import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Avatar, Surface } from 'react-native-paper';
import { useAuth } from '../../src/context/AuthContext';
import { Colors } from '../../src/theme/colors';
import { Sparkles } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSettings } from '../../src/context/SettingsContext';

export default function ProfileScreen() {
  const { session } = useAuth();
  const { mobileConfig } = useSettings();

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Elite Member Profile Header */}
        <Surface style={styles.header} elevation={0}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarWrapper}>
                <Avatar.Text 
                    size={90} 
                    label={session?.user?.email?.substring(0, 2).toUpperCase() || 'TL'} 
                    style={styles.avatar}
                    labelStyle={styles.avatarLabel}
                />
                <View style={styles.statusBadge}>
                    <Sparkles size={12} color={Colors.white} />
                </View>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>GUEST MEMBER</Text>
              <Text style={styles.userEmail}>Access to all premium features</Text>
            </View>
          </View>
        </Surface>

        <View style={styles.footerInfoSection}>
           <Text style={styles.versionText}>
             TRAVEL LOUNGE ECOSYSTEM v{mobileConfig?.appVersion || '1.1.0'}
           </Text>
           <Text style={styles.copyrightText}>© 2026 Executive Excellence Hub</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  avatarWrapper: {
      position: 'relative',
  },
  avatar: {
    backgroundColor: Colors.charcoal,
    borderWidth: 4,
    borderColor: Colors.slate[50],
  },
  avatarLabel: {
    fontFamily: 'Outfit_900Black',
    fontSize: 28,
    color: Colors.white,
  },
  statusBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: Colors.primary,
      borderWidth: 3,
      borderColor: Colors.white,
      justifyContent: 'center',
      alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: 'Outfit_900Black',
    fontSize: 24,
    color: Colors.charcoal,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  userEmail: {
    fontFamily: 'Outfit_500Medium',
    color: Colors.slate[400],
    fontSize: 14,
    marginBottom: 16,
  },
  footerInfoSection: {
    padding: 40,
    alignItems: 'center',
    gap: 8,
  },
  versionText: {
    fontFamily: 'Outfit_900Black',
    color: Colors.slate[200],
    fontSize: 10,
    letterSpacing: 3,
  },
  copyrightText: {
    fontFamily: 'Outfit_500Medium',
    color: Colors.slate[200],
    fontSize: 10,
  },
});
