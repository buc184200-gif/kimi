import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { productReviews } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const reviewRouter = createRouter({
  list: publicQuery
    .input(z.object({ productId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.select().from(productReviews).where(eq(productReviews.productId, input.productId)).orderBy(desc(productReviews.createdAt));
    }),

  create: authedQuery
    .input(
      z.object({
        productId: z.number(),
        rating: z.number().min(1).max(5),
        title: z.string().optional(),
        body: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const result = await db.insert(productReviews).values({
        productId: input.productId,
        userId: ctx.user.id,
        userName: ctx.user.name || "Anonymous",
        rating: input.rating,
        title: input.title || null,
        body: input.body || null,
        verified: true,
      });
      return { id: Number(result[0].insertId), success: true };
    }),
});
