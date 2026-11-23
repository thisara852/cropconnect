import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../context/AuthContext';
import { FarmerProvider } from '../context/FarmerContext';
import { BuyerProvider } from '../context/BuyerContext';
import { AdminProvider } from '../context/AdminContext';
import { LocationProvider } from '../context/LocationContext';
import { PredictionProvider } from '../context/PredictionContext';
import { Colors } from '../constants/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <LocationProvider>
          <PredictionProvider>
            <FarmerProvider>
              <BuyerProvider>
                <AdminProvider>
                <StatusBar style="dark" />
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: Colors.background },
                    animation: 'slide_from_right',
                  }}
                >
                  {/* Phase 1 Auth Routes */}
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen name="welcome" options={{ headerShown: false }} />
                  <Stack.Screen name="login" options={{ headerShown: false }} />
                  <Stack.Screen name="register/role-select" options={{ headerShown: false }} />
                  <Stack.Screen name="register/farmer" options={{ headerShown: false }} />
                  <Stack.Screen name="register/buyer" options={{ headerShown: false }} />
                  <Stack.Screen name="admin/login" options={{ headerShown: false }} />
                  <Stack.Screen name="profile-setup" options={{ headerShown: false }} />
                  <Stack.Screen name="dashboard/farmer" options={{ headerShown: false, gestureEnabled: false }} />
                  <Stack.Screen name="dashboard/buyer" options={{ headerShown: false, gestureEnabled: false }} />
                  <Stack.Screen name="dashboard/admin" options={{ headerShown: false, gestureEnabled: false }} />

                  {/* Phase 2 Complete Farmer Module */}
                  <Stack.Screen name="(farmer)" options={{ headerShown: false, gestureEnabled: false }} />
                  <Stack.Screen name="farmer/crop-add" options={{ headerShown: false }} />
                  <Stack.Screen name="farmer/crop/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="farmer/crop-edit/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="farmer/buyer/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="farmer/compare-offers/[cropId]" options={{ headerShown: false }} />
                  <Stack.Screen name="farmer/price-history" options={{ headerShown: false }} />
                  <Stack.Screen name="farmer/notifications" options={{ headerShown: false }} />

                  {/* Phase 3 Complete Buyer Module */}
                  <Stack.Screen name="(buyer)" options={{ headerShown: false, gestureEnabled: false }} />
                  <Stack.Screen name="buyer/crop/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="buyer/make-offer/[cropId]" options={{ headerShown: false }} />
                  <Stack.Screen name="buyer/farmers" options={{ headerShown: false }} />
                  <Stack.Screen name="buyer/farmer/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="buyer/requirement-post" options={{ headerShown: false }} />
                  <Stack.Screen name="buyer/requirement-edit/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="buyer/saved" options={{ headerShown: false }} />
                  <Stack.Screen name="buyer/notifications" options={{ headerShown: false }} />

                  {/* Phase 4 Complete Admin Module */}
                  <Stack.Screen name="(admin)" options={{ headerShown: false, gestureEnabled: false }} />
                  <Stack.Screen name="admin/verifications" options={{ headerShown: false }} />
                  <Stack.Screen name="admin/farmer/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="admin/buyer/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="admin/offers" options={{ headerShown: false }} />
                  <Stack.Screen name="admin/prices" options={{ headerShown: false }} />
                  <Stack.Screen name="admin/complaints" options={{ headerShown: false }} />
                  <Stack.Screen name="admin/announcements" options={{ headerShown: false }} />

                  {/* Phase 5 Location-Based Matching & Interactive Map */}
                  <Stack.Screen name="map/index" options={{ headerShown: false }} />
                  <Stack.Screen name="farmer/nearby-buyers" options={{ headerShown: false }} />
                  <Stack.Screen name="buyer/nearby-farmers" options={{ headerShown: false }} />
                  <Stack.Screen name="settings/location" options={{ headerShown: false }} />

                  {/* Phase 6 AI-Powered Fair-Price Prediction System */}
                  <Stack.Screen name="prices/district-comparison" options={{ headerShown: false }} />
                  <Stack.Screen name="prices/offer-comparison" options={{ headerShown: false }} />
                  <Stack.Screen name="prices/alerts" options={{ headerShown: false }} />
                  <Stack.Screen name="prices/history" options={{ headerShown: false }} />
                  <Stack.Screen name="prices/prediction-history" options={{ headerShown: false }} />
                </Stack>
              </AdminProvider>
            </BuyerProvider>
          </FarmerProvider>
          </PredictionProvider>
        </LocationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
