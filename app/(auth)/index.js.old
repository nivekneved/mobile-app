import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Title } from 'react-native-paper';
import { useAuth } from '../../src/context/AuthContext';

export default function AuthIndex() {
  const router = useRouter();
  const { session } = useAuth();

  React.useEffect(() => {
    if (session) {
      router.replace('(tabs)');
    }
  }, [session]);

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Welcome to Local Services App</Title>
      <Text style={styles.subtitle}>Find and book local services near you</Text>
      
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => router.push('/(auth)/login')}
          style={styles.button}
        >
          Login
        </Button>
        
        <Button
          mode="outlined"
          onPress={() => router.push('/(auth)/register')}
          style={styles.button}
        >
          Create Account
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  button: {
    marginVertical: 10,
  },
});