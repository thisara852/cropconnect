import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../constants/theme';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Logo } from '../components/common/Logo';

export default function LoginScreen() {
  const router = useRouter();
  const { login, requestPasswordReset } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string; general?: string } = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await login({ email: email.trim(), password });
      if (response.success && response.user) {
        // Role-based navigation
        if (!response.user.isProfileComplete) {
          router.replace('/profile-setup');
        } else if (response.user.role === 'farmer') {
          router.replace('/dashboard/farmer');
        } else if (response.user.role === 'buyer') {
          router.replace('/dashboard/buyer');
        } else if (response.user.role === 'admin') {
          router.replace('/dashboard/admin');
        } else {
          router.replace('/welcome');
        }
      } else {
        setErrors({ general: response.message || 'Login failed. Please check credentials.' });
      }
    } catch {
      setErrors({ general: 'A network error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async () => {
    if (!forgotEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail.trim())) {
      Alert.alert('Invalid Email', 'Please provide a valid registered email address.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await requestPasswordReset(forgotEmail.trim());
      setForgotMessage(res.message || 'Password reset link sent to your email.');
    } catch {
      Alert.alert('Error', 'Unable to process reset request at this time.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Quick autofill for tester convenience
  const fillCredentials = (type: 'farmer' | 'buyer') => {
    if (type === 'farmer') {
      setEmail('farmer@cropconnect.lk');
      setPassword('Farmer123!');
    } else {
      setEmail('buyer@cropconnect.lk');
      setPassword('Buyer123!');
    }
    setErrors({});
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Bar with Back */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={22} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Logo Header */}
          <View style={styles.logoHeader}>
            <Logo size="medium" showTagline={false} />
            <Text style={styles.welcomeTitle}>Welcome Back</Text>
            <Text style={styles.welcomeSubtitle}>
              Log in to your agricultural account to access markets and rescue alerts.
            </Text>
          </View>

          {/* Quick Demo Switcher */}
          <View style={styles.demoCard}>
            <Text style={styles.demoLabel}>Demo Accounts for Testing:</Text>
            <View style={styles.demoPillsRow}>
              <TouchableOpacity
                style={styles.demoPillFarmer}
                onPress={() => fillCredentials('farmer')}
                activeOpacity={0.7}
              >
                <Ionicons name="leaf" size={14} color={Colors.farmer} />
                <Text style={styles.demoPillFarmerText}>Fill Farmer Demo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.demoPillBuyer}
                onPress={() => fillCredentials('buyer')}
                activeOpacity={0.7}
              >
                <Ionicons name="cart" size={14} color={Colors.orangeDark} />
                <Text style={styles.demoPillBuyerText}>Fill Buyer Demo</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            {errors.general && (
              <View style={styles.generalErrorBanner}>
                <Ionicons name="alert-circle" size={18} color={Colors.error} />
                <Text style={styles.generalErrorText}>{errors.general}</Text>
              </View>
            )}

            <Input
              label="Email Address"
              placeholder="e.g. farmer@cropconnect.lk"
              value={email}
              onChangeText={text => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              iconName="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              required
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={text => {
                setPassword(text);
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
              iconName="lock-closed-outline"
              isPassword
              error={errors.password}
              required
            />

            {/* Forgot Password Action */}
            <View style={styles.forgotRow}>
              <TouchableOpacity
                onPress={() => {
                  setForgotEmail(email);
                  setForgotMessage(null);
                  setShowForgotModal(true);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <Button
              title="Log In"
              variant="primary"
              size="large"
              isLoading={isLoading}
              onPress={handleLogin}
              style={{ marginTop: 8 }}
            />

            {/* Register Link */}
            <View style={styles.registerRow}>
              <Text style={styles.registerPrompt}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => router.push('/register/role-select')}
                activeOpacity={0.7}
              >
                <Text style={styles.registerLink}>Register Here</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Secure Admin Link */}
          <View style={styles.adminFooter}>
            <TouchableOpacity
              style={styles.adminFooterBtn}
              onPress={() => router.push('/admin/login')}
              activeOpacity={0.7}
            >
              <Ionicons name="shield-checkmark" size={15} color={Colors.textMuted} />
              <Text style={styles.adminFooterText}>Official Administration Portal</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Forgot Password Modal */}
      <Modal
        visible={showForgotModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowForgotModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconBox}>
              <Ionicons name="key-outline" size={32} color={Colors.primary} />
            </View>

            <Text style={styles.modalTitle}>Reset Your Password</Text>
            <Text style={styles.modalDesc}>
              Enter your registered email address and we'll send you recovery instructions.
            </Text>

            {forgotMessage ? (
              <View style={styles.resetSuccessBox}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                <Text style={styles.resetSuccessText}>{forgotMessage}</Text>
                <Button
                  title="Done"
                  variant="primary"
                  size="medium"
                  onPress={() => setShowForgotModal(false)}
                  style={{ marginTop: 12 }}
                />
              </View>
            ) : (
              <>
                <Input
                  label="Registered Email"
                  placeholder="name@example.com"
                  value={forgotEmail}
                  onChangeText={setForgotEmail}
                  iconName="mail-outline"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <View style={styles.modalBtnRow}>
                  <Button
                    title="Cancel"
                    variant="outline"
                    size="medium"
                    style={{ flex: 1 }}
                    onPress={() => setShowForgotModal(false)}
                  />
                  <Button
                    title="Send Link"
                    variant="primary"
                    size="medium"
                    isLoading={forgotLoading}
                    style={{ flex: 1 }}
                    onPress={handleForgotPasswordSubmit}
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  topBar: {
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logoHeader: {
    alignItems: 'center',
    marginVertical: 14,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textDark,
    marginTop: 16,
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 320,
  },
  demoCard: {
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  demoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  demoPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoPillFarmer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.farmerBg,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#C3E5D4',
  },
  demoPillFarmerText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.farmer,
  },
  demoPillBuyer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.buyerBg,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#F7DDBE',
  },
  demoPillBuyerText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.orangeDark,
  },
  formContainer: {
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
  forgotRow: {
    alignItems: 'flex-end',
    marginBottom: 16,
    marginTop: -4,
  },
  forgotText: {
    fontSize: 13,
    color: Colors.secondary,
    fontWeight: '600',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerPrompt: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  adminFooter: {
    marginTop: 24,
    alignItems: 'center',
  },
  adminFooterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  adminFooterText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  modalIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EAF6F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 6,
  },
  modalDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 8,
  },
  resetSuccessBox: {
    alignItems: 'center',
    backgroundColor: Colors.successBg,
    padding: 16,
    borderRadius: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: '#C2EED3',
  },
  resetSuccessText: {
    fontSize: 13,
    color: Colors.success,
    textAlign: 'center',
    marginVertical: 8,
    fontWeight: '500',
  },
});
