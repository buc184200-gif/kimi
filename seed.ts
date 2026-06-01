import { getDb } from "../api/queries/connection";
import { categories, products, coupons, contactMessages, cartItems, orderItems, orders, wishlistItems, productReviews, addresses, newsletterSubscribers } from "./schema";

async function seed() {
  const db = getDb();
  console.log("Clearing existing data...");

  // Clear all tables in correct order
  await db.delete(cartItems).catch(() => {});
  await db.delete(orderItems).catch(() => {});
  await db.delete(orders).catch(() => {});
  await db.delete(wishlistItems).catch(() => {});
  await db.delete(productReviews).catch(() => {});
  await db.delete(addresses).catch(() => {});
  await db.delete(newsletterSubscribers).catch(() => {});
  await db.delete(contactMessages).catch(() => {});
  await db.delete(coupons).catch(() => {});
  await db.delete(products).catch(() => {});
  await db.delete(categories).catch(() => {});

  console.log("Seeding database...");

  // Seed categories
  await db.insert(categories).values([
    {
      name: "T-Shirts",
      slug: "t-shirts",
      description: "Premium heavyweight cotton t-shirts in essential colors",
      image: "/images/cat-tees.jpg",
      sortOrder: 1,
    },
    {
      name: "Hoodies",
      slug: "hoodies",
      description: "Oversized hoodies crafted from heavyweight fleece",
      image: "/images/cat-hoodies.jpg",
      sortOrder: 2,
    },
    {
      name: "Sweatshirts",
      slug: "sweatshirts",
      description: "Classic crewneck sweatshirts with dropped shoulders",
      image: "/images/cat-hoodies.jpg",
      sortOrder: 3,
    },
  ]);
  console.log("Categories seeded");

  // Seed products
  await db.insert(products).values([
    {
      name: "001 Heavyweight Tee",
      slug: "001-heavyweight-tee",
      description: "Our signature heavyweight t-shirt. Cut from 280gsm organic cotton jersey with a relaxed, boxy fit. Features a reinforced collar, dropped shoulders, and a slightly elongated silhouette. Pre-shrunk and garment-washed for a lived-in feel from day one.",
      price: "95.00",
      comparePrice: null,
      categoryId: 1,
      images: JSON.stringify(["/images/tee-black.jpg", "/images/detail-fabric.jpg", "/images/tee-white.jpg", "/images/tee-grey.jpg"]),
      sizes: JSON.stringify(["S", "M", "L", "XL"]),
      colors: JSON.stringify([{ name: "Black", hex: "#000000" }, { name: "White", hex: "#FFFFFF" }, { name: "Heather Grey", hex: "#999999" }]),
      inventory: JSON.stringify({ S: 12, M: 18, L: 15, XL: 8 }),
      featured: true,
      isNew: false,
      rating: "4.9",
      reviewCount: 128,
      soldCount: 342,
      fabricDetails: "100% Organic Cotton, 280gsm",
      fitInfo: "Oversized / Boxy Fit. Model is 6'1 wearing size L",
      careInstructions: "Machine wash cold. Hang dry. Do not bleach.",
      weight: "280gsm",
    },
    {
      name: "002 Relaxed Hoodie",
      slug: "002-relaxed-hoodie",
      description: "An oversized pullover hoodie cut from 400gsm heavyweight cotton fleece. Features a kangaroo pocket, double-lined hood, and ribbed cuffs and hem. The dropped shoulder construction creates a relaxed silhouette that layers effortlessly.",
      price: "145.00",
      comparePrice: null,
      categoryId: 2,
      images: JSON.stringify(["/images/hoodie-black.jpg", "/images/hoodie-white.jpg", "/images/detail-fabric.jpg"]),
      sizes: JSON.stringify(["S", "M", "L", "XL"]),
      colors: JSON.stringify([{ name: "Black", hex: "#000000" }, { name: "White", hex: "#FFFFFF" }]),
      inventory: JSON.stringify({ S: 8, M: 14, L: 11, XL: 6 }),
      featured: true,
      isNew: false,
      rating: "4.8",
      reviewCount: 86,
      soldCount: 215,
      fabricDetails: "100% Cotton Fleece, 400gsm",
      fitInfo: "Oversized Fit. Size down for a standard fit.",
      careInstructions: "Machine wash cold inside out. Tumble dry low.",
      weight: "400gsm",
    },
    {
      name: "003 Classic Crewneck",
      slug: "003-classic-crewneck",
      description: "A timeless crewneck sweatshirt built from 350gsm French terry cotton. Features ribbed collar, cuffs, and hem with a V-stitch insert at the neckline. The relaxed fit and premium construction make this a wardrobe staple.",
      price: "125.00",
      comparePrice: null,
      categoryId: 3,
      images: JSON.stringify(["/images/sweatshirt-black.jpg", "/images/sweatshirt-white.jpg", "/images/detail-fabric.jpg"]),
      sizes: JSON.stringify(["S", "M", "L", "XL"]),
      colors: JSON.stringify([{ name: "Black", hex: "#000000" }, { name: "White", hex: "#FFFFFF" }]),
      inventory: JSON.stringify({ S: 10, M: 16, L: 13, XL: 7 }),
      featured: true,
      isNew: false,
      rating: "4.7",
      reviewCount: 64,
      soldCount: 178,
      fabricDetails: "100% Cotton French Terry, 350gsm",
      fitInfo: "Relaxed Fit. True to size.",
      careInstructions: "Machine wash cold. Hang dry preferred.",
      weight: "350gsm",
    },
    {
      name: "004 Longline Tee",
      slug: "004-longline-tee",
      description: "An elongated t-shirt silhouette cut from 240gsm cotton jersey. Features an extended body that hits below the hip, side slits for movement, and a clean bound neckline. Designed to be worn alone or as a layering piece.",
      price: "85.00",
      comparePrice: null,
      categoryId: 1,
      images: JSON.stringify(["/images/tee-white.jpg", "/images/tee-black.jpg", "/images/tee-grey.jpg"]),
      sizes: JSON.stringify(["S", "M", "L", "XL"]),
      colors: JSON.stringify([{ name: "White", hex: "#FFFFFF" }, { name: "Black", hex: "#000000" }, { name: "Heather Grey", hex: "#999999" }]),
      inventory: JSON.stringify({ S: 15, M: 20, L: 18, XL: 10 }),
      featured: false,
      isNew: true,
      rating: "4.6",
      reviewCount: 42,
      soldCount: 98,
      fabricDetails: "100% Cotton Jersey, 240gsm",
      fitInfo: "Longline / Elongated Fit. Hits below hip.",
      careInstructions: "Machine wash cold. Hang dry.",
      weight: "240gsm",
    },
    {
      name: "005 Zip Hoodie",
      slug: "005-zip-hoodie",
      description: "A heavyweight full-zip hoodie crafted from 400gsm cotton fleece. Features matte black YKK zipper, double-lined hood, and kangaroo pockets. The clean, minimal design makes this the ultimate everyday layer.",
      price: "155.00",
      comparePrice: null,
      categoryId: 2,
      images: JSON.stringify(["/images/hoodie-black.jpg", "/images/hoodie-white.jpg"]),
      sizes: JSON.stringify(["S", "M", "L", "XL"]),
      colors: JSON.stringify([{ name: "Black", hex: "#000000" }, { name: "White", hex: "#FFFFFF" }]),
      inventory: JSON.stringify({ S: 6, M: 12, L: 9, XL: 5 }),
      featured: false,
      isNew: true,
      rating: "4.8",
      reviewCount: 31,
      soldCount: 67,
      fabricDetails: "100% Cotton Fleece, 400gsm",
      fitInfo: "Oversized Fit. Size down for slimmer fit.",
      careInstructions: "Machine wash cold inside out. Zip closed before washing.",
      weight: "400gsm",
    },
    {
      name: "006 Mock Neck Sweatshirt",
      slug: "006-mock-neck-sweatshirt",
      description: "A refined mock neck sweatshirt cut from 320gsm cotton terry. The elevated collar provides a clean neckline while the relaxed body maintains casual comfort. Perfect for layering under outerwear.",
      price: "135.00",
      comparePrice: null,
      categoryId: 3,
      images: JSON.stringify(["/images/sweatshirt-white.jpg", "/images/sweatshirt-black.jpg"]),
      sizes: JSON.stringify(["S", "M", "L", "XL"]),
      colors: JSON.stringify([{ name: "White", hex: "#FFFFFF" }, { name: "Black", hex: "#000000" }]),
      inventory: JSON.stringify({ S: 9, M: 14, L: 11, XL: 6 }),
      featured: false,
      isNew: true,
      rating: "4.5",
      reviewCount: 28,
      soldCount: 54,
      fabricDetails: "100% Cotton Terry, 320gsm",
      fitInfo: "Relaxed Fit. Mock neck sits close to throat.",
      careInstructions: "Machine wash cold. Reshape while damp.",
      weight: "320gsm",
    },
  ]);
  console.log("Products seeded");

  // Seed coupons
  await db.insert(coupons).values([
    {
      code: "WELCOME10",
      discountType: "percentage",
      discountValue: "10.00",
      minOrder: "50.00",
      maxUses: 1000,
      usedCount: 0,
      isActive: true,
    },
    {
      code: "NOIR20",
      discountType: "percentage",
      discountValue: "20.00",
      minOrder: "150.00",
      maxUses: 500,
      usedCount: 0,
      isActive: true,
    },
    {
      code: "FLAT50",
      discountType: "fixed",
      discountValue: "50.00",
      minOrder: "200.00",
      maxUses: 200,
      usedCount: 0,
      isActive: true,
    },
  ]);
  console.log("Coupons seeded");

  // Seed contact messages
  await db.insert(contactMessages).values([
    {
      name: "Alex Morgan",
      email: "alex@example.com",
      subject: "Sizing Question",
      message: "Hi, I'm wondering about the fit of the 001 Heavyweight Tee. I'm 5'11 and usually wear a medium. Should I stick with M or size down?",
      status: "read",
    },
    {
      name: "Jordan Lee",
      email: "jordan@example.com",
      subject: "Return Request",
      message: "I ordered the 002 Relaxed Hoodie in L but would like to exchange for an M. The hoodie is unworn with tags still attached. How do I proceed?",
      status: "new",
    },
    {
      name: "Sam Rivera",
      email: "sam@example.com",
      subject: "Wholesale Inquiry",
      message: "I run a boutique in Brooklyn and am interested in stocking your 001 and 003 models. Do you offer wholesale pricing for retail partners?",
      status: "new",
    },
  ]);
  console.log("Contact messages seeded");

  console.log("Seed complete!");
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
