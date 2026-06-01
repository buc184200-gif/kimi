import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { cartItems, products } from "@db/schema";
import { eq, and, sql } from "drizzle-orm";

export const cartRouter = createRouter({
  list: publicQuery.query(async ({ ctx }) => {
    const db = getDb();
    const sessionId = ctx.sessionId || "";
    const userId = ctx.user?.id;

    const conditions = userId
      ? [eq(cartItems.userId, userId)]
      : [eq(cartItems.sessionId, sessionId)];

    const items = await db.select().from(cartItems).where(and(...conditions));

    // Join with product data
    const itemsWithProducts = await Promise.all(
      items.map(async (item) => {
        const product = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);
        return {
          ...item,
          product: product[0] || null,
        };
      })
    );

    return itemsWithProducts;
  }),

  add: publicQuery
    .input(
      z.object({
        productId: z.number(),
        size: z.string(),
        color: z.string(),
        quantity: z.number().optional().default(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const sessionId = ctx.sessionId || "";
      const userId = ctx.user?.id;

      // Check if item already exists in cart
      const existing = userId
        ? await db.select().from(cartItems).where(
            and(
              eq(cartItems.userId, userId),
              eq(cartItems.productId, input.productId),
              eq(cartItems.size, input.size),
              eq(cartItems.color, input.color)
            )
          ).limit(1)
        : await db.select().from(cartItems).where(
            and(
              eq(cartItems.sessionId, sessionId),
              eq(cartItems.productId, input.productId),
              eq(cartItems.size, input.size),
              eq(cartItems.color, input.color)
            )
          ).limit(1);

      if (existing.length > 0) {
        // Update quantity
        await db.update(cartItems).set({
          quantity: existing[0].quantity + input.quantity,
        }).where(eq(cartItems.id, existing[0].id));
        return { ...existing[0], quantity: existing[0].quantity + input.quantity };
      }

      const result = await db.insert(cartItems).values({
        sessionId: userId ? null : sessionId,
        userId: userId || null,
        productId: input.productId,
        size: input.size,
        color: input.color,
        quantity: input.quantity,
      });

      return { id: Number(result[0].insertId), ...input, sessionId: userId ? null : sessionId, userId: userId || null };
    }),

  updateQuantity: publicQuery
    .input(z.object({ id: z.number(), quantity: z.number().min(1) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(cartItems).set({ quantity: input.quantity }).where(eq(cartItems.id, input.id));
      return { success: true };
    }),

  remove: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(cartItems).where(eq(cartItems.id, input.id));
      return { success: true };
    }),

  clear: publicQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    const sessionId = ctx.sessionId || "";
    const userId = ctx.user?.id;

    if (userId) {
      await db.delete(cartItems).where(eq(cartItems.userId, userId));
    } else {
      await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
    }
    return { success: true };
  }),

  getCount: publicQuery.query(async ({ ctx }) => {
    const db = getDb();
    const sessionId = ctx.sessionId || "";
    const userId = ctx.user?.id;

    const conditions = userId
      ? [eq(cartItems.userId, userId)]
      : [eq(cartItems.sessionId, sessionId)];

    const result = await db.select({
      count: sql<number>`COALESCE(SUM(${cartItems.quantity}), 0)`,
    }).from(cartItems).where(and(...conditions));

    return { count: result[0]?.count || 0 };
  }),

  transferToUser: authedQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    const userId = ctx.user.id;
    const sessionId = ctx.sessionId || "";

    // Move anonymous cart items to user
    await db.update(cartItems).set({ userId, sessionId: null }).where(eq(cartItems.sessionId, sessionId));
    return { success: true };
  }),
});
