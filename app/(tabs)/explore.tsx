import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Searchbar, Chip, ActivityIndicator, Surface } from 'react-native-paper';
import { Colors } from '../../src/theme/colors';
import { useHomeData } from '../../src/hooks/useHomeData';
import { useSearchServices } from '../../src/hooks/useSearchServices';
import { ServiceCard } from '../../src/components/ServiceCard';
import { useRouter } from 'expo-router';
import { Search, FilterX } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>('all');
  const { categories, loading: loadingCats } = useHomeData();
  const { services, loading: loadingServices } = useSearchServices(searchQuery, selectedCategory);
  const router = useRouter();

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <FilterX size={48} color={Colors.textSecondary} strokeWidth={1} />
      <Text variant="titleMedium" style={styles.emptyTitle}>No experiences found</Text>
      <Text variant="bodyMedium" style={styles.emptySubtitle}>Try adjusting your search or filters.</Text>
      <TouchableOpacity 
        onPress={() => {
          setSearchQuery('');
          setSelectedCategory('all');
        }}
      >
        <Text style={styles.resetText}>Reset all filters</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Surface style={styles.header} elevation={0}>
        <Text variant="headlineMedium" style={styles.title}>Explore</Text>
        <Searchbar
          placeholder="Search hotels, activities..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={Colors.primary}
          placeholderTextColor={Colors.textSecondary}
        />
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          <Chip
            selected={selectedCategory === 'all'}
            onPress={() => setSelectedCategory('all')}
            style={[styles.chip, selectedCategory === 'all' && styles.selectedChip]}
            textStyle={[styles.chipText, selectedCategory === 'all' && styles.selectedChipText]}
            showSelectedOverlay
          >
            All
          </Chip>
          {categories.map((cat) => (
            <Chip
              key={cat.id}
              selected={selectedCategory === cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              style={[styles.chip, selectedCategory === cat.id && styles.selectedChip]}
              textStyle={[styles.chipText, selectedCategory === cat.id && styles.selectedChipText]}
              showSelectedOverlay
            >
              {cat.name}
            </Chip>
          ))}
        </ScrollView>
      </Surface>

      {loadingServices ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          numColumns={1}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <ServiceCard
                name={item.name}
                image_url={item.image_url}
                price={item.price}
                location={item.location}
                onPress={() => router.push(`/services/${item.id}`)}
              />
            </View>
          )}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
    paddingBottom: 16,
  },
  title: {
    fontWeight: '900',
    color: Colors.charcoal,
    marginBottom: 16,
    letterSpacing: -1,
  },
  searchBar: {
    backgroundColor: Colors.surface,
    elevation: 0,
    borderRadius: 12,
    height: 50,
  },
  searchInput: {
    fontSize: 14,
  },
  filterContainer: {
    paddingVertical: 16,
    gap: 8,
  },
  chip: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  selectedChip: {
    backgroundColor: Colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  selectedChipText: {
    color: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  cardWrapper: {
    marginBottom: 16,
    width: '100%',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontWeight: '900',
    color: Colors.charcoal,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  resetText: {
    color: Colors.primary,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
});
