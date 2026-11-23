import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/theme';

export default function AdminDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Seamlessly forward to the complete Phase 4 Admin Tab Navigator
    router.replace('/(admin)' as any);
  }, [router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#D97706" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
