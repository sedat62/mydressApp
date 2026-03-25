import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const snap = await db.collection('categories').orderBy('order', 'asc').get();
    const categories = snap.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name ?? '',
      icon: doc.data().icon ?? '',
      order: doc.data().order ?? 0,
    }));
    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
