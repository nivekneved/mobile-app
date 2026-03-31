import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { Colors } from '../../src/theme/colors';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  
  const { 
    control, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      router.replace('(tabs)');
    } catch (error: any) {
      Alert.alert('Login Error', error.message || 'An error occurred during login');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="displaySmall" style={styles.title}>Sign In</Text>
        <Text variant="bodyLarge" style={styles.subtitle}>Access your travel registry</Text>
      </View>

      <View style={styles.form}>
        <View>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Email Identity"
                mode="outlined"
                autoCapitalize="none"
                keyboardType="email-address"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                style={styles.input}
                outlineStyle={styles.inputOutline}
                error={!!errors.email}
                disabled={isSubmitting}
              />
            )}
          />
          {errors.email && (
            <HelperText type="error" visible={true}>
              {errors.email.message}
            </HelperText>
          )}
        </View>

        <View>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Password"
                mode="outlined"
                secureTextEntry
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                style={styles.input}
                outlineStyle={styles.inputOutline}
                error={!!errors.password}
                disabled={isSubmitting}
              />
            )}
          />
          {errors.password && (
            <HelperText type="error" visible={true}>
              {errors.password.message}
            </HelperText>
          )}
        </View>

        <Button 
          mode="contained" 
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          disabled={isSubmitting}
          style={styles.loginButton}
          contentStyle={styles.buttonContent}
        >
          Authorize Access
        </Button>
        <Button 
          mode="text" 
          onPress={() => router.push('/(auth)/register')}
          textColor={Colors.textSecondary}
          disabled={isSubmitting}
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
    gap: 8,
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
