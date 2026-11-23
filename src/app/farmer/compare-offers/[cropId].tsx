import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFarmer } from '../../../context/FarmerContext';
import { Colors, Shadows } from '../../../constants/theme';
import { Header } from '../../../components/common/Header';

export default function CompareBuyerOffersScreen() {
  const router = useRouter();
  const { cropId } = useLocalSearchParams<{ cropId: string }>();
  const { crops, offers, respondToOffer } = useFarmer();

  const crop = crops.find(c => c.id === cropId);
  const cropOffers = offers.filter(o => o.cropListingId === cropId);

  // Identify best offer (highest price per kg)
  const highestPrice = Math.max(...cropOffers.map(o => o.offeredPricePerKg), 0);

  const handleRespond = (offerId: string, buyerName: string, decision: 'Accepted' | 'Rejected') => {
    Alert.alert(
      `${decision} Offer`,
      `Are you sure you want to ${decision.toLowerCase()} the offer from ${buyerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: decision,
          style: decision === 'Accepted' ? 'default' : 'destructive',
          onPress: async () => {
            await respondToOffer(offerId, decision);
            Alert.alert(
              `Offer ${decision}`,
              decision === 'Accepted'
                ? `You have accepted the offer from ${buyerName}. The buyer will coordinate dispatch logistics.`
                : `You rejected the offer from ${buyerName}.`
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Compare Buyer Offers"
        subtitle={crop ? `${crop.cropName} • ${cropOffers.length} offers received` : 'Buyer Bids'}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Crop Summary Banner */}
        {crop && (
          <View style={[styles.cropBanner, Shadows.small]}>
            <Image source={{ uri: crop.imageUrl }} style={styles.cropThumb} />
            <View style={styles.cropInfo}>
              <Text style={styles.cropTitle}>{crop.cropName}</Text>
              <Text style={styles.cropSub}>
                Batch: {crop.quantityKg.toLocaleString()} kg • Your Target: LKR {crop.pricePerKg}/kg
              </Text>
            </View>
          </View>
        )}

        {/* Offers List */}
        <View style={styles.offersHeaderRow}>
          <Text style={styles.offersSectionTitle}>Received Commercial Bids</Text>
          <Text style={styles.offersCountText}>{cropOffers.length} Available</Text>
        </View>

        {cropOffers.length > 0 ? (
          cropOffers.map(offer => {
            const isBest = offer.offeredPricePerKg === highestPrice;
            const isAccepted = offer.status === 'Accepted';
            const isRejected = offer.status === 'Rejected';

            return (
              <View
                key={offer.id}
                style={[
                  styles.offerCard,
                  Shadows.card,
                  isBest && styles.bestOfferCard,
                  isAccepted && styles.acceptedOfferCard,
                ]}
              >
                {/* Best Offer Tag */}
                {isBest && (
                  <View style={styles.bestOfferRibbon}>
                    <Ionicons name="trophy" size={12} color={Colors.white} />
                    <Text style={styles.bestOfferRibbonText}>TOP MARKET OFFER</Text>
                  </View>
                )}

                {/* Buyer Top Info */}
                <View style={styles.buyerRow}>
                  <Image
                    source={{
                      uri:
                        offer.buyerAvatar ||
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
                    }}
                    style={styles.buyerAvatar}
                  />

                  <View style={styles.buyerDetails}>
                    <Text style={styles.buyerName}>{offer.buyerName}</Text>
                    <Text style={styles.buyerLocation}>
                      <Ionicons name="location" size={11} color={Colors.textMuted} /> {offer.buyerLocation}
                    </Text>
                    <Text style={styles.offerDate}>
                      Offer Date: {new Date(offer.offerDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </Text>
                  </View>

                  {/* Status Indicator */}
                  {offer.status !== 'Pending' && (
                    <View
                      style={[
                        styles.statusPill,
                        isAccepted && { backgroundColor: Colors.successBg, borderColor: '#C2EED3' },
                        isRejected && { backgroundColor: Colors.errorBg, borderColor: '#FCA5A5' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusPillText,
                          isAccepted && { color: Colors.success },
                          isRejected && { color: Colors.error },
                        ]}
                      >
                        {offer.status.toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Offer Numbers */}
                <View style={styles.metricsBox}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Offered Price</Text>
                    <Text style={styles.metricPrice}>
                      LKR {offer.offeredPricePerKg}
                      <Text style={styles.metricUnit}>/kg</Text>
                    </Text>
                  </View>

                  <View style={styles.metricDivider} />

                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Requested Volume</Text>
                    <Text style={styles.metricVol}>
                      {offer.requestedQuantityKg.toLocaleString()}
                      <Text style={styles.metricUnit}> kg</Text>
                    </Text>
                  </View>

                  <View style={styles.metricDivider} />

                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Total Payout</Text>
                    <Text style={styles.metricPayout}>
                      LKR {offer.totalValueLkr.toLocaleString()}
                    </Text>
                  </View>
                </View>

                {/* Notes from Buyer */}
                {offer.notes && (
                  <View style={styles.notesBox}>
                    <Text style={styles.notesText}>"{offer.notes}"</Text>
                  </View>
                )}

                {/* Accept / Reject Action Row */}
                {offer.status === 'Pending' ? (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={() => handleRespond(offer.id, offer.buyerName, 'Rejected')}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="close" size={16} color={Colors.error} />
                      <Text style={styles.rejectBtnText}>Decline</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.acceptBtn}
                      onPress={() => handleRespond(offer.id, offer.buyerName, 'Accepted')}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="checkmark" size={16} color={Colors.white} />
                      <Text style={styles.acceptBtnText}>Accept Offer</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.resolvedRow}>
                    <Ionicons
                      name={isAccepted ? 'checkmark-circle' : 'close-circle'}
                      size={16}
                      color={isAccepted ? Colors.success : Colors.error}
                    />
                    <Text
                      style={[
                        styles.resolvedText,
                        { color: isAccepted ? Colors.success : Colors.error },
                      ]}
                    >
                      {isAccepted
                        ? 'You accepted this trade. Prepare batch for collection.'
                        : 'Offer was rejected.'}
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="chatbubbles-outline" size={40} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No offers on this crop yet</Text>
            <Text style={styles.emptyDesc}>
              Commercial buyers are notified about new listings daily.
            </Text>
          </View>
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
    paddingHorizontal: 20,
    paddingBottom: 36,
    gap: 14,
  },
  cropBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cropThumb: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#EAF6F0',
  },
  cropInfo: {
    flex: 1,
  },
  cropTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textDark,
  },
  cropSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  offersHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  offersSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textDark,
  },
  offersCountText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  offerCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
    overflow: 'hidden',
  },
  bestOfferCard: {
    borderColor: Colors.orange,
    borderWidth: 1.5,
  },
  acceptedOfferCard: {
    borderColor: Colors.secondary,
    backgroundColor: '#FAFCF8',
  },
  bestOfferRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.orange,
    paddingHorizontal: 10,
    paddingVertical: 3,
    position: 'absolute',
    top: 0,
    right: 0,
    borderBottomLeftRadius: 10,
  },
  bestOfferRibbonText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  buyerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  buyerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F0F5F2',
  },
  buyerDetails: {
    flex: 1,
  },
  buyerName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textDark,
  },
  buyerLocation: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  offerDate: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  metricsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAF6',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EEF3EA',
    marginBottom: 10,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
    marginBottom: 2,
  },
  metricPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  metricVol: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
  },
  metricPayout: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.orangeDark,
  },
  metricUnit: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
  },
  notesBox: {
    backgroundColor: '#F0F5F2',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  notesText: {
    fontSize: 11,
    color: Colors.textDark,
    fontStyle: 'italic',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F4EC',
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    backgroundColor: Colors.errorBg,
  },
  rejectBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.error,
  },
  acceptBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: Colors.secondary,
  },
  acceptBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
  resolvedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 6,
  },
  resolvedText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: Colors.white,
    padding: 32,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
  },
  emptyDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
