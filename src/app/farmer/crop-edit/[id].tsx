import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFarmer } from '../../../context/FarmerContext';
import { Colors } from '../../../constants/theme';
import { Header } from '../../../components/common/Header';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { SelectModal } from '../../../components/common/SelectModal';
import { SRI_LANKAN_DISTRICTS } from '../../../constants/districts';
import { CROP_CATEGORIES } from '../../../constants/crops';
import { CropCategory, CropPresetPhoto, CropStatus } from '../../../types/farmer';
import { PresetPhotoModal } from '../../../components/farmer/PresetPhotoModal';

const STATUS_OPTIONS: { label: string; value: CropStatus }[] = [
  { label: 'Active (Listed)', value: 'Active' },
  { label: 'Rescue Alert (Urgent)', value: 'Rescue Alert' },
  { label: 'Under Offer (Negotiating)', value: 'Under Offer' },
  { label: 'Sold (Completed)', value: 'Sold' },
];

export default function EditCropScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { crops, updateCrop } = useFarmer();

  const existingCrop = crops.find(c => c.id === id);

  const [cropName, setCropName] = useState(existingCrop?.cropName || '');
  const [category, setCategory] = useState<CropCategory>(existingCrop?.category || 'Vegetables');
  const [imageUrl, setImageUrl] = useState(existingCrop?.imageUrl || '');
  const [quantityKg, setQuantityKg] = useState(existingCrop?.quantityKg.toString() || '');
  const [pricePerKg, setPricePerKg] = useState(existingCrop?.pricePerKg.toString() || '');
  const [harvestDate, setHarvestDate] = useState(existingCrop?.harvestDate || '');
  const [district, setDistrict] = useState(existingCrop?.district || '');
  const [village, setVillage] = useState(existingCrop?.village || '');
  const [description, setDescription] = useState(existingCrop?.description || '');
  const [status, setStatus] = useState<CropStatus>(existingCrop?.status || 'Active');
  const [isRescue, setIsRescue] = useState(existingCrop?.isRescue || false);

  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (existingCrop) {
      setCropName(existingCrop.cropName);
      setCategory(existingCrop.category);
      setImageUrl(existingCrop.imageUrl);
      setQuantityKg(existingCrop.quantityKg.toString());
      setPricePerKg(existingCrop.pricePerKg.toString());
      setHarvestDate(existingCrop.harvestDate);
      setDistrict(existingCrop.district);
      setVillage(existingCrop.village);
      setDescription(existingCrop.description);
      setStatus(existingCrop.status);
      setIsRescue(existingCrop.isRescue || false);
    }
  }, [existingCrop]);

  if (!existingCrop) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Edit Crop" />
        <View style={styles.notFoundCenter}>
          <Text style={styles.notFoundText}>Crop listing not found.</Text>
          <Button title="Go Back" variant="outline" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const categoryOptions = CROP_CATEGORIES.map(cat => ({ label: cat, value: cat }));
  const districtOptions = SRI_LANKAN_DISTRICTS.map(d => ({
    label: d.name,
    value: d.name,
    subtitle: `${d.sinhalaName} • ${d.tamilName}`,
    meta: d.province,
  }));

  const handlePhotoSelect = (preset: CropPresetPhoto) => {
    setImageUrl(preset.imageUrl);
  };

  const handleUpdate = async () => {
    if (!cropName || !quantityKg || !pricePerKg) {
      Alert.alert('Incomplete Form', 'Please fill in all required fields.');
      return;
    }

    setIsLoading(true);
    try {
      const updated = await updateCrop(existingCrop.id, {
        cropName: cropName.trim(),
        category,
        imageUrl,
        quantityKg: Number(quantityKg),
        pricePerKg: Number(pricePerKg),
        harvestDate,
        district,
        village: village.trim(),
        description: description.trim(),
        status: isRescue ? 'Rescue Alert' : status,
        isRescue,
      });

      if (updated) {
        Alert.alert('Listing Updated', 'Your changes have been saved.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch {
      Alert.alert('Error', 'Failed to update listing.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Edit Crop Listing" subtitle={`Update details for ${existingCrop.cropName}`} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Photo Section */}
          <View style={styles.photoSection}>
            <Image source={{ uri: imageUrl }} style={styles.previewImage} />
            <TouchableOpacity
              style={styles.changePhotoBtn}
              onPress={() => setShowPhotoModal(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="camera" size={16} color={Colors.white} />
              <Text style={styles.changePhotoBtnText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Input label="Crop Name" value={cropName} onChangeText={setCropName} iconName="leaf-outline" required />

            <SelectModal
              label="Crop Category"
              value={category}
              options={categoryOptions}
              onSelect={val => setCategory(val as CropCategory)}
              iconName="grid-outline"
              required
            />

            <SelectModal
              label="Listing Status"
              value={status}
              options={STATUS_OPTIONS}
              onSelect={val => setStatus(val as CropStatus)}
              iconName="flag-outline"
              required
            />

            <View style={styles.twoColRow}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Available Quantity (kg)"
                  value={quantityKg}
                  onChangeText={setQuantityKg}
                  keyboardType="numeric"
                  iconName="cube-outline"
                  required
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Expected Price (LKR/kg)"
                  value={pricePerKg}
                  onChangeText={setPricePerKg}
                  keyboardType="numeric"
                  iconName="pricetag-outline"
                  required
                />
              </View>
            </View>

            <Input
              label="Harvest Date (YYYY-MM-DD)"
              value={harvestDate}
              onChangeText={setHarvestDate}
              iconName="calendar-outline"
              required
            />

            <SelectModal
              label="Harvest District"
              value={district}
              options={districtOptions}
              onSelect={setDistrict}
              iconName="location-outline"
              required
            />

            <Input
              label="Village / Farm Division"
              value={village}
              onChangeText={setVillage}
              iconName="home-outline"
              required
            />

            <Input
              label="Description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              iconName="document-text-outline"
            />

            {/* Rescue Toggle */}
            <View style={[styles.rescueToggleCard, isRescue && styles.rescueToggleCardActive]}>
              <View style={styles.rescueTextGroup}>
                <Text style={[styles.rescueTitle, isRescue && { color: Colors.error }]}>
                  Urgent Crop Rescue Priority
                </Text>
                <Text style={styles.rescueDesc}>Flag this listing for rapid emergency buyer procurement.</Text>
              </View>
              <Switch
                value={isRescue}
                onValueChange={val => {
                  setIsRescue(val);
                  if (val) setStatus('Rescue Alert');
                }}
                trackColor={{ false: '#CBD5E1', true: Colors.error }}
              />
            </View>

            <Button
              title="Save Changes"
              variant="primary"
              size="large"
              isLoading={isLoading}
              onPress={handleUpdate}
              style={{ marginTop: 14 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <PresetPhotoModal
        visible={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        onSelect={handlePhotoSelect}
        selectedUrl={imageUrl}
      />
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
    paddingBottom: 36,
  },
  notFoundCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  notFoundText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  photoSection: {
    width: '100%',
    height: 180,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
    backgroundColor: '#E2EBE5',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  changePhotoBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(23, 77, 55, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  changePhotoBtnText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 12,
  },
  rescueToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAF6',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 4,
  },
  rescueToggleCardActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  rescueTextGroup: {
    flex: 1,
    marginRight: 10,
  },
  rescueTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textDark,
  },
  rescueDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
    marginTop: 2,
  },
});
