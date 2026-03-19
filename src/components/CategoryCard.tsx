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
          source={{ uri: image_url || 'https://via.placeholder.com/200x200?text=Premium' }} 
          style={styles.image} 
        />
        <View style={styles.overlay}>
           <Text style={styles.labelTitle}>EXPLORE</Text>
           <Text style={styles.name}>{name}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 160,
    height: 160,
    borderRadius: 32, // Elite rounding 
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    marginRight: 16,
    marginBottom: 12,
  },
  content: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.slate[100],
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'flex-end',
    padding: 20,
  },
  labelTitle: {
    fontFamily: 'Outfit_900Black',
    fontSize: 8,
    letterSpacing: 3,
    color: Colors.white,
    opacity: 0.8,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  name: {
    color: Colors.white,
    fontFamily: 'Outfit_900Black',
    fontSize: 16,
    letterSpacing: -0.5,
  },
});
