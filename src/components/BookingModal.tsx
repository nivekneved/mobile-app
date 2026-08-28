import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, useWindowDimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { Modal, Portal, Text, TextInput, Button, IconButton, Surface, Chip } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Colors } from '../theme/colors';
import { mss } from '../styles/mss';
import { Calendar, X, CheckCircle, Moon, Clock, Utensils, Users, ArrowRight, ArrowLeft, ShieldCheck, Car, Smartphone, Plus, Trash2, Info } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useServicePricing } from '../hooks/useServicePricing';

const travelerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  passportNumber: z.string().optional(),
});

const bookingSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(8, 'Valid phone number is required'),
  paxAdults: z.number().min(1, 'At least 1 adult is required'),
  paxTeens: z.number().min(0),
  paxChildren: z.number().min(0),
  paxInfants: z.number().min(0),
  checkIn: z.string().min(1, 'Start Date is required'),
  checkOut: z.string().min(1, 'End Date is required'),
  roomType: z.string().optional(),
  mealPreference: z.string().optional(),
  addons: z.array(z.string()).optional(),
  specialRequirements: z.string().optional(),
  travelers: z.array(travelerSchema).optional(),
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

// PRESERVED: old flat-rate addons list
// const AVAILABLE_ADDONS = [
//   { id: 'airport_transfer', name: 'Airport Transfer', price: 2500, icon: Car, description: 'Private VIP pickup from SSR Airport' },
//   { id: 'sim_card', name: 'Local SIM Card', price: 500, icon: Smartphone, description: '100GB 5G Data pre-activated' },
//   { id: 'spa_voucher', name: 'Premium Spa', price: 3500, icon: Moon, description: '60-min Holistic Mauritian Massage' },
//   { id: 'early_checkin', name: 'Early Check-in', price: 1500, icon: Clock, description: 'Arrival from 09:00 (Subject to availability)' },
// ];

const AVAILABLE_ADDONS = [
  { id: 'airport_transfer', name: 'Airport Transfer', price: 2500, icon: Car, description: 'Private VIP pickup from SSR Airport', type: 'flat' },
  { id: 'sim_card', name: 'Local SIM Card', price: 500, icon: Smartphone, description: '100GB 5G Data pre-activated', type: 'per_person' },
  { id: 'spa_voucher', name: 'Premium Spa', price: 3500, icon: Moon, description: '60-min Holistic Mauritian Massage', type: 'per_person' },
  { id: 'early_checkin', name: 'Early Check-in', price: 1500, icon: Clock, description: 'Arrival from 09:00 (Subject to availability)', type: 'flat' },
];

export const BookingModal = ({ visible, onDismiss, service, onSubmit, initialData }: BookingModalProps) => {
  const { width } = useWindowDimensions();
  const [currentStep, setCurrentStep] = useState(1);
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<any>(null);

  const { roomTypes } = useMemo(() => {
    return { roomTypes: service.room_types || [] };
  }, [service]);

  const { control, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      paxAdults: initialData?.paxAdults || 2,
      paxTeens: initialData?.paxTeens || 0,
      paxChildren: initialData?.paxChildren || 0,
      paxInfants: initialData?.paxInfants || 0,
      checkIn: initialData?.checkIn || new Date().toISOString().split('T')[0],
      checkOut: initialData?.checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      roomType: initialData?.roomType || '',
      mealPreference: initialData?.mealPreference || 'none',
      addons: [],
      specialRequirements: '',
      travelers: [],
    },
  });

  const watchAllFields = watch();

  const selectedRoom = useMemo(() => {
    return roomTypes.find(r => r.name === watchAllFields.roomType);
  }, [roomTypes, watchAllFields.roomType]);

  const pricingRequest = useMemo(() => ({
    serviceId: service.id,
    variantId: selectedRoom?.id || 'default',
    startDate: watchAllFields.checkIn,
    endDate: watchAllFields.checkOut,
    participants: {
      adults: watchAllFields.paxAdults,
      teens: watchAllFields.paxTeens,
      children: watchAllFields.paxChildren,
      infants: watchAllFields.paxInfants
    },
    baseRates: {
      adult: selectedRoom?.weekday_price || service.price || 0,
      teen: (service as any).price_teen || service.price * 0.7 || 0,
      child: (service as any).price_child || service.childPrice || service.price * 0.5 || 0,
      infant: (service as any).price_infant || 0
    },
    isPerNight: service.category === 'hotel'
  }), [service.id, service.price, service.category, selectedRoom?.id, selectedRoom?.weekday_price, watchAllFields.checkIn, watchAllFields.checkOut, watchAllFields.paxAdults, watchAllFields.paxTeens, watchAllFields.paxChildren, watchAllFields.paxInfants]);

  const { pricing, mealOptions, loading: calculatingPrice } = useServicePricing(pricingRequest);

  const calculateTotal = () => {
    let base = pricing?.total || 0;
    
    // Dynamic Meal Plan Supplements Integration
    const selectedMealOption = mealOptions.find(m => m.label === watchAllFields.mealPreference);
    const mealPlanTotal = selectedMealOption?.total || 0;

    // PRESERVED: Old flat-rate addons sum
    // const currentAddons = watchAllFields.addons || [];
    // const addonTotal = currentAddons.reduce((sum, id) => {
    //   const addon = AVAILABLE_ADDONS.find(a => a.id === id);
    //   return sum + (addon?.price || 0);
    // }, 0);

    const currentAddons = watchAllFields.addons || [];
    const totalPax = (watchAllFields.paxAdults || 0) + (watchAllFields.paxTeens || 0) + (watchAllFields.paxChildren || 0);
    const addonTotal = currentAddons.reduce((sum, id) => {
      const addon = AVAILABLE_ADDONS.find(a => a.id === id);
      if (!addon) return sum;
      const itemPrice = addon.type === 'per_person' ? addon.price * totalPax : addon.price;
      return sum + itemPrice;
    }, 0);

    return base + mealPlanTotal + addonTotal;
  };

  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [activePickerType, setActivePickerType] = useState<'checkIn' | 'checkOut' | null>(null);

  const openDatePicker = (type: 'checkIn' | 'checkOut') => {
    const currentDateStr = type === 'checkIn' ? watchAllFields.checkIn : watchAllFields.checkOut;
    const parsedDate = currentDateStr ? new Date(currentDateStr) : new Date();
    setTempDate(isNaN(parsedDate.getTime()) ? new Date() : parsedDate);
    setActivePickerType(type);
  };

  const confirmIOSDate = () => {
    if (activePickerType) {
      const formatted = tempDate.toISOString().split('T')[0];
      setValue(activePickerType, formatted, { shouldValidate: true });
    }
    setActivePickerType(null);
  };

  const handleNext = () => {
    if (!watchAllFields.checkIn || !watchAllFields.checkOut) {
      Alert.alert('Missing Dates', 'Please ensure departure and return dates are selected.', [{ text: 'OK' }]);
      return;
    }
    if (currentStep < 2) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const onInvalid = (fieldErrors: any) => {
    const missing: string[] = [];
    if (fieldErrors.firstName) missing.push('First Name (at least 2 characters)');
    if (fieldErrors.lastName) missing.push('Last Name (at least 2 characters)');
    if (fieldErrors.email) missing.push('Valid Email Address');
    if (fieldErrors.phone) missing.push('Phone / WhatsApp Number (min 8 digits)');
    if (fieldErrors.checkIn) missing.push('Departure Date');
    if (fieldErrors.checkOut) missing.push('Return Date');

    const message = missing.length > 0
      ? `Please complete the following required fields:\n\n• ${missing.join('\n• ')}`
      : 'Please ensure all booking fields are filled in correctly.';

    Alert.alert('Incomplete Details', message, [{ text: 'Review Form' }]);
  };

  const onConfirm = async (data: any) => {
    const formData = data as BookingFormData;
    setIsSubmitting(true);
    try {
      const total = calculateTotal();
      await onSubmit({ ...formData, totalAmount: total });
      setSubmittedReport({ ...formData, totalAmount: total });
      setIsSuccess(true);
    } catch (err) {
      Alert.alert('Booking Notice', 'Unable to complete immediate dispatch. Please try again or reach out to our concierge.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2].map(step => (
        <View key={step} style={styles.stepDotContainer}>
          <View style={[styles.stepDot, currentStep >= step && styles.stepDotActive]} />
          {step < 2 && <View style={[styles.stepLine, currentStep > step && styles.stepLineActive]} />}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Journey & Stay Options</Text>
      <Text style={styles.stepSub}>Select your travel dates, travelers, and room preferences.</Text>

      <Surface style={styles.card}>
        <View style={styles.dateRow}>
          <TouchableOpacity onPress={() => openDatePicker('checkIn')} style={styles.dateField} activeOpacity={0.7}>
            <Text style={styles.dateLabel}>DEPARTURE</Text>
            <View style={styles.dateValueContainer}>
              <Calendar size={16} color={Colors.primary} />
              <Text style={styles.dateValue}>{watchAllFields.checkIn || 'Select Date'}</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.dateDivider} />
          <TouchableOpacity onPress={() => openDatePicker('checkOut')} style={styles.dateField} activeOpacity={0.7}>
            <Text style={styles.dateLabel}>RETURN</Text>
            <View style={styles.dateValueContainer}>
              <Calendar size={16} color={Colors.primary} />
              <Text style={styles.dateValue}>{watchAllFields.checkOut || 'Select Date'}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </Surface>

      <Text style={styles.sectionLabel}>TRAVELERS</Text>
      <View style={styles.occupancyGrid}>
        {[
          { label: 'Adults', key: 'paxAdults', min: 1 },
          { label: 'Teens', key: 'paxTeens', min: 0 },
          { label: 'Children', key: 'paxChildren', min: 0 },
          { label: 'Infants', key: 'paxInfants', min: 0 }
        ].map(item => (
          <View key={item.key} style={[styles.occupancyItem, { width: (Math.min(width, 640) - 64) / 2 }]}>
            <Text style={styles.occLabel}>{item.label}</Text>
            <View style={styles.counterRow}>
              <IconButton 
                icon="minus-circle-outline" 
                size={24} 
                iconColor={Colors.primary}
                onPress={() => setValue(item.key as any, Math.max(item.min, (watchAllFields as any)[item.key] - 1))}
                disabled={(watchAllFields as any)[item.key] <= item.min}
              />
              <Text style={styles.counterText}>{(watchAllFields as any)[item.key]}</Text>
              <IconButton 
                icon="plus-circle-outline" 
                size={24} 
                iconColor={Colors.primary}
                onPress={() => setValue(item.key as any, (watchAllFields as any)[item.key] + 1)}
              />
            </View>
          </View>
        ))}
      </View>

      {roomTypes.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>ROOM TYPE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roomScroll}>
            {roomTypes.map(room => (
              <TouchableOpacity 
                key={room.id}
                onPress={() => setValue('roomType', room.name)}
                style={[styles.roomCard, watchAllFields.roomType === room.name && styles.roomCardActive]}
              >
                <Text style={[styles.roomName, watchAllFields.roomType === room.name && styles.roomTextActive]}>{room.name}</Text>
                <Text style={[styles.roomPrice, watchAllFields.roomType === room.name && styles.roomTextActive]}>
                  MUR {(room.weekday_price ?? 0).toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      <Text style={styles.sectionLabel}>MEAL PLAN</Text>
      <View style={styles.chipGrid}>
        {mealOptions && mealOptions.length > 0 ? (
          mealOptions.map(option => (
            <Chip 
              key={option.label}
              selected={watchAllFields.mealPreference === option.label}
              onPress={() => setValue('mealPreference', option.label)}
              style={[styles.planChip, watchAllFields.mealPreference === option.label && styles.planChipActive]}
              textStyle={[styles.planChipText, watchAllFields.mealPreference === option.label && styles.planChipTextActive]}
            >
              {option.label} (+MUR {(option.total ?? 0).toLocaleString()})
            </Chip>
          ))
        ) : (
          ['none', 'Bed & Breakfast', 'Half Board', 'Full Board', 'All Inclusive'].map(plan => (
            <Chip 
              key={plan}
              selected={watchAllFields.mealPreference === plan}
              onPress={() => setValue('mealPreference', plan)}
              style={[styles.planChip, watchAllFields.mealPreference === plan && styles.planChipActive]}
              textStyle={[styles.planChipText, watchAllFields.mealPreference === plan && styles.planChipTextActive]}
            >
              {plan === 'none' ? 'Room Only' : plan}
            </Chip>
          ))
        )}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Contact & Confirmation</Text>
      <Text style={styles.stepSub}>Provide contact details for your instant quote dispatch.</Text>

      <View style={styles.formGrid}>
        <Controller
          control={control}
          name="firstName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label="First Name *" mode="outlined" onBlur={onBlur} onChangeText={onChange} value={value} error={!!errors.firstName} style={styles.input} activeOutlineColor={Colors.primary} />
          )}
        />
        {errors.firstName && <Text style={styles.fieldErrorText}>{errors.firstName.message}</Text>}

        <Controller
          control={control}
          name="lastName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label="Last Name *" mode="outlined" onBlur={onBlur} onChangeText={onChange} value={value} error={!!errors.lastName} style={styles.input} activeOutlineColor={Colors.primary} />
          )}
        />
        {errors.lastName && <Text style={styles.fieldErrorText}>{errors.lastName.message}</Text>}

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label="Email Address *" mode="outlined" keyboardType="email-address" autoCapitalize="none" onBlur={onBlur} onChangeText={onChange} value={value} error={!!errors.email} style={styles.input} activeOutlineColor={Colors.primary} />
          )}
        />
        {errors.email && <Text style={styles.fieldErrorText}>{errors.email.message}</Text>}

        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label="WhatsApp / Phone Number *" mode="outlined" keyboardType="phone-pad" onBlur={onBlur} onChangeText={onChange} value={value} error={!!errors.phone} style={styles.input} activeOutlineColor={Colors.primary} />
          )}
        />
        {errors.phone && <Text style={styles.fieldErrorText}>{errors.phone.message}</Text>}

        <Controller
          control={control}
          name="specialRequirements"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label="Special Requests / Notes (Optional)" mode="outlined" multiline numberOfLines={3} onBlur={onBlur} onChangeText={onChange} value={value} style={styles.input} activeOutlineColor={Colors.primary} />
          )}
        />
      </View>

      <Surface style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <ShieldCheck size={16} color={Colors.success} />
          <Text style={styles.summaryText}>Secure Booking Protocol</Text>
        </View>
        <Text style={styles.summaryNote}>Your inquiry will be handled by a dedicated concierge for instant confirmation.</Text>
      </Surface>
    </View>
  );

  const renderSuccess = () => (
    <View style={styles.successWrapper}>
      <CheckCircle size={80} color={Colors.success} style={{ marginBottom: 20 }} />
      <Text style={styles.successTitle}>Request Dispatched</Text>
      <Text style={styles.successSub}>Thank you for choosing Travel Lounge Elite. Our concierge team will reach out shortly.</Text>
      
      <Surface style={styles.reportCard}>
        <View style={styles.reportRow}>
          <Text style={styles.reportLabel}>SERVICE</Text>
          <Text style={styles.reportValue}>{service.name}</Text>
        </View>
        <View style={styles.reportRow}>
          <Text style={styles.reportLabel}>ESTIMATED TOTAL</Text>
          <Text style={styles.reportValue}>MUR {(calculateTotal() ?? 0).toLocaleString()}</Text>
        </View>
      </Surface>

      <Button mode="contained" onPress={onDismiss} style={styles.doneBtn} contentStyle={{ height: 50 }} buttonColor={Colors.charcoal}>
        BACK TO EXPLORE
      </Button>
    </View>
  );

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          {isSuccess ? renderSuccess() : (
            <View style={styles.content}>
              <View style={styles.header}>
                <View style={{ flex: 1, marginRight: 16 }}>
                  <Text style={styles.brandBadge}>ELITE CONCIERGE</Text>
                  <Text style={styles.title} numberOfLines={2}>{service?.name || 'Travel Booking'}</Text>
                </View>
                <IconButton icon="close" onPress={onDismiss} />
              </View>

              {renderStepIndicator()}

              <ScrollView 
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent} 
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
              >
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
              </ScrollView>

            <View style={styles.footer}>
              <View style={styles.priceContainer}>
                <View>
                   <Text style={styles.priceLabel}>ESTIMATED QUOTE</Text>
                   <Text style={styles.nightsText}>{pricing?.nights || 0} NIGHTS SELECTION</Text>
                </View>
                {calculatingPrice ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <Text style={styles.totalPrice}>Rs {(calculateTotal() ?? 0).toLocaleString()}</Text>
                )}
              </View>

              <View style={styles.buttonRow}>
                {currentStep > 1 && (
                  <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <ArrowLeft size={20} color={Colors.charcoal} />
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                  onPress={currentStep === 2 ? () => (handleSubmit as any)(onConfirm, onInvalid)() : handleNext}
                  disabled={isSubmitting || (currentStep === 1 && pricing?.availabilityStatus?.isAvailable === false)}
                  style={[styles.nextBtn, currentStep === 1 ? { flex: 1 } : {}]}
                  activeOpacity={0.8}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.nextBtnText}>{currentStep === 2 ? 'SEND REQUEST' : 'CONTINUE (1/2)'}</Text>
                      <ArrowRight size={20} color="#fff" />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Dedicated Android Native Picker */}
        {Platform.OS === 'android' && activePickerType !== null && (
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="default"
            minimumDate={activePickerType === 'checkOut' && watchAllFields.checkIn ? new Date(watchAllFields.checkIn) : new Date()}
            onChange={(event, date) => {
              const currentType = activePickerType;
              setActivePickerType(null);
              if (event.type === 'set' && date && currentType) {
                setValue(currentType, date.toISOString().split('T')[0], { shouldValidate: true });
              }
            }}
          />
        )}

        {/* Dedicated iOS / iPadOS Overlay Modal Sheet */}
        {Platform.OS === 'ios' && activePickerType !== null && (
          <Modal
            visible={true}
            onDismiss={() => setActivePickerType(null)}
            contentContainerStyle={styles.iosPickerModalContainer}
          >
            <View style={styles.iosPickerHeader}>
              <TouchableOpacity onPress={() => setActivePickerType(null)} style={styles.pickerHeaderBtn}>
                <Text style={styles.pickerCancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.pickerHeaderTitle}>
                {activePickerType === 'checkIn' ? 'Select Departure Date' : 'Select Return Date'}
              </Text>
              <TouchableOpacity onPress={confirmIOSDate} style={styles.pickerHeaderBtn}>
                <Text style={styles.pickerConfirmText}>Done</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.iosPickerBody}>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                themeVariant="light"
                textColor="#000000"
                minimumDate={activePickerType === 'checkOut' && watchAllFields.checkIn ? new Date(watchAllFields.checkIn) : new Date()}
                onChange={(_, date) => {
                  if (date) setTempDate(date);
                }}
                style={{ height: 216, width: '100%' }}
              />
            </View>
          </Modal>
        )}
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#fff',
    margin: 0,
    marginTop: Platform.OS === 'ios' ? 44 : 20,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    flex: 1,
    height: '92%',
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    height: '100%',
  },
  scrollContainer: {
    flex: 1,
    width: '100%',
  },
  header: {
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandBadge: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.charcoal,
  },
  stepIndicator: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 20,
    justifyContent: 'center',
  },
  stepDotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#eee',
  },
  stepDotActive: {
    backgroundColor: Colors.primary,
  },
  stepLine: {
    width: 30,
    height: 2,
    backgroundColor: '#eee',
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: Colors.primary,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    flexGrow: 1,
  },
  stepContainer: {
    width: '100%',
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.charcoal,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  stepSub: {
    fontSize: 13,
    color: Colors.slate[500],
    lineHeight: 18,
    marginBottom: 24,
  },
  card: {
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    padding: 20,
    marginBottom: 24,
    elevation: 0,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateField: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.slate[400],
    marginBottom: 8,
    letterSpacing: 1,
  },
  dateValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.charcoal,
  },
  dateDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E9ECEF',
    marginHorizontal: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.charcoal,
    letterSpacing: 1.5,
    marginBottom: 16,
    marginTop: 8,
  },
  occupancyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  occupancyItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
  },
  occLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.slate[500],
    marginBottom: 8,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  counterText: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.charcoal,
  },
  roomScroll: {
    marginBottom: 24,
  },
  roomCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    padding: 20,
    marginRight: 12,
    minWidth: 160,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roomCardActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  roomName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.charcoal,
    marginBottom: 4,
  },
  roomPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.slate[500],
  },
  roomTextActive: {
    color: '#fff',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  planChip: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  planChipActive: {
    backgroundColor: Colors.charcoal,
  },
  planChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.slate[500],
  },
  planChipTextActive: {
    color: '#fff',
  },
  addonList: {
    marginBottom: 20,
  },
  addonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  addonCardActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  addonIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  addonInfo: {
    flex: 1,
  },
  addonName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.charcoal,
    marginBottom: 2,
  },
  addonDesc: {
    fontSize: 11,
    color: Colors.slate[500],
  },
  addonPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.primary,
  },
  textWhite: { color: '#fff' },
  textWhite70: { color: 'rgba(255,255,255,0.7)' },
  input: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  summaryCard: {
    marginTop: 10,
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#166534',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  summaryNote: {
    fontSize: 11,
    color: '#15803D',
    lineHeight: 16,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.slate[400],
    letterSpacing: 1,
  },
  nightsText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 2,
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.charcoal,
    letterSpacing: -0.5,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  backBtn: {
    width: 50,
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtn: {
    flex: 3,
    height: 50,
    backgroundColor: Colors.charcoal,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextBtnText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: 'Outfit_800ExtraBold',
    letterSpacing: 1,
  },
  successWrapper: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.charcoal,
    marginBottom: 8,
    textAlign: 'center',
  },
  successSub: {
    fontSize: 14,
    color: Colors.slate[500],
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  reportCard: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
  },
  reportRow: {
    marginBottom: 16,
  },
  reportLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.slate[400],
    letterSpacing: 1,
    marginBottom: 4,
  },
  reportValue: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.charcoal,
  },
  doneBtn: {
    width: '100%',
    borderRadius: 16,
  },
  formGrid: {
    marginTop: 10,
  },
  travelerFormCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  travelerCardTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.charcoal,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  fieldErrorText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '600',
    marginTop: -4,
    marginBottom: 8,
    marginLeft: 4,
  },
  iosPickerModalContainer: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    maxWidth: 420,
    alignSelf: 'center',
    width: '90%',
  },
  iosPickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  pickerHeaderBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  pickerHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.charcoal,
  },
  pickerCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.slate[500],
  },
  pickerConfirmText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  iosPickerBody: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
});
