import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { Searchbar, ActivityIndicator, useTheme, Button } from 'react-native-paper';
import { supabase } from '../../src/lib/supabase';
import PremiumCard from '../../components/PremiumCard';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWishlist } from '../../src/context/WishlistContext';

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    await Promise.all([fetchCategories(), fetchServices()]);
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories([{ id: 'all', name: 'All' }, ...(data || [])]);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchServices = async (category = 'All') => {
    try {
      let query = supabase
        .from('services')
        .select('*')
        .eq('status', 'active')
        .order('priority', { ascending: false });

      if (category !== 'All') {
        // Find category slug/id
        const cat = categories.find(c => c.name === category);
        if (cat) {
          // This assumes a direct service_type mapping or a join 
          // For now, let's use service_type matching as a fallback
          query = query.eq('service_type', cat.slug || category.toLowerCase());
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      setServices(data || []);
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchServices(selectedCategory);
    setRefreshing(false);
  };

  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (service.description && service.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.categoryItem, 
        selectedCategory === item.name && { backgroundColor: theme.colors.primary }
      ]}
      onPress={() => {
        setSelectedCategory(item.name);
        fetchServices(item.name);
      }}
    >
      <Text style={[
        styles.categoryText,
        selectedCategory === item.name && { color: '#FFF', fontWeight: '900' }
      ]}>
        {item.name.toUpperCase()}
      </Text>
    </TouchableOpacity>
  );

  const renderServiceItem = ({ item }) => (
    <PremiumCard style={styles.card}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: item.image_url || 'https://via.placeholder.com/400x200?text=No+Image' }} 
          style={styles.cardImage} 
        />
        <TouchableOpacity 
          style={styles.wishlistBtn}
          onPress={() => toggleWishlist(item)}
        >
          <MaterialCommunityIcons 
            name={isInWishlist(item.id) ? "heart" : "heart-outline"} 
            size={24} 
            color={isInWishlist(item.id) ? "#DC2626" : "#FFF"} 
          />
        </TouchableOpacity>
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>From ${item.base_price || 0}</Text>
        </View>
      </View>
      
      <PremiumCard.Content style={styles.cardContent}>
        <View style={styles.row}>
          <Text style={styles.locationText}>
            <MaterialCommunityIcons name="map-marker" size={12} color="#DC2626" /> {item.region || 'Mauritius'}
          </Text>
          <View style={styles.ratingRow}>
            <MaterialCommunityIcons name="star" size={14} color="#FFB000" />
            <Text style={styles.ratingText}>{item.rating || '4.5'}</Text>
          </View>
        </View>
        <Title style={styles.cardTitle}>{item.name}</Title>
        <Paragraph numberOfLines={2} style={styles.cardPara}>
          {item.description}
        </Paragraph>
      </PremiumCard.Content>
      <PremiumCard.Actions style={styles.cardActions}>
        <Button 
          mode="contained" 
          buttonColor="#DC2626"
          labelStyle={styles.btnLabel}
          onPress={() => router.push(`/service-details/${item.id}`)}
        >
          VIEW DETAILS
        </Button>
      </PremiumCard.Actions>
    </PremiumCard>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Where to next?"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          placeholderTextColor="#94A3B8"
          iconColor="#DC2626"
        />
        
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          style={styles.categoryList}
          contentContainerStyle={{ paddingRight: 24 }}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#DC2626" />
        </View>
      ) : (
        <FlatList
          data={filteredServices}
          renderItem={renderServiceItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#DC2626" />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No services found.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingVertical: 16,
    backgroundColor: '#FFF',
  },
  searchBar: {
    marginHorizontal: 16,
    backgroundColor: '#F1F5F9',
    elevation: 0,
    borderRadius: 12,
  },
  categoryList: {
    marginTop: 16,
    paddingLeft: 16,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F1F5F9',
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 24,
  },
  imageContainer: {
    height: 200,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  priceText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 12,
  },
  cardContent: {
    paddingTop: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E293B',
    lineHeight: 24,
    marginBottom: 8,
  },
  cardPara: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  cardActions: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  btnLabel: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 16,
  },
});