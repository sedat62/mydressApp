import { NextResponse } from 'next/server';
import { db, auth } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET() {
  try {
    const usersSnap = await db.collection('users').orderBy('createdAt', 'desc').get();
    const users = usersSnap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        displayName: d.displayName ?? '',
        email: d.email ?? '',
        avatar: d.avatar ?? '',
        plan: d.plan ?? 'free',
        totalGenerations: d.totalGenerations ?? 0,
        credits: d.credits ?? 0,
        banned: d.banned ?? false,
        subscriptionExpiry: d.subscriptionExpiry?.toDate?.()?.toISOString() ?? null,
        createdAt: d.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      };
    });
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { userId, action, data } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    if (action === 'toggleBan') {
      const userDoc = await db.collection('users').doc(userId).get();
      const currentBanned = userDoc.data()?.banned ?? false;
      await db.collection('users').doc(userId).update({ banned: !currentBanned });
      return NextResponse.json({ success: true, banned: !currentBanned });
    }

    if (action === 'togglePremium') {
      const userDoc = await db.collection('users').doc(userId).get();
      const currentPlan = userDoc.data()?.plan ?? 'free';
      const newPlan = currentPlan === 'pro' ? 'free' : 'pro';
      await db.collection('users').doc(userId).update({ plan: newPlan });
      return NextResponse.json({ success: true, plan: newPlan });
    }

    if (action === 'addCredits' && data?.amount) {
      const amount = Number(data.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        return NextResponse.json({ error: 'Geçerli bir miktar girin' }, { status: 400 });
      }
      await db.collection('users').doc(userId).update({
        credits: FieldValue.increment(amount),
      });
      const updated = await db.collection('users').doc(userId).get();
      return NextResponse.json({ success: true, credits: updated.data()?.credits ?? 0 });
    }

    if (action === 'update' && data) {
      await db.collection('users').doc(userId).update(data);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
