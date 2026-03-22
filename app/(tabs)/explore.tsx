import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Text, ActivityIndicator, Surface, Chip } from 'react-native-paper';
import { useSearchServices } from '../../src/hooks/useSearchServices';
import { Colors } from '../../src/theme/colors';
import { Search, MapPin, Star, Filter, X } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useHomeData } from '../../src/hooks/useHomeData';
import { StatusBar } from 'expo-status-bar';
import { resolveImageUrl } from '../../src/utils/imageUtils';

export default function ExploreScreen() {
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>('all');
  const { categories, isLoading: categoriesLoading } = useHomeData();
  const { services, isLoading, error, searchServices } = useSearchServices();
  const router = useRouter();

  // Sync state with URL parameters from Home screen or direct navigation
  useEffect(() => {
    if (params.category) {
      setSelectedCategory(params.category as string);
    } else if (params.query) {
      setSearchQuery(params.query as string);
    }
  }, [params.category, params.query]);

  // Perform search when filters or query changes
  useEffect(() => {
    searchServices(searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory, searchServices]);

  const renderServiceItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      onPress={() => router.push(`/services/${item.id}`)}
      activeOpacity={0.9}
    >
      <Surface style={styles.serviceCard} elevation={2}>
        <View style={styles.serviceImageContainer}>
          <Image 
            source={resolveImageUrl(item.image_url)} 
            style={styles.serviceImage} 
            resizeMode="cover"
          />
        </View>
        <View style={styles.serviceInfo}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category || 'Experience'}</Text>
          </View>
          <Text variant="titleMedium" style={styles.serviceName}>{item.name}</Text>
          <View style={styles.locationContainer}>
            <MapPin size={14} color={Colors.textSecondary} />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.price}>Rs {item.price.toLocaleString()}</Text>
            <View style={styles.ratingContainer}>
              <Star size={14} color="#FFD700" fill="#FFD700" />
              <Text style={styles.ratingText}>4.9</Text>
            </View>
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>Explore</Text>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            placeholder="Search experiences..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.textSecondary}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
          <Chip 
            selected={selectedCategory === 'all'} 
            onPress={() => setSelectedCategory('all')}
            style={[styles.categoryChip, selectedCategory === 'all' && styles.selectedChip]}
            textStyle={[styles.chipText, selectedCategory === 'all' && styles.selectedChipText]}
          >
            All
          </Chip>
          {categories.map((cat) => (
            <Chip 
              key={cat.id}
              selected={selectedCategory === cat.slug} 
              onPress={() => setSelectedCategory(cat.slug)}
              style={[styles.categoryChip, selectedCategory === cat.slug && styles.selectedChip]}
              textStyle={[styles.chipText, selectedCategory === cat.slug && styles.selectedChipText]}
            >
              {cat.name}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={services}
          renderItem={renderServiceItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text variant="titleMedium" style={styles.emptyText}>No services found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 80,
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: Colors.white,
  },
  title: {
    fontWeight: '900',
    color: Colors.charcoal,
    letterSpacing: -1,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.charcoal,
  },
  filterSection: {
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoryList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 12,
  },
  selectedChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontWeight: '600',
    color: Colors.charcoal,
    fontSize: 13,
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
    padding: 24,
    paddingBottom: 40,
  },
  serviceCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
  },
  serviceImageContainer: {
    height: 180,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  serviceImage: {
    width: '100%',
    height: '100%',
  },
  placeholderText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  serviceInfo: {
    padding: 20,
  },
  categoryBadge: {
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoryText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  serviceName: {
    fontWeight: '800',
    color: Colors.charcoal,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  locationText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  price: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontWeight: '700',
    fontSize: 12,
    color: Colors.charcoal,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontWeight: '700',
    color: Colors.charcoal,
    marginBottom: 4,
  },
  emptySubtext: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
});
