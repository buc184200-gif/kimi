import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { newsletterSubscribers } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const newsletterRouter = createRouter({
  subscribe: publicQuery
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.email, input.email)).limit(1);

      if (existing.length > 0) {
        return { success: true, message: "Already subscribed" };
      }

      await db.insert(newsletterSubscribers).values({ email: input.email });
      return { success: true, message: "Subscribed successfully" };
    }),

  list: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.createdAt));
  }),
});
