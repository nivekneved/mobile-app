import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const resources = {
  en: {
    translation: {
      "explore": "Explore",
      "bookings": "Bookings",
      "profile": "Profile",
      "home": "Home",
      "welcome": "Welcome back",
      "our_services": "OUR SERVICES",
      "perfect_holidays": "Perfect Holidays.",
      "discover_more": "DISCOVER MORE",
      "settings": "Settings",
      "language": "Language",
      "logout": "Logout",
      "faq": "FAQ",
      "news": "News",
      "about": "About Us",
      "safety": "Safety & Security",
      "wishlist": "My Wishlist",
      "inquire_now": "INQUIRE NOW",
    }
  },
  fr: {
    translation: {
      "explore": "Explorer",
      "bookings": "Réservations",
      "profile": "Profil",
      "home": "Accueil",
      "welcome": "Bon retour",
      "our_services": "NOS SERVICES",
      "perfect_holidays": "Vacances Parfaites.",
      "discover_more": "EN SAVOIR PLUS",
      "settings": "Paramètres",
      "language": "Langue",
      "logout": "Déconnexion",
      "faq": "FAQ",
      "news": "Actualités",
      "about": "À Propos",
      "safety": "Sécurité",
      "wishlist": "Ma Liste",
      "inquire_now": "DEMANDER",
    }
  }
};

const LANGUAGE_DETECTOR = {
  type: 'languageDetector',
  async: true,
  detect: async (callback) => {
    try {
      const savedLanguage = await AsyncStorage.getItem('user-language');
      if (savedLanguage) {
        return callback(savedLanguage);
      }
      callback('en');
    } catch (error) {
      console.log('Error fetching language', error);
      callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async (language) => {
    try {
      await AsyncStorage.setItem('user-language', language);
    } catch (error) {}
  }
};

i18n
  .use(initReactI18next)
  .use(LANGUAGE_DETECTOR)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
