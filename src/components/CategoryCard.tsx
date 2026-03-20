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

// Travel Lounge Elite: Synced with Web-App assets
const LOCAL_ASSETS: Record<string, any> = {
  'activities': require('../../assets/categories/activities.jpg'),
  'day-packages': require('../../assets/categories/day-packages.png'),
  'group-tours': require('../../assets/categories/group_tours.png'),
  'cruises': require('../../assets/categories/cruises.png'),
  'rodrigues': require('../../assets/categories/rodrigues.jpg'),
  'hotels': require('../../assets/categories/hotels.png'),
  'flights': require('../../assets/categories/flights.png'),
};

export const CategoryCard = ({ name, image_url, slug, onPress }: CategoryCardProps) => {
  // Use local asset if valid slug exists and no remote image_url is provided, or as higher priority for brand parity
  const localImage = slug ? LOCAL_ASSETS[slug] : null;
  const source = localImage ? localImage : { uri: image_url || 'https://via.placeholder.com/400x600?text=Premium' };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.container}>
      <View style={styles.content}>
        <Image 
          source={source} 
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
    backgroundColor: 'rgba(15, 23, 42, 0.25)', 
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
