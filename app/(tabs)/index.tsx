import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, ActivityIndicator, Searchbar, Avatar } from 'react-native-paper';
import { Colors } from '../../src/theme/colors';
import { useHomeData } from '../../src/hooks/useHomeData';
import { HeroCarousel } from '../../src/components/HeroCarousel';
import { CategoryCard } from '../../src/components/CategoryCard';
import { ServiceCard } from '../../src/components/ServiceCard';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Search, MapPin, Bell, Filter, LogOut } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { Alert } from 'react-native';

export default function HomeScreen() {
  const { heroSlides, categories, featuredServices, loading, error } = useHomeData();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Sign Out", style: "destructive", onPress: signOut }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      
      {/* Premium Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => router.push('/explore')}
          >
            <Search size={22} color={Colors.charcoal} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Bell size={22} color={Colors.charcoal} />
            <View style={styles.dot} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={[styles.actionBtn, styles.logoutBtn]}>
            <LogOut size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Destination Discovery Section */}
        <View style={styles.discoverySection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Top Destinations</Text>
              <Text style={styles.sectionSubtitle}>Explore the must-visit spots</Text>
            </View>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.discoveryList}
          >
            <TouchableOpacity style={styles.destCard} onPress={() => router.push('/explore?query=Grand+Baie')}>
              <Image source={require('../../assets/grand_baie_card.png')} style={styles.destImage} />
              <View style={styles.destOverlay}>
                <Text style={styles.destName}>Grand Baie</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.destCard} onPress={() => router.push('/explore?query=Flic+en+Flac')}>
              <Image source={require('../../assets/flic_en_flac_card.png')} style={styles.destImage} />
              <View style={styles.destOverlay}>
                <Text style={styles.destName}>Flic en Flac</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.destCard} onPress={() => router.push('/explore?query=Rodrigues')}>
              <Image source={require('../../assets/rodrigues_card.png')} style={styles.destImage} />
              <View style={styles.destOverlay}>
                <Text style={styles.destName}>Rodrigues</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {error && (
          <View style={styles.errorSection}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}


        {/* Hero Section */}
        {heroSlides && heroSlides.length > 0 && (
          <View style={styles.carouselContainer}>
            <HeroCarousel data={heroSlides} />
          </View>
        )}

        {/* Categories Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Explore Categories</Text>
              <Text style={styles.sectionSubtitle}>Tailored collections for your style</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/explore')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          >
            {categories && categories.length > 0 ? (
              categories.map((cat) => cat && (
                <CategoryCard 
                  key={cat.id}
                  name={cat.name}
                  image_url={cat.image_url}
                  onPress={() => router.push(`/explore?category=${cat.slug}`)}
                />
              ))
            ) : (
              <Text style={styles.emptyText}>No categories found</Text>
            )}
          </ScrollView>
        </View>

        {/* Featured Section */}
        <View style={[styles.section, styles.featuredSection]}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Exclusive Deals</Text>
              <Text style={styles.sectionSubtitle}>Handpicked premium experiences</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.viewAll}>Filter</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
          >
            {featuredServices && featuredServices.length > 0 ? (
              featuredServices.map((service) => service && (
                <ServiceCard 
                  key={service.id}
                  name={service.name}
                  image_url={service.image_url}
                  price={service.price}
                  category={service.category}
                  location={service.location}
                  onPress={() => router.push(`/services/${service.id}`)}
                />
              ))
            ) : (
              <Text style={styles.emptyText}>No featured services available</Text>
            )}
          </ScrollView>
        </View>

        {/* Support Banner */}
        <TouchableOpacity style={styles.supportBanner}>
          <View style={styles.supportContent}>
            <Text style={styles.supportTitle}>Need Help?</Text>
            <Text style={styles.supportText}>Talk to our travel specialists</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.footerSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: Colors.surface,
  },
  headerLeft: {
    flex: 1,
  },
  logo: {
    width: 140,
    height: 40,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logoutBtn: {
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  dot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  discoverySection: {
    paddingVertical: 10,
  },
  discoveryList: {
    paddingLeft: 24,
    paddingRight: 12,
  },
  destCard: {
    width: 160,
    height: 220,
    borderRadius: 24,
    overflow: 'hidden',
    marginRight: 16,
    backgroundColor: '#F1F5F9',
  },
  destImage: {
    width: '100%',
    height: '100%',
  },
  destOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  destName: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  carouselContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  section: {
    paddingVertical: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.charcoal,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  viewAll: {
    color: Colors.primary,
    fontWeight: '800',
    fontSize: 14,
  },
  categoryList: {
    paddingLeft: 24,
    paddingRight: 12,
  },
  featuredSection: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  featuredList: {
    paddingLeft: 24,
    paddingRight: 12,
  },
  supportBanner: {
    margin: 24,
    padding: 24,
    backgroundColor: Colors.charcoal,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  supportContent: {
    flex: 1,
  },
  supportTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '900',
  },
  supportText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 4,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  errorSection: {
    padding: 24,
    backgroundColor: 'rgba(220, 38, 38, 0.05)',
    marginHorizontal: 24,
    borderRadius: 16,
    marginBottom: 20,
  },
  errorText: {
    color: Colors.primary,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  footerSpacing: {
    height: 100,
  },
});
