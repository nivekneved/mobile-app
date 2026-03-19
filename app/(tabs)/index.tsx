import React, { useMemo } from 'react';
import { Alert, Dimensions, Image, TouchableOpacity, View, StyleSheet, ScrollView } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { Colors } from '../../src/theme/colors';
import { useHomeData } from '../../src/hooks/useHomeData';
import { HeroCarousel } from '../../src/components/HeroCarousel';
import { CategoryCard } from '../../src/components/CategoryCard';
import { ServiceCard } from '../../src/components/ServiceCard';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Search, Filter, Plane, Bed, Sparkles, Percent, MessageCircle, Mail, Phone, Heart } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { PremiumCarousel } from '../../src/components/PremiumCarousel';
import { useSettings } from '../../src/context/SettingsContext';
import * as Linking from 'expo-linking';
import Animated, { useAnimatedStyle, interpolate, Extrapolate, SharedValue } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const DEST_CARD_WIDTH = width * 0.8;
const DEST_GAP = 20;

const DestinationCard = ({ item, index, scrollX, onPress }: { 
  item: any; index: number; scrollX: SharedValue<number>; onPress: () => void;
}) => {
  const animatedCardStyle = useAnimatedStyle(() => {
    const input = [(index - 1)*(DEST_CARD_WIDTH+DEST_GAP), index*(DEST_CARD_WIDTH+DEST_GAP), (index + 1)*(DEST_CARD_WIDTH+DEST_GAP)];
    return { opacity: interpolate(scrollX.value, input, [0.8, 1, 0.8], Extrapolate.CLAMP) };
  });

  return (
    <Animated.View style={[styles.destCardWrapper, animatedCardStyle]}>
      <TouchableOpacity style={styles.destCard} onPress={onPress}>
        <Image source={item.image} style={styles.destImage} />
        <View style={styles.destOverlay}>
           <View style={styles.destLabelWrapper}>
              <Text style={styles.destType}>ESTINATION</Text>
              <Text style={styles.destName}>{item.name}</Text>
           </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function HomeScreen() {
  const { heroSlides, categories, featuredServices, loading, error } = useHomeData();
  const { user } = useAuth();
  const { mobileConfig, generalConfig } = useSettings();
  const router = useRouter();

  const destinations = useMemo(() => [
    { name: 'MAURITIUS', image: require('../../assets/paris_card.png'), query: 'Mauritius' },
    { name: 'RODRIGUES', image: require('../../assets/london_card.png'), query: 'Rodrigues' },
    { name: 'DUBAI', image: require('../../assets/dubai_card.png'), query: 'Dubai' },
  ], []);

  const handleInquiry = (method: 'whatsapp' | 'email' | 'call') => {
    const contact = {
      phone: mobileConfig?.supportPhone || generalConfig?.contactPhone || '+230 5940 7701',
      email: generalConfig?.contactEmail || 'office@travel-lounge.com'
    };
    if (method === 'whatsapp') Linking.openURL(`https://wa.me/${contact.phone.replace(/\+/g, '')}`);
    if (method === 'email') Linking.openURL(`mailto:${contact.email}`);
    if (method === 'call') Linking.openURL(`tel:${contact.phone}`);
  };

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator color={Colors.primary} size="large" /></View>;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      
      {/* Executive Header */}
      <View style={styles.header}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <View style={styles.headerActions}>
           <TouchableOpacity style={styles.actionBtn} onPress={() => handleInquiry('whatsapp')}>
              <MessageCircle size={18} color={Colors.charcoal} />
           </TouchableOpacity>
           <TouchableOpacity style={styles.actionBtn} onPress={() => handleInquiry('email')}>
              <Mail size={18} color={Colors.charcoal} />
           </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Core Logic 1: Find Value (Prices/Benefits) */}
        <View style={styles.valuationSection}>
           <TouchableOpacity style={styles.searchBar} onPress={() => router.push('/explore')}>
             <Search size={20} color={Colors.slate[400]} />
             <Text style={styles.searchPlaceholder}>Search Prices & Benefits...</Text>
             <Filter size={18} color={Colors.primary} />
           </TouchableOpacity>

           {/* Mobile Elite Category Slider (Reference Image Align) */}
           <View style={styles.categoriesWrapper}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.categoryScroll}
              >
                {categories.length > 0 ? categories.map((cat) => (
                  <CategoryCard 
                    key={cat.id} 
                    name={cat.name} 
                    image_url={cat.image_url} 
                    onPress={() => router.push(`/explore?category=${cat.slug}`)} 
                  />
                )) : [1,2,3,4].map(k => <View key={k} style={[styles.categorySkeleton, {width: 156, height: 240}]} />)}
              </ScrollView>
           </View>

           <View style={styles.quickFilters}>
              <TouchableOpacity style={styles.filterBtn} onPress={() => router.push('/explore?benefits=all-inclusive')}>
                <View style={[styles.filterIcon, {backgroundColor: 'rgba(220, 38, 38, 0.1)'}]}><Sparkles size={16} color={Colors.primary} /></View>
                <Text style={styles.filterText}>ALL-INCLUSIVE</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterBtn} onPress={() => router.push('/explore?on_sale=true')}>
                <View style={[styles.filterIcon, {backgroundColor: 'rgba(16, 185, 129, 0.1)'}]}><Percent size={16} color="#10B981" /></View>
                <Text style={styles.filterText}>BEST PRICES</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterBtn} onPress={() => router.push('/explore?category=flights')}>
                <View style={[styles.filterIcon, {backgroundColor: 'rgba(59, 130, 246, 0.1)'}]}><Plane size={16} color="#3B82F6" /></View>
                <Text style={styles.filterText}>FLIGHTS</Text>
              </TouchableOpacity>
           </View>
        </View>

        {/* Discovery Sections */}
        <View style={styles.discoverySection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.labelTitle}>FE EL THE LUXURY</Text>
              <Text style={styles.sectionTitle}>Elite Collections</Text>
            </View>
          </View>
          <PremiumCarousel
            data={destinations}
            itemWidth={DEST_CARD_WIDTH}
            gap={DEST_GAP}
            showIndicators={true}
            indicatorColor={Colors.primary}
            renderItem={({ item, index, scrollX }) => (
              <DestinationCard item={item} index={index} scrollX={scrollX} onPress={() => router.push(`/explore?query=${item.query}`)} />
            )}
          />
        </View>

        {/* Exclusive Deals with Benefit Visibility */}
        <View style={[styles.section, styles.featuredSection]}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.labelTitle}>LIVE THE MOMENT</Text>
              <Text style={styles.sectionTitle}>Featured Offers</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/explore')}><Text style={styles.viewAll}>VIEW ALL</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredList}>
            {featuredServices?.map((service) => service && (
                <ServiceCard 
                  key={service.id} name={service.name} 
                  image_url={service.image_url} price={service.price}
                  category={service.category} location={service.location}
                  onPress={() => router.push(`/services/${service.id}`)}
                />
              )) || <ActivityIndicator style={{marginLeft: 24}} />}
          </ScrollView>
        </View>

        {/* Core Logic 2: Book / WhatsApp / Contact */}
        <View style={styles.conversionCta}>
            <View style={styles.ctaCard}>
                <View style={styles.ctaContent}>
                    <Text style={styles.labelTitleWhite}>24/7 SUPPORT</Text>
                    <Text style={styles.ctaTitle}>Tailor Your Journey</Text>
                    <Text style={styles.ctaText}>Book your services directly or chat with our travel designers.</Text>
                </View>
                <View style={styles.ctaActions}>
                    <TouchableOpacity style={styles.primaryCta} onPress={() => handleInquiry('whatsapp')}>
                        <MessageCircle size={20} color={Colors.white} />
                        <Text style={styles.primaryCtaText}>WHATSAPP</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.secondaryCta} onPress={() => handleInquiry('email')}>
                         <Mail size={18} color={Colors.charcoal} />
                         <Text style={styles.secondaryCtaText}>EMAIL US</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>

        <View style={styles.footerSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  logo: { width: 160, height: 44 },
  headerActions: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.white,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  valuationSection: { padding: 24, backgroundColor: Colors.white },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', height: 60, backgroundColor: Colors.surface,
    borderRadius: 20, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 20, gap: 16,
  },
  searchPlaceholder: { flex: 1, fontFamily: 'Outfit_600SemiBold', fontSize: 14, color: Colors.slate[400] },
  categoriesWrapper: { marginTop: 24, marginBottom: 24 },
  categoryScroll: { paddingRight: 24 },
  categorySkeleton: { backgroundColor: Colors.slate[50], borderRadius: 40, marginRight: 16 },
  quickFilters: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  filterBtn: { alignItems: 'center', gap: 8, width: 75 },
  filterIcon: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  filterText: { fontSize: 8, fontFamily: 'Outfit_900Black', color: Colors.slate[500], textAlign: 'center' },
  discoverySection: { paddingVertical: 16 },
  destCardWrapper: { width: DEST_CARD_WIDTH, height: 260, marginRight: DEST_GAP },
  destCard: { width: '100%', height: '100%', borderRadius: 40, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  destImage: { width: '100%', height: '100%' },
  destOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.15)', justifyContent: 'flex-end', padding: 24 },
  destLabelWrapper: { backgroundColor: 'rgba(255,255,255,0.95)', padding: 16, borderRadius: 24 },
  destType: { fontFamily: 'Outfit_900Black', fontSize: 10, letterSpacing: 2, color: Colors.primary },
  destName: { fontFamily: 'Outfit_900Black', fontSize: 22, color: Colors.charcoal, letterSpacing: -0.5 },
  section: { paddingVertical: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 24, marginBottom: 24 },
  labelTitle: { fontFamily: 'Outfit_900Black', fontSize: 11, letterSpacing: 4, color: Colors.primary, textTransform: 'uppercase' },
  labelTitleWhite: { fontFamily: 'Outfit_900Black', fontSize: 11, letterSpacing: 4, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' },
  sectionTitle: { fontFamily: 'Outfit_900Black', fontSize: 28, color: Colors.charcoal, letterSpacing: -1 },
  viewAll: { fontFamily: 'Outfit_900Black', fontSize: 12, letterSpacing: 1.5, color: Colors.charcoal },
  featuredSection: { backgroundColor: Colors.slate[50], borderTopLeftRadius: 40, borderTopRightRadius: 40 },
  featuredList: { paddingLeft: 24, paddingRight: 8 },
  conversionCta: { padding: 24 },
  ctaCard: { backgroundColor: Colors.charcoal, borderRadius: 40, padding: 32, gap: 24 },
  ctaContent: { gap: 8 },
  ctaTitle: { color: Colors.white, fontSize: 24, fontFamily: 'Outfit_900Black' },
  ctaText: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontFamily: 'Outfit_500Medium', lineHeight: 22 },
  ctaActions: { flexDirection: 'row', gap: 12 },
  primaryCta: { flex: 1.2, height: 60, backgroundColor: Colors.primary, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  primaryCtaText: { color: Colors.white, fontFamily: 'Outfit_900Black', fontSize: 12, letterSpacing: 1 },
  secondaryCta: { flex: 0.8, height: 60, backgroundColor: Colors.white, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  secondaryCtaText: { color: Colors.charcoal, fontFamily: 'Outfit_900Black', fontSize: 10, letterSpacing: 1 },
  footerSpacing: { height: 120 },
});
