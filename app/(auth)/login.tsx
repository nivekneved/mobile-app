import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { Colors } from '../../src/theme/colors';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Input Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      router.replace('(tabs)');
    } catch (error: any) {
      Alert.alert('Login Error', error.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="displaySmall" style={styles.title}>Sign In</Text>
        <Text variant="bodyLarge" style={styles.subtitle}>Access your travel registry</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          label="Email Identity"
          mode="outlined"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          outlineStyle={styles.inputOutline}
          disabled={loading}
        />
        <TextInput
          label="Password"
          mode="outlined"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          outlineStyle={styles.inputOutline}
          disabled={loading}
        />
        <Button 
          mode="contained" 
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          style={styles.loginButton}
          contentStyle={styles.buttonContent}
        >
          Authorize Access
        </Button>
        <Button 
          mode="text" 
          onPress={() => router.push('/(auth)/register')}
          textColor={Colors.textSecondary}
          disabled={loading}
        >
          New here? Create account
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: Colors.background,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontWeight: '900',
    color: Colors.charcoal,
    textTransform: 'uppercase',
    letterSpacing: -1,
  },
  subtitle: {
    color: Colors.textSecondary,
    marginTop: 4,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: Colors.white,
  },
  inputOutline: {
    borderRadius: 12,
  },
  loginButton: {
    marginTop: 8,
    borderRadius: 12,
  },
  buttonContent: {
    height: 48,
  },
});
