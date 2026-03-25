import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const [usersSnap, productsSnap, generationsSnap, socialSnap] = await Promise.all([
      db.collection('users').get(),
      db.collection('products').get(),
      db.collection('generations').get(),
      db.collection('social_posts').get(),
    ]);

    const users = usersSnap.docs.map((d) => d.data());
    const totalUsers = users.length;
    const proUsers = users.filter((u) => u.plan === 'pro').length;
    const totalGenerations = generationsSnap.size;
    const totalProducts = productsSnap.size;
    const totalPosts = socialSnap.size;

    const products = productsSnap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a: any, b: any) => (b.tryOnCount ?? 0) - (a.tryOnCount ?? 0))
      .slice(0, 5)
      .map((p: any, i: number) => ({
        rank: i + 1,
        name: p.name,
        category: p.categoryId,
        tryOnCount: p.tryOnCount ?? 0,
        trending: p.isTrending ?? false,
      }));

    return NextResponse.json({
      stats: {
        totalUsers,
        proUsers,
        totalGenerations,
        totalProducts,
        totalPosts,
        revenue: proUsers * 7.99,
      },
      popularProducts: products,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
