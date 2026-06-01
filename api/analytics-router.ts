import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { orders, products, users } from "@db/schema";
import { eq, desc, sql, gte, lte, and } from "drizzle-orm";

export const analyticsRouter = createRouter({
  dashboard: adminQuery.query(async () => {
    const db = getDb();

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalRevenueResult,
      totalOrdersResult,
      totalCustomersResult,
      totalProductsResult,
      last30DaysRevenueResult,
      last7DaysOrdersResult,
    ] = await Promise.all([
      db.select({ total: sql<number>`COALESCE(SUM(total), 0)` }).from(orders).where(eq(orders.paymentStatus, "paid")),
      db.select({ count: sql<number>`count(*)` }).from(orders),
      db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.role, "user")),
      db.select({ count: sql<number>`count(*)` }).from(products),
      db.select({ total: sql<number>`COALESCE(SUM(total), 0)` }).from(orders).where(
        and(gte(orders.createdAt, thirtyDaysAgo), eq(orders.paymentStatus, "paid"))
      ),
      db.select({ count: sql<number>`count(*)` }).from(orders).where(gte(orders.createdAt, sevenDaysAgo)),
    ]);

    // Chart data - last 30 days daily revenue
    const chartData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

      const dayResult = await db.select({
        revenue: sql<number>`COALESCE(SUM(total), 0)`,
        orders: sql<number>`count(*)`,
      }).from(orders).where(
        and(gte(orders.createdAt, date), lte(orders.createdAt, nextDate))
      );

      chartData.push({
        date: dateStr,
        revenue: dayResult[0]?.revenue || 0,
        orders: dayResult[0]?.orders || 0,
      });
    }

    return {
      totalRevenue: totalRevenueResult[0]?.total || 0,
      totalOrders: totalOrdersResult[0]?.count || 0,
      totalCustomers: totalCustomersResult[0]?.count || 0,
      totalProducts: totalProductsResult[0]?.count || 0,
      last30DaysRevenue: last30DaysRevenueResult[0]?.total || 0,
      last7DaysOrders: last7DaysOrdersResult[0]?.count || 0,
      chartData,
    };
  }),

  topProducts: adminQuery.query(async () => {
    const db = getDb();
    return db.select({
      name: products.name,
      sold: products.soldCount,
      revenue: sql<number>`${products.price} * ${products.soldCount}`,
    }).from(products).orderBy(desc(products.soldCount)).limit(5);
  }),

  salesByPeriod: adminQuery.query(async () => {
    const db = getDb();
    const now = new Date();

    const dailySales = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      const dateStr = date.toLocaleDateString("en-US", { weekday: "short" });

      const result = await db.select({
        revenue: sql<number>`COALESCE(SUM(total), 0)`,
        orders: sql<number>`count(*)`,
      }).from(orders).where(
        and(gte(orders.createdAt, date), lte(orders.createdAt, nextDate), eq(orders.paymentStatus, "paid"))
      );

      dailySales.push({
        label: dateStr,
        revenue: result[0]?.revenue || 0,
        orders: result[0]?.orders || 0,
      });
    }

    return dailySales;
  }),
});
