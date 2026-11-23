import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useFarmer } from '../../context/FarmerContext';
import { Colors } from '../../constants/theme';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { SelectModal } from '../../components/common/SelectModal';
import { SRI_LANKAN_DISTRICTS } from '../../constants/districts';
import { CROP_CATEGORIES, SRI_LANKAN_CROP_PRESETS } from '../../constants/crops';
import { CropCategory, CropPresetPhoto } from '../../types/farmer';
import { PresetPhotoModal } from '../../components/farmer/PresetPhotoModal';
import { firebaseStorageService } from '../../services/firebaseStorageService';

export default function AddCropScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { addCrop } = useFarmer();

  const [cropName, setCropName] = useState('');
  const [category, setCategory] = useState<CropCategory>('Vegetables');
  const [imageUrl, setImageUrl] = useState(SRI_LANKAN_CROP_PRESETS[0].imageUrl);
  const [quantityKg, setQuantityKg] = useState('');
  const [pricePerKg, setPricePerKg] = useState('');
  const [harvestDate, setHarvestDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [district, setDistrict] = useState(user?.district || 'Anuradhapura');
  const [village, setVillage] = useState(user?.village || '');
  const [description, setDescription] = useState('');
  const [isRescue, setIsRescue] = useState(false);

  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const categoryOptions = CROP_CATEGORIES.map(cat => ({
    label: cat,
    value: cat,
  }));

  const districtOptions = SRI_LANKAN_DISTRICTS.map(d => ({
    label: d.name,
    value: d.name,
    subtitle: `${d.sinhalaName} • ${d.tamilName}`,
    meta: d.province,
  }));

  const handlePhotoSelect = (preset: CropPresetPhoto) => {
    setImageUrl(preset.imageUrl);
    if (!cropName) {
      setCropName(preset.cropName);
      setCategory(preset.category);
    }
  };

  const handleUploadToStorage = async () => {
    setUploadProgress(10);
    try {
      const res = await firebaseStorageService.uploadCropImage(
        user?.id || 'farmer_user_001',
        imageUrl,
        `${cropName || 'crop'}.jpg`,
        (pct) => setUploadProgress(pct)
      );
      setImageUrl(res.downloadUrl);
      setTimeout(() => setUploadProgress(null), 800);
      Alert.alert('Storage Upload Complete', 'Crop photo uploaded and linked to Firebase Storage successfully.');
    } catch {
      setUploadProgress(null);
      Alert.alert('Upload Error', 'Could not upload image to Firebase Storage.');
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!cropName.trim()) newErrors.cropName = 'Crop name is required.';
    if (!quantityKg || isNaN(Number(quantityKg)) || Number(quantityKg) <= 0) {
      newErrors.quantityKg = 'Enter a valid harvest quantity in kg.';
    }
    if (!pricePerKg || isNaN(Number(pricePerKg)) || Number(pricePerKg) <= 0) {
      newErrors.pricePerKg = 'Enter expected price per kg in LKR.';
    }
    if (!harvestDate.trim()) newErrors.harvestDate = 'Harvest date is required.';
    if (!district) newErrors.district = 'Select farming district.';
    if (!village.trim()) newErrors.village = 'Enter village / division for logistics.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      const created = await addCrop({
        farmerId: user?.id || 'user_farmer_001',
        farmerName: user?.name || 'Farmer',
        farmerPhone: user?.phone || '0771234567',
        cropName: cropName.trim(),
        category,
        imageUrl,
        quantityKg: Number(quantityKg),
        pricePerKg: Number(pricePerKg),
        harvestDate,
        district,
        village: village.trim(),
        description: description.trim() || 'Freshly harvested produce, graded and ready for delivery.',
        status: isRescue ? 'Rescue Alert' : 'Active',
        isRescue,
      });

      Alert.alert(
        'Listing Published',
        `${created.cropName} (${created.quantityKg} kg) is now live on the CROPCONNECT marketplace.`,
        [
          {
            text: 'View Listing',
            onPress: () => router.replace(`/farmer/crop/${created.id}` as any),
          },
          {
            text: 'My Crops',
            onPress: () => router.replace('/(farmer)/crops' as any),
          },
        ]
      );
    } catch {
      Alert.alert('Error', 'Failed to publish crop listing. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Add Crop Listing"
        subtitle="List your harvest to receive bids from verified commercial buyers"
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
          {/* Photo Picker Card */}
          <View style={styles.photoSection}>
            <Image source={{ uri: imageUrl }} style={styles.previewImage} />
            {uploadProgress !== null && (
              <View style={styles.uploadOverlay}>
                <Text style={styles.uploadText}>Uploading to Firebase Storage: {uploadProgress}%</Text>
                <View style={styles.uploadTrack}>
                  <View style={[styles.uploadFill, { width: `${uploadProgress}%` }]} />
                </View>
              </View>
            )}
            <View style={styles.photoButtonsRow}>
              <TouchableOpacity
                style={styles.changePhotoBtn}
                onPress={() => setShowPhotoModal(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="images" size={14} color={Colors.white} />
                <Text style={styles.changePhotoBtnText}>Presets</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.changePhotoBtn, { backgroundColor: Colors.primary }]}
                onPress={handleUploadToStorage}
                activeOpacity={0.8}
              >
                <Ionicons name="cloud-upload" size={14} color={Colors.white} />
                <Text style={styles.changePhotoBtnText}>Upload to Storage</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            <Input
              label="Crop Name"
              placeholder="e.g. Big Onion (ලොකු ළූණු), Carrots"
              value={cropName}
              onChangeText={setCropName}
              iconName="leaf-outline"
              error={errors.cropName}
              required
            />

            {/* Quick Popular Sri Lankan Crop Chips */}
            <View style={styles.quickCropsContainer}>
              <Text style={styles.quickCropsLabel}>Quick Suggestions:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickCropsScroll}>
                {['Big Onion', 'Tomatoes', 'Green Chillies', 'Carrots', 'Potatoes', 'Pumpkin', 'Paddy / Rice'].map(name => (
                  <TouchableOpacity
                    key={name}
                    style={styles.quickCropChip}
                    onPress={() => {
                      setCropName(name);
                      const match = SRI_LANKAN_CROP_PRESETS.find(p => p.cropName.includes(name));
                      if (match) {
                        setImageUrl(match.imageUrl);
                        setCategory(match.category);
                      }
                    }}
                  >
                    <Text style={styles.quickCropText}>{name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <SelectModal
              label="Crop Category"
              value={category}
              options={categoryOptions}
              onSelect={val => setCategory(val as CropCategory)}
              iconName="grid-outline"
              required
            />

            {/* Quantity and Expected Price (2 columns) */}
            <View style={styles.twoColRow}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Available Quantity (kg)"
                  placeholder="e.g. 2500"
                  value={quantityKg}
                  onChangeText={setQuantityKg}
                  keyboardType="numeric"
                  iconName="cube-outline"
                  error={errors.quantityKg}
                  required
                />
              </View>

              <View style={{ flex: 1 }}>
                <Input
                  label="Expected Price (LKR/kg)"
                  placeholder="e.g. 280"
                  value={pricePerKg}
                  onChangeText={setPricePerKg}
                  keyboardType="numeric"
                  iconName="pricetag-outline"
                  error={errors.pricePerKg}
                  required
                />
              </View>
            </View>

            <Input
              label="Harvest / Dispatch Date (YYYY-MM-DD)"
              placeholder="e.g. 2026-11-25"
              value={harvestDate}
              onChangeText={setHarvestDate}
              iconName="calendar-outline"
              error={errors.harvestDate}
              helperText="Date harvest was picked or ready for pickup."
              required
            />

            <SelectModal
              label="Harvest District"
              value={district}
              options={districtOptions}
              onSelect={setDistrict}
              iconName="location-outline"
              error={errors.district}
              required
            />

            <Input
              label="Village / Farm Division"
              placeholder="e.g. Thambuttegama Track 4"
              value={village}
              onChangeText={setVillage}
              iconName="home-outline"
              error={errors.village}
              required
            />

            <Input
              label="Description & Quality Grade"
              placeholder="e.g. Grade A sorted, sun-cured, low moisture. Packaged in 25kg gunny bags."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              iconName="document-text-outline"
            />

            {/* Emergency Distress Rescue Toggle */}
            <View style={[styles.rescueToggleCard, isRescue && styles.rescueToggleCardActive]}>
              <View style={styles.rescueTextGroup}>
                <View style={styles.rescueBadgeRow}>
                  <Ionicons name="flash" size={14} color={isRescue ? Colors.error : Colors.textMuted} />
                  <Text style={[styles.rescueTitle, isRescue && { color: Colors.error }]}>
                    Mark as Urgent "Crop Rescue" Lot
                  </Text>
                </View>
                <Text style={styles.rescueDesc}>
                  Enable if perishable harvest risks spoilage within 48-72h. Broadcasts priority alerts to food processors.
                </Text>
              </View>
              <Switch
                value={isRescue}
                onValueChange={setIsRescue}
                trackColor={{ false: '#CBD5E1', true: Colors.error }}
              />
            </View>

            <Button
              title="Publish Crop Listing"
              variant={isRescue ? 'danger' : 'primary'}
              size="large"
              isLoading={isLoading}
              iconName="cloud-upload-outline"
              iconPosition="left"
              onPress={handleSubmit}
              style={{ marginTop: 14 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Preset Photo Selector Modal */}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(23, 77, 55, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  photoButtonsRow: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    gap: 8,
  },
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  uploadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  uploadTrack: {
    width: '80%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  uploadFill: {
    height: '100%',
    backgroundColor: '#86EFAC',
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
  quickCropsContainer: {
    marginBottom: 16,
    marginTop: -8,
  },
  quickCropsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 6,
  },
  quickCropsScroll: {
    flexDirection: 'row',
  },
  quickCropChip: {
    backgroundColor: '#F0F5F2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#D4E8DC',
  },
  quickCropText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
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
  rescueBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
