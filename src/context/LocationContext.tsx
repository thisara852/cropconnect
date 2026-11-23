import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  GeoCoordinates,
  UserLocationPreference,
  LocationPermissionStatus,
} from '../types/location';
import { locationService, DISTRICT_COORDINATES } from '../services/locationService';

interface LocationContextType {
  userLocation: UserLocationPreference;
  permissionStatus: LocationPermissionStatus;
  isLoadingLocation: boolean;
  requestPermission: () => Promise<void>;
  updateUserDistrict: (district: string, townOrVillage?: string) => Promise<void>;
  updateLocationPreference: (updates: Partial<UserLocationPreference>) => Promise<void>;
  calculateDistanceTo: (targetCoords?: GeoCoordinates) => number | null;
  formatDistanceTo: (targetCoords?: GeoCoordinates) => string;
}

const defaultLocation: UserLocationPreference = {
  coords: DISTRICT_COORDINATES.dambulla,
  district: 'Dambulla',
  townOrVillage: 'Dedicated Economic Center Hub',
  useGps: false,
  permissionStatus: 'undetermined',
  shareLocationWithOthers: true,
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userLocation, setUserLocation] = useState<UserLocationPreference>(defaultLocation);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(true);

  // Restore saved location preference on startup
  useEffect(() => {
    const loadPref = async () => {
      try {
        const saved = await locationService.getUserLocationPreference();
        setUserLocation(saved);
      } catch {
        setUserLocation(defaultLocation);
      } finally {
        setIsLoadingLocation(false);
      }
    };
    loadPref();
  }, []);

  const requestPermission = useCallback(async () => {
    setIsLoadingLocation(true);
    try {
      const result = await locationService.requestDeviceLocation();
      let updated: UserLocationPreference;

      if (result.status === 'granted' && result.coords) {
        updated = {
          ...userLocation,
          coords: result.coords,
          useGps: true,
          permissionStatus: 'granted',
        };
      } else {
        updated = {
          ...userLocation,
          useGps: false,
          permissionStatus: 'denied',
        };
      }

      setUserLocation(updated);
      await locationService.saveUserLocationPreference(updated);
    } catch {
      const fallback: UserLocationPreference = {
        ...userLocation,
        useGps: false,
        permissionStatus: 'denied',
      };
      setUserLocation(fallback);
      await locationService.saveUserLocationPreference(fallback);
    } finally {
      setIsLoadingLocation(false);
    }
  }, [userLocation]);

  const updateUserDistrict = useCallback(
    async (district: string, townOrVillage?: string) => {
      const coords = locationService.getDistrictCoordinates(district);
      const updated: UserLocationPreference = {
        ...userLocation,
        district,
        townOrVillage: townOrVillage || userLocation.townOrVillage || `${district} Town`,
        coords,
        useGps: false,
      };
      setUserLocation(updated);
      await locationService.saveUserLocationPreference(updated);
    },
    [userLocation]
  );

  const updateLocationPreference = useCallback(
    async (updates: Partial<UserLocationPreference>) => {
      const updated: UserLocationPreference = {
        ...userLocation,
        ...updates,
      };
      setUserLocation(updated);
      await locationService.saveUserLocationPreference(updated);
    },
    [userLocation]
  );

  const calculateDistanceTo = useCallback(
    (targetCoords?: GeoCoordinates): number | null => {
      return locationService.calculateHaversineDistance(userLocation.coords, targetCoords);
    },
    [userLocation.coords]
  );

  const formatDistanceTo = useCallback(
    (targetCoords?: GeoCoordinates): string => {
      const dist = calculateDistanceTo(targetCoords);
      return locationService.formatDistance(dist);
    },
    [calculateDistanceTo]
  );

  return (
    <LocationContext.Provider
      value={{
        userLocation,
        permissionStatus: userLocation.permissionStatus,
        isLoadingLocation,
        requestPermission,
        updateUserDistrict,
        updateLocationPreference,
        calculateDistanceTo,
        formatDistanceTo,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
