import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { CategoryCard } from './CategoryCard';
import { Category, DEFAULT_CATEGORIES } from '../hooks/useHomeData';
import { useRouter } from 'expo-router';

interface CategorySliderProps {
  categories?: Category[];
}

export const CategorySlider = ({ categories }: CategorySliderProps) => {
  const router = useRouter();
  const rawData = (categories && categories.length > 0) ? categories : DEFAULT_CATEGORIES;
  
  // Filter categories to only display active ones intended for home screen
  const filteredData = rawData.filter(c => c && (c as any).show_on_home !== false && (c as any).is_active !== false);
  const data = filteredData.length > 0 ? filteredData : DEFAULT_CATEGORIES;

  const handleCategoryPress = (cat: Category) => {
    const cleanSlug = (cat.slug || '').toLowerCase().trim();
    const cleanLink = (cat.link || '').trim();

    if (cleanLink && cleanLink.startsWith('/')) {
      router.push(cleanLink as any);
    } else if (cleanSlug === 'flights' || cleanSlug === 'flight') {
      router.push('/flights');
    } else {
      router.push(`/explore?category=${encodeURIComponent(cleanSlug)}`);
    }
  };

  return (
    <View style={styles.categoriesWrapper}>
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
        directionalLockEnabled={true}
        scrollEventThrottle={16}
        decelerationRate="fast"
        contentContainerStyle={styles.categoryScroll}
        keyExtractor={(item) => item.id || item.slug}
        renderItem={({ item }) => (
          <CategoryCard 
            name={item.name} 
            slug={item.slug}
            image_url={item.image_url} 
            onPress={() => handleCategoryPress(item)} 
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  categoriesWrapper: {
    marginTop: 24,
    marginBottom: 24,
  },
  categoryScroll: {
    paddingLeft: 24,
    paddingRight: 24,
  },
});
