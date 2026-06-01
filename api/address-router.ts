import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { addresses } from "@db/schema";
import { eq, and } from "drizzle-orm";

export const addressRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.select().from(addresses).where(eq(addresses.userId, ctx.user.id));
  }),

  create: authedQuery
    .input(
      z.object({
        type: z.enum(["shipping", "billing"]),
        label: z.string().optional(),
        fullName: z.string(),
        phone: z.string(),
        addressLine1: z.string(),
        addressLine2: z.string().optional(),
        city: z.string(),
        state: z.string(),
        postalCode: z.string(),
        country: z.string().default("India"),
        isDefault: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      if (input.isDefault) {
        await db.update(addresses).set({ isDefault: false }).where(
          and(eq(addresses.userId, ctx.user.id), eq(addresses.type, input.type))
        );
      }

      const result = await db.insert(addresses).values({
        userId: ctx.user.id,
        type: input.type,
        label: input.label || null,
        fullName: input.fullName,
        phone: input.phone,
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2 || null,
        city: input.city,
        state: input.state,
        postalCode: input.postalCode,
        country: input.country,
        isDefault: input.isDefault,
      });

      return { id: Number(result[0].insertId), ...input };
    }),

  update: authedQuery
    .input(
      z.object({
        id: z.number(),
        type: z.enum(["shipping", "billing"]).optional(),
        label: z.string().optional(),
        fullName: z.string().optional(),
        phone: z.string().optional(),
        addressLine1: z.string().optional(),
        addressLine2: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        postalCode: z.string().optional(),
        country: z.string().optional(),
        isDefault: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const { id, ...data } = input;

      await db.update(addresses).set(data).where(
        and(eq(addresses.id, id), eq(addresses.userId, ctx.user.id))
      );

      return { success: true };
    }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.delete(addresses).where(
        and(eq(addresses.id, input.id), eq(addresses.userId, ctx.user.id))
      );
      return { success: true };
    }),

  setDefault: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const address = await db.select().from(addresses).where(
        and(eq(addresses.id, input.id), eq(addresses.userId, ctx.user.id))
      ).limit(1);

      if (!address[0]) return { success: false };

      await db.update(addresses).set({ isDefault: false }).where(
        and(eq(addresses.userId, ctx.user.id), eq(addresses.type, address[0].type))
      );

      await db.update(addresses).set({ isDefault: true }).where(eq(addresses.id, input.id));
      return { success: true };
    }),
});
