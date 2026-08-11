import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
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
  const imageSource = hasError 
    ? getCategoryFallbackAsset(slug || name) 
    : resolveImageUrl(image_url, 300, 450, slug || name);

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.75}
      delayPressIn={0}
      pressRetentionOffset={{ top: 20, left: 20, right: 20, bottom: 20 }}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel={`Explore ${name} category`}
    >
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <ExpoImage 
          source={imageSource} 
          style={styles.image}
          contentFit="cover"
          transition={200}
          cachePolicy="disk"
          onError={() => setHasError(true)}
        />
      </View>
      <View style={styles.overlay} pointerEvents="none">
        <Text style={styles.name} numberOfLines={2}>{name ? name.trim() : ''}</Text>
        <View style={styles.indicator} />
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
    backgroundColor: 'rgba(15, 23, 42, 0.25)',
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
