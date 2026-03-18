import React from 'react';
import { View, StyleSheet, ScrollView, Image, Dimensions, TouchableOpacity, Share } from 'react-native';
import { Text, ActivityIndicator, Button, Surface } from 'react-native-paper';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Colors } from '../../src/theme/colors';
import { useServiceDetails } from '../../src/hooks/useServiceDetails';
import { useRoomTypes } from '../../src/hooks/useRoomTypes';
import { MapPin, ArrowLeft, Share2, Mail, Clock, Info, Check, Calendar as CalendarIcon, Tag, Moon } from 'lucide-react-native';
import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import { BookingModal } from '../../src/components/BookingModal';
import { supabase } from '../../src/lib/supabase';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 400;

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { service, loading, error } = useServiceDetails(id);
  const { roomTypes: hookRoomTypes, loading: roomsLoading } = useRoomTypes(id as string);

  // Prioritize JSON room types from the service record if they exist
  const roomTypes = React.useMemo(() => {
    if (service?.room_types && Array.isArray(service.room_types) && service.room_types.length > 0) {
      return service.room_types.map((room: any, index: number) => ({
        id: `json-${index}`,
        name: room.type || 'Standard Room',
        weekday_price: parseInt(room.prices?.mon) || 0,
        weekend_price: parseInt(room.prices?.sat) || 0,
        min_stay: parseInt(room.min_stay) || 1,
        image_url: room.image_url,
        amenities: Array.isArray(room.features) ? room.features : (typeof room.features === 'string' ? room.features.split(',').map((f: string) => f.trim()) : [])
      }));
    }
    return hookRoomTypes;
  }, [service?.room_types, hookRoomTypes]);

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
  };

  const [bookingVisible, setBookingVisible] = React.useState(false);

  const handleBooking = async (data: any) => {
    if (!service) return;
    
    // Save to bookings table
    const { error: bookingError } = await supabase
      .from('bookings')
      .select('id')
      .limit(1);

    // Calculate amount based on room type and date
    let selectedAmount = service.price;
    if (service.category?.toLowerCase() === 'hotel' && data.roomType) {
      const selectedRoom = roomTypes.find(r => r.name === data.roomType);
      if (selectedRoom) {
        selectedAmount = isWeekend(data.date) 
          ? selectedRoom.weekend_price 
          : selectedRoom.weekday_price;
      }
    }

    // Prepare booking data
    const bookingData = {
      activity_name: service.name,
      activity_type: service.category || 'Experience',
      description: `Customer: ${data.firstName} ${data.lastName}\nEmail: ${data.email}\nPhone: ${data.phone}${data.roomType ? `\nRoom Type: ${data.roomType}` : ''}\nRequirements: ${data.specialRequirements || 'None'}`,
      start_date: data.date.toISOString().split('T')[0],
      amount: selectedAmount,
      total_amount: selectedAmount,
      currency: 'MUR',
      status: 'pending',
      pax_adults: data.paxAdults,
      pax_children: data.paxChildren,
    };

    const { error } = await supabase
      .from('bookings')
      .insert([bookingData]);

    if (error) {
      console.error('Error saving booking:', error);
      throw error;
    }
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

          {/* Accommodation & Pricing Section for Hotels */}
          {service.category?.toLowerCase() === 'hotel' && roomTypes.length > 0 && (
            <View style={styles.accommodationSection}>
              <Text variant="titleLarge" style={styles.sectionTitle}>Accommodation & Pricing</Text>
              <View style={styles.roomList}>
                {roomTypes.map((room) => (
                  <Surface key={room.id} style={styles.roomCard} elevation={2}>
                    <Image 
                      source={{ uri: room.image_url || 'https://via.placeholder.com/400x300?text=Premium+Room' }} 
                      style={styles.roomImage} 
                    />
                    <View style={styles.roomInfo}>
                      <Text style={styles.roomName}>{room.name}</Text>
                      
                      <View style={styles.priceContainer}>
                        <View style={styles.priceColumn}>
                          <View style={styles.priceHeader}>
                            <Clock size={12} color={Colors.textSecondary} />
                            <Text style={styles.roomPriceLabel}>Weekday</Text>
                          </View>
                          <Text style={styles.priceValue}>Rs {room.weekday_price.toLocaleString()}</Text>
                        </View>
                        
                        <View style={styles.priceDivider} />
                        
                        <View style={styles.priceColumn}>
                          <View style={styles.priceHeader}>
                            <Moon size={12} color={Colors.primary} />
                            <Text style={[styles.roomPriceLabel, { color: Colors.primary }]}>Weekend</Text>
                          </View>
                          <Text style={[styles.priceValue, { color: Colors.primary }]}>Rs {room.weekend_price.toLocaleString()}</Text>
                        </View>
                      </View>

                      {room.amenities && room.amenities.length > 0 && (
                        <View style={styles.roomAmenities}>
                          {room.amenities.slice(0, 3).map((amt: string, idx: number) => (
                            <View key={idx} style={styles.roomAmenityBadge}>
                              <Text style={styles.roomAmenityText}>{amt}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  </Surface>
                ))}
              </View>
            </View>
          )}

          {/* Amenities Section */}
          {service.amenities && service.amenities.length > 0 && (
            <View style={styles.amenitiesSection}>
              <Text variant="titleLarge" style={styles.sectionTitle}>What's Included</Text>
              <View style={styles.amenitiesGrid}>
                {service.amenities.map((item, index) => (
                  <View key={index} style={styles.amenityItem}>
                    <View style={styles.amenityIconContainer}>
                      <Check size={14} color={Colors.primary} />
                    </View>
                    <Text style={styles.amenityText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Itinerary Section */}
          {service.itinerary && service.itinerary.length > 0 && (
            <View style={styles.itinerarySection}>
              <Text variant="titleLarge" style={styles.sectionTitle}>Detailed Itinerary</Text>
              <View style={styles.itineraryList}>
                {service.itinerary.map((item, index) => (
                  <View key={index} style={styles.itineraryItem}>
                    <View style={styles.itineraryTimeline}>
                      <View style={styles.itineraryDot} />
                      {index !== (service.itinerary?.length || 0) - 1 && <View style={styles.itineraryLine} />}
                    </View>
                    <View style={styles.itineraryContent}>
                      <View style={styles.itineraryHeader}>
                        <View style={styles.timeBadge}>
                          <Text style={styles.timeText}>{item.time}</Text>
                        </View>
                        <Text style={styles.itineraryTitle}>{item.title}</Text>
                      </View>
                      <Text style={styles.itineraryDescription}>{item.description}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
          
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
            onPress={() => setBookingVisible(true)}
            style={styles.bookButton}
            contentStyle={styles.bookButtonContent}
            icon={({ size, color }) => <Clock size={size} color={color} />}
          >
            Book Now
          </Button>
        </View>
      </Surface>

      {service && (
        <BookingModal
          visible={bookingVisible}
          onDismiss={() => setBookingVisible(false)}
          service={{
            id: service.id,
            name: service.name,
            price: service.price,
            category: service.category,
            room_types: service.room_types
          }}
          onSubmit={handleBooking}
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
    marginBottom: 32,
  },
  description: {
    color: Colors.textSecondary,
    lineHeight: 28,
  },
  accommodationSection: {
    marginBottom: 32,
  },
  roomList: {
    gap: 20,
    marginTop: 8,
  },
  roomCard: {
    borderRadius: 24,
    backgroundColor: Colors.white,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roomImage: {
    width: '100%',
    height: 180,
  },
  roomInfo: {
    padding: 20,
  },
  roomName: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.charcoal,
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  priceColumn: {
    flex: 1,
  },
  priceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  roomPriceLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: Colors.textSecondary,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.charcoal,
  },
  priceDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  roomAmenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roomAmenityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  roomAmenityText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  amenitiesSection: {
    marginBottom: 32,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.1)',
  },
  amenityIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  amenityText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.charcoal,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itinerarySection: {
    marginBottom: 32,
  },
  itineraryList: {
    marginTop: 8,
  },
  itineraryItem: {
    flexDirection: 'row',
    minHeight: 80,
  },
  itineraryTimeline: {
    width: 24,
    alignItems: 'center',
  },
  itineraryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    zIndex: 2,
  },
  itineraryLine: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  itineraryContent: {
    flex: 1,
    paddingLeft: 16,
    paddingBottom: 24,
  },
  itineraryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  timeBadge: {
    backgroundColor: Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  timeText: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.textSecondary,
  },
  itineraryTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.charcoal,
  },
  itineraryDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
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
