import React from 'react';
import {
  View,
  Text,
  Modal,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SRI_LANKAN_CROP_PRESETS } from '../../constants/crops';
import { Colors } from '../../constants/theme';
import { CropPresetPhoto } from '../../types/farmer';

interface PresetPhotoModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (photo: CropPresetPhoto) => void;
  selectedUrl?: string;
}

export const PresetPhotoModal: React.FC<PresetPhotoModalProps> = ({
  visible,
  onClose,
  onSelect,
  selectedUrl,
}) => {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.dragHandle} />
          <View style={styles.titleRow}>
            <Text style={styles.title}>Select Crop Photograph</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close-circle" size={26} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>
            Choose from authentic harvest photographs or preset agricultural crops.
          </Text>
        </View>

        <FlatList
          data={SRI_LANKAN_CROP_PRESETS}
          keyExtractor={item => item.cropName}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          renderItem={({ item }) => {
            const isSelected = selectedUrl === item.imageUrl;
            return (
              <TouchableOpacity
                style={[styles.photoCard, isSelected && styles.photoCardSelected]}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
                activeOpacity={0.8}
              >
                <Image source={{ uri: item.imageUrl }} style={styles.thumbnail} />
                <View style={styles.cardInfo}>
                  <Text style={styles.cropName} numberOfLines={1}>
                    {item.cropName}
                  </Text>
                  <Text style={styles.categoryName}>{item.category}</Text>
                </View>
                {isSelected && (
                  <View style={styles.selectedCheck}>
                    <Ionicons name="checkmark-circle" size={22} color={Colors.secondary} />
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textDark,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  closeBtn: {
    padding: 2,
  },
  gridContent: {
    padding: 12,
    gap: 12,
  },
  photoCard: {
    flex: 1,
    margin: 6,
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  photoCardSelected: {
    borderColor: Colors.secondary,
    borderWidth: 2,
  },
  thumbnail: {
    width: '100%',
    height: 110,
    backgroundColor: '#E5EFE8',
  },
  cardInfo: {
    padding: 8,
  },
  cropName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textDark,
  },
  categoryName: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  selectedCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: Colors.white,
    borderRadius: 12,
  },
});
