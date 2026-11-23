import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';
import { Button } from '../components/common/Button';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Agricultural Hero Visual */}
        <View style={styles.heroBanner}>
          <View style={styles.heroSun} />
          <View style={styles.heroHillsBack} />
          <View style={styles.heroHillsFront} />

          <View style={styles.heroBadgeContainer}>
            <View style={styles.badgePill}>
              <Text style={styles.badgePillText}>SRI LANKA AGRI NETWORK</Text>
            </View>
          </View>

          {/* Icon Composition */}
          <View style={styles.heroIllustration}>
            <View style={styles.leafCircle}>
              <Ionicons name="leaf" size={48} color={Colors.white} />
            </View>
            <View style={styles.subIconLeft}>
              <Ionicons name="nutrition" size={20} color={Colors.orange} />
            </View>
            <View style={styles.subIconRight}>
              <Ionicons name="trending-up" size={20} color={Colors.secondary} />
            </View>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          {/* Tri-lingual Sri Lankan Greeting */}
          <View style={styles.greetingBadge}>
            <Text style={styles.greetingText}>ආයුබෝවන් • வணக்கம் • Welcome</Text>
          </View>

          <Text style={styles.mainTitle}>
            Fair Prices for Farmers, Fresh Harvests for Buyers
          </Text>

          <Text style={styles.subtitle}>
            CROPCONNECT bridges Sri Lankan farmers experiencing surplus harvest with verified
            commercial buyers through fair-pricing algorithms to eradicate crop wastage.
          </Text>

          {/* Key Value Cards */}
          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <View style={[styles.featureIconBox, { backgroundColor: '#EAF6F0' }]}>
                <Ionicons name="time" size={20} color={Colors.primary} />
              </View>
              <View style={styles.featureTextBox}>
                <Text style={styles.featureTitle}>Crop Rescue Alerts</Text>
                <Text style={styles.featureDesc}>
                  Rapid matching for perishable surpluses before spoil.
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.featureIconBox, { backgroundColor: '#FEF4E8' }]}>
                <Ionicons name="pricetag" size={20} color={Colors.orangeDark} />
              </View>
              <View style={styles.featureTextBox}>
                <Text style={styles.featureTitle}>Fair-Price Matcher</Text>
                <Text style={styles.featureDesc}>
                  Real-time market intelligence benchmarked across all 25 districts.
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              title="Get Started"
              variant="primary"
              size="large"
              iconName="arrow-forward"
              iconPosition="right"
              onPress={() => router.push('/register/role-select')}
            />

            <Button
              title="I Already Have an Account"
              variant="outline"
              size="large"
              style={{ marginTop: 12 }}
              onPress={() => router.push('/login')}
            />
          </View>

          {/* Discreet Admin Portal Entrance */}
          <View style={styles.adminAccessRow}>
            <Ionicons name="shield-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.adminAccessLabel}>Agricultural Authority Staff? </Text>
            <TouchableOpacity
              onPress={() => router.push('/admin/login')}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.adminAccessLink}>Admin Portal</Text>
            </TouchableOpacity>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  heroBanner: {
    height: 230,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSun: {
    position: 'absolute',
    top: 25,
    right: 40,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.orange,
    opacity: 0.85,
  },
  heroHillsBack: {
    position: 'absolute',
    bottom: -30,
    left: -40,
    width: width + 80,
    height: 120,
    borderRadius: 100,
    backgroundColor: '#1C5B42',
  },
  heroHillsFront: {
    position: 'absolute',
    bottom: -50,
    right: -20,
    width: width + 40,
    height: 110,
    borderRadius: 90,
    backgroundColor: Colors.secondary,
    opacity: 0.5,
  },
  heroBadgeContainer: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
  },
  badgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  badgePillText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroIllustration: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 20,
  },
  leafCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  subIconLeft: {
    position: 'absolute',
    left: -20,
    top: 20,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subIconRight: {
    position: 'absolute',
    right: -20,
    top: 20,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contentSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
    alignItems: 'center',
  },
  greetingBadge: {
    backgroundColor: '#EAF6F0',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBE7DA',
    marginBottom: 12,
  },
  greetingText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textDark,
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  featuresGrid: {
    width: '100%',
    gap: 12,
    marginBottom: 28,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  featureIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTextBox: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 20,
  },
  adminAccessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  adminAccessLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  adminAccessLink: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
});
