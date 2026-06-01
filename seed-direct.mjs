import mysql from 'mysql2/promise';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '../.env') });

const dbUrl = process.env.DATABASE_URL;
console.log('Connecting to database...');

const conn = await mysql.createConnection(dbUrl);
console.log('Connected!');

// Clear tables
console.log('Clearing tables...');
await conn.execute('DELETE FROM cart_items').catch(() => {});
await conn.execute('DELETE FROM order_items').catch(() => {});
await conn.execute('DELETE FROM orders').catch(() => {});
await conn.execute('DELETE FROM wishlist_items').catch(() => {});
await conn.execute('DELETE FROM product_reviews').catch(() => {});
await conn.execute('DELETE FROM addresses').catch(() => {});
await conn.execute('DELETE FROM newsletter_subscribers').catch(() => {});
await conn.execute('DELETE FROM contact_messages').catch(() => {});
await conn.execute('DELETE FROM coupons').catch(() => {});
await conn.execute('DELETE FROM products').catch(() => {});
await conn.execute('DELETE FROM categories').catch(() => {});

// Seed categories
console.log('Seeding categories...');
await conn.execute(
  `INSERT INTO categories (name, slug, description, image, sortOrder) VALUES 
   ('T-Shirts', 't-shirts', 'Premium heavyweight cotton t-shirts in essential colors', '/images/cat-tees.jpg', 1),
   ('Hoodies', 'hoodies', 'Oversized hoodies crafted from heavyweight fleece', '/images/cat-hoodies.jpg', 2),
   ('Sweatshirts', 'sweatshirts', 'Classic crewneck sweatshirts with dropped shoulders', '/images/cat-hoodies.jpg', 3)`
);

// Seed products
console.log('Seeding products...');
const products = [
  ['001 Heavyweight Tee', '001-heavyweight-tee', 'Our signature heavyweight t-shirt. Cut from 280gsm organic cotton jersey with a relaxed, boxy fit.', 95.00, null, 1,
   JSON.stringify(['/images/tee-black.jpg','/images/detail-fabric.jpg','/images/tee-white.jpg','/images/tee-grey.jpg']),
   JSON.stringify(['S','M','L','XL']),
   JSON.stringify([{name:'Black',hex:'#000000'},{name:'White',hex:'#FFFFFF'},{name:'Heather Grey',hex:'#999999'}]),
   JSON.stringify({S:12,M:18,L:15,XL:8}), 1, 0, '4.9', 128, 342,
   '100% Organic Cotton, 280gsm', 'Oversized / Boxy Fit', 'Machine wash cold. Hang dry.', '280gsm'],
  ['002 Relaxed Hoodie', '002-relaxed-hoodie', 'An oversized pullover hoodie cut from 400gsm heavyweight cotton fleece.', 145.00, null, 2,
   JSON.stringify(['/images/hoodie-black.jpg','/images/hoodie-white.jpg','/images/detail-fabric.jpg']),
   JSON.stringify(['S','M','L','XL']),
   JSON.stringify([{name:'Black',hex:'#000000'},{name:'White',hex:'#FFFFFF'}]),
   JSON.stringify({S:8,M:14,L:11,XL:6}), 1, 0, '4.8', 86, 215,
   '100% Cotton Fleece, 400gsm', 'Oversized Fit', 'Machine wash cold inside out.', '400gsm'],
  ['003 Classic Crewneck', '003-classic-crewneck', 'A timeless crewneck sweatshirt built from 350gsm French terry cotton.', 125.00, null, 3,
   JSON.stringify(['/images/sweatshirt-black.jpg','/images/sweatshirt-white.jpg','/images/detail-fabric.jpg']),
   JSON.stringify(['S','M','L','XL']),
   JSON.stringify([{name:'Black',hex:'#000000'},{name:'White',hex:'#FFFFFF'}]),
   JSON.stringify({S:10,M:16,L:13,XL:7}), 1, 0, '4.7', 64, 178,
   '100% Cotton French Terry, 350gsm', 'Relaxed Fit', 'Machine wash cold. Hang dry.', '350gsm'],
  ['004 Longline Tee', '004-longline-tee', 'An elongated t-shirt silhouette cut from 240gsm cotton jersey.', 85.00, null, 1,
   JSON.stringify(['/images/tee-white.jpg','/images/tee-black.jpg','/images/tee-grey.jpg']),
   JSON.stringify(['S','M','L','XL']),
   JSON.stringify([{name:'White',hex:'#FFFFFF'},{name:'Black',hex:'#000000'},{name:'Heather Grey',hex:'#999999'}]),
   JSON.stringify({S:15,M:20,L:18,XL:10}), 0, 1, '4.6', 42, 98,
   '100% Cotton Jersey, 240gsm', 'Longline / Elongated Fit', 'Machine wash cold. Hang dry.', '240gsm'],
  ['005 Zip Hoodie', '005-zip-hoodie', 'A heavyweight full-zip hoodie crafted from 400gsm cotton fleece.', 155.00, null, 2,
   JSON.stringify(['/images/hoodie-black.jpg','/images/hoodie-white.jpg']),
   JSON.stringify(['S','M','L','XL']),
   JSON.stringify([{name:'Black',hex:'#000000'},{name:'White',hex:'#FFFFFF'}]),
   JSON.stringify({S:6,M:12,L:9,XL:5}), 0, 1, '4.8', 31, 67,
   '100% Cotton Fleece, 400gsm', 'Oversized Fit', 'Machine wash cold inside out.', '400gsm'],
  ['006 Mock Neck Sweatshirt', '006-mock-neck-sweatshirt', 'A refined mock neck sweatshirt cut from 320gsm cotton terry.', 135.00, null, 3,
   JSON.stringify(['/images/sweatshirt-white.jpg','/images/sweatshirt-black.jpg']),
   JSON.stringify(['S','M','L','XL']),
   JSON.stringify([{name:'White',hex:'#FFFFFF'},{name:'Black',hex:'#000000'}]),
   JSON.stringify({S:9,M:14,L:11,XL:6}), 0, 1, '4.5', 28, 54,
   '100% Cotton Terry, 320gsm', 'Relaxed Fit', 'Machine wash cold. Reshape while damp.', '320gsm'],
];

for (const p of products) {
  await conn.execute(
    `INSERT INTO products (name, slug, description, price, comparePrice, categoryId, images, sizes, colors, inventory, featured, isNew, rating, reviewCount, soldCount, fabricDetails, fitInfo, careInstructions, weight) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    p
  );
}

// Seed coupons
console.log('Seeding coupons...');
await conn.execute(
  `INSERT INTO coupons (code, discountType, discountValue, minOrder, maxUses, usedCount, isActive) VALUES
   ('WELCOME10', 'percentage', 10.00, 50.00, 1000, 0, 1),
   ('NOIR20', 'percentage', 20.00, 150.00, 500, 0, 1),
   ('FLAT50', 'fixed', 50.00, 200.00, 200, 0, 1)`
);

// Seed contact messages
console.log('Seeding contact messages...');
await conn.execute(
  `INSERT INTO contact_messages (name, email, subject, message, status) VALUES
   ('Alex Morgan', 'alex@example.com', 'Sizing Question', 'Hi, I am wondering about the fit of the 001 Heavyweight Tee.', 'read'),
   ('Jordan Lee', 'jordan@example.com', 'Return Request', 'I ordered the 002 Relaxed Hoodie in L but would like to exchange for an M.', 'new'),
   ('Sam Rivera', 'sam@example.com', 'Wholesale Inquiry', 'I run a boutique in Brooklyn and am interested in stocking your products.', 'new')`
);

console.log('Seed complete!');
await conn.end();
