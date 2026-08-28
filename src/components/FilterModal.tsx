import React, { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, Modal, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import { Text, Button, Portal, Surface, Chip } from 'react-native-paper';
import { Colors } from '../theme/colors';
import { X, Search, Users, Shield, Zap, MapPin, Calendar as CalendarIcon, Check } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: any;
  onApply: (filters: any) => void;
  availableAmenities?: string[];
  initialFocus?: 'location' | 'date' | 'guests' | null;
}

const REGIONS = [
  { id: 'all', label: 'All Regions' },
  { id: 'north', label: 'North' },
  { id: 'south', label: 'South' },
  { id: 'east', label: 'East' },
  { id: 'west', label: 'West' },
  { id: 'central', label: 'Central' },
  { id: 'rodrigues', label: 'Rodrigues' },
];

export const FilterModal = ({ 
  visible, 
  onClose, 
  filters, 
  onApply, 
  availableAmenities = [],
  initialFocus = null,
}: FilterModalProps) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [amenitySearch, setAmenitySearch] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, visible]);

  const updateFilter = (key: string, value: any) => {
    setLocalFilters((prev: any) => ({ ...prev, [key]: value }));
  };

  const toggleAmenity = (amenity: string) => {
    const current = localFilters.amenities || [];
    if (current.includes(amenity)) {
      updateFilter('amenities', current.filter((a: string) => a !== amenity));
    } else {
      updateFilter('amenities', [...current, amenity]);
    }
  };

  const resetFilters = () => {
    setLocalFilters({
      adults: 2,
      teenagers: 0,
      children: 0,
      infants: 0,
      location: '',
      region: null,
      date: null,
      priceRange: [0, 200000],
      amenities: [],
    });
  };

  const [tempFilterDate, setTempFilterDate] = useState<Date>(new Date());

  const openFilterDatePicker = () => {
    const current = localFilters.date ? new Date(localFilters.date) : new Date();
    setTempFilterDate(isNaN(current.getTime()) ? new Date() : current);
    setShowDatePicker(true);
  };

  const confirmFilterIOSDate = () => {
    const isoStr = tempFilterDate.toISOString().split('T')[0];
    updateFilter('date', isoStr);
    setShowDatePicker(false);
  };

  const handleAndroidDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      const isoStr = selectedDate.toISOString().split('T')[0];
      updateFilter('date', isoStr);
    }
  };

  const setDatePreset = (preset: 'today' | 'weekend' | 'nextWeek' | 'clear') => {
    const today = new Date();
    if (preset === 'clear') {
      updateFilter('date', null);
      return;
    }
    if (preset === 'today') {
      updateFilter('date', today.toISOString().split('T')[0]);
      return;
    }
    if (preset === 'weekend') {
      // Find upcoming Saturday
      const day = today.getDay();
      const diff = (6 - day + 7) % 7 || 7;
      const saturday = new Date(today);
      saturday.setDate(today.getDate() + diff);
      updateFilter('date', saturday.toISOString().split('T')[0]);
      return;
    }
    if (preset === 'nextWeek') {
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      updateFilter('date', nextWeek.toISOString().split('T')[0]);
      return;
    }
  };

  const filteredAmenities = useMemo(() => {
    if (!amenitySearch) return availableAmenities.slice(0, 15);
    return availableAmenities.filter(a => 
      a.toLowerCase().includes(amenitySearch.toLowerCase())
    ).slice(0, 20);
  }, [availableAmenities, amenitySearch]);

  const formattedDateString = useMemo(() => {
    if (!localFilters.date) return 'Select Date';
    try {
      const d = new Date(localFilters.date);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return localFilters.date;
    }
  }, [localFilters.date]);

  return (
    <Portal>
      <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
        <View style={styles.modalOverlay}>
          <Surface style={styles.modalContent} elevation={5}>
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>Filter Search</Text>
                <Text style={styles.headerSub}>Refine location, dates, and group size</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X size={24} color={Colors.charcoal} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
              
              {/* 1. Location & Region Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                   <MapPin size={18} color={Colors.primary} />
                   <Text style={styles.sectionTitle}>Destination & Region</Text>
                </View>
                
                <View style={styles.inputContainer}>
                  <Search size={16} color={Colors.slate[400]} style={styles.searchIcon} />
                  <TextInput
                    placeholder="Type location (e.g. Grand Baie, Le Morne, Rodrigues)..."
                    style={styles.textInput}
                    value={localFilters.location || ''}
                    onChangeText={(val) => updateFilter('location', val)}
                    placeholderTextColor={Colors.slate[400]}
                  />
                  {!!localFilters.location && (
                    <TouchableOpacity onPress={() => updateFilter('location', '')}>
                      <X size={16} color={Colors.slate[400]} />
                    </TouchableOpacity>
                  )}
                </View>

                <Text style={styles.subLabel}>POPULAR REGIONS</Text>
                <View style={styles.chipsGrid}>
                  {REGIONS.map((r) => {
                    const isSelected = r.id === 'all' 
                      ? !localFilters.region 
                      : (localFilters.region || '').toLowerCase() === r.id;
                    return (
                      <TouchableOpacity
                        key={r.id}
                        onPress={() => updateFilter('region', r.id === 'all' ? null : r.id)}
                        style={[styles.regionChip, isSelected && styles.regionChipActive]}
                      >
                        <Text style={[styles.regionChipText, isSelected && styles.regionChipTextActive]}>
                          {r.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.divider} />

              {/* 2. Date Selection Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                   <CalendarIcon size={18} color={Colors.primary} />
                   <Text style={styles.sectionTitle}>Travel & Check-In Date</Text>
                </View>

                <TouchableOpacity 
                  style={styles.dateSelectorBtn}
                  onPress={openFilterDatePicker}
                  activeOpacity={0.7}
                >
                  <CalendarIcon size={18} color={Colors.primary} />
                  <Text style={styles.dateSelectorText}>{formattedDateString}</Text>
                  {!!localFilters.date && (
                    <TouchableOpacity onPress={() => updateFilter('date', null)}>
                      <Text style={styles.clearDateText}>Clear</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>

                {/* Quick Date Presets */}
                <View style={styles.datePresetsRow}>
                  <TouchableOpacity 
                    style={[styles.presetTag, !localFilters.date && styles.presetTagActive]}
                    onPress={() => setDatePreset('clear')}
                  >
                    <Text style={[styles.presetTagText, !localFilters.date && styles.presetTagTextActive]}>Anytime</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.presetTag}
                    onPress={() => setDatePreset('today')}
                  >
                    <Text style={styles.presetTagText}>Today</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.presetTag}
                    onPress={() => setDatePreset('weekend')}
                  >
                    <Text style={styles.presetTagText}>This Weekend</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.presetTag}
                    onPress={() => setDatePreset('nextWeek')}
                  >
                    <Text style={styles.presetTagText}>Next Week</Text>
                  </TouchableOpacity>
                </View>

                {/* Android Native Picker */}
                {Platform.OS === 'android' && showDatePicker && (
                  <DateTimePicker
                    value={tempFilterDate}
                    mode="date"
                    display="default"
                    onChange={handleAndroidDateChange}
                    minimumDate={new Date()}
                  />
                )}

                {/* iOS Modal Sheet Picker */}
                {Platform.OS === 'ios' && showDatePicker && (
                  <Modal
                    visible={true}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowDatePicker(false)}
                  >
                    <View style={styles.iosFilterPickerOverlay}>
                      <View style={styles.iosFilterPickerModal}>
                        <View style={styles.iosFilterPickerHeader}>
                          <TouchableOpacity onPress={() => setShowDatePicker(false)} style={styles.pickerHeaderBtn}>
                            <Text style={styles.pickerCancelText}>Cancel</Text>
                          </TouchableOpacity>
                          <Text style={styles.pickerHeaderTitle}>Select Travel Date</Text>
                          <TouchableOpacity onPress={confirmFilterIOSDate} style={styles.pickerHeaderBtn}>
                            <Text style={styles.pickerConfirmText}>Done</Text>
                          </TouchableOpacity>
                        </View>
                        <View style={styles.iosFilterPickerBody}>
                          <DateTimePicker
                            value={tempFilterDate}
                            mode="date"
                            display="spinner"
                            themeVariant="light"
                            textColor="#000000"
                            minimumDate={new Date()}
                            onChange={(_, date) => {
                              if (date) setTempFilterDate(date);
                            }}
                            style={{ height: 216, width: '100%' }}
                          />
                        </View>
                      </View>
                    </View>
                  </Modal>
                )}
              </View>

              <View style={styles.divider} />

              {/* 3. Guests & Occupancy Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                   <Users size={18} color={Colors.primary} />
                   <Text style={styles.sectionTitle}>Guests & Group Size</Text>
                </View>
                
                <View style={styles.guestRow}>
                  <View>
                    <Text style={styles.guestLabel}>Adults</Text>
                    <Text style={styles.guestSub}>Ages 18+</Text>
                  </View>
                  <View style={styles.counter}>
                    <TouchableOpacity 
                      style={[styles.counterBtn, localFilters.adults <= 1 && styles.counterBtnDisabled]} 
                      disabled={localFilters.adults <= 1} 
                      onPress={() => updateFilter('adults', (localFilters.adults || 1) - 1)}
                    >
                       <Text style={styles.counterBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.counterValue}>{localFilters.adults || 1}</Text>
                    <TouchableOpacity 
                      style={styles.counterBtn} 
                      onPress={() => updateFilter('adults', (localFilters.adults || 1) + 1)}
                    >
                       <Text style={styles.counterBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.guestRow}>
                  <View>
                    <Text style={styles.guestLabel}>Teenagers</Text>
                    <Text style={styles.guestSub}>Ages 12-17</Text>
                  </View>
                  <View style={styles.counter}>
                    <TouchableOpacity 
                      style={[styles.counterBtn, (localFilters.teenagers || 0) <= 0 && styles.counterBtnDisabled]} 
                      disabled={(localFilters.teenagers || 0) <= 0} 
                      onPress={() => updateFilter('teenagers', (localFilters.teenagers || 0) - 1)}
                    >
                       <Text style={styles.counterBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.counterValue}>{localFilters.teenagers || 0}</Text>
                    <TouchableOpacity 
                      style={styles.counterBtn} 
                      onPress={() => updateFilter('teenagers', (localFilters.teenagers || 0) + 1)}
                    >
                       <Text style={styles.counterBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.guestRow}>
                  <View>
                    <Text style={styles.guestLabel}>Children</Text>
                    <Text style={styles.guestSub}>Ages 3-11</Text>
                  </View>
                  <View style={styles.counter}>
                    <TouchableOpacity 
                      style={[styles.counterBtn, (localFilters.children || 0) <= 0 && styles.counterBtnDisabled]} 
                      disabled={(localFilters.children || 0) <= 0} 
                      onPress={() => updateFilter('children', (localFilters.children || 0) - 1)}
                    >
                       <Text style={styles.counterBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.counterValue}>{localFilters.children || 0}</Text>
                    <TouchableOpacity 
                      style={styles.counterBtn} 
                      onPress={() => updateFilter('children', (localFilters.children || 0) + 1)}
                    >
                       <Text style={styles.counterBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.divider} />

              {/* 4. Price Range */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                   <Zap size={18} color={Colors.primary} />
                   <Text style={styles.sectionTitle}>Budget Range</Text>
                </View>
                 <Text style={styles.priceValue}>
                   Up to Rs {(localFilters.priceRange?.[1] ?? 200000).toLocaleString()}
                 </Text>
                 <View style={styles.pricePresets}>
                    {[5000, 10000, 25000, 50000, 100000, 200000].map(p => (
                      <TouchableOpacity 
                        key={p} 
                        style={[styles.presetBtn, localFilters.priceRange?.[1] === p && styles.presetBtnActive]}
                        onPress={() => updateFilter('priceRange', [0, p])}
                      >
                        <Text style={[styles.presetText, localFilters.priceRange?.[1] === p && styles.presetTextActive]}>
                          {p >= 100000 ? `Rs ${p/1000}k+` : `Rs ${p/1000}k`}
                        </Text>
                      </TouchableOpacity>
                    ))}
                 </View>
              </View>

              <View style={styles.divider} />

              {/* 5. Amenities Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                   <Shield size={18} color={Colors.primary} />
                   <Text style={styles.sectionTitle}>Amenities & Features</Text>
                </View>

                <View style={styles.trendingContainer}>
                   <Text style={styles.trendingLabel}>POPULAR AMENITIES</Text>
                   <View style={styles.trendingTags}>
                      {['WiFi', 'Pool', 'Breakfast', 'Spa', 'Beachfront'].map(tag => (
                        <TouchableOpacity 
                          key={tag} 
                          onPress={() => toggleAmenity(tag)}
                          style={[
                            styles.trendingTag,
                            (localFilters.amenities || []).includes(tag) && styles.trendingTagActive
                          ]}
                        >
                          <Text style={[
                            styles.trendingTagText,
                            (localFilters.amenities || []).includes(tag) && styles.trendingTagTextActive
                          ]}>{tag}</Text>
                        </TouchableOpacity>
                      ))}
                   </View>
                </View>

                <View style={styles.inputContainer}>
                  <Search size={16} color={Colors.slate[400]} style={styles.searchIcon} />
                  <TextInput
                    placeholder="Search amenities (e.g. WiFi, Pool)..."
                    style={styles.textInput}
                    value={amenitySearch}
                    onChangeText={setAmenitySearch}
                    placeholderTextColor={Colors.slate[400]}
                  />
                </View>

                <View style={styles.amenitiesGrid}>
                  {filteredAmenities.map((amenity) => (
                    <Chip
                      key={amenity}
                      selected={(localFilters.amenities || []).includes(amenity)}
                      onPress={() => toggleAmenity(amenity)}
                      style={[
                        styles.amenityChip,
                        (localFilters.amenities || []).includes(amenity) && styles.amenityChipActive
                      ]}
                      textStyle={[
                        styles.amenityChipText,
                        (localFilters.amenities || []).includes(amenity) && styles.amenityChipTextActive
                      ]}
                      showSelectedOverlay
                    >
                      {amenity}
                    </Chip>
                  ))}
                </View>
              </View>

            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity onPress={resetFilters}>
                <Text style={styles.resetText}>Reset All</Text>
              </TouchableOpacity>
              <Button 
                mode="contained" 
                onPress={() => onApply(localFilters)} 
                style={styles.applyBtn} 
                contentStyle={styles.applyBtnContent}
                labelStyle={styles.applyBtnLabel}
              >
                Apply Filters
              </Button>
            </View>
          </Surface>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalContent: { 
    backgroundColor: Colors.white, 
    borderTopLeftRadius: 36, 
    borderTopRightRadius: 36, 
    height: '92%', 
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
    borderBottomWidth: 1, 
    borderBottomColor: Colors.slate[100] 
  },
  headerTitle: { fontFamily: 'Outfit_900Black', fontSize: 24, color: Colors.charcoal, letterSpacing: -0.5 },
  headerSub: { fontFamily: 'Outfit_500Medium', fontSize: 13, color: Colors.slate[400], marginTop: 2 },
  closeBtn: { padding: 8, backgroundColor: Colors.slate[50], borderRadius: 12 },
  scrollBody: { padding: 24 },
  section: { marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionTitle: { fontFamily: 'Outfit_900Black', fontSize: 15, color: Colors.charcoal, textTransform: 'uppercase', letterSpacing: 1 },
  subLabel: { fontFamily: 'Outfit_900Black', fontSize: 11, color: Colors.slate[400], letterSpacing: 1.5, marginTop: 16, marginBottom: 10 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.slate[50], borderRadius: 16, paddingHorizontal: 16, height: 50, marginBottom: 12, borderWidth: 1, borderColor: Colors.slate[100] },
  searchIcon: { marginRight: 12 },
  textInput: { flex: 1, fontFamily: 'Outfit_600SemiBold', fontSize: 14, color: Colors.charcoal },
  chipsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  regionChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: Colors.slate[200], backgroundColor: Colors.white },
  regionChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  regionChipText: { fontFamily: 'Outfit_600SemiBold', fontSize: 13, color: Colors.slate[600] },
  regionChipTextActive: { color: Colors.white },
  dateSelectorBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.slate[50], borderRadius: 16, paddingHorizontal: 16, height: 52, borderWidth: 1, borderColor: Colors.slate[200], gap: 12 },
  dateSelectorText: { flex: 1, fontFamily: 'Outfit_700Bold', fontSize: 15, color: Colors.charcoal },
  clearDateText: { fontFamily: 'Outfit_700Bold', fontSize: 13, color: Colors.primary },
  datePresetsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  presetTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: Colors.slate[50], borderWidth: 1, borderColor: Colors.slate[100] },
  presetTagActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  presetTagText: { fontFamily: 'Outfit_700Bold', fontSize: 12, color: Colors.slate[600] },
  presetTagTextActive: { color: Colors.white },
  guestRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  guestLabel: { fontFamily: 'Outfit_700Bold', fontSize: 15, color: Colors.charcoal },
  guestSub: { fontFamily: 'Outfit_500Medium', fontSize: 12, color: Colors.slate[400], marginTop: 2 },
  counter: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.slate[50], borderRadius: 16, padding: 4 },
  counterBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  counterBtnDisabled: { opacity: 0.5, backgroundColor: Colors.slate[100] },
  counterBtnText: { fontSize: 18, fontWeight: 'bold', color: Colors.charcoal },
  counterValue: { fontFamily: 'Outfit_900Black', fontSize: 16, color: Colors.charcoal, width: 36, textAlign: 'center' },
  divider: { height: 1, backgroundColor: Colors.slate[100], marginBottom: 28 },
  priceValue: { fontFamily: 'Outfit_900Black', fontSize: 26, color: Colors.primary, marginBottom: 16, letterSpacing: -1 },
  pricePresets: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  presetBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, borderWidth: 1, borderColor: Colors.slate[200], backgroundColor: Colors.white },
  presetBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  presetText: { fontFamily: 'Outfit_700Bold', fontSize: 13, color: Colors.slate[600] },
  presetTextActive: { color: Colors.white },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityChip: { backgroundColor: Colors.white, borderColor: Colors.slate[200], borderWidth: 1, borderRadius: 12 },
  amenityChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  amenityChipText: { fontFamily: 'Outfit_600SemiBold', fontSize: 12, color: Colors.slate[600] },
  amenityChipTextActive: { color: Colors.white },
  trendingContainer: { marginBottom: 16 },
  trendingLabel: { fontFamily: 'Outfit_900Black', fontSize: 10, color: Colors.slate[400], letterSpacing: 2, marginBottom: 10 },
  trendingTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  trendingTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: Colors.slate[50], borderWidth: 1, borderColor: Colors.slate[100] },
  trendingTagActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  trendingTagText: { fontFamily: 'Outfit_700Bold', fontSize: 11, color: Colors.slate[500] },
  trendingTagTextActive: { color: Colors.white },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderTopWidth: 1, borderTopColor: Colors.slate[100], backgroundColor: Colors.white },
  resetText: { fontFamily: 'Outfit_900Black', fontSize: 13, color: Colors.slate[400], textDecorationLine: 'underline' },
  applyBtn: { flex: 1, marginLeft: 24, borderRadius: 20, backgroundColor: Colors.primary },
  applyBtnContent: { height: 54 },
  applyBtnLabel: { fontFamily: 'Outfit_900Black', fontSize: 15, letterSpacing: 0.5 },
  iosFilterPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iosFilterPickerModal: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    maxWidth: 420,
    alignSelf: 'center',
    width: '90%',
  },
  iosFilterPickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  pickerHeaderBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  pickerHeaderTitle: {
    fontFamily: 'Outfit_800ExtraBold',
    fontSize: 14,
    color: Colors.charcoal,
  },
  pickerCancelText: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 14,
    color: Colors.slate[500],
  },
  pickerConfirmText: {
    fontFamily: 'Outfit_800ExtraBold',
    fontSize: 14,
    color: Colors.primary,
  },
  iosFilterPickerBody: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
});
export default FilterModal;
