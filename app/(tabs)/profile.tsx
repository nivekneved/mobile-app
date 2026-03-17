import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Avatar, Button, Surface, List, Divider } from 'react-native-paper';
import { useAuth } from '../../src/context/AuthContext';
import { Colors } from '../../src/theme/colors';
import { LogOut, User, Mail, Shield, Bell, CircleHelp, ChevronRight } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Sign Out", style: "destructive", onPress: signOut }
      ]
    );
  };

  const ProfileItem = ({ icon: Icon, title, subtitle, onPress, showDivider = true }: any) => (
    <View>
      <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={styles.menuItemLeft}>
          <View style={styles.iconContainer}>
            <Icon size={20} color={Colors.primary} />
          </View>
          <View>
            <Text variant="titleMedium" style={styles.menuTitle}>{title}</Text>
            {subtitle && <Text variant="bodySmall" style={styles.menuSubtitle}>{subtitle}</Text>}
          </View>
        </View>
        <ChevronRight size={20} color={Colors.textSecondary} />
      </TouchableOpacity>
      {showDivider && <Divider style={styles.divider} />}
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <Surface style={styles.header} elevation={0}>
          <View style={styles.profileInfo}>
            <Avatar.Text 
              size={80} 
              label={user?.email?.substring(0, 2).toUpperCase() || 'TL'} 
              style={styles.avatar}
              labelStyle={styles.avatarLabel}
            />
            <View style={styles.userInfo}>
              <Text variant="headlineSmall" style={styles.userName}>Traveler</Text>
              <Text variant="bodyMedium" style={styles.userEmail}>{user?.email}</Text>
              <View style={styles.membershipBadge}>
                <Shield size={12} color={Colors.white} />
                <Text style={styles.membershipText}>Gold Member</Text>
              </View>
            </View>
          </View>
        </Surface>

        {/* Account Section */}
        <View style={styles.section}>
          <Text variant="labelLarge" style={styles.sectionTitle}>Account Settings</Text>
          <Surface style={styles.menuCard} elevation={1}>
            <ProfileItem 
              icon={User} 
              title="Personal Information" 
              subtitle="Update your profile details"
              onPress={() => console.log('Personal Info')}
            />
            <ProfileItem 
              icon={Bell} 
              title="Notifications" 
              subtitle="Manage your alerts"
              onPress={() => console.log('Notifications')}
            />
            <ProfileItem 
              icon={Shield} 
              title="Security" 
              subtitle="Password and verification"
              onPress={() => console.log('Security')}
              showDivider={false}
            />
          </Surface>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text variant="labelLarge" style={styles.sectionTitle}>Support</Text>
          <Surface style={styles.menuCard} elevation={1}>
            <ProfileItem 
              icon={CircleHelp} 
              title="Help Center" 
              onPress={() => console.log('Help Center')}
            />
            <ProfileItem 
              icon={Mail} 
              title="Contact Us" 
              onPress={() => console.log('Contact Us')}
              showDivider={false}
            />
          </Surface>
        </View>

        <View style={styles.logoutContainer}>
          <Button 
            mode="outlined" 
            onPress={handleLogout}
            style={styles.logoutButton}
            textColor={Colors.primary}
            icon={({ size, color }) => <LogOut size={size} color={color} />}
          >
            Sign Out
          </Button>
          <Text style={styles.versionText}>Version 1.0.0 (Travel Lounge Mobile)</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 24,
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  avatar: {
    backgroundColor: Colors.charcoal,
  },
  avatarLabel: {
    fontWeight: '900',
    color: Colors.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: '900',
    color: Colors.charcoal,
    marginBottom: 4,
  },
  userEmail: {
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  membershipText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  sectionTitle: {
    fontWeight: '900',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
    marginBottom: 12,
    paddingLeft: 4,
  },
  menuCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(230, 30, 36, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTitle: {
    fontWeight: '700',
    color: Colors.charcoal,
  },
  menuSubtitle: {
    color: Colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    marginHorizontal: 16,
    backgroundColor: '#f1f1f1',
  },
  logoutContainer: {
    padding: 40,
    alignItems: 'center',
  },
  logoutButton: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
    borderRadius: 12,
    width: '100%',
  },
  versionText: {
    marginTop: 24,
    color: '#ccc',
    fontSize: 10,
    fontWeight: '600',
  },
});
