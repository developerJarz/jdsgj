import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import ActivityEvent from '@/models/ActivityEvent';
import AuditLog from '@/models/AuditLog';
import { authorizeRole } from '@/lib/middleware/withRole';

const TZ = 'Asia/Dhaka';
const DAY_MS = 86_400_000;
const LIVE_WINDOW_MS = 5 * 60_000;

function rangeStart(range: string, now: Date) {
  if (range === 'today') {
    const dhakaNow = new Date(now.getTime() + 6 * 3_600_000);
    return new Date(Date.UTC(dhakaNow.getUTCFullYear(), dhakaNow.getUTCMonth(), dhakaNow.getUTCDate()) - 6 * 3_600_000);
  }
  return new Date(now.getTime() - (range === '30d' ? 30 : 7) * DAY_MS);
}

export async function GET(req: Request) {
  const { errorResponse } = await authorizeRole(req, ['admin']);
  if (errorResponse) return errorResponse;

  try {
    await connectToDatabase();

    const url = new URL(req.url);
    const range = url.searchParams.get('range') || 'today';
    const now = new Date();
    const start = rangeStart(range, now);
    const inRange = { createdAt: { $gte: start } };
    const hourly = range === 'today';

    const [
      totalsAgg,
      funnelAgg,
      liveAgg,
      topPages,
      topProducts,
      topSearches,
      devices,
      timeline,
      feed,
      adminActions,
    ] = await Promise.all([
      ActivityEvent.aggregate([
        { $match: inRange },
        {
          $group: {
            _id: null,
            pageViews: { $sum: { $cond: [{ $eq: ['$type', 'page_view'] }, 1, 0] } },
            productViews: { $sum: { $cond: [{ $eq: ['$type', 'product_view'] }, 1, 0] } },
            addToCarts: { $sum: { $cond: [{ $eq: ['$type', 'add_to_cart'] }, 1, 0] } },
            orders: { $sum: { $cond: [{ $eq: ['$type', 'order_placed'] }, 1, 0] } },
            revenue: { $sum: { $cond: [{ $eq: ['$type', 'order_placed'] }, { $ifNull: ['$value', 0] }, 0] } },
            searches: { $sum: { $cond: [{ $eq: ['$type', 'search'] }, 1, 0] } },
            signups: { $sum: { $cond: [{ $eq: ['$type', 'signup'] }, 1, 0] } },
            logins: { $sum: { $cond: [{ $eq: ['$type', 'login'] }, 1, 0] } },
            visitors: { $addToSet: '$visitorId' },
            sessions: { $addToSet: '$sessionId' },
          },
        },
        {
          $project: {
            _id: 0,
            pageViews: 1, productViews: 1, addToCarts: 1, orders: 1, revenue: 1, searches: 1, signups: 1, logins: 1,
            visitors: { $size: { $setDifference: ['$visitors', [null]] } },
            sessions: { $size: { $setDifference: ['$sessions', [null]] } },
          },
        },
      ]),
      // Funnel: how many sessions reached each step
      ActivityEvent.aggregate([
        { $match: { ...inRange, sessionId: { $exists: true }, type: { $in: ['page_view', 'product_view', 'add_to_cart', 'checkout_start'] } } },
        { $group: { _id: '$type', sessions: { $addToSet: '$sessionId' } } },
        { $project: { sessions: { $size: '$sessions' } } },
      ]),
      ActivityEvent.aggregate([
        { $match: { createdAt: { $gte: new Date(now.getTime() - LIVE_WINDOW_MS) }, visitorId: { $exists: true } } },
        { $group: { _id: '$visitorId', path: { $last: '$path' } } },
        { $group: { _id: null, count: { $sum: 1 }, paths: { $push: '$path' } } },
      ]),
      ActivityEvent.aggregate([
        { $match: { ...inRange, type: 'page_view' } },
        // Group by pathname without the query string
        { $group: { _id: { $arrayElemAt: [{ $split: ['$path', '?'] }, 0] }, views: { $sum: 1 }, visitors: { $addToSet: '$visitorId' } } },
        { $project: { views: 1, visitors: { $size: '$visitors' } } },
        { $sort: { views: -1 } },
        { $limit: 10 },
      ]),
      ActivityEvent.aggregate([
        { $match: { ...inRange, type: { $in: ['product_view', 'add_to_cart'] }, productId: { $exists: true } } },
        {
          $group: {
            _id: '$productId',
            name: { $last: '$productName' },
            views: { $sum: { $cond: [{ $eq: ['$type', 'product_view'] }, 1, 0] } },
            carts: { $sum: { $cond: [{ $eq: ['$type', 'add_to_cart'] }, 1, 0] } },
          },
        },
        { $sort: { views: -1, carts: -1 } },
        { $limit: 10 },
      ]),
      ActivityEvent.aggregate([
        { $match: { ...inRange, type: 'search', query: { $exists: true, $ne: '' } } },
        { $group: { _id: '$query', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      ActivityEvent.aggregate([
        { $match: { ...inRange, type: 'page_view' } },
        { $group: { _id: { $ifNull: ['$device', 'desktop'] }, visitors: { $addToSet: '$visitorId' } } },
        { $project: { visitors: { $size: '$visitors' } } },
      ]),
      ActivityEvent.aggregate([
        { $match: { ...inRange, type: 'page_view' } },
        {
          $group: {
            _id: { $dateToString: { format: hourly ? '%H' : '%Y-%m-%d', date: '$createdAt', timezone: TZ } },
            views: { $sum: 1 },
            visitors: { $addToSet: '$visitorId' },
          },
        },
        { $project: { views: 1, visitors: { $size: '$visitors' } } },
      ]),
      ActivityEvent.find({ type: { $ne: 'page_view' } })
        .sort({ createdAt: -1 })
        .limit(40)
        .select('type path productName query value userName device createdAt')
        .lean(),
      AuditLog.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('userName userRole action target details createdAt')
        .lean(),
    ]);

    const byBucket = new Map(timeline.map((t: any) => [t._id, t]));
    const traffic: { label: string; views: number; visitors: number }[] = [];
    if (hourly) {
      const currentHour = Number(new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hourCycle: 'h23', timeZone: TZ }).format(now));
      for (let h = 0; h <= currentHour; h++) {
        const key = String(h).padStart(2, '0');
        const hit: any = byBucket.get(key);
        traffic.push({ label: `${key}:00`, views: hit?.views ?? 0, visitors: hit?.visitors ?? 0 });
      }
    } else {
      const days = range === '30d' ? 30 : 7;
      const fmtKey = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
      const fmtLabel = new Intl.DateTimeFormat('en-US', { timeZone: TZ, month: 'short', day: 'numeric' });
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * DAY_MS);
        const hit: any = byBucket.get(fmtKey.format(d));
        traffic.push({ label: fmtLabel.format(d), views: hit?.views ?? 0, visitors: hit?.visitors ?? 0 });
      }
    }

    const totals = totalsAgg[0] ?? {
      pageViews: 0, productViews: 0, addToCarts: 0, orders: 0, revenue: 0, searches: 0, signups: 0, logins: 0, visitors: 0, sessions: 0,
    };
    const funnelMap = new Map(funnelAgg.map((f: any) => [f._id, f.sessions]));

    // Most common pages being viewed right now
    const livePaths = new Map<string, number>();
    for (const p of liveAgg[0]?.paths ?? []) {
      const path = String(p || '/').split('?')[0];
      livePaths.set(path, (livePaths.get(path) ?? 0) + 1);
    }

    return NextResponse.json({
      success: true,
      data: {
        range,
        live: {
          visitors: liveAgg[0]?.count ?? 0,
          pages: [...livePaths.entries()].map(([path, count]) => ({ path, count })).sort((a, b) => b.count - a.count).slice(0, 5),
        },
        totals: {
          ...totals,
          pagesPerSession: totals.sessions > 0 ? Math.round((totals.pageViews / totals.sessions) * 10) / 10 : 0,
          conversionRate: totals.sessions > 0 ? Math.round((totals.orders / totals.sessions) * 1000) / 10 : 0,
        },
        funnel: [
          { step: 'Visited store', sessions: funnelMap.get('page_view') ?? 0 },
          { step: 'Viewed a product', sessions: funnelMap.get('product_view') ?? 0 },
          { step: 'Added to bag', sessions: funnelMap.get('add_to_cart') ?? 0 },
          { step: 'Started checkout', sessions: funnelMap.get('checkout_start') ?? 0 },
          { step: 'Placed order', sessions: totals.orders },
        ],
        traffic,
        topPages: topPages.map((p: any) => ({ path: p._id || '/', views: p.views, visitors: p.visitors })),
        topProducts: topProducts.map((p: any) => ({ id: p._id, name: p.name, views: p.views, carts: p.carts })),
        topSearches: topSearches.map((s: any) => ({ query: s._id, count: s.count })),
        devices: devices.map((d: any) => ({ device: d._id, visitors: d.visitors })),
        feed,
        adminActions,
      },
    });
  } catch (err: any) {
    console.error('Activity API error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
