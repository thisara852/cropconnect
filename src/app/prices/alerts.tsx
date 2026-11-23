import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '../../constants/theme';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { SelectModal } from '../../components/common/SelectModal';
import { SRI_LANKAN_DISTRICTS } from '../../constants/districts';
import { usePrediction } from '../../context/PredictionContext';
import { PriceAlert } from '../../types/prediction';

export default function PriceAlertsScreen() {
  const { supportedCrops, priceAlerts, createPriceAlert, togglePriceAlert, deletePriceAlert } =
    usePrediction();

  // Create Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<string>('Big Onions');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Matale');
  const [targetPrice, setTargetPrice] = useState<string>('280');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cropOptions = supportedCrops.map(c => ({
    label: `${c.name} (${c.sinhalaName})`,
    value: c.name,
    subtitle: `${c.category} • Base LKR ${c.baselinePriceLkr}/kg`,
  }));

  const districtOptions = SRI_LANKAN_DISTRICTS.map(d => ({
    label: d.name,
    value: d.name,
    subtitle: `${d.sinhalaName} • ${d.province} Province`,
  }));

  const handleCreateAlert = async () => {
    const priceNum = parseInt(targetPrice, 10);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid target price in LKR.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createPriceAlert({
        cropName: selectedCrop,
        district: selectedDistrict,
        targetPricePerKg: priceNum,
        condition,
        isEnabled: true,
      });
      setModalVisible(false);
      setTargetPrice('280');
      Alert.alert('Price Alert Active', `You will receive in-app alerts when ${selectedCrop} prices go ${condition} LKR ${priceNum}/kg.`);
    } catch {
      Alert.alert('Error', 'Failed to create price alert.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (alert: PriceAlert) => {
    Alert.alert(
      'Delete Price Alert',
      `Are you sure you want to delete the price alert for ${alert.cropName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deletePriceAlert(alert.id),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Fair-Price Alerts"
        subtitle="In-app threshold monitoring for wholesale price movements"
        rightElement={
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color={Colors.white} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Simulation Notice Banner */}
        <View style={styles.demoBanner}>
          <Ionicons name="information-circle" size={20} color="#0284C7" />
          <View style={{ flex: 1 }}>
            <Text style={styles.demoTitle}>In-App Alert Simulation</Text>
            <Text style={styles.demoText}>
              Threshold triggers are evaluated against rolling wholesale benchmarks. Active alerts
              will display live trigger status badges inside the app without requiring background push services.
            </Text>
          </View>
        </View>

        {/* Alerts List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Price Alerts ({priceAlerts.length})</Text>
        </View>

        {priceAlerts.length === 0 ? (
          <View style={[styles.emptyCard, Shadows.card]}>
            <Ionicons name="notifications-off-outline" size={36} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Price Alerts Configured</Text>
            <Text style={styles.emptyDesc}>
              Tap the "+ Add Alert" button above to monitor target price movements for your crops.
            </Text>
            <Button
              title="Create First Price Alert"
              variant="outline"
              size="medium"
              onPress={() => setModalVisible(true)}
              style={{ marginTop: 14 }}
            />
          </View>
        ) : (
          priceAlerts.map(alert => (
            <View key={alert.id} style={[styles.alertCard, Shadows.card]}>
              <View style={styles.alertTopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cropTitle}>
                    {alert.cropName} • {alert.district}
                  </Text>
                  <Text style={styles.createdDate}>Set on {alert.createdAt}</Text>
                </View>

                <Switch
                  value={alert.isEnabled}
                  onValueChange={() => {
                    togglePriceAlert(alert.id);
                  }}
                  trackColor={{ false: '#CBD5E1', true: '#86EFAC' }}
                  thumbColor={alert.isEnabled ? Colors.primary : '#F1F5F9'}
                />
              </View>

              <View style={styles.alertMidRow}>
                <View style={styles.conditionBox}>
                  <Text style={styles.conditionLabel}>Alert Trigger Condition</Text>
                  <View style={styles.conditionValueRow}>
                    <Ionicons
                      name={alert.condition === 'above' ? 'arrow-up' : 'arrow-down'}
                      size={14}
                      color={alert.condition === 'above' ? '#16A34A' : '#DC2626'}
                    />
                    <Text style={styles.conditionValueText}>
                      Price {alert.condition.toUpperCase()} LKR {alert.targetPricePerKg} /kg
                    </Text>
                  </View>
                </View>

                <View style={styles.currentBox}>
                  <Text style={styles.conditionLabel}>Current Market</Text>
                  <Text style={styles.currentPriceText}>
                    LKR {alert.currentEstimatedPrice} /kg
                  </Text>
                </View>
              </View>

              {/* Trigger Status Pill */}
              <View style={styles.alertBottomRow}>
                {alert.isEnabled ? (
                  alert.isTriggered ? (
                    <View style={[styles.triggerBadge, { backgroundColor: '#DCFCE7' }]}>
                      <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
                      <Text style={[styles.triggerText, { color: '#16A34A' }]}>
                        TRIGGERED: Current price {alert.currentEstimatedPrice}{' '}
                        {alert.condition === 'above' ? '≥' : '≤'} target {alert.targetPricePerKg}
                      </Text>
                    </View>
                  ) : (
                    <View style={[styles.triggerBadge, { backgroundColor: '#F1F5F9' }]}>
                      <Ionicons name="time" size={14} color={Colors.textSecondary} />
                      <Text style={[styles.triggerText, { color: Colors.textSecondary }]}>
                        MONITORING: Waiting for price movement
                      </Text>
                    </View>
                  )
                ) : (
                  <View style={[styles.triggerBadge, { backgroundColor: '#FEE2E2' }]}>
                    <Ionicons name="pause" size={14} color="#DC2626" />
                    <Text style={[styles.triggerText, { color: '#DC2626' }]}>DISABLED</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(alert)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={16} color="#DC2626" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Create Alert Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Price Alert</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color={Colors.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <SelectModal
                label="Selected Crop"
                value={selectedCrop}
                options={cropOptions}
                onSelect={setSelectedCrop}
                iconName="leaf-outline"
              />

              <SelectModal
                label="District / Economic Center"
                value={selectedDistrict}
                options={districtOptions}
                onSelect={setSelectedDistrict}
                iconName="location-outline"
              />

              <Input
                label="Target Price (LKR per kg)"
                placeholder="e.g. 280"
                value={targetPrice}
                onChangeText={setTargetPrice}
                keyboardType="numeric"
                iconName="pricetag-outline"
                helperText="Enter the price threshold you want to monitor."
              />

              {/* Condition Toggle: Above or Below */}
              <Text style={styles.fieldLabel}>Alert Condition</Text>
              <View style={styles.conditionRow}>
                <TouchableOpacity
                  style={[
                    styles.conditionBtn,
                    condition === 'above' && styles.conditionBtnActive,
                  ]}
                  onPress={() => setCondition('above')}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="trending-up"
                    size={16}
                    color={condition === 'above' ? Colors.white : Colors.textDark}
                  />
                  <Text
                    style={[
                      styles.conditionBtnText,
                      condition === 'above' && styles.conditionBtnTextActive,
                    ]}
                  >
                    Price Goes Above Target
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.conditionBtn,
                    condition === 'below' && styles.conditionBtnActive,
                  ]}
                  onPress={() => setCondition('below')}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="trending-down"
                    size={16}
                    color={condition === 'below' ? Colors.white : Colors.textDark}
                  />
                  <Text
                    style={[
                      styles.conditionBtnText,
                      condition === 'below' && styles.conditionBtnTextActive,
                    ]}
                  >
                    Price Drops Below Target
                  </Text>
                </TouchableOpacity>
              </View>

              <Button
                title="Save Price Alert"
                variant="primary"
                size="large"
                isLoading={isSubmitting}
                iconName="notifications"
                iconPosition="left"
                onPress={handleCreateAlert}
                style={{ marginTop: 20 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  demoBanner: {
    flexDirection: 'row',
    backgroundColor: '#E0F2FE',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0369A1',
    marginBottom: 2,
  },
  demoText: {
    fontSize: 11,
    color: '#075985',
    lineHeight: 16,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textDark,
  },
  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textDark,
    marginTop: 10,
  },
  emptyDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 260,
  },
  alertCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  alertTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cropTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textDark,
  },
  createdDate: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  alertMidRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  conditionBox: {
    flex: 1,
  },
  conditionLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  conditionValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  conditionValueText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textDark,
  },
  currentBox: {
    alignItems: 'flex-end',
    borderLeftWidth: 1,
    borderLeftColor: Colors.border,
    paddingLeft: 12,
  },
  currentPriceText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  alertBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  triggerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flex: 1,
    marginRight: 10,
  },
  triggerText: {
    fontSize: 10,
    fontWeight: '800',
  },
  deleteBtn: {
    padding: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textDark,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDark,
    marginTop: 10,
    marginBottom: 8,
  },
  conditionRow: {
    gap: 8,
    marginBottom: 10,
  },
  conditionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  conditionBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  conditionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textDark,
  },
  conditionBtnTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
});
