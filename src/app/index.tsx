import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Logo entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim, scaleAnim, pulseAnim]);

  // Navigate after loading check
  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      if (user) {
        if (!user.isProfileComplete) {
          router.replace('/profile-setup');
        } else if (user.role === 'farmer') {
          router.replace('/dashboard/farmer');
        } else if (user.role === 'buyer') {
          router.replace('/dashboard/buyer');
        } else if (user.role === 'admin') {
          router.replace('/dashboard/admin');
        } else {
          router.replace('/welcome');
        }
      } else {
        router.replace('/welcome');
      }
    }, 1800);

    return () => clearTimeout(timer);
  }, [isLoading, user, router]);

  const handleManualContinue = () => {
    if (user) {
      if (user.role === 'farmer') router.replace('/dashboard/farmer');
      else if (user.role === 'buyer') router.replace('/dashboard/buyer');
      else if (user.role === 'admin') router.replace('/dashboard/admin');
      else router.replace('/welcome');
    } else {
      router.replace('/welcome');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundDecorTop} />
      <View style={styles.backgroundDecorBottom} />

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.brandWrapper,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Animated Agricultural Shield Icon */}
          <Animated.View
            style={[
              styles.iconWrapper,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="leaf" size={54} color={Colors.primary} />
              <View style={styles.aiBadge}>
                <Ionicons name="flash" size={16} color={Colors.white} />
              </View>
            </View>
          </Animated.View>

          {/* App Title */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>
              CROP<Text style={styles.titleOrange}>CONNECT</Text>
            </Text>

            <View style={styles.countryTag}>
              <Text style={styles.flag}>🇱🇰</Text>
              <Text style={styles.countryTagText}>SRI LANKA AGRI-INTELLIGENCE</Text>
            </View>

            <Text style={styles.tagline}>
              AI-Powered Crop Rescue & Fair-Price Matcher
            </Text>
          </View>
        </Animated.View>

        {/* Agricultural Pillars */}
        <Animated.View style={[styles.pillarsRow, { opacity: fadeAnim }]}>
          <View style={styles.pillarItem}>
            <View style={styles.pillarIcon}>
              <Ionicons name="shield-checkmark" size={18} color={Colors.secondary} />
            </View>
            <Text style={styles.pillarText}>Surplus Rescue</Text>
          </View>

          <View style={styles.pillarDivider} />

          <View style={styles.pillarItem}>
            <View style={styles.pillarIcon}>
              <Ionicons name="analytics" size={18} color={Colors.orange} />
            </View>
            <Text style={styles.pillarText}>Fair Pricing</Text>
          </View>

          <View style={styles.pillarDivider} />

          <View style={styles.pillarItem}>
            <View style={styles.pillarIcon}>
              <Ionicons name="link" size={18} color={Colors.secondary} />
            </View>
            <Text style={styles.pillarText}>Direct Match</Text>
          </View>
        </Animated.View>
      </View>

      {/* Footer loading indicator */}
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={Colors.secondary} />
        <Text style={styles.loadingText}>Initializing agricultural network...</Text>

        <TouchableOpacity
          onPress={handleManualContinue}
          style={styles.skipButton}
          activeOpacity={0.7}
        >
          <Text style={styles.skipButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={14} color={Colors.secondary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 24,
  },
  backgroundDecorTop: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#E6EFEA',
    opacity: 0.6,
  },
  backgroundDecorBottom: {
    position: 'absolute',
    bottom: -100,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#FAF0E1',
    opacity: 0.5,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    width: '100%',
  },
  brandWrapper: {
    alignItems: 'center',
  },
  iconWrapper: {
    marginBottom: 20,
  },
  iconCircle: {
    width: 104,
    height: 104,
    borderRadius: 32,
    backgroundColor: '#EAF6F0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#C2E5D4',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
    position: 'relative',
  },
  aiBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: Colors.orange,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 1,
  },
  titleOrange: {
    color: Colors.orange,
  },
  countryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF6F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: '#CBE7DA',
  },
  flag: {
    fontSize: 12,
  },
  countryTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.8,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: width * 0.8,
    lineHeight: 20,
    marginTop: 2,
  },
  pillarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    backgroundColor: Colors.white,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  pillarItem: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  pillarIcon: {
    marginBottom: 4,
  },
  pillarText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textDark,
  },
  pillarDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  footer: {
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  skipButtonText: {
    fontSize: 13,
    color: Colors.secondary,
    fontWeight: '600',
  },
});
