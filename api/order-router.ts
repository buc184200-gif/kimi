import { z } from "zod";
import { createRouter, publicQuery, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { orders, orderItems, cartItems, products } from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

function generateOrderNumber(): string {
  const prefix = "NT";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export const orderRouter = createRouter({
  create: publicQuery
    .input(
      z.object({
        items: z.array(z.object({
          productId: z.number(),
          productName: z.string(),
          productImage: z.string().optional(),
          size: z.string(),
          color: z.string(),
          quantity: z.number(),
          price: z.number(),
        })),
        shippingAddress: z.object({
          fullName: z.string(),
          phone: z.string(),
          addressLine1: z.string(),
          addressLine2: z.string().optional(),
          city: z.string(),
          state: z.string(),
          postalCode: z.string(),
          country: z.string().default("India"),
        }),
        billingAddress: z.object({
          fullName: z.string(),
          phone: z.string(),
          addressLine1: z.string(),
          addressLine2: z.string().optional(),
          city: z.string(),
          state: z.string(),
          postalCode: z.string(),
          country: z.string().default("India"),
        }).optional(),
        paymentMethod: z.enum(["cod", "online"]),
        couponCode: z.string().optional(),
        notes: z.string().optional(),
        subtotal: z.number(),
        shipping: z.number(),
        discount: z.number(),
        total: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const userId = ctx.user?.id || null;
      const orderNumber = generateOrderNumber();

      // Create order
      const orderResult = await db.insert(orders).values({
        userId,
        orderNumber,
        status: input.paymentMethod === "cod" ? "pending" : "confirmed",
        paymentStatus: input.paymentMethod === "cod" ? "pending" : "paid",
        paymentMethod: input.paymentMethod,
        subtotal: input.subtotal.toFixed(2),
        shipping: input.shipping.toFixed(2),
        discount: input.discount.toFixed(2),
        total: input.total.toFixed(2),
        couponCode: input.couponCode || null,
        shippingAddress: JSON.stringify(input.shippingAddress),
        billingAddress: input.billingAddress ? JSON.stringify(input.billingAddress) : null,
        notes: input.notes || null,
      });

      const orderId = Number(orderResult[0].insertId);

      // Create order items
      for (const item of input.items) {
        await db.insert(orderItems).values({
          orderId,
          productId: item.productId,
          productName: item.productName,
          productImage: item.productImage || null,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          price: item.price.toFixed(2),
          total: (item.price * item.quantity).toFixed(2),
        });

        // Update sold count
        await db.update(products).set({
          soldCount: sql`${products.soldCount} + ${item.quantity}`,
        }).where(eq(products.id, item.productId));
      }

      // Clear cart
      const sessionId = ctx.sessionId || "";
      if (userId) {
        await db.delete(cartItems).where(eq(cartItems.userId, userId));
      } else {
        await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
      }

      return { orderId, orderNumber, success: true };
    }),

  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(orders).where(eq(orders.userId, ctx.user.id)).orderBy(desc(orders.createdAt));
  }),

  getById: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const order = await db.select().from(orders).where(
        and(eq(orders.id, input.id), eq(orders.userId, ctx.user.id))
      ).limit(1);

      if (!order[0]) return null;

      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, input.id));
      return { ...order[0], items };
    }),

  getByNumber: publicQuery
    .input(z.object({ orderNumber: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const order = await db.select().from(orders).where(eq(orders.orderNumber, input.orderNumber)).limit(1);

      if (!order[0]) return null;

      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order[0].id));
      return { ...order[0], items };
    }),

  cancel: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.update(orders)
        .set({ status: "cancelled", updatedAt: new Date() })
        .where(and(eq(orders.id, input.id), eq(orders.userId, ctx.user.id)));
      return { success: true };
    }),

  // Admin
  listAll: adminQuery
    .input(
      z.object({
        status: z.string().optional(),
        page: z.number().optional().default(1),
        limit: z.number().optional().default(20),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const params = input || { page: 1, limit: 20 };
      const offset = (params.page - 1) * params.limit;

      const conditions = params.status ? [eq(orders.status, params.status as any)] : [];
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [items, countResult] = await Promise.all([
        db.select().from(orders).where(whereClause).orderBy(desc(orders.createdAt)).limit(params.limit).offset(offset),
        db.select({ count: sql<number>`count(*)` }).from(orders).where(whereClause),
      ]);

      return {
        orders: items,
        total: countResult[0]?.count || 0,
        page: params.page,
        totalPages: Math.ceil((countResult[0]?.count || 0) / params.limit),
      };
    }),

  updateStatus: adminQuery
    .input(z.object({ id: z.number(), status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"]) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(orders).set({ status: input.status, updatedAt: new Date() }).where(eq(orders.id, input.id));
      return { success: true };
    }),

  getStats: adminQuery.query(async () => {
    const db = getDb();

    const [totalOrdersResult, revenueResult, pendingOrdersResult] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(orders),
      db.select({ total: sql<number>`COALESCE(SUM(total), 0)` }).from(orders).where(eq(orders.paymentStatus, "paid")),
      db.select({ count: sql<number>`count(*)` }).from(orders).where(eq(orders.status, "pending")),
    ]);

    const recentOrders = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(5);

    return {
      totalOrders: totalOrdersResult[0]?.count || 0,
      revenue: revenueResult[0]?.total || 0,
      pendingOrders: pendingOrdersResult[0]?.count || 0,
      recentOrders,
    };
  }),
});
