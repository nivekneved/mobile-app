import React, { useRef, useState } from 'react';
import { View, StyleSheet, FlatList, Image, Dimensions, Animated, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Colors } from '../theme/colors';
import { HeroSlide } from '../hooks/useHomeData';

const { width } = Dimensions.get('window');
const ITEM_HEIGHT = 450;

type HeroCarouselProps = {
  data: HeroSlide[];
};

export const HeroCarousel = ({ data }: HeroCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  if (data.length === 0) return null;

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          setActiveIndex(Math.floor(e.nativeEvent.contentOffset.x / width));
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image source={{ uri: item.image_url }} style={styles.image} />
            <View style={styles.overlay} />
            <View style={styles.content}>
              <Text variant="labelMedium" style={styles.tag}>Premium Travel</Text>
              <Text variant="displaySmall" style={styles.title}>{item.title}</Text>
              <Text variant="bodyLarge" style={styles.subtitle}>{item.subtitle}</Text>
              {item.cta_text && (
                <TouchableOpacity style={styles.cta}>
                  <Text variant="labelLarge" style={styles.ctaText}>{item.cta_text}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
      
      <View style={styles.indicators}>
        {data.map((_, i) => (
          <View 
            key={i} 
            style={[
              styles.indicator, 
              activeIndex === i ? styles.indicatorActive : null
            ]} 
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT,
    backgroundColor: Colors.black,
  },
  slide: {
    width,
    height: ITEM_HEIGHT,
    position: 'relative',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
    marginTop: 40,
  },
  tag: {
    color: Colors.white,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 100,
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontSize: 10,
    fontWeight: '900',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  title: {
    color: Colors.white,
    fontWeight: '900',
    marginBottom: 8,
    lineHeight: 42,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 32,
    fontWeight: '500',
  },
  cta: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  ctaText: {
    color: Colors.white,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  indicators: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    flexDirection: 'row',
    gap: 8,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  indicatorActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },
});
