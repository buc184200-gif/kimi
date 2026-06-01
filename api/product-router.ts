import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { products, categories } from "@db/schema";
import { eq, like, and, gte, lte, sql, desc, asc } from "drizzle-orm";

export const productRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        category: z.string().optional(),
        search: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        sizes: z.array(z.string()).optional(),
        colors: z.array(z.string()).optional(),
        sortBy: z.enum(["newest", "price_asc", "price_desc", "popular", "rating"]).optional().default("newest"),
        page: z.number().optional().default(1),
        limit: z.number().optional().default(12),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const params = input || { page: 1, limit: 12, sortBy: "newest" };
      const offset = (params.page - 1) * params.limit;

      const conditions = [];

      if (params.category) {
        const category = await db.select().from(categories).where(eq(categories.slug, params.category)).limit(1);
        if (category.length > 0) {
          conditions.push(eq(products.categoryId, category[0].id));
        }
      }

      if (params.search) {
        conditions.push(like(products.name, `%${params.search}%`));
      }

      if (params.minPrice !== undefined) {
        conditions.push(gte(products.price, params.minPrice.toString()));
      }

      if (params.maxPrice !== undefined) {
        conditions.push(lte(products.price, params.maxPrice.toString()));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      let orderBy;
      switch (params.sortBy) {
        case "price_asc":
          orderBy = asc(products.price);
          break;
        case "price_desc":
          orderBy = desc(products.price);
          break;
        case "popular":
          orderBy = desc(products.soldCount);
          break;
        case "rating":
          orderBy = desc(products.rating);
          break;
        default:
          orderBy = desc(products.createdAt);
      }

      const [items, countResult] = await Promise.all([
        db.select().from(products).where(whereClause).orderBy(orderBy).limit(params.limit).offset(offset),
        db.select({ count: sql<number>`count(*)` }).from(products).where(whereClause),
      ]);

      const total = countResult[0]?.count || 0;

      return {
        products: items,
        total,
        page: params.page,
        totalPages: Math.ceil(total / params.limit),
      };
    }),

  getBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(products).where(eq(products.slug, input.slug)).limit(1);
      return result[0] || null;
    }),

  getFeatured: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(products).where(eq(products.featured, true)).orderBy(desc(products.createdAt));
  }),

  getNewArrivals: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(products).where(eq(products.isNew, true)).orderBy(desc(products.createdAt));
  }),

  getRelated: publicQuery
    .input(z.object({ productId: z.number(), limit: z.number().optional().default(4) }))
    .query(async ({ input }) => {
      const db = getDb();
      const product = await db.select().from(products).where(eq(products.id, input.productId)).limit(1);
      if (!product[0] || !product[0].categoryId) return [];

      return db
        .select()
        .from(products)
        .where(
          and(
            eq(products.categoryId, product[0].categoryId),
            sql`${products.id} != ${input.productId}`
          )
        )
        .limit(input.limit);
    }),

  getCategories: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(categories).orderBy(asc(categories.sortOrder));
  }),
});
