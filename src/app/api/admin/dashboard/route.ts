import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import ActivityEvent from '@/models/ActivityEvent';
import { authorizeRole } from '@/lib/middleware/withRole';

const TZ = 'Asia/Dhaka';
const DAY_MS = 86_400_000;
const NON_REVENUE_STATUSES = ['cancelled', 'returned', 'refunded'];

function rangeWindow(range: string) {
  const now = new Date();
  if (range === 'today') {
    // Midnight in Dhaka (UTC+6)
    const dhakaNow = new Date(now.getTime() + 6 * 3_600_000);
    const start = new Date(Date.UTC(dhakaNow.getUTCFullYear(), dhakaNow.getUTCMonth(), dhakaNow.getUTCDate()) - 6 * 3_600_000);
    return { start, now, lengthMs: now.getTime() - start.getTime(), days: 1 };
  }
  const days = range === '7d' ? 7 : range === '90d' ? 90 : 30;
  const start = new Date(now.getTime() - days * DAY_MS);
  return { start, now, lengthMs: days * DAY_MS, days };
}

async function periodTotals(from: Date, to: Date) {
  const [agg] = await Order.aggregate<{ revenue: number; orders: number; paidOrders: number }>([
    { $match: { createdAt: { $gte: from, $lt: to } } },
    {
      $group: {
        _id: null,
        orders: { $sum: 1 },
        paidOrders: { $sum: { $cond: [{ $in: ['$status', NON_REVENUE_STATUSES] }, 0, 1] } },
        revenue: { $sum: { $cond: [{ $in: ['$status', NON_REVENUE_STATUSES] }, 0, '$grandTotal'] } },
      },
    },
  ]);
  return agg ?? { revenue: 0, orders: 0, paidOrders: 0 };
}

const pctChange = (current: number, previous: number) =>
  previous === 0 ? (current > 0 ? 100 : 0) : Math.round(((current - previous) / previous) * 100);

export async function GET(req: Request) {
  const { errorResponse } = await authorizeRole(req, ['admin', 'moderator']);
  if (errorResponse) return errorResponse;

  try {
    await connectToDatabase();

    const url = new URL(req.url);
    const range = url.searchParams.get('range') || '30d'; // today | 7d | 30d | 90d
    const { start, now, lengthMs, days } = rangeWindow(range);
    const prevStart = new Date(start.getTime() - lengthMs);

    const hourly = range === 'today';
    const bucketFormat = hourly ? '%H' : '%Y-%m-%d';

    const [
      current,
      previous,
      newCustomers,
      prevNewCustomers,
      totalCustomers,
      totalProducts,
      lowStockProducts,
      lowStockCount,
      topProducts,
      statusAgg,
      timeline,
      recentOrders,
      recentCustomers,
      visitorsAgg,
    ] = await Promise.all([
      periodTotals(start, now),
      periodTotals(prevStart, start),
      User.countDocuments({ role: 'customer', createdAt: { $gte: start } }),
      User.countDocuments({ role: 'customer', createdAt: { $gte: prevStart, $lt: start } }),
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments({ is_active: { $ne: false } }),
      Product.find({ stock: { $lte: 5 }, is_active: { $ne: false } })
        .sort({ stock: 1 })
        .limit(6)
        .select('name brand stock sale_price thumbnail slug')
        .lean(),
      Product.countDocuments({ stock: { $lte: 5 }, is_active: { $ne: false } }),
      // Best sellers within the selected range, from real order lines
      Order.aggregate([
        { $match: { createdAt: { $gte: start }, status: { $nin: NON_REVENUE_STATUSES } } },
        { $unwind: '$items' },
        {
          $group: {
            _id: { $toString: '$items.id' },
            name: { $first: '$items.name' },
            thumbnail: { $first: '$items.thumbnail' },
            category: { $first: '$items.category' },
            units: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: start } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: start }, status: { $nin: NON_REVENUE_STATUSES } } },
        {
          $group: {
            _id: { $dateToString: { format: bucketFormat, date: '$createdAt', timezone: TZ } },
            revenue: { $sum: '$grandTotal' },
            orders: { $sum: 1 },
          },
        },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .select('orderNumber customer.fullName customer.city grandTotal status paymentMethod createdAt')
        .lean(),
      User.find({ role: 'customer' })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name phone email rewardPoints createdAt')
        .lean(),
      ActivityEvent.aggregate<{ visitors: number }>([
        { $match: { type: 'page_view', createdAt: { $gte: start } } },
        { $group: { _id: '$visitorId' } },
        { $count: 'visitors' },
      ]),
    ]);

    // Fill empty buckets so the chart has a continuous axis
    const byBucket = new Map(timeline.map((t: any) => [t._id, t]));
    const chartData: { label: string; revenue: number; orders: number }[] = [];
    if (hourly) {
      const currentHour = Number(new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hourCycle: 'h23', timeZone: TZ }).format(now));
      for (let h = 0; h <= currentHour; h++) {
        const key = String(h).padStart(2, '0');
        const hit: any = byBucket.get(key);
        chartData.push({ label: `${key}:00`, revenue: hit?.revenue ?? 0, orders: hit?.orders ?? 0 });
      }
    } else {
      const fmtKey = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
      const fmtLabel = new Intl.DateTimeFormat('en-US', { timeZone: TZ, month: 'short', day: 'numeric' });
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * DAY_MS);
        const hit: any = byBucket.get(fmtKey.format(d));
        chartData.push({ label: fmtLabel.format(d), revenue: hit?.revenue ?? 0, orders: hit?.orders ?? 0 });
      }
    }

    const statusDistribution: Record<string, number> = {};
    statusAgg.forEach((s: any) => {
      statusDistribution[s._id] = s.count;
    });

    const visitors = visitorsAgg[0]?.visitors ?? 0;
    const avgOrderValue = current.paidOrders > 0 ? Math.round(current.revenue / current.paidOrders) : 0;
    const prevAvg = previous.paidOrders > 0 ? Math.round(previous.revenue / previous.paidOrders) : 0;

    return NextResponse.json({
      success: true,
      data: {
        range,
        stats: {
          totalRevenue: current.revenue,
          totalOrders: current.orders,
          avgOrderValue,
          newCustomers,
          totalCustomers,
          totalProducts,
          lowStockCount,
          visitors,
          conversionRate: visitors > 0 ? Math.round((current.orders / visitors) * 1000) / 10 : 0,
        },
        trends: {
          revenue: pctChange(current.revenue, previous.revenue),
          orders: pctChange(current.orders, previous.orders),
          avgOrderValue: pctChange(avgOrderValue, prevAvg),
          newCustomers: pctChange(newCustomers, prevNewCustomers),
        },
        chartData,
        statusDistribution,
        topProducts,
        lowStockProducts,
        recentOrders,
        recentCustomers,
      },
    });
  } catch (err: any) {
    console.error('Admin dashboard API error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
