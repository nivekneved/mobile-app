import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { 
  ActivityIndicator, 
  Button, 
  Title, 
  Paragraph, 
  useTheme,
  Divider,
} from 'react-native-paper';
import { supabase } from '../../src/lib/supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWishlist } from '../../src/context/WishlistContext';

import InquiryForm from '../../src/components/InquiryForm';

const { width } = Dimensions.get('window');

export default function ServiceDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inquiryVisible, setInquiryVisible] = useState(false);
  const theme = useTheme();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const router = useRouter();

  useEffect(() => {
    fetchService();
  }, [id]);

  const fetchService = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setService(data);
    } catch (err) {
      console.error('Error fetching service details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#DC2626" />
      </View>
    );
  }

  if (!service) {
    return (
      <View style={styles.center}>
        <Text>Service not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: '',
          headerTransparent: true,
          headerLeft: () => (
            <TouchableOpacity 
              style={styles.headerBtn} 
              onPress={() => router.back()}
            >
              <MaterialCommunityIcons name="chevron-left" size={28} color="#0F172A" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              style={styles.headerBtn}
              onPress={() => toggleWishlist(service)}
            >
              <MaterialCommunityIcons 
                name={isInWishlist(service.id) ? "heart" : "heart-outline"} 
                size={22} 
                color={isInWishlist(service.id) ? "#DC2626" : "#0F172A"} 
              />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView>
        <Image 
          source={{ uri: service.image_url || 'https://via.placeholder.com/800x400' }} 
          style={styles.image} 
        />
        
        <View style={styles.content}>
          <View style={styles.tagRow}>
            <Text style={styles.categoryTag}>{(service.service_type || 'Travel').toUpperCase()}</Text>
            <View style={styles.ratingBox}>
              <MaterialCommunityIcons name="star" size={14} color="#FFB000" />
              <Text style={styles.ratingText}>{service.rating || '4.5'}</Text>
            </View>
          </View>

          <Title style={styles.title}>{service.name}</Title>
          
          <View style={styles.locationRow}>
            <MaterialCommunityIcons name="map-marker-outline" size={16} color="#64748B" />
            <Text style={styles.locationText}>{service.location || 'Mauritius'}</Text>
          </View>

          <Divider style={styles.divider} />

          <Text style={styles.sectionTitle}>Overview</Text>
          <Paragraph style={styles.description}>
            {service.description}
          </Paragraph>

          {service.highlights && service.highlights.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Highlights</Text>
              {service.highlights.map((h, i) => (
                <View key={i} style={styles.listRow}>
                  <MaterialCommunityIcons name="check-circle" size={18} color="#DC2626" />
                  <Text style={styles.listText}>{h}</Text>
                </View>
              ))}
            </>
          )}

          <Divider style={styles.divider} />

          <View style={styles.bookingCard}>
            <View>
              <Text style={styles.priceLabel}>Price starting from</Text>
              <Text style={styles.priceValue}>${service.base_price || 0}</Text>
            </View>
            <Button 
              mode="contained" 
              buttonColor="#DC2626"
              style={styles.bookBtn}
              labelStyle={styles.bookBtnLabel}
              onPress={() => setInquiryVisible(true)}
            >
              INQUIRE NOW
            </Button>
          </View>
        </View>
      </ScrollView>

      <InquiryForm 
        visible={inquiryVisible} 
        onDismiss={() => setInquiryVisible(false)} 
        serviceId={service.id}
        serviceName={service.name}
      />
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: width,
    height: 350,
  },
  content: {
    padding: 24,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
  },
  tagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryTag: {
    fontSize: 10,
    fontWeight: '900',
    color: '#DC2626',
    letterSpacing: 2,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1E293B',
    lineHeight: 34,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  locationText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 4,
    fontWeight: '500',
  },
  divider: {
    marginVertical: 24,
    backgroundColor: '#F1F5F9',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
    marginBottom: 24,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  listText: {
    fontSize: 14,
    color: '#475569',
    marginLeft: 12,
    fontWeight: '500',
  },
  bookingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    marginTop: 8,
    marginBottom: 40,
  },
  priceLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1E293B',
  },
  bookBtn: {
    borderRadius: 100,
  },
  bookBtnLabel: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    paddingHorizontal: 8,
  },
});
