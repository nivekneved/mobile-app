import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { Text, Avatar, Surface, Divider } from 'react-native-paper';
import { useAuth } from '../../src/context/AuthContext';
import { Colors } from '../../src/theme/colors';
import { LogOut, User, Mail, Shield, Bell, CircleHelp, ChevronRight, MessageCircle, CreditCard, Sparkles, Map } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useSettings } from '../../src/context/SettingsContext';
import * as Linking from 'expo-linking';

export default function ProfileScreen() {
  const { session, signOut } = useAuth();
  const { mobileConfig, generalConfig } = useSettings();

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out from the Elite Lounge?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Sign Out", style: "destructive", onPress: signOut }
      ]
    );
  };

  const handleSupport = (method: 'whatsapp' | 'email') => {
    const contact = {
      phone: mobileConfig?.supportPhone || generalConfig?.contactPhone || '+230 5940 7701',
      email: generalConfig?.contactEmail || 'office@travel-lounge.com'
    };
    if (method === 'whatsapp') Linking.openURL(`https://wa.me/${contact.phone.replace(/\+/g, '')}`);
    if (method === 'email') Linking.openURL(`mailto:${contact.email}`);
  };

  const ProfileItem = ({ icon: Icon, title, subtitle, onPress, showDivider = true, destructive = false }: any) => (
    <View>
      <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={styles.menuItemLeft}>
          <View style={[styles.iconContainer, destructive && { backgroundColor: 'rgba(220, 38, 38, 0.05)' }]}>
            <Icon size={18} color={destructive ? Colors.primary : Colors.charcoal} />
          </View>
          <View>
            <Text style={[styles.menuTitle, destructive && { color: Colors.primary }]}>{title}</Text>
            {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
          </View>
        </View>
        <ChevronRight size={18} color={Colors.slate[300]} />
      </TouchableOpacity>
      {showDivider && <Divider style={styles.divider} />}
    </View>
  );

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
              <Text style={styles.userName}>{session?.user?.email?.split('@')[0].toUpperCase() || 'MEMBER'}</Text>
              <Text style={styles.userEmail}>{session?.user?.email}</Text>
              <View style={styles.membershipBadge}>
                <Shield size={10} color={Colors.white} />
                <Text style={styles.membershipText}>EXECUTIVE MEMBER</Text>
              </View>
            </View>
          </View>
        </Surface>

        {/* Quick Conversions Logic: Bookings & Support */}
        <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionBox} onPress={() => {}}>
                <Map size={24} color={Colors.primary} />
                <Text style={styles.quickActionLabel}>MY JOURNEYS</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionBox} onPress={() => handleSupport('whatsapp')}>
                <MessageCircle size={24} color={Colors.charcoal} />
                <Text style={styles.quickActionLabel}>SUPPORT</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionBox} onPress={() => {}}>
                <CreditCard size={24} color={Colors.charcoal} />
                <Text style={styles.quickActionLabel}>REWARDS</Text>
            </TouchableOpacity>
        </View>

        {/* Support Concierge Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Direct Concierge</Text>
          <Surface style={styles.menuCard} elevation={0}>
            <ProfileItem 
              icon={MessageCircle} 
              title="Chat via WhatsApp" 
              subtitle="Instant response from travel designers"
              onPress={() => handleSupport('whatsapp')}
            />
            <ProfileItem 
              icon={Mail} 
              title="Message our Office" 
              subtitle="For complex bookings and inquiries"
              onPress={() => handleSupport('email')}
              showDivider={false}
            />
          </Surface>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Preferences</Text>
          <Surface style={styles.menuCard} elevation={0}>
            <ProfileItem 
              icon={User} 
              title="Personal Information" 
              subtitle="Member details & documentation"
              onPress={() => {}}
            />
            <ProfileItem 
              icon={Bell} 
              title="Notifications" 
              subtitle="Flight alerts & premium deals"
              onPress={() => {}}
            />
            <ProfileItem 
              icon={LogOut} 
              title="Sign Out" 
              subtitle="Safely exit the executive lounge"
              onPress={handleLogout}
              destructive={true}
              showDivider={false}
            />
          </Surface>
        </View>

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
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.charcoal,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  membershipText: {
    color: Colors.white,
    fontSize: 9,
    fontFamily: 'Outfit_900Black',
    letterSpacing: 2,
  },
  quickActions: {
      flexDirection: 'row',
      paddingHorizontal: 24,
      gap: 12,
      marginBottom: 32,
  },
  quickActionBox: {
      flex: 1,
      height: 100,
      backgroundColor: Colors.slate[50],
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
      borderWidth: 1,
      borderColor: Colors.border,
  },
  quickActionLabel: {
      fontFamily: 'Outfit_900Black',
      fontSize: 8,
      letterSpacing: 1,
      color: Colors.slate[500],
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Outfit_900Black',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 4,
    fontSize: 10,
    marginBottom: 20,
    paddingLeft: 4,
  },
  menuCard: {
    backgroundColor: Colors.white,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: Colors.slate[50],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuTitle: {
    fontFamily: 'Outfit_900Black',
    fontSize: 16,
    color: Colors.charcoal,
    letterSpacing: -0.2,
  },
  menuSubtitle: {
    fontFamily: 'Outfit_500Medium',
    color: Colors.slate[400],
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    marginHorizontal: 24,
    backgroundColor: Colors.slate[100],
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
