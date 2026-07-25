import { Tabs } from 'expo-router';
import { Colors } from '../../src/theme/colors';
import { Home, Search, Calendar, User, Newspaper, Plane, Heart } from 'lucide-react-native';
import { TouchableOpacity, Alert, Platform } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';

export default function TabLayout() {
  const { } = useAuth(); // signOut removed — handleLogout was commented out and is not in use

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 6,
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
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
        name="bookings"
        options={{
          headerShown: false,
          title: 'Bookings',
          tabBarIcon: ({ color }) => <Calendar size={20} color={color} />,
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

