import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  TextInput, 
  Button, 
  Text, 
  useTheme, 
  ActivityIndicator,
  Portal,
  Modal,
} from 'react-native-paper';
import { supabase } from '../src/lib/supabase';

export default function InquiryForm({ visible, onDismiss, serviceId, serviceName }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const handleSubmit = async () => {
    if (!name || !email || !message) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('inquiries')
        .insert([
          {
            name,
            email,
            phone,
            subject: `Inquiry for ${serviceName}`,
            message: `Service ID: ${serviceId}\n\n${message}`,
            status: 'unread',
          }
        ]);

      if (error) throw error;

      Alert.alert('Success', 'Your inquiry has been sent successfully!');
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      onDismiss();
    } catch (err) {
      console.error('Error submitting inquiry:', err);
      Alert.alert('Error', 'Failed to send inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.container}
      >
        <ScrollView>
          <Text style={styles.title}>Service Inquiry</Text>
          <Text style={styles.subtitle}>Let us know how we can help you with {serviceName}.</Text>

          <TextInput
            label="Your Name *"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            outlineColor="#E2E8F0"
            activeOutlineColor="#DC2626"
          />

          <TextInput
            label="Email Address *"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            style={styles.input}
            outlineColor="#E2E8F0"
            activeOutlineColor="#DC2626"
          />

          <TextInput
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
            outlineColor="#E2E8F0"
            activeOutlineColor="#DC2626"
          />

          <TextInput
            label="Message *"
            value={message}
            onChangeText={setMessage}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={[styles.input, { height: 120 }]}
            outlineColor="#E2E8F0"
            activeOutlineColor="#DC2626"
          />

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.submitBtn}
            buttonColor="#DC2626"
            contentStyle={{ paddingVertical: 8 }}
            labelStyle={styles.btnLabel}
          >
            SEND INQUIRY
          </Button>

          <Button
            mode="text"
            onPress={onDismiss}
            textColor="#64748B"
            style={styles.cancelBtn}
          >
            CANCEL
          </Button>
        </ScrollView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 24,
    margin: 20,
    borderRadius: 24,
    maxHeight: '80%',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
    lineHeight: 20,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFF',
  },
  submitBtn: {
    marginTop: 8,
    borderRadius: 12,
  },
  btnLabel: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
  cancelBtn: {
    marginTop: 8,
  },
});
