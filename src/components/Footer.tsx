import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking, Dimensions } from 'react-native';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, MessageCircle } from 'lucide-react-native';
import { Colors } from '../theme/colors';

const { width } = Dimensions.get('window');

const Footer = () => {
  const contactEmail = 'reservation@travellounge.mu';
  const contactPhone = '+230 5940 7701';
  const whatsappNumber = '23059407701';
  const facebookUrl = 'https://www.facebook.com/travellounge.mu';
  const instagramUrl = 'https://www.instagram.com/travellounge_ltd?igsh=MWljeWRiNG43aDN0OQ==';
  
  const office1Address = '1st Floor, Travel Lounge Building, Sir William Newton Street, Port Louis';
  const office2Address = 'Unit G04, Ground Floor, Ebene Junction, Ebene';

  const handlePress = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      {/* Footer Top - Branding */}
      <View style={styles.brandingSection}>
        <Image 
          source={require('../../assets/logo-white.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.tagline}>
          Your local and international holiday provider. IATA accredited travel agents for safe and memorable holidays.
        </Text>
        
        <View style={styles.socialRow}>
          <TouchableOpacity onPress={() => handlePress(facebookUrl)} style={styles.socialIcon}>
            <Facebook size={20} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handlePress(instagramUrl)} style={styles.socialIcon}>
            <Instagram size={20} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handlePress(`whatsapp://send?phone=${whatsappNumber}`)} 
            style={[styles.socialIcon, { backgroundColor: '#25D366' }]}
          >
            <MessageCircle size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Office Locations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>VISIT US</Text>
        
        <View style={styles.locationBlock}>
          <View style={styles.locationHeader}>
            <View style={styles.redDot} />
            <Text style={styles.locationName}>PORT LOUIS</Text>
          </View>
          <Text style={styles.addressText}>{office1Address}</Text>
          <TouchableOpacity 
            style={styles.directionsBtn}
            onPress={() => handlePress(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(office1Address)}`)}
          >
            <MapPin size={12} color={Colors.primary} />
            <Text style={styles.directionsText}>DIRECTIONS</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.locationBlock}>
          <View style={styles.locationHeader}>
            <View style={styles.redDot} />
            <Text style={styles.locationName}>EBENE</Text>
          </View>
          <Text style={styles.addressText}>{office2Address}</Text>
          <TouchableOpacity 
            style={styles.directionsBtn}
            onPress={() => handlePress(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(office2Address)}`)}
          >
            <MapPin size={12} color={Colors.primary} />
            <Text style={styles.directionsText}>DIRECTIONS</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Contact Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CONTACT US</Text>
        
        <TouchableOpacity style={styles.contactRow} onPress={() => handlePress(`tel:${contactPhone.replace(/\s+/g, '')}`)}>
          <View style={styles.contactIconBg}>
            <Phone size={16} color={Colors.primary} />
          </View>
          <Text style={styles.contactLabel}>{contactPhone}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactRow} onPress={() => handlePress(`mailto:${contactEmail}`)}>
          <View style={styles.contactIconBg}>
            <Mail size={16} color={Colors.primary} />
          </View>
          <Text style={styles.contactLabel}>{contactEmail}</Text>
        </TouchableOpacity>

        <View style={styles.contactRow}>
          <View style={styles.contactIconBg}>
            <Clock size={16} color={Colors.primary} />
          </View>
          <View>
            <Text style={[styles.contactLabel, { marginBottom: 2 }]}>Working Hours</Text>
            <Text style={styles.workingHoursSub}>Mon - Fri: 08:30 - 17:00</Text>
          </View>
        </View>
      </View>

      {/* Footer Bottom - Copyright */}
      <View style={styles.copyrightBorder} />
      <View style={styles.copyrightSection}>
        <Text style={styles.copyrightText}>
          © {new Date().getFullYear()} Travel Lounge. All rights reserved.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.slate[900],
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  brandingSection: {
    marginBottom: 48,
  },
  logo: {
    height: 60,
    width: 180,
    marginBottom: 24,
    marginLeft: -10, // Visual alignment
  },
  tagline: {
    color: Colors.slate[400],
    fontFamily: 'Outfit_500Medium',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 32,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialIcon: {
    width: 44,
    height: 44,
    backgroundColor: Colors.slate[800],
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 48,
  },
  sectionTitle: {
    color: Colors.white,
    fontFamily: 'Outfit_900Black',
    fontSize: 11,
    letterSpacing: 4,
    marginBottom: 24,
    opacity: 0.9,
  },
  locationBlock: {
    marginBottom: 32,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  redDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  locationName: {
    color: Colors.white,
    fontFamily: 'Outfit_900Black',
    fontSize: 12,
    letterSpacing: 2,
  },
  addressText: {
    color: Colors.slate[400],
    fontFamily: 'Outfit_500Medium',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
  },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  directionsText: {
    color: Colors.primary,
    fontFamily: 'Outfit_900Black',
    fontSize: 10,
    letterSpacing: 1,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  contactIconBg: {
    width: 40,
    height: 40,
    backgroundColor: Colors.slate[800],
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactLabel: {
    color: Colors.slate[300],
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 15,
  },
  workingHoursSub: {
    color: Colors.slate[500],
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
  },
  copyrightBorder: {
    height: 1,
    backgroundColor: Colors.slate[800],
    marginBottom: 32,
  },
  copyrightSection: {
    alignItems: 'center',
  },
  copyrightText: {
    color: Colors.slate[500],
    fontFamily: 'Outfit_500Medium',
    fontSize: 13,
  },
});

export default Footer;
