import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, FlatList, TextInput, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import { Text, ActivityIndicator, Surface, Chip, Button } from 'react-native-paper';
import { useSearchServices } from '../../src/hooks/useSearchServices';
import { Colors } from '../../src/theme/colors';
import { Search, MapPin, Star, Sliders, X } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useHomeData } from '../../src/hooks/useHomeData';
import { StatusBar } from 'expo-status-bar';
import { resolveImageUrl } from '../../src/utils/imageUtils';
import { FilterModal } from '../../src/components/FilterModal';

const { width } = Dimensions.get('window');

export default function ExploreScreen() {
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>('all');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    adults: 2,
    teenagers: 0,
    children: 0,
    infants: 0,
    date: null,
    priceRange: [0, 200000],
  });

  const { categories } = useHomeData();
  const { services, isLoading, searchServices } = useSearchServices();
  const router = useRouter();

  useEffect(() => {
    if (params.category) {
      setSelectedCategory(params.category as string);
    } else if (params.query) {
      setSearchQuery(params.query as string);
    }
  }, [params.category, params.query]);

  useEffect(() => {
    searchServices(searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory]);

  const processedServices = useMemo(() => {
    let result = [...services];

    const totalGuests = filters.adults + filters.teenagers + filters.children + filters.infants;
    if (totalGuests > 0) {
      result = result.filter(s => {
         if (s.max_group_size && totalGuests > s.max_group_size) return false;
         if (s.max_adults && filters.adults > s.max_adults) return false;
         return true;
      });
    }

    if (filters.priceRange[1] < 200000) {
      result = result.filter(s => (s.price ?? 0) <= filters.priceRange[1]);
    }

    return result;
  }, [services, filters]);

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
    setIsFilterVisible(false);
  };

  const renderServiceItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      onPress={() => router.push(`/services/${item.id}`)}
      activeOpacity={0.9}
      style={styles.serviceCardWrapper}
    >
      <Surface style={styles.serviceCard} elevation={0}>
        <View style={styles.serviceImageContainer}>
          <Image 
            source={resolveImageUrl(item.image_url)} 
            style={styles.serviceImage} 
            resizeMode="cover"
          />
          <View style={styles.priceTag}>
            <Text style={styles.priceLabel}>FROM</Text>
            <Text style={styles.priceValue}>Rs {item.price?.toLocaleString() || '0'}</Text>
          </View>
        </View>
        <View style={styles.serviceInfo}>
          <View style={styles.headerRow}>
            <Text style={styles.categoryBadgeText}>{item.category?.toUpperCase() || 'EXPERIENCE'}</Text>
            <View style={styles.eliteBadge}>
              <Star size={10} color="#D97706" fill="#D97706" />
              <Text style={styles.eliteText}>ELITE</Text>
            </View>
          </View>
          
          <Text style={styles.serviceName}>{item.name}</Text>
          
          <View style={styles.footerRow}>
            <View style={styles.locationContainer}>
              <MapPin size={12} color={Colors.slate[400]} />
              <Text style={styles.locationText}>{item.location || 'Mauritius'}</Text>
            </View>
            <View style={styles.discoverBtn}>
               <Text style={styles.discoverText}>DISCOVER</Text>
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
          <TouchableOpacity style={styles.filterBtn} onPress={() => setIsFilterVisible(true)}>
            <Sliders size={20} color={Colors.primary} />
          </TouchableOpacity>
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
          {[
            ...categories.filter(cat => cat.slug !== 'activities' && cat.slug !== 'flight' && cat.slug !== 'flights'),
            ...(!categories.find(c => c.slug === 'sea-activities') ? [{ id: 'sea-act', name: 'Sea Activities', slug: 'activities-sea' }] : []),
            ...(!categories.find(c => c.slug === 'land-activities') ? [{ id: 'land-act', name: 'Land Activities', slug: 'activities-land' }] : [])
          ].map((cat: any) => (
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
          data={processedServices}
          renderItem={renderServiceItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text variant="titleMedium" style={styles.emptyText}>No services found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
              <Button mode="text" onPress={() => setFilters({ adults: 2, teenagers: 0, children: 0, infants: 0, date: null, priceRange: [0, 200000] })}>Reset Filters</Button>
            </View>
          }
        />
      )}

      <FilterModal 
        visible={isFilterVisible} 
        onClose={() => setIsFilterVisible(false)} 
        filters={filters} 
        onApply={handleApplyFilters} 
      />
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
  filterBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: Colors.white,
    marginLeft: 8,
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
  serviceCardWrapper: {
    marginBottom: 24,
  },
  serviceCard: {
    backgroundColor: Colors.white,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  serviceImageContainer: {
    height: 200,
    backgroundColor: Colors.surface,
    position: 'relative',
  },
  serviceImage: {
    width: '100%',
    height: '100%',
  },
  priceTag: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  priceLabel: {
    fontFamily: 'Outfit_900Black',
    fontSize: 8,
    color: Colors.slate[400],
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  priceValue: {
    fontFamily: 'Outfit_900Black',
    fontSize: 16,
    color: Colors.primary,
  },
  serviceInfo: {
    padding: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadgeText: {
    fontFamily: 'Outfit_900Black',
    fontSize: 10,
    color: Colors.primary,
    letterSpacing: 2,
  },
  eliteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  eliteText: {
    fontFamily: 'Outfit_900Black',
    fontSize: 8,
    color: '#D97706',
    letterSpacing: 1,
  },
  serviceName: {
    fontFamily: 'Outfit_900Black',
    fontSize: 20,
    color: Colors.charcoal,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
    color: Colors.slate[400],
  },
  discoverBtn: {
    backgroundColor: Colors.slate[50],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  discoverText: {
    fontFamily: 'Outfit_900Black',
    fontSize: 10,
    color: Colors.charcoal,
    letterSpacing: 1,
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
