import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { Colors } from '../../src/theme/colors';
import { useHomeData } from '../../src/hooks/useHomeData';
import { HeroCarousel } from '../../src/components/HeroCarousel';
import { CategoryCard } from '../../src/components/CategoryCard';
import { ServiceCard } from '../../src/components/ServiceCard';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { heroSlides, categories, featuredServices, loading, error } = useHomeData();
  const router = useRouter();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <HeroCarousel data={heroSlides} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="labelLarge" style={styles.sectionTag}>Discover</Text>
            <Text variant="headlineSmall" style={styles.sectionTitle}>Our Services</Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          >
            {categories.map((cat) => (
              <CategoryCard 
                key={cat.id}
                name={cat.name}
                image_url={cat.image_url}
                onPress={() => console.log('Category pressed:', cat.name)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={[styles.section, styles.featuredSection]}>
          <View style={styles.sectionHeader}>
            <Text variant="labelLarge" style={styles.sectionTag}>Travel Lounge Selection</Text>
            <Text variant="headlineSmall" style={styles.sectionTitle}>Featured Experience</Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
          >
            {featuredServices.map((service) => (
              <ServiceCard 
                key={service.id}
                name={service.name}
                image_url={service.image_url}
                price={service.price}
                location={service.location}
                onPress={() => router.push(`/services/${service.id}`)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Ready to book your next escape?</Text>
          <Text style={styles.footerSubtext}>Contact our specialists for personalized assistance.</Text>
        </View>
      </ScrollView>
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
    backgroundColor: Colors.background,
  },
  section: {
    paddingVertical: 24,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTag: {
    color: Colors.primary,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 10,
    marginBottom: 4,
  },
  sectionTitle: {
    fontWeight: '900',
    color: Colors.charcoal,
    letterSpacing: -0.5,
  },
  categoryList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  featuredSection: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  featuredList: {
    paddingHorizontal: 20,
  },
  footer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  footerText: {
    fontWeight: '900',
    color: Colors.charcoal,
    fontSize: 16,
    marginBottom: 4,
  },
  footerSubtext: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
});
