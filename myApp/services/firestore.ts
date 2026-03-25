import {
  collection,
  doc,
  getDocs,
  getDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  limit,
  onSnapshot,
  updateDoc,
  increment,
  serverTimestamp,
  addDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { Category, Product, SocialPost, GeneratedImage } from '@/constants/mock-data';

export async function getCategories(): Promise<Category[]> {
  const snap = await getDocs(query(collection(db, 'categories'), orderBy('order', 'asc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
}

export async function getProducts(): Promise<Product[]> {
  const snap = await getDocs(query(collection(db, 'products'), orderBy('tryOnCount', 'desc')));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      name: data.name ?? '',
      categoryId: data.categoryId ?? '',
      color: data.color ?? '#6C63FF',
      description: data.description ?? '',
      features: data.features ?? [],
      tryOnCount: data.tryOnCount ?? 0,
      isTrending: data.isTrending ?? false,
      imageUrl: data.imageUrl || undefined,
    } as Product;
  });
}

export async function getSocialPosts(): Promise<SocialPost[]> {
  const snap = await getDocs(query(collection(db, 'social_posts'), orderBy('createdAt', 'desc'), limit(30)));
  return snap.docs.map((d) => {
    const data = d.data();
    const ts = data.createdAt?.toDate?.();
    return {
      id: d.id,
      userName: data.userName ?? '',
      userAvatar: data.userAvatar ?? '',
      productName: data.productName ?? '',
      likes: data.likes ?? 0,
      comments: data.comments ?? 0,
      timeAgo: ts ? getTimeAgo(ts) : '',
      liked: false,
    } as SocialPost;
  });
}

export async function getUserGenerations(userId: string): Promise<GeneratedImage[]> {
  const snap = await getDocs(
    query(collection(db, 'generations'), where('userId', '==', userId), orderBy('createdAt', 'desc')),
  );
  return snap.docs.map((d) => {
    const data = d.data();
    const ts = data.createdAt?.toDate?.();
    return {
      id: d.id,
      productName: data.productName ?? '',
      createdAt: ts ? getTimeAgo(ts) : '',
      color: data.color ?? '#6C63FF',
      resultImageUrl: data.resultImageUrl ?? undefined,
    } as GeneratedImage;
  });
}

export function subscribeProducts(cb: (products: Product[]) => void): Unsubscribe {
  return onSnapshot(
    query(collection(db, 'products'), orderBy('tryOnCount', 'desc')),
    (snap) => {
      cb(snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name ?? '',
          categoryId: data.categoryId ?? '',
          color: data.color ?? '#6C63FF',
          description: data.description ?? '',
          features: data.features ?? [],
          tryOnCount: data.tryOnCount ?? 0,
          isTrending: data.isTrending ?? false,
          imageUrl: data.imageUrl || undefined,
        } as Product;
      }));
    },
  );
}

export function subscribeCategories(cb: (cats: Category[]) => void): Unsubscribe {
  return onSnapshot(
    query(collection(db, 'categories'), orderBy('order', 'asc')),
    (snap) => {
      cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category)));
    },
  );
}

export function subscribeSocialPosts(cb: (posts: SocialPost[]) => void): Unsubscribe {
  return onSnapshot(
    query(collection(db, 'social_posts'), orderBy('createdAt', 'desc'), limit(30)),
    (snap) => {
      cb(
        snap.docs.map((d) => {
          const data = d.data();
          const ts = data.createdAt?.toDate?.();
          return {
            id: d.id,
            userName: data.userName ?? '',
            userAvatar: data.userAvatar ?? '',
            productName: data.productName ?? '',
            likes: data.likes ?? 0,
            comments: data.comments ?? 0,
            timeAgo: ts ? getTimeAgo(ts) : '',
            liked: false,
          } as SocialPost;
        }),
      );
    },
  );
}

export function subscribeUserGenerations(
  userId: string,
  cb: (imgs: GeneratedImage[]) => void,
): Unsubscribe {
  return onSnapshot(
    query(collection(db, 'generations'), where('userId', '==', userId), orderBy('createdAt', 'desc')),
    (snap) => {
      cb(
        snap.docs.map((d) => {
          const data = d.data();
          const ts = data.createdAt?.toDate?.();
          return {
            id: d.id,
            productName: data.productName ?? '',
            createdAt: ts ? getTimeAgo(ts) : '',
            color: data.color ?? '#6C63FF',
            resultImageUrl: data.resultImageUrl ?? undefined,
          } as GeneratedImage;
        }),
      );
    },
  );
}

export async function toggleLike(postId: string, add: boolean) {
  await updateDoc(doc(db, 'social_posts', postId), {
    likes: increment(add ? 1 : -1),
  });
}

export async function addGeneration(
  userId: string,
  productId: string,
  productName: string,
  color: string,
  resultImageUrl?: string,
) {
  await addDoc(collection(db, 'generations'), {
    userId,
    productId,
    productName,
    color,
    resultImageUrl: resultImageUrl ?? null,
    status: 'completed',
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'users', userId), {
    totalGenerations: increment(1),
    credits: increment(-1),
  });
}

export async function deleteGeneration(generationId: string) {
  await deleteDoc(doc(db, 'generations', generationId));
}

function getTimeAgo(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}
