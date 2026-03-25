import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const snap = await db.collection('social_posts').orderBy('createdAt', 'desc').get();
    const posts = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        userName: d.userName ?? '',
        userAvatar: d.userAvatar ?? '',
        productName: d.productName ?? '',
        likes: d.likes ?? 0,
        comments: d.comments ?? 0,
        createdAt: d.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      };
    });
    return NextResponse.json(posts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    await db.collection('social_posts').doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
