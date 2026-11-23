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

export default function AdminLoginScreen() {
  const router = useRouter();
  const { adminLogin } = useAuth();

  const [adminEmail, setAdminEmail] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [securityPin, setSecurityPin] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!adminEmail.trim()) {
      newErrors.adminEmail = 'Administrative email is required.';
    } else if (!adminEmail.trim().endsWith('@cropconnect.gov.lk')) {
      newErrors.adminEmail = 'Only authorized @cropconnect.gov.lk accounts can access this portal.';
    }

    if (!passphrase) {
      newErrors.passphrase = 'Administrative passphrase is required.';
    }

    if (!securityPin.trim()) {
      newErrors.securityPin = '4-digit Security PIN is required.';
    } else if (!/^\d{4}$/.test(securityPin.trim())) {
      newErrors.securityPin = 'PIN must be exactly 4 digits.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdminLogin = async () => {
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await adminLogin({
        email: adminEmail.trim(),
        passphrase,
        securityPin: securityPin.trim(),
      });

      if (response.success && response.user) {
        // Admin authorization granted
        router.replace('/dashboard/admin');
      } else {
        setErrors({ general: response.message || 'Authorization failed: Invalid admin credentials.' });
      }
    } catch {
      setErrors({ general: 'Administrative security service error.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Quick autofill for tester evaluation
  const fillDemoAdmin = () => {
    setAdminEmail('admin@cropconnect.gov.lk');
    setPassphrase('Admin#Pass2026');
    setSecurityPin('7492');
    setErrors({});
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Official Admin Portal"
        subtitle="Restricted to authorized Ministry & Agricultural Authority personnel"
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
          {/* Security Alert Banner */}
          <View style={styles.securityBanner}>
            <View style={styles.securityIconBox}>
              <Ionicons name="shield-checkmark" size={26} color={Colors.adminGold} />
            </View>
            <View style={styles.securityTextBox}>
              <Text style={styles.securityTitle}>Restricted Government & Oversight Zone</Text>
              <Text style={styles.securityDesc}>
                Public registration is strictly prohibited. All authorization attempts are logged
                with IP timestamping and audit trails.
              </Text>
            </View>
          </View>

          {/* Demo evaluation helper */}
          <View style={styles.demoBox}>
            <View style={styles.demoHeaderRow}>
              <Ionicons name="key" size={14} color={Colors.adminGold} />
              <Text style={styles.demoBoxTitle}>Evaluation Test Credentials</Text>
            </View>
            <Text style={styles.demoBoxInfo}>
              Authorized Admin: <Text style={styles.mono}>admin@cropconnect.gov.lk</Text>
            </Text>
            <TouchableOpacity
              style={styles.demoFillBtn}
              onPress={fillDemoAdmin}
              activeOpacity={0.7}
            >
              <Ionicons name="flash" size={12} color={Colors.white} />
              <Text style={styles.demoFillBtnText}>Autofill Admin Credentials</Text>
            </TouchableOpacity>
          </View>

          {/* Login Form */}
          <View style={styles.formCard}>
            {errors.general && (
              <View style={styles.generalErrorBanner}>
                <Ionicons name="warning" size={18} color={Colors.error} />
                <Text style={styles.generalErrorText}>{errors.general}</Text>
              </View>
            )}

            <Input
              label="Administrative Email (gov.lk)"
              placeholder="officer@cropconnect.gov.lk"
              value={adminEmail}
              onChangeText={text => {
                setAdminEmail(text);
                if (errors.adminEmail) setErrors({ ...errors, adminEmail: '' });
              }}
              iconName="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.adminEmail}
              helperText="Must match your designated government oversight email."
              required
            />

            <Input
              label="Administrative Passphrase"
              placeholder="Enter secure passphrase"
              value={passphrase}
              onChangeText={text => {
                setPassphrase(text);
                if (errors.passphrase) setErrors({ ...errors, passphrase: '' });
              }}
              iconName="lock-closed-outline"
              isPassword
              error={errors.passphrase}
              required
            />

            <Input
              label="4-Digit Security Hardware / MFA PIN"
              placeholder="e.g. 7492"
              value={securityPin}
              onChangeText={text => {
                setSecurityPin(text);
                if (errors.securityPin) setErrors({ ...errors, securityPin: '' });
              }}
              iconName="key-outline"
              keyboardType="number-pad"
              maxLength={4}
              error={errors.securityPin}
              helperText="Departmental multi-factor authentication token."
              required
            />

            {/* Submit Button */}
            <Button
              title="Authenticate & Access Admin Dashboard"
              variant="primary"
              size="large"
              isLoading={isLoading}
              onPress={handleAdminLogin}
              style={[styles.adminSubmitBtn, { backgroundColor: '#1E293B' }]}
            />
          </View>

          {/* Audit Notice */}
          <View style={styles.auditDisclaimer}>
            <Ionicons name="lock-closed" size={13} color={Colors.textMuted} />
            <Text style={styles.auditDisclaimerText}>
              CROPCONNECT Sri Lanka • System Access Control Policy v2.4
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F5F7',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    gap: 12,
  },
  securityIconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityTextBox: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 2,
  },
  securityDesc: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 15,
  },
  demoBox: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 6,
  },
  demoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  demoBoxTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  demoBoxInfo: {
    fontSize: 12,
    color: '#78350F',
  },
  mono: {
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  demoFillBtn: {
    backgroundColor: '#B45309',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  demoFillBtnText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
  adminSubmitBtn: {
    marginTop: 14,
  },
  auditDisclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
  },
  auditDisclaimerText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
});
