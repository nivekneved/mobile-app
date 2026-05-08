import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Modal, Portal, Text, TextInput, Button, IconButton, Surface } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Colors } from '../theme/colors';
import { mss } from '../styles/mss';
import { Calendar, X, CheckCircle, Moon, Clock, Utensils } from 'lucide-react-native';
import { useRoomTypes } from '../hooks/useRoomTypes';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useServicePricing } from '../hooks/useServicePricing';

const bookingSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(8, 'Valid phone number is required'),
  paxAdults: z.number().min(1, 'At least 1 adult is required'),
  paxTeens: z.number().min(0),
  paxChildren: z.number().min(0),
  paxInfants: z.number().min(0),
  checkIn: z.string().min(1, 'Star Date is required'),
  checkOut: z.string().min(1, 'Date end is required'),
  roomType: z.string().optional(),
  mealPreference: z.string().optional(),
  specialRequirements: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingModalProps {
  visible: boolean;
  onDismiss: () => void;
  service: {
    id: string;
    name: string;
    price: number;
    childPrice?: number;
    category?: string;
    meal_plans?: { id: string; label: string; price: number }[];
    room_types?: any[];
  };
  onSubmit: (data: BookingFormData & { totalAmount: number }) => Promise<void>;
  initialData?: Partial<BookingFormData>;
}

interface RoomType {
  id: string;
  name: string;
  weekday_price: number;
  weekend_price: number;
  min_stay_days?: number;
  meal_plan?: string;
  max_adults?: number;
  max_teens?: number;
  max_children?: number;
  max_infants?: number;
}

export const BookingModal = ({ visible, onDismiss, service, onSubmit, initialData }: BookingModalProps) => {
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<any>(null);
  const { roomTypes: hookRoomTypes, loading: fetchingRooms } = useRoomTypes(service.id);

  const roomTypes = React.useMemo(() => {
    // 1. Process JSONB room_types from the service object
    const jsonRooms = (service as any).room_types && Array.isArray((service as any).room_types)
      ? (service as any).room_types.map((room: any, index: number) => {
          const weekday = typeof room.prices?.mon === 'string' ? parseFloat(room.prices.mon) : (room.prices?.mon || room.price_per_night || 0);
          const weekend = typeof room.prices?.sat === 'string' ? parseFloat(room.prices.sat) : (room.prices?.sat || room.price_per_night || 0);
          
          return {
            id: `json-${index}-${room.type || 'room'}`,
            name: room.type || room.name || 'Standard Room',
            weekday_price: weekday,
            weekend_price: weekend,
            min_stay_days: parseInt(room.min_stay_days || room.min_stay) || 1,
            image_url: room.image_url,
            meal_plan: room.meal_plan || room.mealPlan,
            amenities: Array.isArray(room.features) ? room.features : (typeof room.features === 'string' ? room.features.split(',').map((f: string) => f.trim()) : [])
          };
        })
      : [];

    // 2. Combine with hookRoomTypes (from the dedicated table)
    const combined = [...hookRoomTypes];
    
    jsonRooms.forEach((jr: any) => {
      const exists = combined.some(cr => cr.name.toLowerCase() === jr.name.toLowerCase());
      if (!exists) {
        combined.push(jr);
      }
    });

    return combined;
  }, [service, hookRoomTypes]);

  const { control, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      paxAdults: initialData?.paxAdults || 2,
      paxInfants: initialData?.paxInfants || 0,
      paxChildren: initialData?.paxChildren || 0,
      paxTeens: initialData?.paxTeens || 0,
      checkIn: initialData?.checkIn || new Date().toISOString().split('T')[0],
      checkOut: initialData?.checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      roomType: initialData?.roomType || '',
      mealPreference: initialData?.mealPreference || 'none',
      specialRequirements: '',
    },
  });

  const watchAllFields = watch();

  const pricingRequest = React.useMemo(() => ({
    serviceId: service.id,
    variantId: roomTypes.find(r => r.name === watchAllFields.roomType || (r as any).type === watchAllFields.roomType)?.id || 'default',
    startDate: watchAllFields.checkIn,
    endDate: watchAllFields.checkOut,
    participants: {
      adults: watchAllFields.paxAdults,
      teens: watchAllFields.paxTeens,
      children: watchAllFields.paxChildren,
      infants: watchAllFields.paxInfants
    },
    baseRates: {
      adult: roomTypes.find(r => r.name === watchAllFields.roomType)?.weekday_price || service.price || 0,
      teen: (service as any).price_teen || (service as any).teen_price || (service as any).child_price || service.price || 0,
      child: (service as any).price_child || service.childPrice || 0,
      infant: (service as any).price_infant || (service as any).infant_price || 0
    }
  }), [service, watchAllFields, roomTypes]);

  const { pricing, loading: calculatingPrice } = useServicePricing(pricingRequest);

  const calculateTotal = () => {
    if (!pricing) return 0;
    
    let total = pricing.total || 0;
    
    // Add meal plan costs
    if (watchAllFields.mealPreference && watchAllFields.mealPreference !== 'none') {
      const meal = service.meal_plans?.find(m => m.id === watchAllFields.mealPreference);
      if (meal && meal.price) {
        const totalPax = (watchAllFields.paxAdults || 0) + (watchAllFields.paxTeens || 0) + (watchAllFields.paxChildren || 0) + (watchAllFields.paxInfants || 0);
        total += (meal.price || 0) * totalPax * Math.max(1, pricing.nights || 0);
      }
    }
    return total;
  };

  const handleFormSubmit = async (data: BookingFormData) => {
    // Basic sanitization (trimming)
    const sanitizedData = {
      ...data,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      specialRequirements: data.specialRequirements?.trim(),
    };

    if (!sanitizedData.firstName || !sanitizedData.lastName || !sanitizedData.email || !sanitizedData.phone) {
      Alert.alert('Incomplete Form', 'Please provide all contact information.');
      return;
    }

    setIsSubmitting(true);
    try {
      const total = calculateTotal();
      const selectedRoom = roomTypes.find(r => r.name === sanitizedData.roomType);
      
      await onSubmit({ 
        ...sanitizedData, 
        totalAmount: total,
        roomMealPlan: selectedRoom?.meal_plan 
      } as any);
      
      setSubmittedReport({ ...data, totalAmount: total });
      setIsSuccess(true);
    } catch (err) {
      console.error('Booking submission error:', err);
      Alert.alert('Error', 'Failed to submit booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess && submittedReport) {
    return (
      <Portal>
        <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.successContainer}>
          <View style={styles.successContent}>
            <View style={styles.successHeader}>
               <CheckCircle color="#059669" size={48} />
               <View>
                 <Text variant="headlineSmall" style={styles.successTitle}>Booking Report</Text>
                 <Text style={styles.successSubtitle}>Transaction successful</Text>
               </View>
            </View>

            <View style={styles.reportCard}>
               <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Experience</Text>
                  <Text style={styles.reportVal} numberOfLines={1}>{service.name}</Text>
               </View>
               <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Dates</Text>
                  <Text style={styles.reportVal}>{new Date(submittedReport.checkIn).toLocaleDateString()} - {new Date(submittedReport.checkOut).toLocaleDateString()}</Text>
               </View>
               <View style={styles.reportRow}>
                  <Text style={styles.reportLabel}>Travelers</Text>
                   <Text style={styles.reportVal}>
                    {submittedReport.paxAdults}A, {submittedReport.paxTeens}T, {submittedReport.paxChildren}C, {submittedReport.paxInfants}I
                  </Text>
               </View>
               <View style={styles.reportDivider} />
               <View style={styles.reportRow}>
                  <Text style={styles.totalLabel}>TOTAL AMOUNT</Text>
                  <Text style={styles.totalVal}>Rs {submittedReport.totalAmount?.toLocaleString()}</Text>
               </View>
            </View>

            <Text style={styles.successText}>
              A confirmation email has been sent to {submittedReport.email}. Our team will contact you shortly to finalize the arrangements.
            </Text>
            
            <Button 
              mode="contained" 
              onPress={() => {
                setIsSuccess(false);
                setSubmittedReport(null);
                reset();
                onDismiss();
              }} 
              style={styles.successButton}
              contentStyle={{ height: 56 }}
            >
              Back to Experience
            </Button>
          </View>
        </Modal>
      </Portal>
    );
  }

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
        <Surface style={styles.header}>
          <View>
            <Text variant="titleLarge" style={styles.title}>Book Experience</Text>
            <Text variant="labelMedium" style={styles.subtitle}>{service.name}</Text>
          </View>
          <IconButton icon={() => <X size={24} color={Colors.charcoal} />} onPress={onDismiss} />
        </Surface>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          {/* ... existing form fields ... */}
          {/* (I'll keep the middle part the same) */}
          <View style={styles.row}>
            <View style={styles.col}>
              <Controller
                control={control}
                name="firstName"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    label="First Name"
                    value={value}
                    onChangeText={onChange}
                    mode="outlined"
                    error={!!errors.firstName}
                    activeOutlineColor={Colors.primary}
                    style={styles.input}
                  />
                )}
              />
              {errors.firstName && <Text style={styles.error}>{errors.firstName.message}</Text>}
            </View>
            <View style={styles.col}>
              <Controller
                control={control}
                name="lastName"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    label="Last Name"
                    value={value}
                    onChangeText={onChange}
                    mode="outlined"
                    error={!!errors.lastName}
                    activeOutlineColor={Colors.primary}
                    style={styles.input}
                  />
                )}
              />
              {errors.lastName && <Text style={styles.error}>{errors.lastName.message}</Text>}
            </View>
          </View>

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Email"
                value={value}
                onChangeText={onChange}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                error={!!errors.email}
                activeOutlineColor={Colors.primary}
                style={styles.input}
              />
            )}
          />
          {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Phone Number"
                value={value}
                onChangeText={onChange}
                mode="outlined"
                keyboardType="phone-pad"
                error={!!errors.phone}
                activeOutlineColor={Colors.primary}
                style={styles.input}
              />
            )}
          />
          {errors.phone && <Text style={styles.error}>{errors.phone.message}</Text>}

          <View style={styles.sectionDivider}>
            <Text style={styles.sectionTitle}>Booking Details</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.fieldLabel}>Star Date</Text>
              <TouchableOpacity 
                style={styles.dateSelector} 
                onPress={() => setShowCheckInPicker(true)}
              >
                <Calendar size={20} color={Colors.primary} />
                <Text style={styles.dateValue}>{watchAllFields.checkIn}</Text>
              </TouchableOpacity>
              {showCheckInPicker && (
                <DateTimePicker
                  value={new Date(watchAllFields.checkIn)}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    setShowCheckInPicker(false);
                    if (selectedDate) {
                      setValue('checkIn', selectedDate.toISOString().split('T')[0]);
                      // Ensure check-out is after check-in
                      const checkout = new Date(watchAllFields.checkOut);
                      if (checkout <= selectedDate) {
                        const nextDay = new Date(selectedDate);
                        nextDay.setDate(nextDay.getDate() + 1);
                        setValue('checkOut', nextDay.toISOString().split('T')[0]);
                      }
                    }
                  }}
                />
              )}
            </View>
            <View style={styles.col}>
              <Text style={styles.fieldLabel}>Date end</Text>
              <TouchableOpacity 
                style={styles.dateSelector} 
                onPress={() => setShowCheckOutPicker(true)}
              >
                <Calendar size={20} color={Colors.primary} />
                <Text style={styles.dateValue}>{watchAllFields.checkOut}</Text>
              </TouchableOpacity>
              {showCheckOutPicker && (
                <DateTimePicker
                  value={new Date(watchAllFields.checkOut)}
                  mode="date"
                  display="default"
                  minimumDate={new Date(new Date(watchAllFields.checkIn).getTime() + 86400000)}
                  onChange={(event, selectedDate) => {
                    setShowCheckOutPicker(false);
                    if (selectedDate) {
                      setValue('checkOut', selectedDate.toISOString().split('T')[0]);
                    }
                  }}
                />
              )}
            </View>
          </View>

          <View style={styles.guestGrid}>
            <View style={styles.guestCol}>
              <Controller
                control={control}
                name="paxAdults"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.guestInputWrapper}>
                    <Text style={styles.guestLabel}>Adults (18+)</Text>
                    <View style={styles.counterRow}>
                      <IconButton icon="minus-circle-outline" size={24} iconColor={Colors.primary} disabled={value <= 1} onPress={() => onChange(Math.max(1, value - 1))} />
                      <Text style={styles.counterText}>{value}</Text>
                      <IconButton icon="plus-circle-outline" size={24} iconColor={Colors.primary} onPress={() => onChange(value + 1)} />
                    </View>
                  </View>
                )}
              />
            </View>
            <View style={styles.guestCol}>
               <Controller
                control={control}
                name="paxTeens"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.guestInputWrapper}>
                    <Text style={styles.guestLabel}>Teens (12-17)</Text>
                    <View style={styles.counterRow}>
                      <IconButton icon="minus-circle-outline" size={24} iconColor={Colors.primary} disabled={value <= 0} onPress={() => onChange(Math.max(0, value - 1))} />
                      <Text style={styles.counterText}>{value}</Text>
                      <IconButton icon="plus-circle-outline" size={24} iconColor={Colors.primary} onPress={() => onChange(value + 1)} />
                    </View>
                  </View>
                )}
              />
            </View>
          </View>

          <View style={styles.guestGrid}>
            <View style={styles.guestCol}>
              <Controller
                control={control}
                name="paxChildren"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.guestInputWrapper}>
                    <Text style={styles.guestLabel}>Child (3-11)</Text>
                    <View style={styles.counterRow}>
                      <IconButton icon="minus-circle-outline" size={24} iconColor={Colors.primary} disabled={value <= 0} onPress={() => onChange(Math.max(0, value - 1))} />
                      <Text style={styles.counterText}>{value}</Text>
                      <IconButton icon="plus-circle-outline" size={24} iconColor={Colors.primary} onPress={() => onChange(value + 1)} />
                    </View>
                  </View>
                )}
              />
            </View>
            <View style={styles.guestCol}>
               <Controller
                control={control}
                name="paxInfants"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.guestInputWrapper}>
                    <Text style={styles.guestLabel}>Infants (0-2)</Text>
                    <View style={styles.counterRow}>
                      <IconButton icon="minus-circle-outline" size={24} iconColor={Colors.primary} disabled={value <= 0} onPress={() => onChange(Math.max(0, value - 1))} />
                      <Text style={styles.counterText}>{value}</Text>
                      <IconButton icon="plus-circle-outline" size={24} iconColor={Colors.primary} onPress={() => onChange(value + 1)} />
                    </View>
                  </View>
                )}
              />
            </View>
          </View>

          {/* Show variant selection for both Hotels and Packages if available */}
          {roomTypes.length > 0 && (
            <View style={styles.roomTypeSection}>
              <Text style={styles.fieldLabel}>Select Room Type</Text>
              {fetchingRooms ? (
                <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 10 }} />
              ) : (
                <Controller
                  control={control}
                  name="roomType"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.roomTypeList}>
                      {roomTypes.map((type: RoomType) => (
                        <TouchableOpacity
                          key={type.id}
                          onPress={() => onChange(type.name)}
                          style={[
                            styles.roomTypeCard,
                            value === type.name && styles.roomTypeCardSelected
                          ]}
                        >
                          <View style={styles.roomTypeInfo}>
                            <Text style={[
                              styles.roomTypeName,
                              value === type.name && styles.roomTypeTextSelected
                            ]}>{type.name}</Text>
                            <View style={styles.roomTypePriceRow}>
                              <View style={styles.miniPriceBadge}>
                                <Clock size={10} color={value === type.name ? Colors.white : Colors.textSecondary} />
                                <Text style={[
                                  styles.roomTypePrice,
                                  value === type.name && styles.roomTypeTextSelected
                                ]}> Rs {type.weekday_price?.toLocaleString() || '0'}</Text>
                              </View>
                              <View style={[styles.miniPriceBadge, styles.miniPriceBadgeWeekend]}>
                                <Moon size={10} color={value === type.name ? Colors.white : Colors.primary} />
                                <Text style={[
                                  styles.roomTypePrice,
                                  { color: value === type.name ? Colors.white : Colors.primary }
                                ]}> Rs {type.weekend_price?.toLocaleString() || '0'}</Text>
                              </View>
                            </View>
                            {type.meal_plan && (
                              <View style={[styles.miniPriceBadge, { marginTop: 4 }]}>
                                <Utensils size={10} color={value === type.name ? Colors.white : '#D97706'} />
                                <Text style={[
                                  styles.roomTypePrice,
                                  { color: value === type.name ? Colors.white : '#D97706', fontSize: 10 }
                                ]}> {type.meal_plan}</Text>
                              </View>
                            )}
                            {type.min_stay_days && type.min_stay_days > 1 && (
                              <Text style={[
                                styles.minStayText,
                                value === type.name && styles.roomTypeTextSelected
                              ]}>
                                {type.min_stay_days} nights minimum stay required
                              </Text>
                            )}
                          </View>
                          {value === type.name && (
                            <CheckCircle size={20} color={Colors.white} />
                          )}
                        </TouchableOpacity>
                      ))}
                      {roomTypes.length === 0 && (
                        <Text style={styles.noRoomsText}>No room types available for selection.</Text>
                      )}
                    </View>
                  )}
                />
              )}
            </View>
          )}

          {service.meal_plans && service.meal_plans.length > 0 && (
            <View style={styles.roomTypeSection}>
              <Text style={styles.fieldLabel}>Select Meal Plan</Text>
              <Controller
                control={control}
                name="mealPreference"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.roomTypeList}>
                    <TouchableOpacity
                      onPress={() => onChange('none')}
                      style={[
                        styles.roomTypeCard,
                        value === 'none' && styles.roomTypeCardSelected
                      ]}
                    >
                      <View style={styles.roomTypeInfo}>
                        <Text style={[styles.roomTypeName, value === 'none' && styles.roomTypeTextSelected]}>No Preference</Text>
                        <Text style={[styles.roomTypePrice, value === 'none' && styles.roomTypeTextSelected]}>Included or pay on site</Text>
                      </View>
                      {value === 'none' && <CheckCircle size={20} color={Colors.white} />}
                    </TouchableOpacity>

                    {service.meal_plans?.map((meal) => (
                      <TouchableOpacity
                        key={meal.id}
                        onPress={() => onChange(meal.id)}
                        style={[
                          styles.roomTypeCard,
                          value === meal.id && styles.roomTypeCardSelected
                        ]}
                      >
                        <View style={styles.roomTypeInfo}>
                          <Text style={[styles.roomTypeName, value === meal.id && styles.roomTypeTextSelected]}>{meal.label}</Text>
                          <View style={styles.miniPriceBadge}>
                             <Utensils size={12} color={value === meal.id ? Colors.white : Colors.textSecondary} />
                             <Text style={[styles.roomTypePrice, value === meal.id && styles.roomTypeTextSelected]}>
                                +Rs {meal.price?.toLocaleString() || '0'} per pax/night
                             </Text>
                          </View>
                        </View>
                        {value === meal.id && <CheckCircle size={20} color={Colors.white} />}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              />
            </View>
          )}

          <Controller
            control={control}
            name="specialRequirements"
            render={({ field: { onChange, value } }) => (
              <TextInput
                label="Special Requirements (Optional)"
                value={value}
                onChangeText={onChange}
                mode="outlined"
                multiline
                numberOfLines={3}
                activeOutlineColor={Colors.primary}
                style={styles.textArea}
              />
            )}
          />
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>ESTIMATED TOTAL ({pricing?.nights || 0} Nights)</Text>
            {calculatingPrice ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Text style={styles.totalValue}>Rs {(calculateTotal() || 0).toLocaleString()}</Text>
            )}
          </View>
          <Button
            mode="contained"
            onPress={handleSubmit(handleFormSubmit as any)}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.submitButton}
            contentStyle={styles.submitButtonContent}
            labelStyle={styles.submitButtonLabel}
          >
            REQUEST A QUOTE
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: Colors.white,
    margin: 20,
    borderRadius: 24,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontWeight: '900',
    color: Colors.charcoal,
  },
  subtitle: {
    color: Colors.textSecondary,
  },
  form: {
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  guestGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  guestCol: {
    flex: 1,
  },
  guestInputWrapper: {
    backgroundColor: Colors.slate[50],
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  guestLabel: {
    fontSize: 10,
    fontFamily: 'Outfit_900Black',
    color: Colors.slate[400],
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  counterText: {
    fontFamily: 'Outfit_900Black',
    fontSize: 16,
    color: Colors.charcoal,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.charcoal,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  roomTypeSection: {
    marginVertical: 16,
  },
  roomTypeList: {
    gap: 8,
  },
  roomTypeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  roomTypeCardSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  roomTypeInfo: {
    flex: 1,
  },
  roomTypeName: {
    fontWeight: '800',
    fontSize: 14,
    color: Colors.charcoal,
    marginBottom: 4,
  },
  roomTypePriceRow: {
    flexDirection: 'row',
    gap: 12,
  },
  miniPriceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniPriceBadgeWeekend: {
    // Spacer or specific style for weekend badge if needed
  },
  roomTypePrice: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  roomTypeTextSelected: {
    color: Colors.white,
  },
  minStayText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '800',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  noRoomsText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 10,
  },
  input: {
    backgroundColor: Colors.white,
    marginBottom: 12,
  },
  textArea: {
    backgroundColor: Colors.white,
    marginBottom: 20,
  },
  error: {
    color: Colors.primary,
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionDivider: {
    marginVertical: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontWeight: '800',
    fontSize: 14,
    color: Colors.charcoal,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
    backgroundColor: 'rgba(220, 38, 38, 0.05)',
  },
  dateLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  dateValue: {
    fontWeight: '900',
    color: Colors.charcoal,
    fontSize: 16,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  totalSection: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  totalValue: {
    fontWeight: '900',
    fontSize: 18,
    color: Colors.charcoal,
  },
  submitButton: {
    flex: 1.5,
    borderRadius: 12,
  },
  submitButtonContent: {
    height: 60,
  },
  submitButtonLabel: {
    fontFamily: 'Outfit_900Black',
    fontSize: 12,
    letterSpacing: 2,
  },
  successContainer: {
    backgroundColor: 'transparent',
    padding: 20,
  },
  successContent: {
    ...mss.section,
    padding: 32,
    alignItems: 'stretch',
  },
  successHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  successTitle: {
    fontFamily: 'Outfit_900Black',
    color: Colors.charcoal,
    fontSize: 24,
  },
  successSubtitle: {
    fontFamily: 'Outfit_600SemiBold',
    color: '#059669',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  reportCard: {
    backgroundColor: Colors.slate[50],
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  reportLabel: {
    fontFamily: 'Outfit_600SemiBold',
    color: Colors.slate[400],
    fontSize: 12,
  },
  reportVal: {
    fontFamily: 'Outfit_700Bold',
    color: Colors.charcoal,
    fontSize: 12,
    flex: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
  reportDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  totalVal: {
    fontFamily: 'Outfit_900Black',
    color: Colors.primary,
    fontSize: 18,
  },
  successText: {
    fontFamily: 'Outfit_500Medium',
    color: Colors.slate[500],
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 32,
    textAlign: 'center',
  },
  successButton: {
    borderRadius: 16,
    backgroundColor: Colors.charcoal,
  },
});
