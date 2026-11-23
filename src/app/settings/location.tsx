import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLocation } from '../../context/LocationContext';
import { SRI_LANKAN_DISTRICTS } from '../../constants/districts';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../constants/theme';

export default function LocationSettingsScreen() {
  const router = useRouter();
  const {
    userLocation,
    permissionStatus,
    requestPermission,
    updateUserDistrict,
    updateLocationPreference,
  } = useLocation();

  const [selectedDistrict, setSelectedDistrict] = useState(userLocation.district || 'Dambulla');
  const [townOrVillage, setTownOrVillage] = useState(userLocation.townOrVillage || '');
  const [shareLocation, setShareLocation] = useState(userLocation.shareLocationWithOthers ?? true);
  const [isRequestingGps, setIsRequestingGps] = useState(false);

  const handleRequestGps = async () => {
    setIsRequestingGps(true);
    await requestPermission();
    setIsRequestingGps(false);
    Alert.alert(
      'Location Access',
      permissionStatus === 'granted'
        ? 'Device GPS location enabled successfully.'
        : 'Location permission was denied or is unavailable. You can continue using manual district selection.'
    );
  };

  const handleSave = async () => {
    await updateUserDistrict(selectedDistrict, townOrVillage);
    await updateLocationPreference({
      shareLocationWithOthers: shareLocation,
    });
    Alert.alert('Location Preferences Saved', `Your regional base is set to ${selectedDistrict} (${townOrVillage}).`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTextCol}>
          <Text style={styles.headerTitle}>Location Preferences & Privacy</Text>
          <Text style={styles.headerSubtitle}>
            Manage GPS permissions, regional trading hub & privacy
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* GPS Permission Card */}
        <View style={[styles.card, Shadows.card]}>
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: permissionStatus === 'granted' ? '#EAF6F0' : '#FEF3C7' },
              ]}
            >
              <Ionicons
                name={permissionStatus === 'granted' ? 'locate' : 'navigate-outline'}
                size={22}
                color={permissionStatus === 'granted' ? Colors.secondary : '#D97706'}
              />
            </View>
            <View style={styles.cardTitleCol}>
              <Text style={styles.cardTitle}>Device GPS Access</Text>
              <Text style={styles.cardSubtitle}>
                Status:{' '}
                <Text style={{ fontWeight: '700', color: permissionStatus === 'granted' ? Colors.secondary : '#D97706' }}>
                  {permissionStatus === 'granted' ? 'Enabled (High Precision)' : 'Manual / Not Granted'}
                </Text>
              </Text>
            </View>
          </View>

          <Text style={styles.cardDesc}>
            Enabling device location automatically calculates precise transport distances to nearby harvest lots and buyers in kilometers using the Haversine formula.
          </Text>

          <TouchableOpacity
            style={[styles.gpsActionBtn, permissionStatus === 'granted' && styles.gpsActionBtnGranted]}
            onPress={handleRequestGps}
            activeOpacity={0.8}
            disabled={isRequestingGps}
          >
            <Ionicons
              name={permissionStatus === 'granted' ? 'checkmark-circle' : 'locate-outline'}
              size={18}
              color="#FFFFFF"
            />
            <Text style={styles.gpsActionText}>
              {permissionStatus === 'granted'
                ? 'Update Current GPS Position'
                : 'Enable Device Location'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Manual Regional Base Selection */}
        <View style={[styles.card, Shadows.card]}>
          <Text style={styles.sectionHeading}>Manual Regional Base</Text>
          <Text style={styles.sectionSubtitle}>
            Select your primary farming or operating district in Sri Lanka
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Operating District</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.districtChips}>
              {SRI_LANKAN_DISTRICTS.map((d) => {
                const isSel = selectedDistrict.toLowerCase() === d.name.toLowerCase();
                return (
                  <TouchableOpacity
                    key={d.id}
                    style={[styles.districtChip, isSel && styles.districtChipActive]}
                    onPress={() => setSelectedDistrict(d.name)}
                  >
                    <Text style={[styles.districtChipText, isSel && styles.districtChipTextActive]}>
                      {d.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Town / Village / Agrarian Division</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="home-outline" size={18} color={Colors.textMuted} />
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Galewela, Kandapola, Pettah"
                value={townOrVillage}
                onChangeText={setTownOrVillage}
              />
            </View>
          </View>
        </View>

        {/* Privacy & Visibility Settings */}
        <View style={[styles.card, Shadows.card]}>
          <Text style={styles.sectionHeading}>Privacy & Visibility</Text>

          <View style={styles.switchRow}>
            <View style={styles.switchTextCol}>
              <Text style={styles.switchTitle}>Display Approximate Location</Text>
              <Text style={styles.switchSubtitle}>
                Allow verified buyers and farmers to view your district proximity on the interactive map. Exact GPS coordinates are never made public.
              </Text>
            </View>
            <Switch
              value={shareLocation}
              onValueChange={setShareLocation}
              trackColor={{ false: '#CBD5E1', true: Colors.secondary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
          <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
          <Text style={styles.saveBtnText}>Save Location Settings</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  scrollContent: {
    backgroundColor: Colors.background,
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl * 1.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitleCol: {
    flex: 1,
  },
  cardTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  cardSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  cardDesc: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  gpsActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  gpsActionBtnGranted: {
    backgroundColor: Colors.secondary,
  },
  gpsActionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: FontSize.xs,
  },
  sectionHeading: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  sectionSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  inputGroup: {
    gap: 6,
    marginTop: Spacing.xs,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.text,
  },
  districtChips: {
    gap: Spacing.xs,
    paddingVertical: 4,
  },
  districtChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  districtChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  districtChipText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  districtChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 44,
    gap: Spacing.xs,
  },
  textInput: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
    gap: Spacing.md,
  },
  switchTextCol: {
    flex: 1,
  },
  switchTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
  },
  switchSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: FontSize.md,
  },
});
