import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Title, Paragraph, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import Hero from '../../components/Hero';
import PremiumCard from '../../components/PremiumCard';

export default function HomeScreen() {
  const router = useRouter();
  const { session, userEmail } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Hero />
        
        <View style={styles.introSection}>
          <Text style={styles.preHeader}>OUR SERVICES</Text>
          <Text style={styles.mainHeader}>
            Helping You Plan {'\n'}
            <Text style={styles.altHeader}>Perfect Holidays.</Text>
          </Text>
          <Text style={styles.description}>
            We specialize in comfortable escapes that everyone can enjoy. 
            From beautiful beaches to local cultural spots.
          </Text>
        </View>

        <PremiumCard 
          style={styles.card}
          onPress={() => router.push('/explore')}
        >
          <PremiumCard.Content>
            <Text style={styles.cardTag}>BROWSE</Text>
            <Title style={styles.cardTitle}>Book Services</Title>
            <Paragraph style={styles.cardPara}>
              Find trusted service providers in your area for various needs.
            </Paragraph>
          </PremiumCard.Content>
          <PremiumCard.Actions style={styles.cardActions}>
            <Button 
              mode="text" 
              textColor="#DC2626" 
              labelStyle={styles.actionLabel}
            >
              BROWSE NOW →
            </Button>
          </PremiumCard.Actions>
        </PremiumCard>

        <PremiumCard 
          style={styles.card}
          onPress={() => router.push('/bookings')}
        >
          <PremiumCard.Content>
            <Text style={styles.cardTag}>MANAGE</Text>
            <Title style={styles.cardTitle}>My Bookings</Title>
            <Paragraph style={styles.cardPara}>
              View and manage your upcoming appointments and bookings.
            </Paragraph>
          </PremiumCard.Content>
          <PremiumCard.Actions style={styles.cardActions}>
            <Button 
              mode="text" 
              textColor="#DC2626" 
              labelStyle={styles.actionLabel}
            >
              VIEW DETAILS →
            </Button>
          </PremiumCard.Actions>
        </PremiumCard>

        <PremiumCard 
          style={styles.card}
          onPress={() => router.push('/profile')}
        >
          <PremiumCard.Content>
            <Text style={styles.cardTag}>ACCOUNT</Text>
            <Title style={styles.cardTitle}>View Profile</Title>
            <Paragraph style={styles.cardPara}>
              Update your profile information and manage your preferences.
            </Paragraph>
          </PremiumCard.Content>
          <PremiumCard.Actions style={styles.cardActions}>
            <Button 
              mode="text" 
              textColor="#DC2626" 
              labelStyle={styles.actionLabel}
            >
              SETTINGS →
            </Button>
          </PremiumCard.Actions>
        </PremiumCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Slate 50
  },
  content: {
    paddingBottom: 40,
  },
  introSection: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
  },
  preHeader: {
    fontSize: 10,
    fontWeight: '900',
    color: '#DC2626',
    letterSpacing: 4,
    marginBottom: 16,
  },
  mainHeader: {
    fontSize: 34,
    fontWeight: '900',
    color: '#1E293B', // Slate 900
    lineHeight: 38,
    letterSpacing: -1,
    marginBottom: 16,
  },
  altHeader: {
    color: '#94A3B8', // Slate 400
  },
  description: {
    fontSize: 15,
    color: '#64748B', // Slate 500
    lineHeight: 24,
    fontWeight: '500',
    maxWidth: '85%',
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  cardTag: {
    fontSize: 9,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 2,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 8,
  },
  cardPara: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  cardActions: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
});