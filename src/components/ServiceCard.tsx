import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { Colors } from '../theme/colors';
import { MapPin, Sparkles } from 'lucide-react-native';
import { resolveImageUrl } from '../utils/imageUtils';
import { Image as ExpoImage } from 'expo-image';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

interface ServiceCardProps {
  name: string;
  image_url: string | null;
  price: number;
  category?: string;
  location?: string;
  onPress: () => void;
}

export const ServiceCard = ({ name, image_url, price, category, location, onPress }: ServiceCardProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      <Surface style={styles.card} elevation={0}>
        <View style={styles.imageContainer}>
          <ExpoImage 
            source={resolveImageUrl(image_url, 400, 300)} 
            style={styles.image}
            contentFit="cover"
            transition={300}
            cachePolicy="disk"
          />
          <View style={styles.priceTag}>
            <Text style={styles.priceLabel}>FROM</Text>
            <Text style={styles.priceValue}>
              Rs {price?.toLocaleString() || '0'}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.category}>{category || 'Experience'}</Text>
            <View style={styles.benefitBadge}>
              <Sparkles size={10} color="#D97706" />
              <Text style={styles.benefitText}>ELITE CHOICE</Text>
            </View>
          </View>
          
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          
          <View style={styles.footer}>
            <View style={styles.locationRow}>
              <MapPin size={12} color={Colors.slate[400]} />
              <Text style={styles.location} numberOfLines={1}>{location || 'Mauritius'}</Text>
            </View>
            <View style={styles.bookAction}>
              <Text style={styles.bookText}>DISCOVER</Text>
            </View>
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginRight: 20,
    marginBottom: 10,
  },
  card: {
    borderRadius: 32,
    backgroundColor: Colors.white,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  priceTag: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  priceLabel: {
    fontFamily: 'Outfit_900Black',
    fontSize: 8,
    color: Colors.slate[400],
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  priceValue: {
    fontFamily: 'Outfit_900Black',
    fontSize: 16,
    color: Colors.primary,
  },
  content: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  category: {
    fontFamily: 'Outfit_900Black',
    fontSize: 9,
    color: Colors.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  benefitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  benefitText: {
    fontFamily: 'Outfit_900Black',
    fontSize: 8,
    color: '#D97706',
    letterSpacing: 1,
  },
  name: {
    fontFamily: 'Outfit_900Black',
    fontSize: 18,
    color: Colors.charcoal,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  location: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
    color: Colors.slate[400],
  },
  bookAction: {
    backgroundColor: Colors.slate[50],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  bookText: {
    fontFamily: 'Outfit_900Black',
    fontSize: 10,
    color: Colors.charcoal,
    letterSpacing: 1,
  },
});
