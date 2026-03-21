import React from 'react';
import { View, StyleSheet, Dimensions, Image, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, { 
  useAnimatedStyle, 
  interpolate, 
  Extrapolate,
  SharedValue
} from 'react-native-reanimated';
import { Colors } from '../theme/colors';
import { HeroSlide } from '../hooks/useHomeData';
import { PremiumCarousel } from './PremiumCarousel';

const { width } = Dimensions.get('window');
const ITEM_HEIGHT = 480;

type HeroSlideItemProps = {
  item: HeroSlide;
  index: number;
  scrollX: SharedValue<number>;
};

import { resolveImageUrl } from '../utils/imageUtils';

const HeroSlideItem = ({ item, index, scrollX }: HeroSlideItemProps) => {
  const animatedImageStyle = useAnimatedStyle(() => {
    const input = [(index - 1) * width, index * width, (index + 1) * width];
    const scale = interpolate(scrollX.value, input, [1.2, 1, 1.2], Extrapolate.CLAMP);
    const translateX = interpolate(scrollX.value, input, [-width * 0.2, 0, width * 0.2], Extrapolate.CLAMP);
    return {
      transform: [{ scale }, { translateX }],
    };
  });

  const animatedContentStyle = useAnimatedStyle(() => {
    const input = [(index - 1) * width, index * width, (index + 1) * width];
    const opacity = interpolate(scrollX.value, input, [0, 1, 0], Extrapolate.CLAMP);
    const translateY = interpolate(scrollX.value, input, [20, 0, 20], Extrapolate.CLAMP);
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  return (
    <View style={styles.slide}>
      <View style={styles.imageContainer}>
        <Animated.Image 
          source={resolveImageUrl(item.image_url)} 
          style={[styles.image, animatedImageStyle]} 
        />
      </View>
      <View style={styles.overlay} />
      <Animated.View style={[styles.content, animatedContentStyle]}>
        <Text variant="labelMedium" style={styles.tag}>Exclusive Collection</Text>
        <Text variant="displaySmall" style={styles.title}>{item.title}</Text>
        <Text variant="bodyLarge" style={styles.subtitle}>{item.subtitle}</Text>
        {item.cta_text && (
          <TouchableOpacity style={styles.cta} activeOpacity={0.8}>
            <Text variant="labelLarge" style={styles.ctaText}>{item.cta_text}</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
};

type HeroCarouselProps = {
  data: HeroSlide[];
};

export const HeroCarousel = ({ data }: HeroCarouselProps) => {
  if (!data || data.length === 0) return null;

  return (
    <View style={styles.container}>
      <PremiumCarousel
        data={data}
        itemWidth={width}
        gap={0}
        showIndicators={true}
        indicatorColor={Colors.primary}
        renderItem={({ item, index, scrollX }) => (
          <HeroSlideItem item={item} index={index} scrollX={scrollX} />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT + 40, // Space for indicators
    backgroundColor: Colors.charcoal,
  },
  slide: {
    width,
    height: ITEM_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
  },
  imageContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 32,
    marginTop: 60,
  },
  tag: {
    color: Colors.white,
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 100,
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontSize: 10,
    fontWeight: '900',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(220,38,38, 0.4)',
  },
  title: {
    color: Colors.white,
    fontWeight: '900',
    marginBottom: 12,
    lineHeight: 46,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 40,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
  },
  cta: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 14,
    alignSelf: 'flex-start',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaText: {
    color: Colors.white,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
});
