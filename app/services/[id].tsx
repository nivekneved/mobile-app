import React from 'react';
import { View, StyleSheet, ScrollView, Image, Dimensions, TouchableOpacity, Share } from 'react-native';
import { Text, ActivityIndicator, Button, Surface } from 'react-native-paper';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Colors } from '../../src/theme/colors';
import { useServiceDetails } from '../../src/hooks/useServiceDetails';
import { MapPin, ArrowLeft, Share2, Mail, Clock, Info } from 'lucide-react-native';
import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 400;

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { service, loading, error } = useServiceDetails(id);

  const handleInquiry = () => {
    if (!service) return;
    
    const subject = `Inquiry: ${service.name}`;
    const body = `Hello Travel Lounge team,\n\nI am interested in the following service:\n\nService Name: ${service.name}\nService ID: ${service.id}\nLocation: ${service.location || 'N/A'}\n\nPlease provide more information regarding availability and booking details.\n\nThank you!`;
    
    Linking.openURL(`mailto:info@travellounge.mu?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const handleShare = async () => {
    if (!service) return;
    try {
      await Share.share({
        message: `Check out this amazing experience on Travel Lounge: ${service.name}\nLocation: ${service.location}\nPrice: Rs ${service.price}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (error || !service) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Service not found</Text>
        <Button mode="contained" onPress={() => router.back()} style={{ marginTop: 20 }}>Go Back</Button>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
        {/* Header Image Section */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: service.image_url || 'https://via.placeholder.com/800x600?text=Travel+Lounge' }} 
            style={styles.image} 
          />
          <View style={styles.overlay} />
          
          {/* Custom Header Controls */}
          <View style={styles.topControls}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
              <ArrowLeft color={Colors.white} size={24} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
              <Share2 color={Colors.white} size={24} />
            </TouchableOpacity>
          </View>

          {/* Title Overlay */}
          <View style={styles.titleOverlay}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{service.category || 'Experience'}</Text>
            </View>
            <Text variant="headlineMedium" style={styles.name}>{service.name}</Text>
            {service.location && (
              <View style={styles.locationContainer}>
                <MapPin color={Colors.white} size={16} />
                <Text style={styles.location}>{service.location}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          <View style={styles.priceSection}>
            <View>
              <Text variant="labelLarge" style={styles.priceLabel}>Starting from</Text>
              <Text variant="displaySmall" style={styles.price}>Rs {service.price.toLocaleString()}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Guaranteed Best Price</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Clock color={Colors.primary} size={20} />
              <View>
                <Text style={styles.detailLabel}>Availability</Text>
                <Text style={styles.detailValue}>Flexible Dates</Text>
              </View>
            </View>
            <View style={styles.detailItem}>
              <Info color={Colors.primary} size={20} />
              <View>
                <Text style={styles.detailLabel}>Type</Text>
                <Text style={styles.detailValue}>{service.category}</Text>
              </View>
            </View>
          </View>

          <View style={styles.descriptionSection}>
            <Text variant="titleLarge" style={styles.sectionTitle}>Overview</Text>
            <Text variant="bodyLarge" style={styles.description}>
              {service.description || "Discover the beauty and luxury of this carefully curated experience by Travel Lounge. We ensure every detail is handled with professional care for your comfort and enjoyment."}
            </Text>
          </View>
          
          {/* Spacing for bottom bar */}
          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <Surface style={styles.bottomBar} elevation={4}>
        <View style={styles.bottomBarContent}>
          <View>
            <Text variant="labelMedium" style={styles.bottomPriceLabel}>Total Package From</Text>
            <Text variant="titleLarge" style={styles.bottomPrice}>Rs {service.price.toLocaleString()}</Text>
          </View>
          <Button 
            mode="contained" 
            onPress={handleInquiry}
            style={styles.bookButton}
            contentStyle={styles.bookButtonContent}
            icon={({ size, color }) => <Mail size={size} color={color} />}
          >
            Inquire Now
          </Button>
        </View>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    height: HEADER_HEIGHT,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  topControls: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleOverlay: {
    position: 'absolute',
    bottom: 30,
    left: 24,
    right: 24,
  },
  categoryBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryText: {
    color: Colors.white,
    fontWeight: '900',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  name: {
    color: Colors.white,
    fontWeight: '900',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    backgroundColor: Colors.white,
    padding: 24,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  priceLabel: {
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  price: {
    color: Colors.primary,
    fontWeight: '900',
  },
  tag: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    color: '#059669',
    fontWeight: '900',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 24,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  detailValue: {
    fontWeight: '700',
    color: Colors.charcoal,
  },
  sectionTitle: {
    fontWeight: '900',
    color: Colors.charcoal,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 14,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  description: {
    color: Colors.textSecondary,
    lineHeight: 28,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  bottomBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomPriceLabel: {
    color: Colors.textSecondary,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  bottomPrice: {
    fontWeight: '900',
    color: Colors.charcoal,
  },
  bookButton: {
    borderRadius: 16,
    flex: 0.7,
  },
  bookButtonContent: {
    height: 54,
  },
});
