import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { Colors } from '../../src/theme/colors';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.title}>Welcome to Travel Lounge</Text>
          <Text variant="bodyLarge" style={styles.subtitle}>Your premium travel companion is being prepared.</Text>
          <Button 
            mode="contained" 
            onPress={() => console.log('Explore pressed')}
            style={styles.button}
          >
            Start Exploring
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
  },
  card: {
    borderRadius: 24,
    backgroundColor: Colors.white,
    elevation: 4,
  },
  title: {
    fontWeight: '900',
    color: Colors.charcoal,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  button: {
    borderRadius: 12,
  },
});
