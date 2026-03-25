export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  color: string;
  description: string;
  features: string[];
  tryOnCount: number;
  isTrending: boolean;
  imageUrl?: string;
}

export interface SocialPost {
  id: string;
  userName: string;
  userAvatar: string;
  productName: string;
  likes: number;
  comments: number;
  timeAgo: string;
  liked: boolean;
}

export interface GeneratedImage {
  id: string;
  productName: string;
  createdAt: string;
  color: string;
  resultImageUrl?: string;
}

export const categories: Category[] = [
  { id: 'outfits', name: 'Outfits', icon: 'checkroom' },
  { id: 'bags', name: 'Bags', icon: 'shopping-bag' },
  { id: 'shoes', name: 'Shoes', icon: 'steps' },
  { id: 'glasses', name: 'Glasses', icon: 'visibility' },
  { id: 'watches', name: 'Watches', icon: 'watch' },
  { id: 'accessories', name: 'Accessories', icon: 'diamond' },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Classic Leather Bag',
    categoryId: 'bags',
    color: '#D4A574',
    description: 'Timeless leather handbag with premium stitching. Perfect for everyday use or formal occasions.',
    features: ['Genuine leather', 'Adjustable strap', 'Inner pockets', 'Gold-tone hardware'],
    tryOnCount: 2340,
    isTrending: true,
  },
  {
    id: '2',
    name: 'Urban Backpack',
    categoryId: 'bags',
    color: '#4A5568',
    description: 'Minimalist urban backpack designed for city commuters. Lightweight yet spacious.',
    features: ['Water-resistant fabric', 'Laptop compartment', 'Padded straps', 'Hidden pocket'],
    tryOnCount: 1820,
    isTrending: false,
  },
  {
    id: '3',
    name: 'Elegant Clutch',
    categoryId: 'bags',
    color: '#E8B4C8',
    description: 'Sleek evening clutch with a satin finish. Adds a touch of glamour to any outfit.',
    features: ['Satin finish', 'Chain strap', 'Magnetic closure', 'Compact design'],
    tryOnCount: 3150,
    isTrending: true,
  },
  {
    id: '4',
    name: 'Sport Sneakers',
    categoryId: 'shoes',
    color: '#7C8CF0',
    description: 'Versatile sneakers that blend comfort with street style. Great for casual and athletic wear.',
    features: ['Breathable mesh', 'Cushioned sole', 'Lightweight', 'Non-slip grip'],
    tryOnCount: 4210,
    isTrending: true,
  },
  {
    id: '5',
    name: 'Classic Loafers',
    categoryId: 'shoes',
    color: '#8B6F47',
    description: 'Timeless leather loafers for a polished, refined look. Ideal for smart casual outfits.',
    features: ['Full-grain leather', 'Penny slot detail', 'Cushioned insole', 'Durable sole'],
    tryOnCount: 1560,
    isTrending: false,
  },
  {
    id: '6',
    name: 'Running Shoes',
    categoryId: 'shoes',
    color: '#48BB78',
    description: 'High-performance running shoes with responsive cushioning for every stride.',
    features: ['Foam midsole', 'Reflective details', 'Heel support', 'Breathable upper'],
    tryOnCount: 2890,
    isTrending: false,
  },
  {
    id: '7',
    name: 'Aviator Sunglasses',
    categoryId: 'glasses',
    color: '#C4A35A',
    description: 'Iconic aviator frames with UV400 protection. A must-have for sunny days.',
    features: ['UV400 protection', 'Metal frame', 'Polarized lenses', 'Spring hinges'],
    tryOnCount: 5670,
    isTrending: true,
  },
  {
    id: '8',
    name: 'Round Frames',
    categoryId: 'glasses',
    color: '#2D3748',
    description: 'Vintage-inspired round frames that add a creative, intellectual vibe to any look.',
    features: ['Acetate frame', 'Anti-glare coating', 'Lightweight', 'Unisex fit'],
    tryOnCount: 980,
    isTrending: false,
  },
  {
    id: '9',
    name: 'Cat Eye Glasses',
    categoryId: 'glasses',
    color: '#E53E3E',
    description: 'Bold cat eye frames that make a fashion statement. Retro charm meets modern style.',
    features: ['Acetate frame', 'Blue light filter', 'Slim temples', 'Wide fit'],
    tryOnCount: 1340,
    isTrending: false,
  },
  {
    id: '10',
    name: 'Smart Watch Pro',
    categoryId: 'watches',
    color: '#2B6CB0',
    description: 'Premium smartwatch with health monitoring, GPS, and a stunning OLED display.',
    features: ['OLED display', 'Heart rate monitor', 'GPS tracking', 'Water-resistant'],
    tryOnCount: 3780,
    isTrending: true,
  },
  {
    id: '11',
    name: 'Minimal Watch',
    categoryId: 'watches',
    color: '#1A1A2E',
    description: 'Clean, minimalist analog watch. Understated elegance for the modern wearer.',
    features: ['Japanese movement', 'Sapphire crystal', 'Leather band', 'Slim profile'],
    tryOnCount: 2100,
    isTrending: false,
  },
  {
    id: '12',
    name: 'Gold Bracelet',
    categoryId: 'accessories',
    color: '#D4A017',
    description: 'Delicate gold-plated bracelet with a chain-link design. Stackable and versatile.',
    features: ['18K gold plated', 'Adjustable clasp', 'Tarnish-resistant', 'Hypoallergenic'],
    tryOnCount: 1450,
    isTrending: false,
  },
  {
    id: '13',
    name: 'Silk Scarf',
    categoryId: 'accessories',
    color: '#9F7AEA',
    description: 'Luxurious silk scarf with an artistic print. Wear it around the neck, as a headband, or on your bag.',
    features: ['100% silk', 'Hand-rolled edges', 'Vivid print', 'Multi-wear styling'],
    tryOnCount: 2670,
    isTrending: true,
  },
  {
    id: '14',
    name: 'Canvas Tote',
    categoryId: 'bags',
    color: '#CBD5E0',
    description: 'Durable canvas tote for everyday errands. Eco-friendly and effortlessly casual.',
    features: ['Organic cotton', 'Reinforced handles', 'Inner pocket', 'Machine washable'],
    tryOnCount: 890,
    isTrending: false,
  },
  {
    id: '15',
    name: 'High Heels',
    categoryId: 'shoes',
    color: '#FC8181',
    description: 'Classic pointed-toe pumps that elevate any look. Comfortable enough for all-day wear.',
    features: ['Padded insole', 'Stiletto heel', 'Pointed toe', 'Suede finish'],
    tryOnCount: 3420,
    isTrending: true,
  },
  {
    id: '16',
    name: 'Sport Watch',
    categoryId: 'watches',
    color: '#38A169',
    description: 'Rugged sport watch built for adventure. Tracks workouts, steps, and outdoor activities.',
    features: ['Shock-resistant', 'Stopwatch', 'Backlight display', '100m water-resistant'],
    tryOnCount: 1980,
    isTrending: false,
  },
  {
    id: '17',
    name: 'Casual Street Combo',
    categoryId: 'outfits',
    color: '#6C63FF',
    description: 'Relaxed streetwear combination: oversized tee, joggers, and fresh sneakers. Effortless cool.',
    features: ['Oversized tee', 'Tapered joggers', 'White sneakers', 'Baseball cap'],
    tryOnCount: 6120,
    isTrending: true,
  },
  {
    id: '18',
    name: 'Business Chic Set',
    categoryId: 'outfits',
    color: '#1A1A2E',
    description: 'Sharp business look with a blazer, slim trousers, and oxford shoes. Boardroom ready.',
    features: ['Fitted blazer', 'Slim trousers', 'Oxford shoes', 'Crisp shirt'],
    tryOnCount: 4350,
    isTrending: true,
  },
  {
    id: '19',
    name: 'Summer Boho Outfit',
    categoryId: 'outfits',
    color: '#F6AD55',
    description: 'Breezy bohemian outfit perfect for warm days. Flowing fabrics and earthy tones.',
    features: ['Maxi dress', 'Woven sandals', 'Straw hat', 'Layered necklaces'],
    tryOnCount: 3890,
    isTrending: false,
  },
];

export const socialPosts: SocialPost[] = [
  {
    id: '1',
    userName: 'Sarah Johnson',
    userAvatar: 'SJ',
    productName: 'Classic Leather Bag',
    likes: 234,
    comments: 18,
    timeAgo: '2h ago',
    liked: false,
  },
  {
    id: '2',
    userName: 'Mike Chen',
    userAvatar: 'MC',
    productName: 'Sport Sneakers',
    likes: 189,
    comments: 12,
    timeAgo: '4h ago',
    liked: true,
  },
  {
    id: '3',
    userName: 'Emma Wilson',
    userAvatar: 'EW',
    productName: 'Aviator Sunglasses',
    likes: 342,
    comments: 28,
    timeAgo: '6h ago',
    liked: false,
  },
  {
    id: '4',
    userName: 'Alex Rivera',
    userAvatar: 'AR',
    productName: 'Smart Watch Pro',
    likes: 156,
    comments: 9,
    timeAgo: '8h ago',
    liked: false,
  },
  {
    id: '5',
    userName: 'Lisa Park',
    userAvatar: 'LP',
    productName: 'Elegant Clutch',
    likes: 421,
    comments: 34,
    timeAgo: '12h ago',
    liked: true,
  },
  {
    id: '6',
    userName: 'David Kim',
    userAvatar: 'DK',
    productName: 'Running Shoes',
    likes: 278,
    comments: 21,
    timeAgo: '1d ago',
    liked: false,
  },
];

export const generatedImages: GeneratedImage[] = [
  { id: '1', productName: 'Classic Leather Bag', createdAt: 'Today', color: '#D4A574' },
  { id: '2', productName: 'Sport Sneakers', createdAt: 'Today', color: '#7C8CF0' },
  { id: '3', productName: 'Aviator Sunglasses', createdAt: 'Yesterday', color: '#C4A35A' },
  { id: '4', productName: 'Smart Watch Pro', createdAt: 'Yesterday', color: '#2B6CB0' },
  { id: '5', productName: 'Elegant Clutch', createdAt: '2 days ago', color: '#E8B4C8' },
  { id: '6', productName: 'Round Frames', createdAt: '3 days ago', color: '#2D3748' },
  { id: '7', productName: 'Gold Bracelet', createdAt: '4 days ago', color: '#D4A017' },
  { id: '8', productName: 'Classic Loafers', createdAt: '5 days ago', color: '#8B6F47' },
  { id: '9', productName: 'Urban Backpack', createdAt: '1 week ago', color: '#4A5568' },
];

export function formatTryOnCount(count: number): string {
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return count.toString();
}

export function getCategoryName(categoryId: string): string {
  return categories.find((c) => c.id === categoryId)?.name ?? categoryId;
}
