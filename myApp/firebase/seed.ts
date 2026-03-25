/**
 * Firestore Seed Script
 *
 * Run: npx ts-node firebase/seed.ts
 *
 * Before running:
 * 1. Create a Firebase project at console.firebase.google.com
 * 2. Download the service account key JSON
 * 3. Set GOOGLE_APPLICATION_CREDENTIALS env variable to the key path
 * 4. npm install firebase-admin
 */

import * as admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

const categories = [
  { id: 'outfits', name: 'Outfits', icon: 'checkroom', order: 0 },
  { id: 'bags', name: 'Bags', icon: 'shopping-bag', order: 1 },
  { id: 'shoes', name: 'Shoes', icon: 'steps', order: 2 },
  { id: 'glasses', name: 'Glasses', icon: 'visibility', order: 3 },
  { id: 'watches', name: 'Watches', icon: 'watch', order: 4 },
  { id: 'accessories', name: 'Accessories', icon: 'diamond', order: 5 },
];

const products = [
  {
    name: 'Classic Leather Bag', categoryId: 'bags', color: '#D4A574',
    description: 'Timeless leather handbag with premium stitching. Perfect for everyday use or formal occasions.',
    features: ['Genuine leather', 'Adjustable strap', 'Inner pockets', 'Gold-tone hardware'],
    tryOnCount: 2340, isTrending: true, imageUrl: '',
  },
  {
    name: 'Urban Backpack', categoryId: 'bags', color: '#4A5568',
    description: 'Minimalist urban backpack designed for city commuters. Lightweight yet spacious.',
    features: ['Water-resistant fabric', 'Laptop compartment', 'Padded straps', 'Hidden pocket'],
    tryOnCount: 1820, isTrending: false, imageUrl: '',
  },
  {
    name: 'Elegant Clutch', categoryId: 'bags', color: '#E8B4C8',
    description: 'Sleek evening clutch with a satin finish. Adds a touch of glamour to any outfit.',
    features: ['Satin finish', 'Chain strap', 'Magnetic closure', 'Compact design'],
    tryOnCount: 3150, isTrending: true, imageUrl: '',
  },
  {
    name: 'Sport Sneakers', categoryId: 'shoes', color: '#7C8CF0',
    description: 'Versatile sneakers that blend comfort with street style.',
    features: ['Breathable mesh', 'Cushioned sole', 'Lightweight', 'Non-slip grip'],
    tryOnCount: 4210, isTrending: true, imageUrl: '',
  },
  {
    name: 'Classic Loafers', categoryId: 'shoes', color: '#8B6F47',
    description: 'Timeless leather loafers for a polished, refined look.',
    features: ['Full-grain leather', 'Penny slot detail', 'Cushioned insole', 'Durable sole'],
    tryOnCount: 1560, isTrending: false, imageUrl: '',
  },
  {
    name: 'Aviator Sunglasses', categoryId: 'glasses', color: '#C4A35A',
    description: 'Iconic aviator frames with UV400 protection.',
    features: ['UV400 protection', 'Metal frame', 'Polarized lenses', 'Spring hinges'],
    tryOnCount: 5670, isTrending: true, imageUrl: '',
  },
  {
    name: 'Smart Watch Pro', categoryId: 'watches', color: '#2B6CB0',
    description: 'Premium smartwatch with health monitoring, GPS, and a stunning OLED display.',
    features: ['OLED display', 'Heart rate monitor', 'GPS tracking', 'Water-resistant'],
    tryOnCount: 3780, isTrending: true, imageUrl: '',
  },
  {
    name: 'Silk Scarf', categoryId: 'accessories', color: '#9F7AEA',
    description: 'Luxurious silk scarf with an artistic print.',
    features: ['100% silk', 'Hand-rolled edges', 'Vivid print', 'Multi-wear styling'],
    tryOnCount: 2670, isTrending: true, imageUrl: '',
  },
  {
    name: 'Casual Street Combo', categoryId: 'outfits', color: '#6C63FF',
    description: 'Relaxed streetwear combination: oversized tee, joggers, and fresh sneakers.',
    features: ['Oversized tee', 'Tapered joggers', 'White sneakers', 'Baseball cap'],
    tryOnCount: 6120, isTrending: true, imageUrl: '',
  },
  {
    name: 'Business Chic Set', categoryId: 'outfits', color: '#1A1A2E',
    description: 'Sharp business look with a blazer, slim trousers, and oxford shoes.',
    features: ['Fitted blazer', 'Slim trousers', 'Oxford shoes', 'Crisp shirt'],
    tryOnCount: 4350, isTrending: true, imageUrl: '',
  },
];

const mockUsers = [
  { displayName: 'Sarah Johnson', email: 'sarah@example.com', avatar: 'SJ', plan: 'pro', totalGenerations: 47, banned: false },
  { displayName: 'Mike Chen', email: 'mike@example.com', avatar: 'MC', plan: 'free', totalGenerations: 12, banned: false },
  { displayName: 'Emma Wilson', email: 'emma@example.com', avatar: 'EW', plan: 'pro', totalGenerations: 89, banned: false },
  { displayName: 'Alex Rivera', email: 'alex@example.com', avatar: 'AR', plan: 'free', totalGenerations: 5, banned: false },
  { displayName: 'Lisa Park', email: 'lisa@example.com', avatar: 'LP', plan: 'pro', totalGenerations: 156, banned: false },
  { displayName: 'David Kim', email: 'david@example.com', avatar: 'DK', plan: 'free', totalGenerations: 3, banned: false },
];

async function seed() {
  console.log('Seeding categories...');
  for (const cat of categories) {
    await db.collection('categories').doc(cat.id).set({
      name: cat.name,
      icon: cat.icon,
      order: cat.order,
    });
  }

  console.log('Seeding products...');
  for (const product of products) {
    await db.collection('products').add({
      ...product,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  console.log('Seeding mock users...');
  for (const user of mockUsers) {
    await db.collection('users').add({
      ...user,
      role: 'user',
      subscriptionExpiry: user.plan === 'pro'
        ? admin.firestore.Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
        : null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  console.log('Seed complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
