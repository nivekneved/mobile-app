import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { Colors } from '../../src/theme/colors';

export default function LoginScreen() {
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
          style={styles.input}
          outlineStyle={styles.inputOutline}
        />
        <TextInput
          label="Password"
          mode="outlined"
          secureTextEntry
          style={styles.input}
          outlineStyle={styles.inputOutline}
        />
        <Button 
          mode="contained" 
          onPress={() => console.log('Login pressed')}
          style={styles.loginButton}
          contentStyle={styles.buttonContent}
        >
          Authorize Access
        </Button>
        <Button 
          mode="text" 
          onPress={() => console.log('Register pressed')}
          textColor={Colors.textSecondary}
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
