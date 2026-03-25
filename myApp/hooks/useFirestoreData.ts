import { useEffect, useState } from 'react';
import {
  subscribeProducts,
  subscribeCategories,
  subscribeSocialPosts,
  subscribeUserGenerations,
} from '@/services/firestore';
import {
  products as fallbackProducts,
  categories as fallbackCategories,
  socialPosts as fallbackSocialPosts,
} from '@/constants/mock-data';
import type { Category, Product, SocialPost, GeneratedImage } from '@/constants/mock-data';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeProducts((data) => {
      if (data.length > 0) setProducts(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { products, loading };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeCategories((data) => {
      if (data.length > 0) setCategories(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { categories, loading };
}

export function useSocialPosts() {
  const [posts, setPosts] = useState<SocialPost[]>(fallbackSocialPosts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeSocialPosts((data) => {
      if (data.length > 0) setPosts(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { posts, setPosts, loading };
}

export function useUserGenerations(userId: string | undefined) {
  const [generations, setGenerations] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setGenerations([]);
      setLoading(false);
      return;
    }
    const unsub = subscribeUserGenerations(userId, (data) => {
      setGenerations(data);
      setLoading(false);
    });
    return unsub;
  }, [userId]);

  return { generations, loading };
}
