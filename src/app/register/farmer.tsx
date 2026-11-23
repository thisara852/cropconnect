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
import { SRI_LANKAN_DISTRICTS } from '../../constants/districts';

export default function FarmerRegistrationScreen() {
  const router = useRouter();
  const { registerFarmer } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [district, setDistrict] = useState('');
  const [village, setVillage] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Map districts to select options
  const districtOptions = SRI_LANKAN_DISTRICTS.map(d => ({
    label: d.name,
    value: d.name,
    subtitle: `${d.sinhalaName} • ${d.tamilName}`,
    meta: d.province,
  }));

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = 'Name must be at least 3 characters.';
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required.';
    } else if (!/^(?:0|\+94)7[0-9]{8}$/.test(phoneNumber.trim().replace(/[\s-]/g, ''))) {
      newErrors.phoneNumber = 'Enter a valid 10-digit Sri Lankan phone (e.g. 0771234567).';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
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

    if (!district) {
      newErrors.district = 'Please select your farming district.';
    }

    if (!village.trim()) {
      newErrors.village = 'Village or Grama Niladhari division is required.';
    }

    if (!agreeTerms) {
      newErrors.terms = 'You must agree to the Terms of Agricultural Service.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await registerFarmer({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        district,
        village: village.trim(),
      });

      if (response.success && response.user) {
        // Proceed to profile setup or dashboard
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
        title="Farmer Registration"
        subtitle="Join Sri Lanka's direct agricultural trade network"
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
          {/* Header Badge */}
          <View style={styles.roleBanner}>
            <View style={styles.bannerIcon}>
              <Ionicons name="leaf" size={24} color={Colors.farmer} />
            </View>
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>Farmer Account</Text>
              <Text style={styles.bannerSubtitle}>
                Sell harvested produce at fair prices without intermediate cuts.
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
              label="Full Name"
              placeholder="e.g. Sunil Bandara"
              value={fullName}
              onChangeText={text => {
                setFullName(text);
                if (errors.fullName) setErrors({ ...errors, fullName: '' });
              }}
              iconName="person-outline"
              error={errors.fullName}
              required
            />

            <Input
              label="Phone Number"
              placeholder="07X XXX XXXX"
              value={phoneNumber}
              onChangeText={text => {
                setPhoneNumber(text);
                if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: '' });
              }}
              iconName="call-outline"
              keyboardType="phone-pad"
              error={errors.phoneNumber}
              helperText="Used for crop dispatch and direct buyer communications."
              required
            />

            <Input
              label="Email Address"
              placeholder="sunil.bandara@example.com"
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
              label="Agricultural District"
              placeholder="Select your district (e.g. Anuradhapura)"
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
              label="Village / Farming Division"
              placeholder="e.g. Thambuttegama, Track 4"
              value={village}
              onChangeText={text => {
                setVillage(text);
                if (errors.village) setErrors({ ...errors, village: '' });
              }}
              iconName="home-outline"
              error={errors.village}
              helperText="Enables localized crop rescue and regional transport sharing."
              required
            />

            <Input
              label="Password"
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

            {/* Terms checkbox */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAgreeTerms(!agreeTerms)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={agreeTerms ? 'checkbox' : 'square-outline'}
                size={22}
                color={agreeTerms ? Colors.secondary : Colors.textMuted}
              />
              <Text style={styles.termsText}>
                I certify that I am a farmer / grower and agree to the{' '}
                <Text style={styles.termsHighlight}>Fair-Price Trade Terms</Text>.
              </Text>
            </TouchableOpacity>
            {errors.terms && <Text style={styles.termsError}>{errors.terms}</Text>}

            {/* Submit Button */}
            <Button
              title="Create Farmer Account"
              variant="primary"
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
    backgroundColor: Colors.farmerBg,
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C2E5D4',
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
    color: Colors.farmer,
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
