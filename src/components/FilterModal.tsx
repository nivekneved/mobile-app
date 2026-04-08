import React, { useState } from 'react';
import { View, StyleSheet, Modal, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Button, IconButton, Portal, Surface } from 'react-native-paper';
import { Colors } from '../theme/colors';
import { X, Calendar as CalendarIcon, Users, Sliders, Check } from 'lucide-react-native';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: any;
  onApply: (filters: any) => void;
}

export const FilterModal = ({ visible, onClose, filters, onApply }: FilterModalProps) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const updateFilter = (key: string, value: any) => {
    setLocalFilters({ ...localFilters, [key]: value });
  };

  const resetFilters = () => {
    setLocalFilters({
      adults: 2,
      teenagers: 0,
      children: 0,
      infants: 0,
      date: null,
      priceRange: [0, 200000],
    });
  };

  return (
    <Portal>
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <Surface style={styles.modalContent} elevation={5}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Filters</Text>
              <IconButton icon="close" size={24} onPress={onClose} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
              
              {/* Guests Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Guests</Text>
                
                <View style={styles.guestRow}>
                  <View>
                    <Text style={styles.guestLabel}>Adults</Text>
                    <Text style={styles.guestSub}>Ages 18+</Text>
                  </View>
                  <View style={styles.counter}>
                    <IconButton icon="minus-circle-outline" size={24} disabled={localFilters.adults <= 1} onPress={() => updateFilter('adults', localFilters.adults - 1)} />
                    <Text style={styles.counterText}>{localFilters.adults}</Text>
                    <IconButton icon="plus-circle-outline" size={24} onPress={() => updateFilter('adults', localFilters.adults + 1)} />
                  </View>
                </View>

                <View style={styles.guestRow}>
                  <View>
                    <Text style={styles.guestLabel}>Teenagers</Text>
                    <Text style={styles.guestSub}>Ages 12-17</Text>
                  </View>
                  <View style={styles.counter}>
                    <IconButton icon="minus-circle-outline" size={24} disabled={localFilters.teenagers <= 0} onPress={() => updateFilter('teenagers', localFilters.teenagers - 1)} />
                    <Text style={styles.counterText}>{localFilters.teenagers}</Text>
                    <IconButton icon="plus-circle-outline" size={24} onPress={() => updateFilter('teenagers', localFilters.teenagers + 1)} />
                  </View>
                </View>

                <View style={styles.guestRow}>
                  <View>
                    <Text style={styles.guestLabel}>Children</Text>
                    <Text style={styles.guestSub}>Ages 3-11</Text>
                  </View>
                  <View style={styles.counter}>
                    <IconButton icon="minus-circle-outline" size={24} disabled={localFilters.children <= 0} onPress={() => updateFilter('children', localFilters.children - 1)} />
                    <Text style={styles.counterText}>{localFilters.children}</Text>
                    <IconButton icon="plus-circle-outline" size={24} onPress={() => updateFilter('children', localFilters.children + 1)} />
                  </View>
                </View>

                <View style={styles.guestRow}>
                  <View>
                    <Text style={styles.guestLabel}>Infants</Text>
                    <Text style={styles.guestSub}>Ages 0-2</Text>
                  </View>
                  <View style={styles.counter}>
                    <IconButton icon="minus-circle-outline" size={24} disabled={localFilters.infants <= 0} onPress={() => updateFilter('infants', localFilters.infants - 1)} />
                    <Text style={styles.counterText}>{localFilters.infants}</Text>
                    <IconButton icon="plus-circle-outline" size={24} onPress={() => updateFilter('infants', localFilters.infants + 1)} />
                  </View>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Price Range (Simplified) */}
              <View style={styles.section}>
                 <Text style={styles.sectionTitle}>Budget (Rs)</Text>
                 <Text style={styles.priceValue}>Up to Rs {localFilters.priceRange[1].toLocaleString()}</Text>
                 {/* In a real app, I'd use a Slider component here. For now, we'll keep it simple or use presets. */}
                 <View style={styles.pricePresets}>
                    {[5000, 10000, 25000, 50000, 100000, 200000].map(p => (
                      <TouchableOpacity 
                        key={p} 
                        style={[styles.presetBtn, localFilters.priceRange[1] === p && styles.presetBtnActive]}
                        onPress={() => updateFilter('priceRange', [0, p])}
                      >
                        <Text style={[styles.presetText, localFilters.priceRange[1] === p && styles.presetTextActive]}>Rs {p/1000}k</Text>
                      </TouchableOpacity>
                    ))}
                 </View>
              </View>

            </ScrollView>

            <View style={styles.footer}>
              <Button mode="text" onPress={resetFilters} labelStyle={styles.resetLabel}>Reset All</Button>
              <Button mode="contained" onPress={() => onApply(localFilters)} style={styles.applyBtn} contentStyle={styles.applyBtnContent}>Show Results</Button>
            </View>
          </Surface>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.white, borderTopLeftRadius: 32, borderTopRightRadius: 32, height: '80%', paddingBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontFamily: 'Outfit_900Black', fontSize: 18, color: Colors.charcoal },
  scrollBody: { padding: 24 },
  section: { marginBottom: 24 },
  sectionTitle: { fontFamily: 'Outfit_900Black', fontSize: 16, color: Colors.charcoal, marginBottom: 16 },
  guestRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  guestLabel: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: Colors.charcoal },
  guestSub: { fontFamily: 'Outfit_500Medium', fontSize: 12, color: Colors.slate[400] },
  counter: { flexDirection: 'row', alignItems: 'center' },
  counterText: { fontFamily: 'Outfit_900Black', fontSize: 16, color: Colors.charcoal, width: 30, textAlign: 'center' },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 8, marginBottom: 24 },
  priceValue: { fontFamily: 'Outfit_900Black', fontSize: 24, color: Colors.primary, marginBottom: 12 },
  pricePresets: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  presetBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, backgroundColor: '#F8FAFC' },
  presetBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  presetText: { fontFamily: 'Outfit_700Bold', fontSize: 13, color: Colors.slate[500] },
  presetTextActive: { color: Colors.white },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.white },
  resetLabel: { fontFamily: 'Outfit_900Black', fontSize: 12, color: Colors.slate[400], letterSpacing: 1 },
  applyBtn: { flex: 1, marginLeft: 20, borderRadius: 16 },
  applyBtnContent: { height: 54 },
});
