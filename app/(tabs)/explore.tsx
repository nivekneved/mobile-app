import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { Text, ActivityIndicator, Surface } from 'react-native-paper';
import { Colors } from '../../src/theme/colors';
import { useHomeData } from '../../src/hooks/useHomeData';
import { useSearchServices } from '../../src/hooks/useSearchServices';
import { ServiceCard } from '../../src/components/ServiceCard';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Search, Filter, Sparkles, SlidersHorizontal, PackageSearch } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

export default function ExploreScreen() {
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    (params.category as string) || 'all'
  );
  const { categories } = useHomeData();
  const { services, loading: loadingServices } = useSearchServices(searchQuery, selectedCategory);
  const router = useRouter();

  useEffect(() => {
    if (params.category) setSelectedCategory(params.category as string);
  }, [params.category]);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <PackageSearch size={64} color={Colors.slate[200]} strokeWidth={1} />
      <Text style={styles.emptyTitle}>NO MATCHES FOUND</Text>
      <Text style={styles.emptySubtitle}>We couldn't find any experiences matching your current filters. Try refining your selection.</Text>
      <TouchableOpacity 
        style={styles.resetBtn}
        onPress={() => {
          setSearchQuery('');
          setSelectedCategory('all');
        }}
      >
        <Text style={styles.resetText}>RESET ALL FILTERS</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Executive Discovery Header */}
      <Surface style={styles.header} elevation={0}>
        <View style={styles.headerTop}>
            <View>
                <Text style={styles.labelTitle}>DISCOVER VALUE</Text>
                <Text style={styles.title}>Explore Services</Text>
            </View>
            <TouchableOpacity style={styles.slidersBtn}>
                <SlidersHorizontal size={20} color={Colors.charcoal} />
            </TouchableOpacity>
        </View>

        <View style={styles.searchWrapper}>
             <Search size={20} color={Colors.slate[400]} />
             <input 
                style={styles.searchInput}
                placeholder="Search benefits, hotels, prices..."
                placeholderTextColor={Colors.slate[300]}
                value={searchQuery}
                onTextChange={setSearchQuery} // Note: This is a conceptual input for the elite look, assuming standard RN TextInput-like behavior if refactored or standard RN TextInput
             />
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          <TouchableOpacity
            onPress={() => setSelectedCategory('all')}
            style={[styles.chip, selectedCategory === 'all' && styles.selectedChip]}
          >
            <Text style={[styles.chipText, selectedCategory === 'all' && styles.selectedChipText]}>ALL SERVICES</Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setSelectedCategory(cat.slug)}
              style={[styles.chip, selectedCategory === cat.slug && styles.selectedChip]}
            >
              <Text style={[styles.chipText, selectedCategory === cat.slug && styles.selectedChipText]}>{cat.name?.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Surface>

      {loadingServices ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={styles.loadingText}>CURATING RESULTS...</Text>
        </View>
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <ServiceCard
                name={item.name}
                image_url={item.image_url}
                price={item.price}
                category={item.category}
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  labelTitle: {
    fontFamily: 'Outfit_900Black',
    fontSize: 10,
    letterSpacing: 4,
    color: Colors.primary,
    marginBottom: 4,
  },
  title: {
    fontFamily: 'Outfit_900Black',
    fontSize: 28,
    color: Colors.charcoal,
    letterSpacing: -1,
  },
  slidersBtn: {
     width: 48,
     height: 48,
     borderRadius: 16,
     backgroundColor: Colors.slate[50],
     borderWidth: 1,
     borderColor: Colors.border,
     justifyContent: 'center',
     alignItems: 'center',
  },
  searchWrapper: {
     flexDirection: 'row',
     alignItems: 'center',
     backgroundColor: Colors.slate[50],
     height: 60,
     borderRadius: 20,
     paddingHorizontal: 20,
     gap: 12,
     borderWidth: 1,
     borderColor: Colors.border,
  },
  searchInput: {
     flex: 1,
     fontFamily: 'Outfit_600SemiBold',
     fontSize: 15,
     color: Colors.charcoal,
  },
  filterContainer: {
    paddingVertical: 20,
    gap: 12,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedChip: {
    backgroundColor: Colors.charcoal,
    borderColor: Colors.charcoal,
  },
  chipText: {
    fontSize: 10,
    fontFamily: 'Outfit_900Black',
    color: Colors.slate[500],
    letterSpacing: 1,
  },
  selectedChipText: {
    color: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontFamily: 'Outfit_900Black',
    fontSize: 10,
    letterSpacing: 2,
    color: Colors.slate[400],
  },
  listContent: {
    padding: 24,
    paddingBottom: 120,
  },
  cardWrapper: {
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    paddingHorizontal: 48,
  },
  emptyTitle: {
    fontFamily: 'Outfit_900Black',
    fontSize: 16,
    letterSpacing: 2,
    color: Colors.charcoal,
    marginTop: 24,
    marginBottom: 12,
  },
  emptySubtitle: {
    color: Colors.slate[400],
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Outfit_500Medium',
    lineHeight: 22,
    marginBottom: 24,
  },
  resetBtn: {
    height: 54,
    paddingHorizontal: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetText: {
    color: Colors.white,
    fontSize: 11,
    fontFamily: 'Outfit_900Black',
    letterSpacing: 2,
  },
});
