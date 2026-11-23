import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AIFairPricePrediction } from '../../types/farmer';
import { Colors } from '../../constants/theme';

interface PriceComparisonGaugeProps {
  prediction: AIFairPricePrediction;
}

export const PriceComparisonGauge: React.FC<PriceComparisonGaugeProps> = ({ prediction }) => {
  return (
    <View style={styles.container}>
      {/* Simulation Disclaimer Badge */}
      <View style={styles.simulatedBadge}>
        <Ionicons name="sparkles" size={12} color={Colors.orangeDark} />
        <Text style={styles.simulatedBadgeText}>SIMULATED AI PREDICTION SAMPLE</Text>
      </View>

      {/* Main Predicted Number */}
      <View style={styles.mainPredictedCard}>
        <Text style={styles.predictLabel}>Recommended Fair Farm-Gate Price</Text>
        <View style={styles.priceRow}>
          <Text style={styles.currency}>LKR</Text>
          <Text style={styles.priceNumber}>{prediction.predictedPricePerKg}</Text>
          <Text style={styles.unit}>/ kg</Text>
        </View>

        <View style={styles.trendRow}>
          <Ionicons
            name={prediction.trend === 'up' ? 'trending-up' : 'trending-down'}
            size={16}
            color={prediction.trend === 'up' ? Colors.secondary : Colors.error}
          />
          <Text
            style={[
              styles.trendText,
              { color: prediction.trend === 'up' ? Colors.secondary : Colors.error },
            ]}
          >
            {prediction.trendPercent}% vs last week's avg
          </Text>
          <Text style={styles.confidenceText}>• {prediction.confidenceScore}% confidence</Text>
        </View>

        {/* Visual Range Bar */}
        <View style={styles.rangeContainer}>
          <View style={styles.rangeLabelsRow}>
            <Text style={styles.rangeMinText}>Min: LKR {prediction.minPricePerKg}</Text>
            <Text style={styles.rangeMaxText}>Max: LKR {prediction.maxPricePerKg}</Text>
          </View>

          <View style={styles.barTrack}>
            <View style={styles.barFill} />
            <View style={styles.barMarker} />
          </View>
          <Text style={styles.barHelper}>Recommended bargaining window</Text>
        </View>
      </View>

      {/* Economic Centers Comparison Grid */}
      <View style={styles.centersSection}>
        <Text style={styles.centersSectionTitle}>Terminal Market Benchmarks (Wholesale Today)</Text>

        <View style={styles.centersGrid}>
          <View style={styles.centerItem}>
            <Text style={styles.centerName}>Dambulla DEC</Text>
            <Text style={styles.centerPrice}>LKR {prediction.dambullaWholesalePrice}</Text>
            <Text style={styles.centerSubtitle}>Central wholesale</Text>
          </View>

          <View style={styles.centerDivider} />

          <View style={styles.centerItem}>
            <Text style={styles.centerName}>Pettah Market</Text>
            <Text style={styles.centerPrice}>LKR {prediction.pettahWholesalePrice}</Text>
            <Text style={styles.centerSubtitle}>Colombo terminal</Text>
          </View>

          <View style={styles.centerDivider} />

          <View style={styles.centerItem}>
            <Text style={styles.centerName}>Meegoda DEC</Text>
            <Text style={styles.centerPrice}>LKR {prediction.meegodaWholesalePrice}</Text>
            <Text style={styles.centerSubtitle}>Western transit</Text>
          </View>
        </View>
      </View>

      {/* AI Reasoning Text */}
      <View style={styles.explanationBox}>
        <View style={styles.expHeader}>
          <Ionicons name="information-circle" size={16} color={Colors.secondary} />
          <Text style={styles.expTitle}>Why this price?</Text>
        </View>
        <Text style={styles.expBody}>{prediction.explanation}</Text>

        {/* Factors */}
        <View style={styles.factorsList}>
          {prediction.factors.map((f, i) => (
            <View key={i} style={styles.factorItem}>
              <Ionicons
                name={
                  f.impact === 'positive'
                    ? 'arrow-up-circle'
                    : f.impact === 'negative'
                    ? 'arrow-down-circle'
                    : 'remove-circle'
                }
                size={14}
                color={
                  f.impact === 'positive'
                    ? Colors.secondary
                    : f.impact === 'negative'
                    ? Colors.error
                    : Colors.textMuted
                }
              />
              <Text style={styles.factorName}>{f.name}:</Text>
              <Text style={styles.factorDesc} numberOfLines={1}>
                {f.text}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  simulatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF4E8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#FCD7A8',
    marginBottom: 10,
  },
  simulatedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.orangeDark,
    letterSpacing: 0.5,
  },
  mainPredictedCard: {
    backgroundColor: Colors.white,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    marginBottom: 14,
  },
  predictLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  currency: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  priceNumber: {
    fontSize: 42,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  unit: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    marginBottom: 16,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '700',
  },
  confidenceText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  rangeContainer: {
    width: '100%',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F4EC',
  },
  rangeLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  rangeMinText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  rangeMaxText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.secondary,
  },
  barTrack: {
    height: 10,
    backgroundColor: '#E6ECE8',
    borderRadius: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  barFill: {
    position: 'absolute',
    left: '20%',
    width: '60%',
    height: '100%',
    backgroundColor: Colors.secondary,
    borderRadius: 5,
  },
  barMarker: {
    position: 'absolute',
    left: '52%',
    top: 0,
    width: 4,
    height: '100%',
    backgroundColor: Colors.primary,
  },
  barHelper: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  centersSection: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
  },
  centersSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  centersGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  centerItem: {
    flex: 1,
    alignItems: 'center',
  },
  centerName: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  centerPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textDark,
  },
  centerSubtitle: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 1,
  },
  centerDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },
  explanationBox: {
    backgroundColor: '#F5FAF7',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D4E8DC',
  },
  expHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  expTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  expBody: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
    marginBottom: 10,
  },
  factorsList: {
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#DCECE3',
  },
  factorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  factorName: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textDark,
  },
  factorDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    flex: 1,
  },
});
