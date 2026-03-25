import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET() {
  try {
    const snap = await db.collection('products').orderBy('tryOnCount', 'desc').get();
    const products = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        name: d.name ?? '',
        categoryId: d.categoryId ?? '',
        color: d.color ?? '#6C63FF',
        description: d.description ?? '',
        features: d.features ?? [],
        tryOnCount: d.tryOnCount ?? 0,
        isTrending: d.isTrending ?? false,
        imageUrl: d.imageUrl ?? '',
        createdAt: d.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      };
    });
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const ref = await db.collection('products').add({
      ...body,
      tryOnCount: body.tryOnCount ?? 0,
      isTrending: body.isTrending ?? false,
      imageUrl: body.imageUrl ?? '',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ id: ref.id, success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    await db.collection('products').doc(id).update({
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    await db.collection('products').doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
