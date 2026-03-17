import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Modal, Portal, Text, TextInput, Button, IconButton, Surface } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../theme/colors';
import { Calendar, Users, X, CheckCircle } from 'lucide-react-native';

const bookingSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(8, 'Valid phone number is required'),
  paxAdults: z.number().min(1, 'At least 1 adult is required'),
  paxChildren: z.number().min(0),
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
    category?: string;
  };
  onSubmit: (data: BookingFormData & { date: Date }) => Promise<void>;
}

export const BookingModal = ({ visible, onDismiss, service, onSubmit }: BookingModalProps) => {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { control, handleSubmit, formState: { errors }, reset } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      paxAdults: 1,
      paxChildren: 0,
      specialRequirements: '',
    },
  });

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleFormSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({ ...data, date });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        reset();
        onDismiss();
      }, 3000);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Portal>
        <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.successContainer}>
          <View style={styles.successContent}>
            <CheckCircle color="#059669" size={64} />
            <Text variant="headlineSmall" style={styles.successTitle}>Request Sent!</Text>
            <Text style={styles.successText}>
              We've received your booking request for {service.name}. Our team will contact you shortly.
            </Text>
            <Button mode="contained" onPress={onDismiss} style={styles.successButton}>
              Close
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

          <TouchableOpacity 
            style={styles.dateSelector} 
            onPress={() => setShowDatePicker(true)}
          >
            <Calendar size={20} color={Colors.primary} />
            <View>
              <Text style={styles.dateLabel}>Preferred Date</Text>
              <Text style={styles.dateValue}>{date.toLocaleDateString()}</Text>
            </View>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}

          <View style={styles.row}>
            <View style={styles.col}>
              <Controller
                control={control}
                name="paxAdults"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    label="Adults"
                    value={value.toString()}
                    onChangeText={(val) => onChange(parseInt(val) || 0)}
                    mode="outlined"
                    keyboardType="numeric"
                    error={!!errors.paxAdults}
                    activeOutlineColor={Colors.primary}
                    style={styles.input}
                  />
                )}
              />
              {errors.paxAdults && <Text style={styles.error}>{errors.paxAdults.message}</Text>}
            </View>
            <View style={styles.col}>
              <Controller
                control={control}
                name="paxChildren"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    label="Children"
                    value={value.toString()}
                    onChangeText={(val) => onChange(parseInt(val) || 0)}
                    mode="outlined"
                    keyboardType="numeric"
                    activeOutlineColor={Colors.primary}
                    style={styles.input}
                  />
                )}
              />
            </View>
          </View>

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
            <Text style={styles.totalLabel}>Total Price From</Text>
            <Text style={styles.totalValue}>Rs {service.price.toLocaleString()}</Text>
          </View>
          <Button
            mode="contained"
            onPress={handleSubmit(handleFormSubmit as any)}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.submitButton}
            contentStyle={styles.submitButtonContent}
          >
            Confirm Booking
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
    height: 50,
  },
  successContainer: {
    backgroundColor: Colors.white,
    margin: 40,
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
  },
  successContent: {
    alignItems: 'center',
    textAlign: 'center',
  },
  successTitle: {
    fontWeight: '900',
    color: Colors.charcoal,
    marginTop: 20,
    marginBottom: 12,
  },
  successText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  successButton: {
    width: '100%',
    borderRadius: 16,
  },
});
