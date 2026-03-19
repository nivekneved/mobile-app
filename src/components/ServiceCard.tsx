import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { Colors } from '../theme/colors';
import { MapPin, Share2, Star, CheckCircle2 } from 'lucide-react-native';

type ServiceCardProps = {
  name: string;
  image_url: string;
  price: number;
  category?: string;
  location?: string;
  benefits?: string[]; // New: Benefits logic
  onPress: () => void;
};

export const ServiceCard = ({ 
  name, 
  image_url, 
  price, 
  category, 
  location, 
  benefits = ['All-Inclusive', 'VIP Transfer'], // Mock defaults for elite look
  onPress 
}: ServiceCardProps) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <Surface style={styles.container} elevation={0}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: image_url || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=400' }} 
            style={styles.image} 
          />
          <View style={styles.priceTag}>
            <Text style={styles.priceLabel}>FROM</Text>
            <Text style={styles.priceValue}>
              {price !== undefined && price !== null && price > 0
                ? `Rs ${price.toLocaleString()}` 
                : 'UPON REQUEST'}
            </Text>
          </View>
          <TouchableOpacity style={styles.shareIcon}>
             <Share2 size={16} color={Colors.charcoal} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={styles.category}>{category || 'EXCLUSIVE EXPERIENCE'}</Text>
          </View>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          
          {location && (
            <View style={styles.locationContainer}>
              <MapPin size={12} color={Colors.slate[400]} />
              <Text style={styles.location}>{location}</Text>
            </View>
          )}

          {/* Benefits Section - Key User Request */}
          <View style={styles.benefitsRow}>
            {benefits.slice(0, 2).map((benefit, idx) => (
              <View key={idx} style={styles.benefitTag}>
                <CheckCircle2 size={10} color={Colors.primary} />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>

          <View style={styles.footerRow}>
             <View style={styles.ratingRow}>
                <Star size={12} color="#F59E0B" fill="#F59E0B" />
                <Text style={styles.ratingText}>Top Choice</Text>
             </View>
             <TouchableOpacity style={styles.bookBadge} onPress={onPress}>
                <Text style={styles.bookText}>INQUIRE</Text>
             </TouchableOpacity>
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 290,
    borderRadius: 32, 
    overflow: 'hidden',
    backgroundColor: Colors.white,
    marginRight: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 190,
    backgroundColor: Colors.slate[100],
  },
  priceTag: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: Colors.charcoal,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'Outfit_900Black',
    fontSize: 8,
    letterSpacing: 1,
  },
  priceValue: {
    color: Colors.white,
    fontFamily: 'Outfit_900Black',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  shareIcon: {
     position: 'absolute',
     top: 12,
     right: 12,
     width: 36,
     height: 36,
     borderRadius: 18,
     backgroundColor: 'rgba(255,255,255,0.9)',
     justifyContent: 'center',
     alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  topRow: {
    marginBottom: 4,
  },
  category: {
    fontSize: 9,
    fontFamily: 'Outfit_900Black',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  name: {
    color: Colors.charcoal,
    fontFamily: 'Outfit_900Black',
    fontSize: 19,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  location: {
    color: Colors.slate[400],
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 12,
  },
  benefitsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.slate[100],
    paddingTop: 12,
  },
  benefitTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.slate[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(203, 213, 225, 0.3)',
  },
  benefitText: {
    fontSize: 10,
    fontFamily: 'Outfit_700Bold',
    color: Colors.slate[600],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    fontSize: 11,
    fontFamily: 'Outfit_800ExtraBold',
    color: '#D97706',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bookBadge: {
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.charcoal,
  },
  bookText: {
    fontSize: 10,
    fontFamily: 'Outfit_900Black',
    color: Colors.charcoal,
    letterSpacing: 1,
  }
});
