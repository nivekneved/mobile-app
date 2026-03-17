import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { Colors } from '../theme/colors';
import { MapPin } from 'lucide-react-native';

type ServiceCardProps = {
  name: string;
  image_url: string;
  price: number;
  category?: string;
  location?: string;
  onPress: () => void;
};

export const ServiceCard = ({ 
  name, 
  image_url, 
  price, 
  category, 
  location, 
  onPress 
}: ServiceCardProps) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <Surface style={styles.container} elevation={2}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: image_url || 'https://via.placeholder.com/300x200?text=No+Image' }} 
            style={styles.image} 
          />
          <View style={styles.priceTag}>
            <Text style={styles.priceValue}>
              {price !== undefined && price !== null 
                ? `Rs ${price.toLocaleString()}` 
                : 'Price on request'}
            </Text>
          </View>
        </View>
        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={styles.category}>{category || 'Experience'}</Text>
          </View>
          <Text variant="titleMedium" style={styles.name} numberOfLines={1}>{name}</Text>
          {location && (
            <View style={styles.locationContainer}>
              <MapPin size={14} color={Colors.primary} />
              <Text variant="bodySmall" style={styles.location}>{location}</Text>
            </View>
          )}
          <View style={styles.ratingRow}>
             {/* Add a static premium tag/rating for template look */}
             <Text style={styles.premiumBadge}>Selected</Text>
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 280,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    marginRight: 20,
    marginBottom: 12,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#F1F5F9',
  },
  priceTag: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  priceValue: {
    color: Colors.primary,
    fontWeight: '900',
    fontSize: 14,
  },
  content: {
    padding: 16,
  },
  topRow: {
    marginBottom: 4,
  },
  category: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  name: {
    color: Colors.charcoal,
    fontWeight: '900',
    fontSize: 18,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  location: {
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  premiumBadge: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.primary,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
