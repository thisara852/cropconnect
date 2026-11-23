import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Linking,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { MapMarkerItem, MarkerType, GeoCoordinates } from '../../types/location';
import { useLocation } from '../../context/LocationContext';
import { locationService } from '../../services/locationService';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../constants/theme';

interface InteractiveMapViewProps {
  markers: MapMarkerItem[];
  initialCenter?: GeoCoordinates;
  title?: string;
  subtitle?: string;
}

// Sri Lanka Geographic Bounds for proportional coordinate mapping
const SRI_LANKA_BOUNDS = {
  minLat: 5.8,
  maxLat: 9.9,
  minLng: 79.5,
  maxLng: 82.0,
};

export const InteractiveMapView: React.FC<InteractiveMapViewProps> = ({
  markers,
  title = 'Interactive Agri Map',
  subtitle = 'Discover nearby farmers, commercial buyers & economic centres',
}) => {
  const router = useRouter();
  const { userLocation, calculateDistanceTo, formatDistanceTo } = useLocation();

  const [selectedType, setSelectedType] = useState<'all' | MarkerType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMarker, setSelectedMarker] = useState<MapMarkerItem | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  // Filter markers based on type and search
  const filteredMarkers = useMemo(() => {
    return markers.filter((m) => {
      const matchesType = selectedType === 'all' || m.type === selectedType;
      const matchesSearch =
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.village && m.village.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.crops && m.crops.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchesType && matchesSearch;
    });
  }, [markers, selectedType, searchQuery]);

  // Project geographic latitude and longitude into 2D percentage coordinates
  const getMarkerPosition = (coords: GeoCoordinates) => {
    const latSpan = SRI_LANKA_BOUNDS.maxLat - SRI_LANKA_BOUNDS.minLat;
    const lngSpan = SRI_LANKA_BOUNDS.maxLng - SRI_LANKA_BOUNDS.minLng;

    // Invert latitude because screen Y goes downwards from top to bottom
    const yPct = ((SRI_LANKA_BOUNDS.maxLat - coords.latitude) / latSpan) * 100;
    const xPct = ((coords.longitude - SRI_LANKA_BOUNDS.minLng) / lngSpan) * 100;

    return {
      top: `${Math.min(92, Math.max(8, yPct))}%` as any,
      left: `${Math.min(90, Math.max(10, xPct))}%` as any,
    };
  };

  const getMarkerVisual = (type: MarkerType) => {
    switch (type) {
      case 'farmer':
        return {
          bg: Colors.secondary,
          border: '#0F3424',
          icon: 'leaf' as const,
          label: 'Farmer',
        };
      case 'buyer':
        return {
          bg: Colors.orange,
          border: '#7C2D12',
          icon: 'business' as const,
          label: 'Buyer',
        };
      case 'crop':
        return {
          bg: '#10B981',
          border: '#064E3B',
          icon: 'basket' as const,
          label: 'Crop Lot',
        };
      case 'market':
        return {
          bg: '#2563EB',
          border: '#1E3A8A',
          icon: 'storefront' as const,
          label: 'Economic Centre',
        };
    }
  };

  const handleOpenDirections = (marker: MapMarkerItem) => {
    locationService.openExternalMaps(marker.coords, marker.title);
  };

  const handleCall = (phone?: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`).catch(() => {});
    }
  };

  const handleViewDetails = (marker: MapMarkerItem) => {
    if (marker.type === 'farmer' && marker.targetId) {
      router.push(`/buyer/farmer/${marker.targetId}` as any);
    } else if (marker.type === 'buyer' && marker.targetId) {
      router.push(`/admin/buyer/${marker.targetId}` as any);
    } else if (marker.type === 'crop' && marker.targetId) {
      router.push(`/buyer/crop/${marker.targetId}` as any);
    }
  };

  return (
    <View style={styles.container}>
      {/* Search & Filter Header Bar */}
      <View style={styles.topControlBar}>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search district, crop, or enterprise..."
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Map / List View Toggle Button */}
          <TouchableOpacity
            style={styles.viewToggleBtn}
            onPress={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
            activeOpacity={0.8}
          >
            <Ionicons
              name={viewMode === 'map' ? 'list' : 'map'}
              size={18}
              color="#FFFFFF"
            />
            <Text style={styles.viewToggleText}>
              {viewMode === 'map' ? 'List' : 'Map'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterPillsScroll}
        >
          {[
            { key: 'all', label: `All (${markers.length})`, icon: 'apps' },
            {
              key: 'farmer',
              label: `Farmers (${markers.filter((m) => m.type === 'farmer').length})`,
              icon: 'leaf',
            },
            {
              key: 'buyer',
              label: `Buyers (${markers.filter((m) => m.type === 'buyer').length})`,
              icon: 'business',
            },
            {
              key: 'market',
              label: `Economic Centres (${markers.filter((m) => m.type === 'market').length})`,
              icon: 'storefront',
            },
          ].map((item) => {
            const isSel = selectedType === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.filterPill, isSel && styles.filterPillActive]}
                onPress={() => setSelectedType(item.key as any)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={item.icon as any}
                  size={13}
                  color={isSel ? '#FFFFFF' : Colors.textSecondary}
                />
                <Text style={[styles.filterPillText, isSel && styles.filterPillTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* MAP VIEW */}
      {viewMode === 'map' ? (
        <View style={styles.mapCanvasWrapper}>
          {/* Stylized Island Map Base */}
          <View
            style={[
              styles.mapCanvas,
              {
                transform: [{ scale: zoomLevel }],
              },
            ]}
          >
            {/* Visual Island Outline / Regional Terrain Guide */}
            <View style={styles.sriLankaTerrain}>
              {/* Regional Province Watermark Overlays */}
              <Text style={[styles.regionLabel, { top: '15%', left: '42%' }]}>Northern</Text>
              <Text style={[styles.regionLabel, { top: '35%', left: '38%' }]}>North Central</Text>
              <Text style={[styles.regionLabel, { top: '48%', left: '45%' }]}>Central / Dambulla</Text>
              <Text style={[styles.regionLabel, { top: '65%', left: '28%' }]}>Western</Text>
              <Text style={[styles.regionLabel, { top: '68%', left: '55%' }]}>Uva</Text>
              <Text style={[styles.regionLabel, { top: '80%', left: '48%' }]}>Southern</Text>
            </View>

            {/* User Current Location Dot */}
            {userLocation.coords && (
              <View style={[styles.userGpsPin, getMarkerPosition(userLocation.coords)]}>
                <View style={styles.userPulseRing} />
                <View style={styles.userCoreDot} />
                <View style={styles.userPinLabel}>
                  <Text style={styles.userPinText}>You ({userLocation.district})</Text>
                </View>
              </View>
            )}

            {/* Plotted Markers */}
            {filteredMarkers.map((marker) => {
              const pos = getMarkerPosition(marker.coords);
              const visual = getMarkerVisual(marker.type);
              const isSelected = selectedMarker?.id === marker.id;

              return (
                <TouchableOpacity
                  key={marker.id}
                  style={[
                    styles.markerPin,
                    pos,
                    {
                      backgroundColor: visual.bg,
                      borderColor: visual.border,
                      zIndex: isSelected ? 99 : 10,
                      transform: [{ scale: isSelected ? 1.25 : 1 }],
                    },
                  ]}
                  onPress={() => setSelectedMarker(marker)}
                  activeOpacity={0.8}
                >
                  <Ionicons name={visual.icon} size={14} color="#FFFFFF" />
                  {isSelected && <View style={styles.pinTriangle} />}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Floating Map Zoom & Centering Controls */}
          <View style={styles.mapToolsRight}>
            <TouchableOpacity
              style={styles.mapToolBtn}
              onPress={() => setZoomLevel((z) => Math.min(1.4, z + 0.15))}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={20} color={Colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mapToolBtn}
              onPress={() => setZoomLevel((z) => Math.max(0.85, z - 0.15))}
              activeOpacity={0.8}
            >
              <Ionicons name="remove" size={20} color={Colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mapToolBtn, { backgroundColor: '#EAF6F0' }]}
              onPress={() => {
                setZoomLevel(1);
                if (userLocation.coords) {
                  // Re-center on user
                }
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="locate" size={18} color={Colors.secondary} />
            </TouchableOpacity>
          </View>

          {/* Map Legend Footer */}
          <View style={styles.mapLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.secondary }]} />
              <Text style={styles.legendText}>Farmers</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.orange }]} />
              <Text style={styles.legendText}>Buyers</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#2563EB' }]} />
              <Text style={styles.legendText}>Economic Centres</Text>
            </View>
          </View>

          {/* Bottom Sliding Marker Details Drawer */}
          {selectedMarker && (
            <View style={[styles.detailDrawer, Shadows.floating]}>
              <View style={styles.drawerTop}>
                <View style={styles.drawerTitleCol}>
                  <View style={styles.drawerBadgeRow}>
                    <View
                      style={[
                        styles.drawerTypePill,
                        { backgroundColor: getMarkerVisual(selectedMarker.type).bg },
                      ]}
                    >
                      <Text style={styles.drawerTypePillText}>
                        {getMarkerVisual(selectedMarker.type).label.toUpperCase()}
                      </Text>
                    </View>

                    {selectedMarker.isVerified && (
                      <View style={styles.verifiedBadge}>
                        <Ionicons name="checkmark-circle" size={12} color={Colors.secondary} />
                        <Text style={styles.verifiedText}>Verified</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.drawerTitle} numberOfLines={1}>
                    {selectedMarker.title}
                  </Text>
                  <Text style={styles.drawerSubtitle} numberOfLines={1}>
                    {selectedMarker.subtitle}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.closeDrawerBtn}
                  onPress={() => setSelectedMarker(null)}
                >
                  <Ionicons name="close" size={20} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Proximity Distance Box */}
              <View style={styles.drawerProximityRow}>
                <View style={styles.proxItem}>
                  <Ionicons name="navigate-outline" size={14} color={Colors.primary} />
                  <Text style={styles.proxText}>
                    {formatDistanceTo(selectedMarker.coords)}
                  </Text>
                </View>

                <View style={styles.proxItem}>
                  <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
                  <Text style={styles.proxText}>
                    {selectedMarker.village ? `${selectedMarker.village}, ` : ''}{selectedMarker.district}
                  </Text>
                </View>
              </View>

              {/* Action Buttons: Directions, Call, View */}
              <View style={styles.drawerActionsRow}>
                <TouchableOpacity
                  style={styles.directionsBtn}
                  onPress={() => handleOpenDirections(selectedMarker)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="navigate" size={16} color="#FFFFFF" />
                  <Text style={styles.directionsBtnText}>Directions</Text>
                </TouchableOpacity>

                {selectedMarker.phone ? (
                  <TouchableOpacity
                    style={styles.callBtn}
                    onPress={() => handleCall(selectedMarker.phone)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="call" size={16} color={Colors.primary} />
                  </TouchableOpacity>
                ) : null}

                {selectedMarker.targetId ? (
                  <TouchableOpacity
                    style={styles.viewDetailsBtn}
                    onPress={() => handleViewDetails(selectedMarker)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.viewDetailsBtnText}>View Details</Text>
                    <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          )}
        </View>
      ) : (
        /* LIST VIEW FALLBACK */
        <ScrollView contentContainerStyle={styles.listContainer}>
          <Text style={styles.listResultsHeader}>
            Found <Text style={{ fontWeight: '700', color: Colors.primary }}>{filteredMarkers.length}</Text> locations nearby
          </Text>

          {filteredMarkers.map((marker) => {
            const visual = getMarkerVisual(marker.type);
            const dist = formatDistanceTo(marker.coords);
            return (
              <View key={marker.id} style={[styles.listCard, Shadows.card]}>
                <View style={styles.listCardTop}>
                  <View style={[styles.listIconCircle, { backgroundColor: visual.bg }]}>
                    <Ionicons name={visual.icon} size={20} color="#FFFFFF" />
                  </View>

                  <View style={styles.listInfoCol}>
                    <View style={styles.listTitleRow}>
                      <Text style={styles.listTitle} numberOfLines={1}>
                        {marker.title}
                      </Text>
                      <View style={[styles.listPill, { backgroundColor: visual.bg }]}>
                        <Text style={styles.listPillText}>{visual.label}</Text>
                      </View>
                    </View>

                    <Text style={styles.listSubtitle}>{marker.subtitle}</Text>
                    <Text style={styles.listDistText}>
                      <Ionicons name="navigate-outline" size={12} color={Colors.primary} /> {dist} • {marker.district}
                    </Text>
                  </View>
                </View>

                <View style={styles.listActionsRow}>
                  <TouchableOpacity
                    style={styles.listActionSmallBtn}
                    onPress={() => handleOpenDirections(marker)}
                  >
                    <Ionicons name="navigate-outline" size={14} color={Colors.text} />
                    <Text style={styles.listActionSmallText}>Maps</Text>
                  </TouchableOpacity>

                  {marker.phone && (
                    <TouchableOpacity
                      style={styles.listActionSmallBtn}
                      onPress={() => handleCall(marker.phone)}
                    >
                      <Ionicons name="call-outline" size={14} color={Colors.primary} />
                      <Text style={[styles.listActionSmallText, { color: Colors.primary }]}>Call</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.listActionPrimaryBtn}
                    onPress={() => handleViewDetails(marker)}
                  >
                    <Text style={styles.listActionPrimaryText}>View</Text>
                    <Ionicons name="chevron-forward" size={12} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topControlBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.xs,
    zIndex: 20,
  },
  searchRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    alignItems: 'center',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 40,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.text,
  },
  viewToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    height: 40,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  viewToggleText: {
    color: '#FFFFFF',
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  filterPillsScroll: {
    gap: Spacing.xs,
    paddingVertical: 4,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  mapCanvasWrapper: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#E0F2FE', // Island ocean blue
    overflow: 'hidden',
  },
  mapCanvas: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  sriLankaTerrain: {
    position: 'absolute',
    top: '5%',
    left: '12%',
    right: '12%',
    bottom: '5%',
    backgroundColor: '#F6F8F3', // Landmass beige/green
    borderRadius: 80,
    borderWidth: 2,
    borderColor: '#C2E5D4',
  },
  regionLabel: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(23, 77, 55, 0.25)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  userGpsPin: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  userPulseRing: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(35, 148, 93, 0.25)',
    position: 'absolute',
  },
  userCoreDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.secondary,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userPinLabel: {
    position: 'absolute',
    top: 20,
    backgroundColor: 'rgba(23, 77, 55, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  userPinText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  markerPin: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    elevation: 4,
  },
  pinTriangle: {
    position: 'absolute',
    bottom: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#0F172A',
  },
  mapToolsRight: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    gap: Spacing.xs,
    zIndex: 30,
  },
  mapToolBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 3,
  },
  mapLegend: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    flexDirection: 'row',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    zIndex: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    color: Colors.text,
    fontWeight: '600',
  },
  detailDrawer: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    zIndex: 100,
    gap: Spacing.sm,
  },
  drawerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  drawerTitleCol: {
    flex: 1,
  },
  drawerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  drawerTypePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  drawerTypePillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  verifiedText: {
    fontSize: 10,
    color: Colors.secondary,
    fontWeight: '700',
  },
  drawerTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
  },
  drawerSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  closeDrawerBtn: {
    padding: 4,
  },
  drawerProximityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    gap: Spacing.md,
  },
  proxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  proxText: {
    fontSize: 11,
    color: Colors.text,
    fontWeight: '600',
  },
  drawerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 2,
  },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: Spacing.md,
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  directionsBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  callBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.farmerBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C2E5D4',
  },
  viewDetailsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  viewDetailsBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  listContainer: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl * 1.5,
  },
  listResultsHeader: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  listCardTop: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  listIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listInfoCol: {
    flex: 1,
  },
  listTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  listPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  listPillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  listSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  listDistText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  listActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.xs + 2,
  },
  listActionSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  listActionSmallText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text,
  },
  listActionPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    gap: 4,
  },
  listActionPrimaryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
