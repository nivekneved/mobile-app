import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { Text, ActivityIndicator, Surface, Chip, TextInput, Button } from 'react-native-paper';
import { useCustomerBookings, Booking } from '../../src/hooks/useCustomerBookings';
import { Colors } from '../../src/theme/colors';
import { MapPin, Calendar, Clock, ChevronRight, Plane, Search, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../../src/lib/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '../../src/context/SettingsContext';
import { resolveImageUrl } from '../../src/utils/imageUtils';
import { formatShortBookingRef } from '../../src/utils/textUtils';

export default function BookingsScreen() {
  const { generalConfig } = useSettings();
  const labels = generalConfig?.ui_labels || {};
  const insets = useSafeAreaInsets();
  const { bookings, isLoading, error, addGuestCustomerId } = useCustomerBookings();
  const router = useRouter();

  // Search/Lookup states
  const [showLookup, setShowLookup] = useState(false);
  const [lookupEmail, setLookupEmail] = useState('');
  const [lookupRef, setLookupRef] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleLookup = async () => {
    if (!lookupEmail.trim() || !lookupRef.trim()) {
      // PRESERVED: Alert.alert('Required Fields', 'Please enter both email and booking reference.');
      Alert.alert(labels.required_fields || 'Required Fields', labels.enter_email_ref || 'Please enter both email and booking reference.');
      return;
    }
    try {
      setIsSearching(true);
      const { data, error: queryError } = await supabase
        .from('bookings')
        .select(`
          customer_id,
          booking_reference,
          customers (
            email
          )
        `)
        .eq('booking_reference', lookupRef.trim().toUpperCase())
        .single();

      if (queryError || !data) {
        // PRESERVED: Alert.alert('Not Found', 'No booking found with this reference.');
        Alert.alert(labels.not_found || 'Not Found', labels.no_booking_found || 'No booking found with this reference.');
        return;
      }

      const customerEmail = (data.customers as any)?.email;
      if (customerEmail?.toLowerCase() !== lookupEmail.trim().toLowerCase()) {
        // PRESERVED: Alert.alert('Verification Failed', 'The email address does not match this booking reference.');
        Alert.alert(labels.verification_failed || 'Verification Failed', labels.email_mismatch || 'The email address does not match this booking reference.');
        return;
      }

      await addGuestCustomerId(data.customer_id);
      // PRESERVED: Alert.alert('Success', 'Booking retrieved and saved successfully!');
      Alert.alert(labels.success || 'Success', labels.booking_imported || 'Booking retrieved and saved successfully!');
      setLookupEmail('');
      setLookupRef('');
      setShowLookup(false);
    } catch (err) {
      console.error('Error during lookup:', err);
      // PRESERVED: Alert.alert('Error', 'Failed to retrieve booking. Please try again.');
      Alert.alert(labels.error || 'Error', labels.retrieve_failed || 'Failed to retrieve booking. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed': return '#059669';
      case 'pending': return Colors.primary;
      case 'cancelled': return Colors.textSecondary;
      default: return Colors.charcoal;
    }
  };

  const renderBookingItem = ({ item }: { item: Booking }) => (
    <TouchableOpacity 
      activeOpacity={0.9} 
      onPress={() => router.push(`/services/${item.service_id}`)}
    >
      <Surface style={styles.bookingCard} elevation={1}>
        <Image 
          source={resolveImageUrl(item.image_url, 200, 200, item.service_type)} 
          style={styles.thumbnail} 
        />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text variant="titleMedium" style={styles.serviceName} numberOfLines={1}>
              {item.service_name || item.service_type}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {item.status}
              </Text>
            </View>
          </View>

          {item.booking_reference && (
            <Text style={styles.refText}>Ref: {formatShortBookingRef(item.booking_reference)}</Text>
          )}

          <View style={styles.infoRow}>
            <MapPin size={12} color={Colors.textSecondary} />
            <Text style={styles.infoText}>{item.location}</Text>
          </View>

          <View style={styles.footer}>
            <View style={styles.infoRow}>
              <Calendar size={12} color={Colors.textSecondary} />
              <Text style={styles.infoText}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>{labels.total_label || 'Total'}</Text>
              <Text style={styles.price}>Rs {(item.total_amount ?? 0).toLocaleString()}</Text>
            </View>
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Plane size={48} color={Colors.textSecondary} strokeWidth={1} />
      </View>
      <Text variant="titleLarge" style={styles.emptyTitle}>{labels.no_bookings || 'No adventures yet'}</Text>
      <Text variant="bodyMedium" style={styles.emptySubtitle}>
        {labels.bookings_empty_subtitle || 'Your travel inquiries and bookings will appear here. Start exploring our premium destinations!'}
      </Text>
      <TouchableOpacity 
        style={styles.exploreButton}
        onPress={() => router.push('/explore')}
      >
        <Text style={styles.exploreButtonText}>{labels.discover_experiences || 'Discover Experiences'}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top + 16 : 40 }]}>
        <View style={styles.headerRow}>
          <View>
            {/* PRESERVED: <Text variant="headlineMedium" style={styles.title}>My Bookings</Text> */}
            {/* PRESERVED: <Text variant="bodyMedium" style={styles.subtitle}>Your travel history and inquiries</Text> */}
            <Text variant="headlineMedium" style={styles.title}>{labels.my_bookings_title || 'My Bookings'}</Text>
            <Text variant="bodyMedium" style={styles.subtitle}>{labels.my_bookings_subtitle || 'Your travel history and inquiries'}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.importBtn, showLookup && styles.importBtnActive]} 
            onPress={() => setShowLookup(!showLookup)}
          >
            <Plus size={20} color={showLookup ? Colors.white : Colors.charcoal} />
          </TouchableOpacity>
        </View>

        {showLookup && (
          <Surface style={styles.lookupCard} elevation={1}>
            <Text style={styles.lookupTitle}>{labels.import_booking_title || 'Import Guest Booking'}</Text>
            <TextInput
              label={labels.email_address_placeholder || 'Email Address'}
              value={lookupEmail}
              onChangeText={setLookupEmail}
              mode="outlined"
              activeOutlineColor={Colors.primary}
              style={styles.lookupInput}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              label={labels.booking_ref_placeholder || 'Booking Reference (e.g. TL-XXXXXX)'}
              value={lookupRef}
              onChangeText={setLookupRef}
              mode="outlined"
              activeOutlineColor={Colors.primary}
              style={styles.lookupInput}
              autoCapitalize="characters"
            />
            <Button 
              mode="contained" 
              onPress={handleLookup} 
              loading={isSearching}
              disabled={isSearching}
              buttonColor={Colors.charcoal}
              style={styles.lookupBtn}
            >
              {labels.find_import_btn || 'FIND & IMPORT'}
            </Button>
          </Surface>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBookingItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
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
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: Colors.white,
  },
  title: {
    fontWeight: '900',
    color: Colors.charcoal,
    letterSpacing: -1,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 4,
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
  bookingCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  thumbnail: {
    width: 100,
    height: '100%',
    minHeight: 120,
  },
  cardContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  serviceName: {
    flex: 1,
    fontWeight: '800',
    color: Colors.charcoal,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  infoText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 12,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 9,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  price: {
    fontWeight: '900',
    color: Colors.primary,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontWeight: '900',
    color: Colors.charcoal,
    marginBottom: 12,
  },
  emptySubtitle: {
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  exploreButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  exploreButtonText: {
    color: Colors.white,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  importBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  importBtnActive: {
    backgroundColor: Colors.primary,
  },
  lookupCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: Colors.white,
  },
  lookupTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.charcoal,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  lookupInput: {
    marginBottom: 8,
    backgroundColor: Colors.white,
  },
  lookupBtn: {
    marginTop: 8,
    borderRadius: 8,
  },
  refText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
});
