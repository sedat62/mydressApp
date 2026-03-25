import { useState, useMemo, useCallback } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/theme';
import { useProducts, useCategories } from '@/hooks/useFirestoreData';
import { CategoryPill } from '@/components/category-pill';
import { ProductCard } from '@/components/product-card';
import { TrendingCard } from '@/components/trending-card';
import { ProductDetailSheet } from '@/components/product-detail-sheet';
import type { Product } from '@/constants/mock-data';

export default function HomeScreen() {
  const router = useRouter();
  const { products } = useProducts();
  const { categories } = useCategories();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sheetProduct, setSheetProduct] = useState<Product | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const trendingProducts = useMemo(
    () => products.filter((p) => p.isTrending),
    [products],
  );

  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (selectedCategory) {
      filtered = filtered.filter((p) => p.categoryId === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(q));
    }
    return filtered;
  }, [selectedCategory, search, products]);

  const productRows = useMemo(() => {
    const rows: (typeof filteredProducts)[] = [];
    for (let i = 0; i < filteredProducts.length; i += 2) {
      rows.push(filteredProducts.slice(i, i + 2));
    }
    return rows;
  }, [filteredProducts]);

  const openSheet = useCallback((product: Product) => {
    setSheetProduct(product);
    setSheetVisible(true);
  }, []);

  const closeSheet = useCallback(() => {
    setSheetVisible(false);
  }, []);

  const handleTryOn = useCallback((product: Product) => {
    setSheetVisible(false);
    router.push({ pathname: '/(tabs)/generate', params: { productId: product.id } });
  }, [router]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View entering={FadeIn.duration(500)} style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.title}>TryOn AI</Text>
        </View>
        <Pressable style={styles.notifBtn}>
          <MaterialIcons name="notifications-none" size={24} color={Colors.text} />
        </Pressable>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.mainContent}>
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.searchRow}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor={Colors.textSecondary}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')}>
                <MaterialIcons name="close" size={18} color={Colors.textSecondary} />
              </Pressable>
            )}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <View style={styles.trendingHeader}>
            <MaterialIcons name="trending-up" size={20} color={Colors.primary} />
            <Text style={styles.trendingTitle}>Trending Try-Ons</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.trendingRow}>
            {trendingProducts.map((p) => (
              <TrendingCard key={p.id} product={p} onPress={openSheet} />
            ))}
          </ScrollView>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}>
            <CategoryPill
              name="All"
              icon="apps"
              selected={selectedCategory === null}
              onPress={() => setSelectedCategory(null)}
            />
            {categories.map((cat) => (
              <CategoryPill
                key={cat.id}
                name={cat.name}
                icon={cat.icon}
                selected={selectedCategory === cat.id}
                onPress={() =>
                  setSelectedCategory(selectedCategory === cat.id ? null : cat.id)
                }
              />
            ))}
          </ScrollView>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedCategory
              ? categories.find((c) => c.id === selectedCategory)?.name ?? 'Products'
              : 'Discover'}
          </Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{filteredProducts.length}</Text>
          </View>
        </Animated.View>

        {productRows.length > 0 ? (
          productRows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.productRow}>
              {row.map((item, colIndex) => {
                const index = rowIndex * 2 + colIndex;
                return (
                  <View
                    key={item.id}
                    style={[
                      styles.productWrapper,
                      colIndex === 0 ? styles.productLeft : styles.productRight,
                    ]}>
                    <ProductCard product={item} onPress={openSheet} index={index} />
                  </View>
                );
              })}
              {row.length === 1 && <View style={styles.productWrapper} />}
            </View>
          ))
        ) : (
          <View style={styles.empty}>
            <MaterialIcons name="search-off" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        )}
      </ScrollView>

      <ProductDetailSheet
        product={sheetProduct}
        visible={sheetVisible}
        onClose={closeSheet}
        onTryOn={handleTryOn}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  greeting: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  mainContent: {
    paddingBottom: 100,
  },
  searchRow: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  trendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 10,
  },
  trendingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  trendingRow: {
    paddingHorizontal: 20,
    paddingBottom: 6,
  },
  categoryRow: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  countBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  productRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
  },
  productWrapper: {
    flex: 1,
    padding: 6,
  },
  productLeft: {
    paddingRight: 4,
  },
  productRight: {
    paddingLeft: 4,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
});
