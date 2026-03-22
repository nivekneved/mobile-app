import React from 'react';
import { View, StyleSheet, ScrollView, Image, Dimensions, TouchableOpacity, Share } from 'react-native';
import { Text, ActivityIndicator, Surface } from 'react-native-paper';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Colors } from '../../src/theme/colors';
import { useServiceDetails } from '../../src/hooks/useServiceDetails';
import { useRoomTypes } from '../../src/hooks/useRoomTypes';
import { MapPin, ArrowLeft, Share2, Mail, Clock, Info, Check, Calendar as CalendarIcon, Tag, Moon, MessageCircle, Phone, Sparkles } from 'lucide-react-native';
import * as Linking from 'expo-linking';
import { StatusBar } from 'expo-status-bar';
import { BookingModal } from '../../src/components/BookingModal';
import { supabase } from '../../src/lib/supabase';
import { useSettings } from '../../src/context/SettingsContext';
import { resolveImageUrl } from '../../src/utils/imageUtils';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 450;

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { mobileConfig, generalConfig } = useSettings();
  const { service, isLoading, error } = useServiceDetails(id);
  const { roomTypes: hookRoomTypes } = useRoomTypes(id as string);

  const roomTypes = React.useMemo(() => {
    // 1. Check for JSONB room_types in the service object first (from services table)
    if (service?.room_types && Array.isArray(service.room_types) && service.room_types.length > 0) {
      return service.room_types.map((room: any, index: number) => {
        // Handle both string and number for prices
        const weekday = typeof room.prices?.mon === 'string' ? parseFloat(room.prices.mon) : (room.prices?.mon || 0);
        const weekend = typeof room.prices?.sat === 'string' ? parseFloat(room.prices.sat) : (room.prices?.sat || 0);
        
        return {
          id: `json-${index}`,
          name: room.type || room.name || 'Standard Room',
          weekday_price: weekday,
          weekend_price: weekend,
          min_stay: parseInt(room.min_stay) || 1,
          image_url: room.image_url || room.image,
          amenities: Array.isArray(room.features) ? room.features : 
                     (typeof room.features === 'string' ? room.features.split(',').map((f: string) => f.trim()) : [])
        };
      });
    }
    // 2. Fallback to separate room_types table if the JSON column is empty
    return hookRoomTypes || [];
  }, [service?.room_types, hookRoomTypes]);

  const [bookingVisible, setBookingVisible] = React.useState(false);

  const handleInquiry = (method: 'whatsapp' | 'email') => {
    const contact = {
      phone: mobileConfig?.supportPhone || generalConfig?.contactPhone || '+230 5940 7701',
      email: generalConfig?.contactEmail || 'office@travel-lounge.com'
    };
    const message = `Inquiry for: ${service?.name} (ID: ${id})`;
    if (method === 'whatsapp') Linking.openURL(`https://wa.me/${contact.phone.replace(/\+/g, '')}?text=${encodeURIComponent(message)}`);
    if (method === 'email') Linking.openURL(`mailto:${contact.email}?subject=${encodeURIComponent(message)}`);
  };

  if (isLoading) return <View style={styles.loadingContainer}><ActivityIndicator color={Colors.primary} size="large" /></View>;
  if (error || !service) return <View style={styles.loadingContainer}><Text>Service not found</Text></View>;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView showsVerticalScrollIndicator={false} style={styles.container} stickyHeaderIndices={[1]}>
        {/* Elite Image Header */}
        <View style={styles.imageContainer}>
          <Image source={resolveImageUrl(service.image_url)} style={styles.image} />
          <View style={styles.overlay} />
          <View style={styles.topControls}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}><ArrowLeft color={Colors.white} size={22} /></TouchableOpacity>
            <TouchableOpacity onPress={() => Share.share({ message: `Check out ${service.name} on Travel Lounge` })} style={styles.iconButton}><Share2 color={Colors.white} size={22} /></TouchableOpacity>
          </View>
          <View style={styles.titleOverlay}>
            <View style={styles.categoryBadge}><Text style={styles.categoryText}>{service.category || 'Experience'}</Text></View>
            <Text style={styles.name}>{service.name}</Text>
            {service.location && (
              <View style={styles.locationContainer}><MapPin color="#CBD5E1" size={14} /><Text style={styles.location}>{service.location}</Text></View>
            )}
          </View>
        </View>

        {/* Action Conversion Bar (Sticky) */}
        <View style={styles.stickyActionWrapper}>
            <View style={styles.actionConversionBar}>
                <TouchableOpacity style={styles.actionItem} onPress={() => handleInquiry('whatsapp')}>
                    <MessageCircle size={20} color={Colors.primary} />
                    <Text style={styles.actionText}>WHATSAPP</Text>
                </TouchableOpacity>
                <View style={styles.actionDivider} />
                <TouchableOpacity style={styles.actionItem} onPress={() => handleInquiry('email')}>
                    <Mail size={20} color={Colors.charcoal} />
                    <Text style={styles.actionText}>EMAIL</Text>
                </TouchableOpacity>
                <View style={styles.actionDivider} />
                <TouchableOpacity style={styles.actionItem} onPress={() => setBookingVisible(true)}>
                    <CalendarIcon size={20} color={Colors.charcoal} />
                    <Text style={styles.actionText}>BOOKING</Text>
                </TouchableOpacity>
            </View>
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          <View style={styles.valuationHeader}>
            <View>
              <Text style={styles.valuationLabel}>EXECUTIVE PRICE</Text>
              <Text style={styles.valuationValue}>Rs {service.price.toLocaleString()}</Text>
            </View>
            <View style={styles.benefitBadge}>
               <Sparkles size={14} color="#D97706" />
               <Text style={styles.benefitBadgeText}>ALL-INCLUSIVE</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>The Experience</Text>
            <Text style={styles.description}>{service.description || "Discover the beauty and luxury of this carefully curated experience by Travel Lounge."}</Text>
          </View>

          {/* Accommodation for Hotels */}
          {service.category?.toLowerCase() === 'hotel' && roomTypes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Elite Accommodation</Text>
              {roomTypes.map((room) => (
                <Surface key={room.id} style={styles.roomCard} elevation={0}>
                  <Image source={resolveImageUrl(room.image_url)} style={styles.roomImage} />
                  <View style={styles.roomContent}>
                    <Text style={styles.roomName}>{room.name}</Text>
                    <View style={styles.priceGrid}>
                        <View style={styles.priceCell}><Text style={styles.priceCellTitle}>WEEKDAY</Text><Text style={styles.priceCellVal}>Rs {room.weekday_price.toLocaleString()}</Text></View>
                        <View style={styles.priceCell}><Text style={[styles.priceCellTitle, {color: Colors.primary}]}>WEEKEND</Text><Text style={[styles.priceCellVal, {color: Colors.primary}]}>Rs {room.weekend_price.toLocaleString()}</Text></View>
                    </View>
                  </View>
                </Surface>
              ))}
            </View>
          )}

          {/* Itinerary Section */}
          {service.itinerary && service.itinerary.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>The Journey</Text>
              {(service.itinerary as any[]).map((item, index) => (
                <View key={index} style={styles.journeyItem}>
                  <View style={styles.journeyLineWrapper}>
                    <View style={styles.journeyDot} />
                    {index !== (service.itinerary?.length || 0) - 1 && <View style={styles.journeyLine} />}
                  </View>
                  <View style={styles.journeyContent}>
                     <Text style={styles.journeyTime}>{item?.time}</Text>
                     <Text style={styles.journeyTitle}>{item?.title}</Text>
                     <Text style={styles.journeyDesc}>{item?.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
          
          <View style={{ height: 160 }} />
        </View>
      </ScrollView>

      {/* Elite Sticky Footer Conversion */}
      <Surface style={styles.footerBar} elevation={5}>
         <View style={styles.footerInfo}>
             <Text style={styles.footerPriceLabel}>TOTAL FROM</Text>
             <Text style={styles.footerPriceVal}>Rs {service.price.toLocaleString()}</Text>
         </View>
         <TouchableOpacity style={styles.footerCta} onPress={() => setBookingVisible(true)}>
             <Text style={styles.footerCtaText}>CONTINUE BOOKING</Text>
         </TouchableOpacity>
      </Surface>

      <BookingModal
        visible={bookingVisible}
        onDismiss={() => setBookingVisible(false)}
        service={{ 
          id: service.id, 
          name: service.name, 
          price: service.price, 
          category: service.category
        }}
        onSubmit={async (data) => {
          try {
            // 1. Check for authenticated user or use guest info
            const { data: { user } } = await supabase.auth.getUser();
            let customerId: string | undefined;

            if (user) {
              const { data: customer } = await supabase
                .from('customers')
                .select('id')
                .eq('id', user.id)
                .single();
              
              if (!customer) {
                // If customer record doesn't exist, create one from profile
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', user.id)
                  .single();

                if (profile) {
                  const names = (profile.name || '').split(' ');
                  const { data: newCustomer, error: insertError } = await supabase
                    .from('customers')
                    .insert([{
                      id: user.id,
                      user_id: user.id,
                      first_name: names[0] || 'Member',
                      last_name: names.slice(1).join(' ') || 'User',
                      email: profile.email,
                      phone: profile.phone,
                      status: 'Active'
                    }])
                    .select()
                    .single();
                  
                  if (insertError) throw insertError;
                  customerId = newCustomer?.id;
                } else {
                  customerId = user.id;
                }
              } else {
                customerId = customer.id;
              }
            } else {
              // Guest user - handle identification
              const { data: existingCustomer } = await supabase
                .from('customers')
                .select('id')
                .eq('email', data.email)
                .maybeSingle();

              if (existingCustomer) {
                customerId = existingCustomer.id;
              } else {
                const { data: newGuest, error: guestError } = await supabase
                  .from('customers')
                  .insert([{
                    first_name: data.firstName,
                    last_name: data.lastName,
                    email: data.email,
                    phone: data.phone,
                    status: 'Lead'
                  }])
                  .select()
                  .single();
                
                if (guestError) throw guestError;
                customerId = newGuest?.id;
              }
            }

            if (!customerId) throw new Error('Customer identification failed');

            // 2. Prepare payload for the booking RPC
            const bookingPayload = {
              customer_id: customerId,
              start_date: data.date.toISOString(),
              status: 'Pending',
              pax_adults: data.paxAdults,
              pax_children: data.paxChildren,
              amount: service.price,
              activity_type: service.category || 'General',
              activity_name: service.name,
              description: data.roomType 
                ? `Booking for ${service.name}. Room: ${data.roomType}. Special: ${data.specialRequirements || 'None'}`
                : `Booking for ${service.name}. Special: ${data.specialRequirements || 'None'}`,
              created_at: new Date().toISOString()
            };

            const itemsPayload = [{
              service_id: service.id,
              service_name: service.name,
              service_category: service.category || 'General',
              amount: service.price
            }];

            // 3. Execute transactional insert via RPC
            const { error: rpcError } = await supabase.rpc('create_booking_v1', {
              p_booking_data: bookingPayload,
              p_items_data: itemsPayload
            });

            if (rpcError) throw rpcError;

          } catch (error) {
            console.error('Mobile booking submission failed:', error);
            throw error; // Re-throw so the modal can show error alert
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imageContainer: { height: HEADER_HEIGHT, position: 'relative' },
  image: { width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 23, 42, 0.4)' },
  topControls: { position: 'absolute', top: 60, left: 24, right: 24, flexDirection: 'row', justifyContent: 'space-between', zIndex: 10 },
  iconButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(15, 23, 42, 0.3)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  titleOverlay: { position: 'absolute', bottom: 40, left: 24, right: 24 },
  categoryBadge: { backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 12 },
  categoryText: { color: Colors.white, fontFamily: 'Outfit_900Black', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2 },
  name: { color: Colors.white, fontFamily: 'Outfit_900Black', fontSize: 32, letterSpacing: -1, marginBottom: 8 },
  locationContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  location: { color: '#CBD5E1', fontFamily: 'Outfit_600SemiBold', fontSize: 14 },
  stickyActionWrapper: { zIndex: 100, backgroundColor: 'transparent' },
  actionConversionBar: { 
    flexDirection: 'row', 
    height: 74, 
    backgroundColor: '#FFFFFF', 
    marginHorizontal: 24, 
    marginTop: -37, 
    borderRadius: 24, 
    borderWidth: 1, 
    borderColor: Colors.border, 
    shadowColor: '#0F172A', 
    shadowOffset: { width: 0, height: 10 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 20, 
    elevation: 5,
    width: width - 48,
    alignSelf: 'center'
  },
  actionItem: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 4 },
  actionText: { fontFamily: 'Outfit_900Black', fontSize: 9, color: Colors.charcoal, letterSpacing: 1 },
  actionDivider: { width: 1, height: 30, backgroundColor: Colors.border, alignSelf: 'center' },
  content: { padding: 24, paddingTop: 40 },
  valuationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  valuationLabel: { fontFamily: 'Outfit_900Black', fontSize: 10, letterSpacing: 3, color: Colors.slate[400] },
  valuationValue: { fontFamily: 'Outfit_900Black', fontSize: 32, color: Colors.primary, letterSpacing: -1 },
  benefitBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 6 },
  benefitBadgeText: { color: '#D97706', fontFamily: 'Outfit_900Black', fontSize: 10, letterSpacing: 1 },
  section: { marginBottom: 40 },
  sectionTitle: { fontFamily: 'Outfit_900Black', fontSize: 13, letterSpacing: 4, color: Colors.charcoal, textTransform: 'uppercase', marginBottom: 20 },
  description: { fontFamily: 'Outfit_500Medium', fontSize: 16, color: Colors.slate[500], lineHeight: 28 },
  roomCard: { borderRadius: 32, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', marginBottom: 20 },
  roomImage: { width: '100%', height: 200 },
  roomContent: { padding: 24 },
  roomName: { fontFamily: 'Outfit_900Black', fontSize: 20, color: Colors.charcoal, marginBottom: 16 },
  priceGrid: { flexDirection: 'row', gap: 20, backgroundColor: Colors.slate[50], padding: 16, borderRadius: 20 },
  priceCell: { flex: 1 },
  priceCellTitle: { fontFamily: 'Outfit_900Black', fontSize: 9, letterSpacing: 1, color: Colors.slate[400], marginBottom: 4 },
  priceCellVal: { fontFamily: 'Outfit_900Black', fontSize: 14, color: Colors.charcoal },
  journeyItem: { flexDirection: 'row', minHeight: 100 },
  journeyLineWrapper: { width: 30, alignItems: 'center' },
  journeyDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.primary, zIndex: 10 },
  journeyLine: { flex: 1, width: 2, backgroundColor: Colors.border, marginVertical: 4 },
  journeyContent: { flex: 1, paddingLeft: 16, paddingBottom: 32 },
  journeyTime: { fontFamily: 'Outfit_900Black', fontSize: 11, color: Colors.primary, letterSpacing: 2, marginBottom: 4 },
  journeyTitle: { fontFamily: 'Outfit_900Black', fontSize: 18, color: Colors.charcoal, marginBottom: 8 },
  journeyDesc: { fontFamily: 'Outfit_500Medium', fontSize: 14, color: Colors.slate[500], lineHeight: 22 },
  footerBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 110, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 20 },
  footerInfo: { flex: 1 },
  footerPriceLabel: { fontFamily: 'Outfit_900Black', fontSize: 10, letterSpacing: 3, color: Colors.slate[400] },
  footerPriceVal: { fontFamily: 'Outfit_900Black', fontSize: 24, color: Colors.charcoal, letterSpacing: -0.5 },
  footerCta: { flex: 1.2, height: 64, backgroundColor: Colors.primary, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  footerCtaText: { color: Colors.white, fontFamily: 'Outfit_900Black', fontSize: 12, letterSpacing: 2 },
});
