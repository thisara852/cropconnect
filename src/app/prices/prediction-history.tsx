import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '../../constants/theme';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { usePrediction } from '../../context/PredictionContext';
import { PredictionResult } from '../../types/prediction';

export default function PredictionHistoryScreen() {
  const router = useRouter();
  const { predictionHistory, deleteHistoryItem, clearHistory } = usePrediction();
  const [selectedRecord, setSelectedRecord] = useState<PredictionResult | null>(null);

  const handleDelete = (item: PredictionResult) => {
    Alert.alert(
      'Delete Prediction',
      `Delete saved calculation for ${item.cropName} (${item.district})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteHistoryItem(item.id),
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Predictions',
      'Are you sure you want to delete your entire local prediction history?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: clearHistory },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="Prediction History"
        subtitle="Locally saved AI Fair-Price calculation runs"
        rightElement={
          predictionHistory.length > 0 ? (
            <TouchableOpacity onPress={handleClearAll} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>Clear All</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {predictionHistory.length === 0 ? (
          <View style={[styles.emptyCard, Shadows.card]}>
            <Ionicons name="time-outline" size={38} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Previous Predictions Found</Text>
            <Text style={styles.emptyDesc}>
              Every time you calculate a fair-price prediction in the Dashboard, it is automatically stored here.
            </Text>
            <Button
              title="Go to Price Predictor"
              variant="primary"
              size="medium"
              onPress={() => router.push('/(farmer)/prices' as any)}
              style={{ marginTop: 14 }}
            />
          </View>
        ) : (
          predictionHistory.map(item => {
            const isExpanded = selectedRecord?.id === item.id;
            return (
              <View key={item.id} style={[styles.historyCard, Shadows.card]}>
                <TouchableOpacity
                  onPress={() => setSelectedRecord(isExpanded ? null : item)}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardTopRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cropTitle}>
                        {item.cropName} ({item.quality} Grade)
                      </Text>
                      <Text style={styles.districtText}>
                        {item.district} • {item.quantityKg.toLocaleString()} kg
                      </Text>
                    </View>

                    <View style={styles.priceBox}>
                      <Text style={styles.priceText}>LKR {item.estimatedPricePerKg} /kg</Text>
                      <Text style={styles.totalValText}>
                        LKR {item.estimatedTotalValue.toLocaleString()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardBottomRow}>
                    <Text style={styles.dateText}>
                      Calculated on {new Date(item.predictionDate).toLocaleDateString()}
                    </Text>

                    <View style={styles.actionRow}>
                      <Text style={styles.toggleText}>
                        {isExpanded ? 'Hide Details' : 'View Factors'}
                      </Text>
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={14}
                        color={Colors.secondary}
                      />
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Expanded Details */}
                {isExpanded && (
                  <View style={styles.expandedSection}>
                    <View style={styles.rangeRow}>
                      <Text style={styles.rangeLabel}>Expected Price Range:</Text>
                      <Text style={styles.rangeVal}>
                        LKR {item.minExpectedPrice} - {item.maxExpectedPrice} /kg
                      </Text>
                    </View>

                    <View style={styles.rangeRow}>
                      <Text style={styles.rangeLabel}>Suggested Selling:</Text>
                      <Text style={[styles.rangeVal, { color: Colors.primary }]}>
                        LKR {item.suggestedSellingPrice} /kg
                      </Text>
                    </View>

                    <Text style={styles.factorsHeading}>Applied Heuristic Rules:</Text>
                    {item.factors.map((f, fIdx) => (
                      <View key={fIdx} style={styles.factorItem}>
                        <Ionicons
                          name={
                            f.impact === 'positive'
                              ? 'checkmark-circle'
                              : f.impact === 'negative'
                              ? 'alert-circle'
                              : 'information-circle'
                          }
                          size={12}
                          color={
                            f.impact === 'positive'
                              ? '#16A34A'
                              : f.impact === 'negative'
                              ? '#DC2626'
                              : '#64748B'
                          }
                        />
                        <Text style={styles.factorNameText}>{f.name}:</Text>
                        <Text style={styles.factorDescText}>{f.multiplierText}</Text>
                      </View>
                    ))}

                    <View style={styles.expandedFooter}>
                      <Text style={styles.sourceText} numberOfLines={1}>
                        {item.sourceBaseline}
                      </Text>

                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDelete(item)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="trash-outline" size={14} color="#DC2626" />
                        <Text style={styles.deleteBtnText}>Delete Record</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  clearBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
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
    maxWidth: 280,
    lineHeight: 18,
  },
  historyCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cropTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textDark,
  },
  districtText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  priceBox: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.primary,
  },
  totalValText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: 1,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  dateText: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  toggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.secondary,
  },
  expandedSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  rangeLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  rangeVal: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textDark,
  },
  factorsHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textDark,
    marginTop: 8,
    marginBottom: 4,
  },
  factorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  factorNameText: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  factorDescText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textDark,
  },
  expandedFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  sourceText: {
    fontSize: 9,
    color: Colors.textSecondary,
    flex: 1,
    marginRight: 8,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deleteBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
});
