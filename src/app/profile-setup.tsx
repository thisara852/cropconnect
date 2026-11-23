import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../constants/theme';
import { Header } from '../components/common/Header';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { RoleBadge } from '../components/common/RoleBadge';
import { SelectModal } from '../components/common/SelectModal';
import { SRI_LANKAN_DISTRICTS } from '../constants/districts';

// Preset agricultural avatar options
const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1595956553066-fe24a8c33395?w=200&q=80', // Farmer male
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80', // Grower female
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80', // Commercial buyer
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80', // Agri entrepreneur
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80', // Agricultural officer
];

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();

  const [selectedAvatar, setSelectedAvatar] = useState(
    user?.avatarUrl || AVATAR_OPTIONS[0]
  );
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [district, setDistrict] = useState(user?.district || '');
  const [locationDetail, setLocationDetail] = useState(
    user?.role === 'farmer' ? user?.village || '' : user?.businessAddress || ''
  );
  const [bio, setBio] = useState(user?.bio || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const role = user?.role || 'farmer';

  const districtOptions = SRI_LANKAN_DISTRICTS.map(d => ({
    label: d.name,
    value: d.name,
    subtitle: `${d.sinhalaName} • ${d.tamilName}`,
    meta: d.province,
  }));

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required.';
    if (!phone.trim()) newErrors.phone = 'Contact number is required.';
    if (!district) newErrors.district = 'District is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      const updates: any = {
        name: name.trim(),
        phone: phone.trim(),
        district,
        avatarUrl: selectedAvatar,
        bio: bio.trim(),
        isProfileComplete: true,
      };

      if (role === 'farmer') {
        updates.village = locationDetail.trim();
      } else if (role === 'buyer') {
        updates.businessAddress = locationDetail.trim();
      }

      const res = await updateProfile(updates);

      if (res.success) {
        Alert.alert(
          'Profile Saved',
          'Your CROPCONNECT agricultural profile is now active.',
          [
            {
              text: 'Go to Dashboard',
              onPress: () => {
                if (role === 'farmer') {
                  router.replace('/dashboard/farmer');
                } else if (role === 'buyer') {
                  router.replace('/dashboard/buyer');
                } else {
                  router.replace('/dashboard/admin');
                }
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', res.message || 'Could not update profile.');
      }
    } catch {
      Alert.alert('Error', 'Unable to connect to server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Complete Your Profile"
        subtitle="Personalize your trading presence on CROPCONNECT"
        showBack={false}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar Picker Section */}
          <View style={styles.avatarSection}>
            <View style={styles.mainAvatarWrapper}>
              <Image source={{ uri: selectedAvatar }} style={styles.mainAvatar} />
              <View style={styles.avatarBadge}>
                <Ionicons name="camera" size={16} color={Colors.white} />
              </View>
            </View>

            <View style={styles.roleBadgeWrapper}>
              <RoleBadge role={role} size="medium" />
            </View>

            <Text style={styles.avatarPickerLabel}>Choose Profile Photo Preset</Text>
            <View style={styles.avatarThumbnailsRow}>
              {AVATAR_OPTIONS.map((uri, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setSelectedAvatar(uri)}
                  style={[
                    styles.avatarThumbWrapper,
                    selectedAvatar === uri && styles.avatarThumbSelected,
                  ]}
                  activeOpacity={0.7}
                >
                  <Image source={{ uri }} style={styles.avatarThumb} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Details Card */}
          <View style={styles.formCard}>
            <Text style={styles.sectionHeader}>User & Business Details</Text>

            <Input
              label={role === 'buyer' ? 'Business / Contact Person' : 'Full Name'}
              value={name}
              onChangeText={setName}
              iconName="person-outline"
              error={errors.name}
              required
            />

            <Input
              label="Contact Phone"
              value={phone}
              onChangeText={setPhone}
              iconName="call-outline"
              keyboardType="phone-pad"
              error={errors.phone}
              required
            />

            <SelectModal
              label="Primary Agricultural / Trading District"
              value={district}
              options={districtOptions}
              onSelect={setDistrict}
              iconName="location-outline"
              error={errors.district}
              required
            />

            <Input
              label={
                role === 'farmer'
                  ? 'Village / Grama Niladhari Division'
                  : 'Commercial Office / Warehouse Address'
              }
              value={locationDetail}
              onChangeText={setLocationDetail}
              iconName="map-outline"
              placeholder={role === 'farmer' ? 'e.g. Medawachchiya Track 5' : 'e.g. Peliyagoda Cold Stores'}
            />

            <Input
              label={
                role === 'farmer'
                  ? 'Farm Bio & Primary Cultivations'
                  : 'Procurement Needs & Capacity'
              }
              value={bio}
              onChangeText={setBio}
              placeholder={
                role === 'farmer'
                  ? 'e.g. 4 acres of Big Onions, Tomatoes and Green Chillies.'
                  : 'e.g. Weekly requirement of 2 metric tons of fresh vegetables.'
              }
              iconName="information-circle-outline"
              multiline
              numberOfLines={3}
              helperText="Helps the AI Fair-Price Matcher recommend best trade matches."
            />

            <Button
              title="Save & Launch Dashboard"
              variant={role === 'buyer' ? 'orange' : 'primary'}
              size="large"
              isLoading={isLoading}
              onPress={handleSaveProfile}
              style={{ marginTop: 12 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: 12,
  },
  mainAvatarWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  mainAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: Colors.white,
    backgroundColor: '#E0EAE4',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: Colors.secondary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  roleBadgeWrapper: {
    marginVertical: 6,
  },
  avatarPickerLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 6,
    marginBottom: 8,
  },
  avatarThumbnailsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  avatarThumbWrapper: {
    borderRadius: 22,
    padding: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarThumbSelected: {
    borderColor: Colors.secondary,
  },
  avatarThumb: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  formCard: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 8,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 16,
  },
});
