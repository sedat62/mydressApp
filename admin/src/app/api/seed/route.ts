import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const categories = [
  { id: 'outfits', name: 'Outfits', icon: 'checkroom', order: 0 },
  { id: 'bags', name: 'Bags', icon: 'shopping-bag', order: 1 },
  { id: 'shoes', name: 'Shoes', icon: 'steps', order: 2 },
  { id: 'glasses', name: 'Glasses', icon: 'visibility', order: 3 },
  { id: 'watches', name: 'Watches', icon: 'watch', order: 4 },
  { id: 'accessories', name: 'Accessories', icon: 'diamond', order: 5 },
];

const products = [
  { name: 'Classic Leather Bag', categoryId: 'bags', color: '#D4A574', description: 'Timeless leather handbag with premium stitching. Perfect for everyday use or formal occasions.', features: ['Genuine leather', 'Adjustable strap', 'Inner pockets', 'Gold-tone hardware'], tryOnCount: 2340, isTrending: true, imageUrl: '' },
  { name: 'Urban Backpack', categoryId: 'bags', color: '#4A5568', description: 'Minimalist urban backpack designed for city commuters. Lightweight yet spacious.', features: ['Water-resistant fabric', 'Laptop compartment', 'Padded straps', 'Hidden pocket'], tryOnCount: 1820, isTrending: false, imageUrl: '' },
  { name: 'Elegant Clutch', categoryId: 'bags', color: '#E8B4C8', description: 'Sleek evening clutch with a satin finish. Adds a touch of glamour to any outfit.', features: ['Satin finish', 'Chain strap', 'Magnetic closure', 'Compact design'], tryOnCount: 3150, isTrending: true, imageUrl: '' },
  { name: 'Sport Sneakers', categoryId: 'shoes', color: '#7C8CF0', description: 'Versatile sneakers that blend comfort with street style.', features: ['Breathable mesh', 'Cushioned sole', 'Lightweight', 'Non-slip grip'], tryOnCount: 4210, isTrending: true, imageUrl: '' },
  { name: 'Classic Loafers', categoryId: 'shoes', color: '#8B6F47', description: 'Timeless leather loafers for a polished, refined look.', features: ['Full-grain leather', 'Penny slot detail', 'Cushioned insole', 'Durable sole'], tryOnCount: 1560, isTrending: false, imageUrl: '' },
  { name: 'Running Shoes', categoryId: 'shoes', color: '#48BB78', description: 'High-performance running shoes with responsive cushioning for every stride.', features: ['Foam midsole', 'Reflective details', 'Heel support', 'Breathable upper'], tryOnCount: 2890, isTrending: false, imageUrl: '' },
  { name: 'Aviator Sunglasses', categoryId: 'glasses', color: '#C4A35A', description: 'Iconic aviator frames with UV400 protection. A must-have for sunny days.', features: ['UV400 protection', 'Metal frame', 'Polarized lenses', 'Spring hinges'], tryOnCount: 5670, isTrending: true, imageUrl: '' },
  { name: 'Round Frames', categoryId: 'glasses', color: '#2D3748', description: 'Vintage-inspired round frames that add a creative, intellectual vibe.', features: ['Acetate frame', 'Anti-glare coating', 'Lightweight', 'Unisex fit'], tryOnCount: 980, isTrending: false, imageUrl: '' },
  { name: 'Cat Eye Glasses', categoryId: 'glasses', color: '#E53E3E', description: 'Bold cat eye frames that make a fashion statement. Retro charm meets modern style.', features: ['Acetate frame', 'Blue light filter', 'Slim temples', 'Wide fit'], tryOnCount: 1340, isTrending: false, imageUrl: '' },
  { name: 'Smart Watch Pro', categoryId: 'watches', color: '#2B6CB0', description: 'Premium smartwatch with health monitoring, GPS, and a stunning OLED display.', features: ['OLED display', 'Heart rate monitor', 'GPS tracking', 'Water-resistant'], tryOnCount: 3780, isTrending: true, imageUrl: '' },
  { name: 'Minimal Watch', categoryId: 'watches', color: '#1A1A2E', description: 'Clean, minimalist analog watch. Understated elegance for the modern wearer.', features: ['Japanese movement', 'Sapphire crystal', 'Leather band', 'Slim profile'], tryOnCount: 2100, isTrending: false, imageUrl: '' },
  { name: 'Gold Bracelet', categoryId: 'accessories', color: '#D4A017', description: 'Delicate gold-plated bracelet with a chain-link design. Stackable and versatile.', features: ['18K gold plated', 'Adjustable clasp', 'Tarnish-resistant', 'Hypoallergenic'], tryOnCount: 1450, isTrending: false, imageUrl: '' },
  { name: 'Silk Scarf', categoryId: 'accessories', color: '#9F7AEA', description: 'Luxurious silk scarf with an artistic print.', features: ['100% silk', 'Hand-rolled edges', 'Vivid print', 'Multi-wear styling'], tryOnCount: 2670, isTrending: true, imageUrl: '' },
  { name: 'Canvas Tote', categoryId: 'bags', color: '#CBD5E0', description: 'Durable canvas tote for everyday errands. Eco-friendly and effortlessly casual.', features: ['Organic cotton', 'Reinforced handles', 'Inner pocket', 'Machine washable'], tryOnCount: 890, isTrending: false, imageUrl: '' },
  { name: 'High Heels', categoryId: 'shoes', color: '#FC8181', description: 'Classic pointed-toe pumps that elevate any look.', features: ['Padded insole', 'Stiletto heel', 'Pointed toe', 'Suede finish'], tryOnCount: 3420, isTrending: true, imageUrl: '' },
  { name: 'Sport Watch', categoryId: 'watches', color: '#38A169', description: 'Rugged sport watch built for adventure.', features: ['Shock-resistant', 'Stopwatch', 'Backlight display', '100m water-resistant'], tryOnCount: 1980, isTrending: false, imageUrl: '' },
  { name: 'Casual Street Combo', categoryId: 'outfits', color: '#6C63FF', description: 'Relaxed streetwear combination: oversized tee, joggers, and fresh sneakers.', features: ['Oversized tee', 'Tapered joggers', 'White sneakers', 'Baseball cap'], tryOnCount: 6120, isTrending: true, imageUrl: '' },
  { name: 'Business Chic Set', categoryId: 'outfits', color: '#1A1A2E', description: 'Sharp business look with a blazer, slim trousers, and oxford shoes.', features: ['Fitted blazer', 'Slim trousers', 'Oxford shoes', 'Crisp shirt'], tryOnCount: 4350, isTrending: true, imageUrl: '' },
  { name: 'Summer Boho Outfit', categoryId: 'outfits', color: '#F6AD55', description: 'Breezy bohemian outfit perfect for warm days.', features: ['Maxi dress', 'Woven sandals', 'Straw hat', 'Layered necklaces'], tryOnCount: 3890, isTrending: false, imageUrl: '' },
];

const socialPosts = [
  { userName: 'Sarah Johnson', userAvatar: 'SJ', productName: 'Classic Leather Bag', likes: 234, comments: 18 },
  { userName: 'Mike Chen', userAvatar: 'MC', productName: 'Sport Sneakers', likes: 189, comments: 12 },
  { userName: 'Emma Wilson', userAvatar: 'EW', productName: 'Aviator Sunglasses', likes: 342, comments: 28 },
  { userName: 'Alex Rivera', userAvatar: 'AR', productName: 'Smart Watch Pro', likes: 156, comments: 9 },
  { userName: 'Lisa Park', userAvatar: 'LP', productName: 'Elegant Clutch', likes: 421, comments: 34 },
  { userName: 'David Kim', userAvatar: 'DK', productName: 'Running Shoes', likes: 278, comments: 21 },
];

export async function POST() {
  try {
    const batch = db.batch();

    for (const cat of categories) {
      batch.set(db.collection('categories').doc(cat.id), {
        name: cat.name,
        icon: cat.icon,
        order: cat.order,
      });
    }
    await batch.commit();

    for (const product of products) {
      await db.collection('products').add({
        ...product,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    for (const post of socialPosts) {
      await db.collection('social_posts').add({
        ...post,
        createdAt: FieldValue.serverTimestamp(),
      });
    }

    return NextResponse.json({ success: true, message: 'Seed completed: categories, products, social posts' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
