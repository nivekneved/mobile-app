import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Button, TextInput, Title, HelperText } from 'react-native-paper';
import { useAuth } from '../../src/context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const validateInputs = () => {
    let isValid = true;
    
    if (!email.trim()) {
      setEmailError(true);
      isValid = false;
    } else {
      setEmailError(false);
    }
    
    if (!password) {
      setPasswordError(true);
      isValid = false;
    } else {
      setPasswordError(false);
    }
    
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateInputs()) return;
    
    setLoading(true);
    try {
      await login(email, password);
      router.replace('(tabs)/index');
    } catch (error) {
      Alert.alert('Login Error', error.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.innerContainer}>
        <Title style={styles.title}>Login</Title>
        
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          error={emailError}
        />
        {emailError && (
          <HelperText type="error">Email is required</HelperText>
        )}
        
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
          error={passwordError}
        />
        {passwordError && (
          <HelperText type="error">Password is required</HelperText>
        )}
        
        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Login
        </Button>
        
        <Button
          mode="text"
          onPress={() => router.push('/(auth)/register')}
          style={styles.linkButton}
        >
          Don't have an account? Sign Up
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    marginBottom: 15,
  },
  linkButton: {
    marginTop: 10,
  },
});