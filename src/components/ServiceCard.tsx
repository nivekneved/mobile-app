import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { Colors } from '../theme/colors';
import { MapPin } from 'lucide-react-native';

type ServiceCardProps = {
  name: string;
  image_url: string;
  price: number;
  location?: string;
  onPress: () => void;
};

export const ServiceCard = ({ name, image_url, price, location, onPress }: ServiceCardProps) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <Surface style={styles.container} elevation={1}>
        <Image source={{ uri: image_url || 'https://via.placeholder.com/300x200?text=No+Image' }} style={styles.image} />
        <View style={styles.content}>
          <Text variant="titleMedium" style={styles.name} numberOfLines={1}>{name}</Text>
          {location && (
            <View style={styles.locationContainer}>
              <MapPin size={12} color={Colors.textSecondary} />
              <Text variant="bodySmall" style={styles.location}>{location}</Text>
            </View>
          )}
          <View style={styles.footer}>
            <Text variant="labelLarge" style={styles.priceLabel}>From</Text>
            <Text variant="titleLarge" style={styles.price}>Rs {price.toLocaleString()}</Text>
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 260,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    marginRight: 16,
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: 160,
  },
  content: {
    padding: 16,
  },
  name: {
    color: Colors.charcoal,
    fontWeight: '800',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  location: {
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceLabel: {
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    fontSize: 10,
  },
  price: {
    color: Colors.primary,
    fontWeight: '900',
  },
});
