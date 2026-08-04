import React, { useState } from 'react';
import { StyleSheet, Pressable, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Colors } from '../theme/colors';
import { resolveImageUrl, getCategoryFallbackAsset } from '../utils/imageUtils';
import { Image as ExpoImage } from 'expo-image';

interface CategoryCardProps {
  name: string;
  slug: string;
  image_url: string | null;
  onPress: () => void;
}

export const CategoryCard = ({ name, slug, image_url, onPress }: CategoryCardProps) => {
  const [hasError, setHasError] = useState(false);
  const imageSource = hasError ? getCategoryFallbackAsset(slug || name) : resolveImageUrl(image_url, 300, 450, slug || name);

  return (
    /* PREVIOUS TouchableOpacity PRESERVED AS COMMENT PER USER RULES:
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <ExpoImage ... />
      <View style={styles.overlay} pointerEvents="none">...</View>
    </TouchableOpacity>
    */
    <Pressable 
      style={({ pressed }) => [styles.container, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]} 
      onPress={onPress}
      delayPressIn={0}
      pressRetentionOffset={{ top: 20, bottom: 20, left: 20, right: 20 }}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    >
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <ExpoImage 
          source={imageSource} 
          style={styles.image}
          contentFit="cover"
          transition={300}
          cachePolicy="disk"
          onError={() => setHasError(true)}
        />
      </View>
      <View style={styles.overlay} pointerEvents="none">
        <Text style={styles.name}>{name}</Text>
        <View style={styles.indicator} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 156,
    height: 240,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: Colors.slate[50],
    marginRight: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.2)',
    justifyContent: 'flex-end',
    padding: 20,
  },
  name: {
    color: Colors.white,
    fontFamily: 'Outfit_900Black',
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  indicator: {
    width: 24,
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
});
