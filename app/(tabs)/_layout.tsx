import { Tabs } from 'expo-router';
import { Colors } from '../../src/theme/colors';
import { Home, Search, Calendar, User, Newspaper, Plane, Heart } from 'lucide-react-native';
import { TouchableOpacity, Alert, Platform } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const { } = useAuth(); // signOut removed — handleLogout was commented out and is not in use
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'ios' ? 24 : 16);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          height: 56 + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: 8,
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: 0.2,
          marginTop: 2,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: Colors.white,
        },
        headerTitleStyle: {
          fontWeight: '900',
          fontSize: 16,
          textTransform: 'uppercase',
          letterSpacing: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          headerShown: false,
          title: 'Explore',
          tabBarIcon: ({ color }) => <Search size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="flights"
        options={{
          headerShown: false,
          title: 'Flights',
          tabBarIcon: ({ color }) => <Plane size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          headerShown: false,
          title: 'Wishlist',
          tabBarIcon: ({ color }) => <Heart size={20} color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          href: null, // Hide from tab bar
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          headerShown: false,
          title: 'Insights',
          tabBarIcon: ({ color }) => <Newspaper size={20} color={color} />,
        }}
      />
    </Tabs>
  );
}

