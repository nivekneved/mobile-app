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
  const data = (categories && categories.length > 0) ? categories : DEFAULT_CATEGORIES;

  const handleCategoryPress = (cat: Category) => {
    if (cat.slug === 'flights') {
      router.push('/flights');
    } else {
      router.push(`/explore?category=${encodeURIComponent(cat.slug)}`);
    }
  };

  return (
    <View style={styles.categoriesWrapper}>
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
