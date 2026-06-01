import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { coupons } from "@db/schema";
import { eq, and, sql } from "drizzle-orm";

export const couponRouter = createRouter({
  validate: publicQuery
    .input(z.object({ code: z.string(), orderTotal: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(coupons).where(
        and(eq(coupons.code, input.code.toUpperCase()), eq(coupons.isActive, true))
      ).limit(1);

      if (!result[0]) {
        return { valid: false, discount: 0, message: "Invalid coupon code" };
      }

      const coupon = result[0];

      // Check min order
      if (coupon.minOrder && Number(coupon.minOrder) > input.orderTotal) {
        return { valid: false, discount: 0, message: `Minimum order of $${coupon.minOrder} required` };
      }

      // Check usage limit
      if (coupon.maxUses && coupon.usedCount && coupon.usedCount >= coupon.maxUses) {
        return { valid: false, discount: 0, message: "Coupon has reached maximum usage" };
      }

      // Check validity dates
      if (coupon.validFrom && new Date(coupon.validFrom) > new Date()) {
        return { valid: false, discount: 0, message: "Coupon not yet valid" };
      }
      if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
        return { valid: false, discount: 0, message: "Coupon has expired" };
      }

      const discount = coupon.discountType === "percentage"
        ? input.orderTotal * (Number(coupon.discountValue) / 100)
        : Number(coupon.discountValue);

      return { valid: true, discount: Math.round(discount * 100) / 100, message: "Coupon applied" };
    }),

  list: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(coupons).orderBy(sql`${coupons.createdAt} DESC`);
  }),

  create: adminQuery
    .input(
      z.object({
        code: z.string(),
        discountType: z.enum(["percentage", "fixed"]),
        discountValue: z.number(),
        minOrder: z.number().optional(),
        maxUses: z.number().optional(),
        validFrom: z.string().optional(),
        validUntil: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(coupons).values({
        code: input.code.toUpperCase(),
        discountType: input.discountType,
        discountValue: input.discountValue.toFixed(2),
        minOrder: input.minOrder ? input.minOrder.toFixed(2) : "0",
        maxUses: input.maxUses || null,
        validFrom: input.validFrom ? new Date(input.validFrom) : null,
        validUntil: input.validUntil ? new Date(input.validUntil) : null,
        isActive: true,
      });
      return { id: Number(result[0].insertId), success: true };
    }),

  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(coupons).where(eq(coupons.id, input.id));
      return { success: true };
    }),
});
