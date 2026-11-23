import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

type SelectedRole = 'farmer' | 'buyer' | null;

export default function RoleSelectionScreen() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<SelectedRole>('farmer');

  const handleContinue = () => {
    if (selectedRole === 'farmer') {
      router.push('/register/farmer');
    } else if (selectedRole === 'buyer') {
      router.push('/register/buyer');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Create Account"
        subtitle="Choose how you want to participate in CROPCONNECT"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardsContainer}>
          {/* Farmer Role Card */}
          <Card
            onPress={() => setSelectedRole('farmer')}
            selected={selectedRole === 'farmer'}
            selectedBorderColor={Colors.secondary}
            style={styles.roleCard}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: '#EAF6F0' }]}>
                <Ionicons name="leaf" size={28} color={Colors.farmer} />
              </View>
              <View style={styles.radioContainer}>
                <View
                  style={[
                    styles.radioOuter,
                    selectedRole === 'farmer' && { borderColor: Colors.secondary },
                  ]}
                >
                  {selectedRole === 'farmer' && <View style={styles.radioInner} />}
                </View>
              </View>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.titleRow}>
                <Text style={styles.roleTitle}>I am a Farmer / Grower</Text>
                <View style={styles.badgeFarmer}>
                  <Text style={styles.badgeFarmerText}>PRODUCER</Text>
                </View>
              </View>

              <Text style={styles.roleDescription}>
                List upcoming or surplus vegetable, fruit, and paddy harvests. Get AI-recommended
                fair prices, avoid distress sales to middlemen, and connect directly with bulk buyers.
              </Text>

              {/* Highlights */}
              <View style={styles.featureList}>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.secondary} />
                  <Text style={styles.featureItemText}>Surplus distress rescue alerts</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.secondary} />
                  <Text style={styles.featureItemText}>Island-wide fair pricing intelligence</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.secondary} />
                  <Text style={styles.featureItemText}>Direct payment guarantee</Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Buyer Role Card */}
          <Card
            onPress={() => setSelectedRole('buyer')}
            selected={selectedRole === 'buyer'}
            selectedBorderColor={Colors.orange}
            style={styles.roleCard}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconContainer, { backgroundColor: '#FEF4E8' }]}>
                <Ionicons name="cart" size={28} color={Colors.orangeDark} />
              </View>
              <View style={styles.radioContainer}>
                <View
                  style={[
                    styles.radioOuter,
                    selectedRole === 'buyer' && { borderColor: Colors.orange },
                  ]}
                >
                  {selectedRole === 'buyer' && (
                    <View style={[styles.radioInner, { backgroundColor: Colors.orange }]} />
                  )}
                </View>
              </View>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.titleRow}>
                <Text style={styles.roleTitle}>I am an Agri-Buyer</Text>
                <View style={styles.badgeBuyer}>
                  <Text style={styles.badgeBuyerText}>COMMERCIAL</Text>
                </View>
              </View>

              <Text style={styles.roleDescription}>
                For supermarkets, exporters, food processors, restaurants, wholesalers, and retail merchants.
                Procure quality produce directly at source with transparent pricing and verified logistics.
              </Text>

              {/* Highlights */}
              <View style={styles.featureList}>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.orange} />
                  <Text style={styles.featureItemText}>Direct farm gate sourcing</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.orange} />
                  <Text style={styles.featureItemText}>Automated supply matching & alerts</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.orange} />
                  <Text style={styles.featureItemText}>Quality assurance & volume discounts</Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Notice on Administrator Restriction */}
          <View style={styles.adminNoticeBox}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.textMuted} />
            <Text style={styles.adminNoticeText}>
              Note: Government & Agricultural Authority Administrator accounts are strictly provisioned
              via authorized internal credentials and are not open for public registration.
            </Text>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.footerContainer}>
          <Button
            title={selectedRole === 'farmer' ? 'Register as Farmer' : 'Register as Buyer'}
            variant={selectedRole === 'farmer' ? 'primary' : 'orange'}
            size="large"
            iconName="arrow-forward"
            iconPosition="right"
            onPress={handleContinue}
          />

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already registered? </Text>
            <TouchableOpacity onPress={() => router.push('/login')} activeOpacity={0.7}>
              <Text style={styles.loginLink}>Log In</Text>
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
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  cardsContainer: {
    gap: 16,
    marginVertical: 12,
  },
  roleCard: {
    padding: 18,
    borderRadius: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioContainer: {
    padding: 4,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.secondary,
  },
  cardBody: {
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textDark,
  },
  badgeFarmer: {
    backgroundColor: Colors.farmerBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeFarmerText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.farmer,
  },
  badgeBuyer: {
    backgroundColor: Colors.buyerBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeBuyerText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.orangeDark,
  },
  roleDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  featureList: {
    marginTop: 8,
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F4EC',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureItemText: {
    fontSize: 12,
    color: Colors.textDark,
    fontWeight: '500',
  },
  adminNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 4,
  },
  adminNoticeText: {
    fontSize: 11,
    color: Colors.textMuted,
    flex: 1,
    lineHeight: 16,
  },
  footerContainer: {
    marginTop: 20,
    gap: 14,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  loginLink: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
});
