import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/theme';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { SelectModal } from '../../components/common/SelectModal';
import { SRI_LANKAN_DISTRICTS, BUYER_BUSINESS_TYPES } from '../../constants/districts';

export default function BuyerRegistrationScreen() {
  const router = useRouter();
  const { registerBuyer } = useAuth();

  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Map districts
  const districtOptions = SRI_LANKAN_DISTRICTS.map(d => ({
    label: d.name,
    value: d.name,
    subtitle: `${d.sinhalaName} • ${d.tamilName}`,
    meta: d.province,
  }));

  // Map business types
  const businessTypeOptions = BUYER_BUSINESS_TYPES.map(type => ({
    label: type,
    value: type,
  }));

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!businessName.trim()) {
      newErrors.businessName = 'Registered business or enterprise name is required.';
    } else if (businessName.trim().length < 2) {
      newErrors.businessName = 'Business name is too short.';
    }

    if (!ownerName.trim()) {
      newErrors.ownerName = 'Owner or procurement manager name is required.';
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required.';
    } else if (!/^(?:0|\+94)7[0-9]{8}$/.test(phoneNumber.trim().replace(/[\s-]/g, ''))) {
      newErrors.phoneNumber = 'Enter a valid 10-digit Sri Lankan phone (e.g. 0719876543).';
    }

    if (!email.trim()) {
      newErrors.email = 'Business email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!businessAddress.trim()) {
      newErrors.businessAddress = 'Business address or warehouse location is required.';
    } else if (businessAddress.trim().length < 5) {
      newErrors.businessAddress = 'Please enter a complete address.';
    }

    if (!district) {
      newErrors.district = 'Please select your operating district.';
    }

    if (!businessType) {
      newErrors.businessType = 'Please select your commercial category.';
    }

    if (!agreeTerms) {
      newErrors.terms = 'You must agree to the Commercial Buyer Agreement.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await registerBuyer({
        businessName: businessName.trim(),
        ownerName: ownerName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        businessAddress: businessAddress.trim(),
        district,
        businessType,
      });

      if (response.success && response.user) {
        router.replace('/profile-setup');
      } else {
        setErrors({ general: response.message || 'Registration failed. Please check your data.' });
      }
    } catch {
      setErrors({ general: 'Network connection error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Buyer Registration"
        subtitle="Source premium harvests directly from verified Sri Lankan growers"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Banner */}
          <View style={styles.roleBanner}>
            <View style={styles.bannerIcon}>
              <Ionicons name="cart" size={24} color={Colors.orangeDark} />
            </View>
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>Commercial Buyer Account</Text>
              <Text style={styles.bannerSubtitle}>
                Procure quality wholesale produce and bid on rescue lots.
              </Text>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {errors.general && (
              <View style={styles.generalErrorBanner}>
                <Ionicons name="alert-circle" size={18} color={Colors.error} />
                <Text style={styles.generalErrorText}>{errors.general}</Text>
              </View>
            )}

            <Input
              label="Business / Enterprise Name"
              placeholder="e.g. Lanka Fresh Supermarkets Ltd"
              value={businessName}
              onChangeText={text => {
                setBusinessName(text);
                if (errors.businessName) setErrors({ ...errors, businessName: '' });
              }}
              iconName="business-outline"
              error={errors.businessName}
              required
            />

            <SelectModal
              label="Business Type / Category"
              placeholder="Select commercial category"
              value={businessType}
              options={businessTypeOptions}
              onSelect={val => {
                setBusinessType(val);
                if (errors.businessType) setErrors({ ...errors, businessType: '' });
              }}
              iconName="cube-outline"
              error={errors.businessType}
              required
            />

            <Input
              label="Authorized Contact / Manager Name"
              placeholder="e.g. Dilshan Perera"
              value={ownerName}
              onChangeText={text => {
                setOwnerName(text);
                if (errors.ownerName) setErrors({ ...errors, ownerName: '' });
              }}
              iconName="person-outline"
              error={errors.ownerName}
              required
            />

            <Input
              label="Business Phone Number"
              placeholder="07X XXX XXXX"
              value={phoneNumber}
              onChangeText={text => {
                setPhoneNumber(text);
                if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: '' });
              }}
              iconName="call-outline"
              keyboardType="phone-pad"
              error={errors.phoneNumber}
              helperText="For order confirmations, logistics dispatch, and trade receipts."
              required
            />

            <Input
              label="Business Email Address"
              placeholder="procurement@lankafresh.lk"
              value={email}
              onChangeText={text => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              iconName="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              required
            />

            <SelectModal
              label="Headquarters / Sourcing District"
              placeholder="Select primary operating district"
              value={district}
              options={districtOptions}
              onSelect={val => {
                setDistrict(val);
                if (errors.district) setErrors({ ...errors, district: '' });
              }}
              iconName="location-outline"
              error={errors.district}
              required
            />

            <Input
              label="Business / Warehouse Address"
              placeholder="No, Street, City"
              value={businessAddress}
              onChangeText={text => {
                setBusinessAddress(text);
                if (errors.businessAddress) setErrors({ ...errors, businessAddress: '' });
              }}
              iconName="map-outline"
              error={errors.businessAddress}
              multiline
              numberOfLines={2}
              required
            />

            <Input
              label="Account Password"
              placeholder="At least 6 characters"
              value={password}
              onChangeText={text => {
                setPassword(text);
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
              iconName="lock-closed-outline"
              isPassword
              error={errors.password}
              required
            />

            <Input
              label="Confirm Password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChangeText={text => {
                setConfirmPassword(text);
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
              }}
              iconName="shield-checkmark-outline"
              isPassword
              error={errors.confirmPassword}
              required
            />

            {/* Terms Checkbox */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAgreeTerms(!agreeTerms)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={agreeTerms ? 'checkbox' : 'square-outline'}
                size={22}
                color={agreeTerms ? Colors.orange : Colors.textMuted}
              />
              <Text style={styles.termsText}>
                I certify that I represent this commercial enterprise and agree to the{' '}
                <Text style={styles.termsHighlight}>Direct Buyer Standards</Text>.
              </Text>
            </TouchableOpacity>
            {errors.terms && <Text style={styles.termsError}>{errors.terms}</Text>}

            {/* Submit Button */}
            <Button
              title="Create Buyer Account"
              variant="orange"
              size="large"
              isLoading={isLoading}
              onPress={handleRegister}
              style={{ marginTop: 14 }}
            />
          </View>

          {/* Bottom Login Link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already registered? </Text>
            <TouchableOpacity onPress={() => router.push('/login')} activeOpacity={0.7}>
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingBottom: 32,
  },
  roleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.buyerBg,
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F7D6A3',
    gap: 12,
  },
  bannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.orangeDark,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  formCard: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  generalErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.errorBg,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#F8B4B4',
  },
  generalErrorText: {
    fontSize: 13,
    color: Colors.error,
    flex: 1,
    fontWeight: '500',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
    marginBottom: 4,
    gap: 10,
  },
  termsText: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  termsHighlight: {
    color: Colors.primary,
    fontWeight: '700',
  },
  termsError: {
    fontSize: 12,
    color: Colors.error,
    marginBottom: 10,
    marginLeft: 32,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
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
