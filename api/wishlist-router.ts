import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { wishlistItems, products } from "@db/schema";
import { eq, and } from "drizzle-orm";

export const wishlistRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const items = await db.select().from(wishlistItems).where(eq(wishlistItems.userId, ctx.user.id));

    const itemsWithProducts = await Promise.all(
      items.map(async (item) => {
        const product = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);
        return { ...item, product: product[0] || null };
      })
    );

    return itemsWithProducts;
  }),

  toggle: authedQuery
    .input(z.object({ productId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      const existing = await db.select().from(wishlistItems).where(
        and(eq(wishlistItems.userId, ctx.user.id), eq(wishlistItems.productId, input.productId))
      ).limit(1);

      if (existing.length > 0) {
        await db.delete(wishlistItems).where(eq(wishlistItems.id, existing[0].id));
        return { added: false };
      }

      await db.insert(wishlistItems).values({
        userId: ctx.user.id,
        productId: input.productId,
      });
      return { added: true };
    }),

  check: authedQuery
    .input(z.object({ productId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      const existing = await db.select().from(wishlistItems).where(
        and(eq(wishlistItems.userId, ctx.user.id), eq(wishlistItems.productId, input.productId))
      ).limit(1);
      return { isInWishlist: existing.length > 0 };
    }),
});
