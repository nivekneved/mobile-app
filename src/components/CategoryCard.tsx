import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Colors } from '../theme/colors';

type CategoryCardProps = {
  name: string;
  image_url: string;
  onPress: () => void;
};

export const CategoryCard = ({ name, image_url, onPress }: CategoryCardProps) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.container}>
      <View style={styles.content}>
        <Image 
          source={{ uri: image_url || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=400' }} 
          style={styles.image} 
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
    borderRadius: 40, // Extreme Elite rounding from image
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.slate[50],
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
    backgroundColor: 'rgba(15, 23, 42, 0.2)', // HD Slate shadow overlay
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
    fontSize: 14,
    letterSpacing: 1.5,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
});
