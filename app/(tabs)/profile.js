import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Card, Title, Paragraph, Button, Divider, List, Menu } from 'react-native-paper';
import { useAuth } from '../../src/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import PremiumCard from '../../components/PremiumCard';

export default function ProfileScreen() {
  const { session, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [menuVisible, setMenuVisible] = React.useState(false);

  const profileInfo = {
    name: session?.user?.user_metadata?.name || 'User',
    email: session?.user?.email || 'Not provided',
    joinDate: session?.user?.created_at ? new Date(session.user.created_at).toLocaleDateString() : 'Unknown',
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setMenuVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profileInfo.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Title style={styles.profileName}>{profileInfo.name}</Title>
          <Paragraph style={styles.profileEmail}>{profileInfo.email}</Paragraph>
          <Text style={styles.joinDate}>Member since {profileInfo.joinDate}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{t('settings').toUpperCase()}</Text>
          
          <PremiumCard style={styles.settingsCard}>
            <List.Item
              title={t('language')}
              description={i18n.language === 'en' ? 'English' : 'Français'}
              left={props => <List.Icon {...props} icon="translate" color="#DC2626" />}
              right={props => (
                <Menu
                  visible={menuVisible}
                  onDismiss={() => setMenuVisible(false)}
                  anchor={
                    <Button onPress={() => setMenuVisible(true)} textColor="#DC2626">
                      CHANGE
                    </Button>
                  }
                >
                  <Menu.Item onPress={() => changeLanguage('en')} title="English" />
                  <Menu.Item onPress={() => changeLanguage('fr')} title="Français" />
                </Menu>
              )}
            />
            <Divider />
            <List.Item
              title={t('wishlist')}
              left={props => <List.Icon {...props} icon="heart-outline" color="#DC2626" />}
              onPress={() => console.log('Wishlist pressed')}
            />
          </PremiumCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{t('about').toUpperCase()}</Text>
          <PremiumCard style={styles.settingsCard}>
            <List.Item
              title={t('faq')}
              left={props => <List.Icon {...props} icon="help-circle-outline" color="#DC2626" />}
              onPress={() => router.push('/faq')}
            />
            <Divider />
            <List.Item
              title={t('news')}
              left={props => <List.Icon {...props} icon="newspaper-variant-outline" color="#DC2626" />}
              onPress={() => router.push('/news')}
            />
            <Divider />
            <List.Item
              title={t('safety')}
              left={props => <List.Icon {...props} icon="shield-check-outline" color="#DC2626" />}
              onPress={() => console.log('Safety pressed')}
            />
          </PremiumCard>
        </View>

        <View style={styles.logoutContainer}>
          <Button
            mode="contained"
            buttonColor="#DC2626"
            onPress={logout}
            style={styles.logoutBtn}
            labelStyle={styles.logoutLabel}
          >
            {t('logout').toUpperCase()}
          </Button>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: 'white',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  avatarText: {
    fontSize: 34,
    fontWeight: '900',
    color: 'white',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 8,
  },
  joinDate: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
    letterSpacing: 1,
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 2,
    marginBottom: 12,
    marginLeft: 8,
  },
  settingsCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 0,
    borderRadius: 20,
  },
  logoutContainer: {
    marginTop: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  logoutBtn: {
    width: '100%',
    borderRadius: 12,
  },
  logoutLabel: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    paddingVertical: 4,
  },
  version: {
    marginTop: 16,
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
  },
});