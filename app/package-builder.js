import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { 
  Text, 
  Button, 
  ProgressBar, 
  TextInput, 
  Card,
  useTheme,
  Surface,
} from 'react-native-paper';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '../src/lib/supabase';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const STAGES = ['DESTINATION', 'DURATION', 'TRAVELERS', 'STAY', 'CONTACT'];

export default function PackageBuilderScreen() {
  const [stageIndex, setStageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const theme = useTheme();

  const [formData, setFormData] = useState({
    destination: '',
    duration: '',
    travelers: '',
    stayType: '',
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const nextStage = () => {
    if (stageIndex < STAGES.length - 1) {
      setStageIndex(stageIndex + 1);
    }
  };

  const prevStage = () => {
    if (stageIndex > 0) {
      setStageIndex(stageIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      Alert.alert('Missing Info', 'Please provide your name and email.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('inquiries')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            subject: 'Custom Package Builder Inquiry',
            message: `CUSTOM PACKAGE DETAILS:
Destination: ${formData.destination}
Duration: ${formData.duration}
Travelers: ${formData.travelers}
Stay Preference: ${formData.stayType}
Additional Notes: ${formData.message}`,
            status: 'unread',
          }
        ]);

      if (error) throw error;

      Alert.alert('Success', 'Your custom plan inquiry has been sent!', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err) {
      console.error('Error submitting package builder:', err);
      Alert.alert('Error', 'Failed to send inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentStage = STAGES[stageIndex];
  const progress = (stageIndex + 1) / STAGES.length;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Package Builder', headerBackTitle: 'Back' }} />
      
      <View style={styles.header}>
        <Text style={styles.progressText}>Step {stageIndex + 1} of {STAGES.length}</Text>
        <ProgressBar progress={progress} color="#DC2626" style={styles.progressBar} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.stageContent}>
          {currentStage === 'DESTINATION' && (
            <>
              <Text style={styles.stageTitle}>Where to first?</Text>
              <View style={styles.grid}>
                {['North (Vibrant)', 'South (Wild)', 'East (Beaches)', 'West (Sunsets)'].map(item => (
                  <Surface 
                    key={item} 
                    style={[styles.tile, formData.destination === item && styles.activeTile]}
                    elevation={1}
                  >
                    <TouchableOpacity 
                      style={styles.tileTouch}
                      onPress={() => { setFormData({...formData, destination: item}); nextStage(); }}
                    >
                      <MaterialCommunityIcons 
                        name="map-marker" 
                        size={24} 
                        color={formData.destination === item ? "#FFF" : "#DC2626"} 
                      />
                      <Text style={[styles.tileLabel, formData.destination === item && styles.activeLabel]}>{item}</Text>
                    </TouchableOpacity>
                  </Surface>
                ))}
              </View>
            </>
          )}

          {currentStage === 'DURATION' && (
            <>
              <Text style={styles.stageTitle}>How long will you stay?</Text>
              <View style={styles.grid}>
                {['5 Days', '7 Days', '10 Days', '14 Days', '21 Days+'].map(item => (
                  <Surface 
                    key={item} 
                    style={[styles.tile, formData.duration === item && styles.activeTile]}
                    elevation={1}
                  >
                    <TouchableOpacity 
                      style={styles.tileTouch}
                      onPress={() => { setFormData({...formData, duration: item}); nextStage(); }}
                    >
                      <MaterialCommunityIcons 
                        name="calendar-clock" 
                        size={24} 
                        color={formData.duration === item ? "#FFF" : "#DC2626"} 
                      />
                      <Text style={[styles.tileLabel, formData.duration === item && styles.activeLabel]}>{item}</Text>
                    </TouchableOpacity>
                  </Surface>
                ))}
              </View>
            </>
          )}

          {currentStage === 'TRAVELERS' && (
            <>
              <Text style={styles.stageTitle}>Who are you traveling with?</Text>
              <View style={styles.grid}>
                {['Solo', 'Couple', 'Family', 'Group', 'Work Trip'].map(item => (
                  <Surface 
                    key={item} 
                    style={[styles.tile, formData.travelers === item && styles.activeTile]}
                    elevation={1}
                  >
                    <TouchableOpacity 
                      style={styles.tileTouch}
                      onPress={() => { setFormData({...formData, travelers: item}); nextStage(); }}
                    >
                      <MaterialCommunityIcons 
                        name="account-group" 
                        size={24} 
                        color={formData.travelers === item ? "#FFF" : "#DC2626"} 
                      />
                      <Text style={[styles.tileLabel, formData.travelers === item && styles.activeLabel]}>{item}</Text>
                    </TouchableOpacity>
                  </Surface>
                ))}
              </View>
            </>
          )}

          {currentStage === 'STAY' && (
            <>
              <Text style={styles.stageTitle}>Preferred accommodation?</Text>
              <View style={styles.grid}>
                {['Beach Resort', 'Luxury Villa', 'Boutique Hotel', 'Budget Rest', 'Eco Lodge'].map(item => (
                  <Surface 
                    key={item} 
                    style={[styles.tile, formData.stayType === item && styles.activeTile]}
                    elevation={1}
                  >
                    <TouchableOpacity 
                      style={styles.tileTouch}
                      onPress={() => { setFormData({...formData, stayType: item}); nextStage(); }}
                    >
                      <MaterialCommunityIcons 
                        name="home-heart" 
                        size={24} 
                        color={formData.stayType === item ? "#FFF" : "#DC2626"} 
                      />
                      <Text style={[styles.tileLabel, formData.stayType === item && styles.activeLabel]}>{item}</Text>
                    </TouchableOpacity>
                  </Surface>
                ))}
              </View>
            </>
          )}

          {currentStage === 'CONTACT' && (
            <View style={styles.formContainer}>
              <Text style={styles.stageTitle}>Almost there!</Text>
              <Surface style={styles.summaryCard} elevation={0}>
                <Text style={styles.summaryLabel}>YOUR SELECTION</Text>
                <Text style={styles.summaryText}>
                   {formData.destination} • {formData.duration} • {formData.travelers} • {formData.stayType}
                </Text>
              </Surface>

              <TextInput
                label="Full Name *"
                value={formData.name}
                onChangeText={(t) => setFormData({...formData, name: t})}
                mode="outlined"
                style={styles.input}
              />
              <TextInput
                label="Email Address *"
                value={formData.email}
                onChangeText={(t) => setFormData({...formData, email: t})}
                mode="outlined"
                keyboardType="email-address"
                style={styles.input}
              />
              <TextInput
                label="Phone Number"
                value={formData.phone}
                onChangeText={(t) => setFormData({...formData, phone: t})}
                mode="outlined"
                style={styles.input}
              />
              <TextInput
                label="Additional Requirements"
                value={formData.message}
                onChangeText={(t) => setFormData({...formData, message: t})}
                mode="outlined"
                multiline
                numberOfLines={4}
                style={[styles.input, { height: 100 }]}
              />

              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={loading}
                disabled={loading}
                style={styles.submitBtn}
                buttonColor="#DC2626"
                labelStyle={styles.submitBtnLabel}
              >
                REQUEST CUSTOM PLAN
              </Button>
            </View>
          )}
        </View>
      </ScrollView>

      {stageIndex > 0 && (
        <View style={styles.footer}>
          <Button 
            mode="text" 
            onPress={prevStage} 
            textColor="#64748B" 
            icon="chevron-left"
          >
            PREVIOUS STEP
          </Button>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    padding: 24,
    backgroundColor: '#FFF',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 2,
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F1F5F9',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  stageContent: {
    paddingHorizontal: 24,
  },
  stageTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1E293B',
    lineHeight: 34,
    marginBottom: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tile: {
    width: (width - 60) / 2,
    height: 120,
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  activeTile: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  tileTouch: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileLabel: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: '900',
    color: '#64748B',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  activeLabel: {
    color: '#FFF',
  },
  formContainer: {
    marginTop: 8,
  },
  summaryCard: {
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 2,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1E293B',
    lineHeight: 20,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFF',
  },
  submitBtn: {
    marginTop: 16,
    borderRadius: 12,
  },
  submitBtnLabel: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    paddingVertical: 4,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    alignItems: 'flex-start',
  },
});
