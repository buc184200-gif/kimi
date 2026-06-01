import { authRouter } from "./auth-router";
import { productRouter } from "./product-router";
import { reviewRouter } from "./review-router";
import { cartRouter } from "./cart-router";
import { orderRouter } from "./order-router";
import { wishlistRouter } from "./wishlist-router";
import { couponRouter } from "./coupon-router";
import { addressRouter } from "./address-router";
import { newsletterRouter } from "./newsletter-router";
import { contactRouter } from "./contact-router";
import { analyticsRouter } from "./analytics-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  product: productRouter,
  review: reviewRouter,
  cart: cartRouter,
  order: orderRouter,
  wishlist: wishlistRouter,
  coupon: couponRouter,
  address: addressRouter,
  newsletter: newsletterRouter,
  contact: contactRouter,
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;
