import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { InteractiveMapView } from '../../components/location/InteractiveMapView';
import { useFarmer } from '../../context/FarmerContext';
import { useBuyer } from '../../context/BuyerContext';
import { useLocation } from '../../context/LocationContext';
import { MapMarkerItem } from '../../types/location';
import { locationService, SRI_LANKAN_MARKETS } from '../../services/locationService';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';

export default function DedicatedMapScreen() {
  const router = useRouter();
  const { crops, buyers } = useFarmer();
  const { farmers } = useBuyer();
  const { userLocation } = useLocation();

  // Combine markers for Farmers, Buyers, Crops, and Economic Centres
  const mapMarkers = useMemo(() => {
    const list: MapMarkerItem[] = [];

    // 1. Dedicated Economic Centres
    SRI_LANKAN_MARKETS.forEach((mkt) => {
      list.push({
        id: mkt.id,
        type: 'market',
        title: mkt.name,
        subtitle: `${mkt.type} • ${mkt.operatingHours}`,
        coords: mkt.coords,
        district: mkt.district,
        crops: mkt.keyCommodities,
        phone: mkt.contactPhone,
      });
    });

    // 2. Farmer Markers
    farmers.forEach((farmer) => {
      list.push({
        id: `farmer_${farmer.id}`,
        type: 'farmer',
        title: farmer.name,
        subtitle: `Farmer • ${farmer.activeListingsCount} active lots • Rating ★ ${farmer.rating}`,
        coords: locationService.getDistrictCoordinates(farmer.district),
        district: farmer.district,
        village: farmer.village,
        phone: farmer.phone,
        crops: farmer.cropsOffered,
        rating: farmer.rating,
        targetId: farmer.id,
      });
    });

    // 3. Buyer Markers
    buyers.forEach((buyer) => {
      list.push({
        id: `buyer_${buyer.id}`,
        type: 'buyer',
        title: buyer.businessName,
        subtitle: `Commercial Buyer • ${buyer.businessType}`,
        coords: locationService.getDistrictCoordinates(buyer.district),
        district: buyer.district,
        phone: buyer.phone,
        crops: buyer.requiredCrop ? [buyer.requiredCrop] : undefined,
        isVerified: buyer.verified,
        targetId: buyer.id,
      });
    });

    // 4. Crop Listings
    crops.forEach((crop) => {
      list.push({
        id: `crop_${crop.id}`,
        type: 'crop',
        title: `${crop.cropName} (${crop.quantityKg} kg)`,
        subtitle: `Farmgate Asking: LKR ${crop.pricePerKg}/kg • Farmer: ${crop.farmerName}`,
        coords: locationService.getDistrictCoordinates(crop.district),
        district: crop.district,
        village: crop.village,
        phone: crop.farmerPhone,
        pricePerKg: crop.pricePerKg,
        quantityKg: crop.quantityKg,
        isRescue: crop.isRescue,
        targetId: crop.id,
      });
    });

    return list;
  }, [farmers, buyers, crops]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTextCol}>
          <Text style={styles.headerTitle}>National Agri Geo-Map</Text>
          <Text style={styles.headerSubtitle}>
            Center: {userLocation.district} ({userLocation.townOrVillage})
          </Text>
        </View>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => router.push('/settings/location' as any)}
          activeOpacity={0.8}
        >
          <Ionicons name="options-outline" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Interactive Map Component */}
      <InteractiveMapView
        markers={mapMarkers}
        initialCenter={userLocation.coords}
        title="Interactive Agricultural Map"
        subtitle="Explore verified farmers, buyers & economic centers"
      />
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
  settingsBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
