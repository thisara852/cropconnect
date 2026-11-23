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
import { Button } from '../../../components/common/Button';

export default function CropDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { crops, offers, deleteCrop, updateCrop } = useFarmer();

  const crop = crops.find(c => c.id === id);
  const cropOffers = offers.filter(o => o.cropListingId === id);

  if (!crop) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Crop Details" />
        <View style={styles.centerBox}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.errorTitle}>Crop listing not found</Text>
          <Button
            title="Back to My Crops"
            variant="outline"
            onPress={() => router.replace('/(farmer)/crops' as any)}
            style={{ marginTop: 12 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Listing',
      `Are you sure you want to delete "${crop.cropName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteCrop(crop.id);
            router.replace('/(farmer)/crops' as any);
          },
        },
      ]
    );
  };

  const handleToggleRescue = async () => {
    const newRescue = !crop.isRescue;
    await updateCrop(crop.id, {
      isRescue: newRescue,
      status: newRescue ? 'Rescue Alert' : 'Active',
    });
    Alert.alert(
      newRescue ? 'Rescue Alert Active' : 'Rescue Alert Removed',
      newRescue
        ? 'Your harvest is now flagged with high urgency for commercial food processors.'
        : 'Listing restored to regular active marketplace status.'
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={crop.cropName}
        subtitle={`${crop.category} • ${crop.district}`}
        rightElement={
          <TouchableOpacity
            style={styles.headerEditBtn}
            onPress={() => router.push(`/farmer/crop-edit/${crop.id}` as any)}
          >
            <Ionicons name="pencil" size={16} color={Colors.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Photo & Badges */}
        <View style={[styles.heroCard, Shadows.card]}>
          <Image source={{ uri: crop.imageUrl }} style={styles.heroImage} />

          <View style={styles.badgeOverlay}>
            <View
              style={[
                styles.statusPill,
                crop.status === 'Rescue Alert' && { backgroundColor: Colors.error },
                crop.status === 'Under Offer' && { backgroundColor: Colors.orangeDark },
                crop.status === 'Sold' && { backgroundColor: '#64748B' },
              ]}
            >
              <Text style={styles.statusPillText}>{crop.status}</Text>
            </View>

            {crop.isRescue && (
              <View style={styles.urgentPill}>
                <Ionicons name="flash" size={12} color={Colors.white} />
                <Text style={styles.urgentPillText}>URGENT RESCUE</Text>
              </View>
            )}
          </View>
        </View>

        {/* Pricing & Volume Metric Cards */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Expected Price</Text>
            <Text style={styles.metricPrice}>
              LKR {crop.pricePerKg} <Text style={styles.metricUnit}>/kg</Text>
            </Text>
            <Text style={styles.metricHint}>Estimated baseline</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Harvest Quantity</Text>
            <Text style={styles.metricValue}>
              {crop.quantityKg.toLocaleString()} <Text style={styles.metricUnit}>kg</Text>
            </Text>
            <Text style={styles.metricHint}>Total batch size</Text>
          </View>
        </View>

        {/* Total Batch Estimated Value */}
        <View style={styles.valueCard}>
          <View style={styles.valueRow}>
            <Text style={styles.valueLabel}>Total Estimated Batch Value:</Text>
            <Text style={styles.valueAmount}>
              LKR {(crop.quantityKg * crop.pricePerKg).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Offers Section */}
        <View style={styles.sectionBox}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderLeft}>
              <Ionicons name="chatbubbles" size={18} color={Colors.primary} />
              <Text style={styles.sectionTitle}>
                Buyer Offers ({cropOffers.length})
              </Text>
            </View>
            {cropOffers.length > 0 && (
              <TouchableOpacity
                onPress={() => router.push(`/farmer/compare-offers/${crop.id}` as any)}
              >
                <Text style={styles.compareAllText}>Compare All</Text>
              </TouchableOpacity>
            )}
          </View>

          {cropOffers.length > 0 ? (
            <View style={styles.offersPreviewList}>
              {cropOffers.slice(0, 2).map(offer => (
                <View key={offer.id} style={styles.offerItemCard}>
                  <View style={styles.offerItemTop}>
                    <Text style={styles.offerBuyerName}>{offer.buyerName}</Text>
                    {offer.isBestOffer && (
                      <View style={styles.bestOfferBadge}>
                        <Text style={styles.bestOfferText}>BEST OFFER</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.offerPriceRow}>
                    <Text style={styles.offerRate}>
                      LKR {offer.offeredPricePerKg}/kg • {offer.requestedQuantityKg} kg
                    </Text>
                    <Text style={styles.offerTotal}>
                      LKR {offer.totalValueLkr.toLocaleString()}
                    </Text>
                  </View>
                </View>
              ))}

              <Button
                title="Review & Compare All Offers"
                variant="orange"
                size="medium"
                iconName="analytics"
                onPress={() => router.push(`/farmer/compare-offers/${crop.id}` as any)}
                style={{ marginTop: 6 }}
              />
            </View>
          ) : (
            <View style={styles.noOffersBox}>
              <Text style={styles.noOffersText}>No buyer offers received yet.</Text>
              <Text style={styles.noOffersSub}>
                Buyers in {crop.district} are currently reviewing newly listed lots.
              </Text>
            </View>
          )}
        </View>

        {/* Harvest & Farmer Details */}
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>Harvest & Location Details</Text>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Harvest / Dispatch Date:</Text>
            <Text style={styles.detailValue}>{crop.harvestDate}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>District & Province:</Text>
            <Text style={styles.detailValue}>{crop.district}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Village / Farm Division:</Text>
            <Text style={styles.detailValue}>{crop.village || 'Local Division'}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Farmer Contact:</Text>
            <Text style={styles.detailValue}>{crop.farmerName} ({crop.farmerPhone})</Text>
          </View>

          {crop.description ? (
            <View style={styles.descBox}>
              <Text style={styles.descLabel}>Quality & Batch Notes:</Text>
              <Text style={styles.descText}>{crop.description}</Text>
            </View>
          ) : null}
        </View>

        {/* Actions Row */}
        <View style={styles.actionsGrid}>
          <Button
            title={crop.isRescue ? 'Remove Rescue Tag' : 'Broadcast as Rescue Alert'}
            variant={crop.isRescue ? 'outline' : 'danger'}
            size="large"
            iconName="flash"
            onPress={handleToggleRescue}
          />

          <View style={styles.bottomButtonsRow}>
            <Button
              title="Edit Listing"
              variant="secondary"
              size="large"
              iconName="create-outline"
              style={{ flex: 1 }}
              onPress={() => router.push(`/farmer/crop-edit/${crop.id}` as any)}
            />

            <Button
              title="Delete"
              variant="outline"
              size="large"
              iconName="trash-outline"
              style={{ minWidth: 100 }}
              onPress={handleDelete}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerEditBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EAF6F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
    marginTop: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    gap: 16,
  },
  heroCard: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E2EBE5',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  badgeOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    gap: 8,
  },
  statusPill: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusPillText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  urgentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.error,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  urgentPillText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  metricPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.primary,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.textDark,
  },
  metricUnit: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  metricHint: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  valueCard: {
    backgroundColor: '#EAF6F0',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#C2E5D4',
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valueLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  valueAmount: {
    fontSize: 17,
    fontWeight: '900',
    color: Colors.primary,
  },
  sectionBox: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textDark,
  },
  compareAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  offersPreviewList: {
    gap: 10,
  },
  offerItemCard: {
    backgroundColor: '#FAF7F2',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1E6D6',
  },
  offerItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  offerBuyerName: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textDark,
  },
  bestOfferBadge: {
    backgroundColor: Colors.orange,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bestOfferText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.white,
  },
  offerPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  offerRate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  offerTotal: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  noOffersBox: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  noOffersText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDark,
  },
  noOffersSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAF6',
  },
  detailLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDark,
  },
  descBox: {
    marginTop: 10,
    backgroundColor: '#F8FAF6',
    padding: 10,
    borderRadius: 10,
  },
  descLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 2,
  },
  descText: {
    fontSize: 12,
    color: Colors.textDark,
    lineHeight: 17,
  },
  actionsGrid: {
    gap: 12,
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
