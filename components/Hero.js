import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, Dimensions, ScrollView, Animated } from 'react-native';
import { Text, Button, ActivityIndicator, useTheme } from 'react-native-paper';
import { supabase } from '../src/lib/supabase';

const { width } = Dimensions.get('window');

export default function Hero() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const theme = useTheme();

  useEffect(() => {
    async function loadHeroSlides() {
      try {
        const { data, error } = await supabase
          .from('hero_slides')
          .select('*')
          .order('order_index', { ascending: true });

        if (error) throw error;
        setSlides(data || []);
      } catch (err) {
        console.error('Error fetching hero slides:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHeroSlides();
  }, []);

  const handleScroll = (event) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveSlide(slideIndex);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (slides.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {slides.map((slide, index) => (
          <View key={slide.id} style={styles.slide}>
            <Image
              source={{ uri: slide.image_url }}
              style={styles.image}
              resizeMode="cover"
            />
            {/* Overlay Gradient Placeholder */}
            <View style={styles.overlay} />
            
            <View style={styles.content}>
              <Text style={styles.tag}>TRAVEL DEALS</Text>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.subtitle}>{slide.subtitle || slide.description}</Text>
              
              <View style={styles.buttonRow}>
                <Button 
                  mode="contained" 
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                >
                  DISCOVER MORE
                </Button>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Pagination Indicators */}
      <View style={styles.pagination}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i === activeSlide ? theme.colors.primary : 'rgba(255,255,255,0.3)' },
              i === activeSlide && styles.activeDot
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 450,
    backgroundColor: '#1E293B',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  slide: {
    width,
    height: 450,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.4)', // Slate 900 with transparency
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  tag: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 16,
    opacity: 0.8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: -1,
    marginBottom: 12,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
    maxWidth: 280,
  },
  buttonRow: {
    flexDirection: 'row',
  },
  button: {
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  buttonContent: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  buttonLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#FFFFFF',
  },
  pagination: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 20,
  },
});
