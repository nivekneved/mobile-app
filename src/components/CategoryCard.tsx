import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Colors } from '../theme/colors';

type CategoryCardProps = {
  name: string;
  image_url: string;
  slug?: string;
  onPress: () => void;
};

// Travel Lounge Elite: Curated fallback imagery for high-end look
const FALLBACK_IMAGES: Record<string, string> = {
  'activities': 'https://images.unsplash.com/photo-1544911845-1f34a3eb36b1?q=80&w=600', // Yacht Adventure
  'day-packages': 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=600', // Luxury Villa Pool
  'group-tours': 'https://images.unsplash.com/photo-1516422317184-2144d471900d?q=80&w=600', // Safari/Tours
  'cruises': 'https://images.unsplash.com/photo-1548574505-5e239809ee19?q=80&w=600', // Ocean Liner
  'rodrigues': 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?q=80&w=600', // Island Sunset
  'hotels': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600', // Premium Suite
  'default': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600'
};

export const CategoryCard = ({ name, image_url, slug, onPress }: CategoryCardProps) => {
  const finalImage = image_url || FALLBACK_IMAGES[slug || 'default'] || FALLBACK_IMAGES['default'];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.container}>
      <View style={styles.content}>
        <Image 
          source={{ uri: finalImage }} 
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.overlay}>
           <View style={styles.labelContainer}>
              <Text style={styles.name}>{name?.toUpperCase()}</Text>
           </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 156,
    height: 240,
    borderRadius: 40, 
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.slate[100],
    marginRight: 16,
  },
  content: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.25)', // Increased shadow depth for text legibility
    justifyContent: 'flex-end',
    padding: 16,
    paddingBottom: 24,
  },
  labelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    color: '#FFFFFF',
    fontFamily: 'Outfit_900Black',
    fontSize: 13,
    letterSpacing: 1.5,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
});
