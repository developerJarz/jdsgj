import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import { authorizeRole } from '@/lib/middleware/withRole';

export async function GET(req: Request) {
  const { user, errorResponse } = await authorizeRole(req, ['admin', 'moderator']);
  if (errorResponse) return errorResponse;

  try {
    await connectToDatabase();

    const url = new URL(req.url);
    const range = url.searchParams.get('range') || '30d'; // 7d, 30d, all

    // Calculate dates
    const now = new Date();
    let startDate = new Date();
    if (range === '7d') {
      startDate.setDate(now.getDate() - 7);
    } else if (range === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else {
      startDate.setDate(now.getDate() - 30);
    }

    // Parallel aggregate queries
    const [
      totalRevenueAgg,
      totalOrdersCount,
      totalCustomersCount,
      totalProductsCount,
      recentOrders,
      recentCustomers,
      lowStockProducts,
      topProducts,
      ordersByStatusAgg,
    ] = await Promise.all([
      // Total revenue of non-cancelled orders
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } },
      ]),

      // Total orders
      Order.countDocuments(),

      // Total customers
      User.countDocuments({ role: 'customer' }),

      // Total products
      Product.countDocuments({ is_active: true }),

      // Recent 6 orders
      Order.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .select('orderNumber customer pricing status paymentMethod createdAt')
        .lean(),

      // Recent 5 customers
      User.find({ role: 'customer' })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name phone email rewardPoints createdAt')
        .lean(),

      // Low stock products (stock <= 5)
      Product.find({ stock: { $lte: 5 } })
        .limit(6)
        .select('name price stock thumbnail category brand')
        .lean(),

      // Top selling products
      Product.find()
        .sort({ sold_count: -1, rating: -1 })
        .limit(5)
        .select('name price regular_price stock sold_count rating thumbnail category')
        .lean(),

      // Orders by status
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const totalRevenue = totalRevenueAgg[0]?.total || 0;
    const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

    // Build status distribution map
    const statusDistribution: Record<string, number> = {};
    ordersByStatusAgg.forEach((item) => {
      statusDistribution[item._id] = item.count;
    });

    // Recent 7 days daily sales chart data
    const dailySalesData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.setHours(0, 0, 0, 0));
      const dayEnd = new Date(d.setHours(23, 59, 59, 999));

      const dayRevenueAgg = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: dayStart, $lte: dayEnd },
            status: { $ne: 'cancelled' },
          },
        },
        { $group: { _id: null, total: { $sum: '$pricing.total' }, count: { $sum: 1 } } },
      ]);

      const dayLabel = dayStart.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      dailySalesData.push({
        label: dayLabel,
        revenue: dayRevenueAgg[0]?.total || 0,
        orders: dayRevenueAgg[0]?.count || 0,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalRevenue,
          totalOrders: totalOrdersCount,
          totalCustomers: totalCustomersCount,
          totalProducts: totalProductsCount,
          avgOrderValue,
          lowStockCount: lowStockProducts.length,
        },
        chartData: dailySalesData,
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
