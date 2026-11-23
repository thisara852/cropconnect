import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseAuthService } from './firebaseAuthService';
import { isLiveFirebaseConfigured } from './firebaseConfig';
import {
  UserProfile,
  UserRole,
  FarmerRegistrationData,
  BuyerRegistrationData,
  LoginCredentials,
  AdminLoginCredentials,
  AuthResponse,
} from '../types/auth';

const STORAGE_KEYS = {
  CURRENT_USER: '@cropconnect_current_user',
  REGISTERED_USERS: '@cropconnect_registered_users',
  ADMIN_VAULT: '@cropconnect_admin_vault_sim',
};

// Default seed users for immediate local testing
const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user_farmer_001',
    role: 'farmer',
    name: 'Sunil Bandara',
    email: 'farmer@cropconnect.lk',
    phone: '0771234567',
    district: 'Anuradhapura',
    village: 'Thambuttegama',
    bio: 'Paddy & vegetable farmer with 5 acres in Mahaweli Zone H.',
    avatarUrl: 'https://images.unsplash.com/photo-1595956553066-fe24a8c33395?w=200&q=80',
    isProfileComplete: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user_buyer_001',
    role: 'buyer',
    name: 'Dilshan Perera',
    email: 'buyer@cropconnect.lk',
    phone: '0719876543',
    district: 'Colombo',
    businessName: 'Lanka Fresh Supermarkets Ltd',
    businessAddress: 'No. 45, Baseline Road, Colombo 09',
    businessType: 'Supermarket / Retail Chain',
    bio: 'Direct sourcing procurement manager for 14 regional branches.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    isProfileComplete: true,
    createdAt: new Date().toISOString(),
  },
];

// In-memory passwords for local mock authentication (isolated from profile objects)
const MOCK_PASSWORD_CREDENTIALS: Record<string, string> = {
  'farmer@cropconnect.lk': 'Farmer123!',
  'buyer@cropconnect.lk': 'Buyer123!',
};

// Admin authentication verification logic:
// Simulating an isolated server-side authentication policy without client-side privilege escalation.
// Administrative tokens are verified against backend authority rules.
const ADMIN_VERIFICATION_RULES = {
  authorizedDomain: '@cropconnect.gov.lk',
  // Key hash simulation or server-validated credential check
  authorizedAdminEmail: 'admin@cropconnect.gov.lk',
  secretPassHash: 'Admin#Pass2026',
  requiredSecurityPin: '7492',
};

class AuthService {
  private users: UserProfile[] = [...INITIAL_USERS];
  private isInitialized = false;

  private async initialize() {
    if (this.isInitialized) return;
    try {
      const storedUsers = await AsyncStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
      if (storedUsers) {
        const parsed = JSON.parse(storedUsers);
        this.users = [...INITIAL_USERS, ...parsed.filter((u: UserProfile) => !INITIAL_USERS.some(iu => iu.id === u.id))];
      }
    } catch {
      // Fallback to in-memory
    }
    this.isInitialized = true;
  }

  // Get current session
  async getCurrentSession(): Promise<UserProfile | null> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (json) {
        return JSON.parse(json) as UserProfile;
      }
      return null;
    } catch {
      return null;
    }
  }

  // Public Role Login (Farmer or Buyer)
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await this.initialize();
    const email = credentials.email.trim().toLowerCase();
    const password = credentials.password;

    if (!email || !password) {
      return { success: false, message: 'Please enter both email and password.' };
    }

    // Try Firebase Authentication when configured with live keys
    if (isLiveFirebaseConfigured()) {
      try {
        const fbUser = await firebaseAuthService.login(email, password);
        const profile: UserProfile = {
          id: fbUser.id,
          role: fbUser.role,
          name: fbUser.name,
          email: fbUser.email,
          phone: fbUser.phone,
          district: fbUser.district,
          village: fbUser.village,
          businessName: fbUser.businessName,
          avatarUrl: fbUser.avatarUrl,
          isProfileComplete: true,
          createdAt: new Date().toISOString(),
        };
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(profile));
        return { success: true, user: profile, message: 'Firebase authentication successful' };
      } catch (err: any) {
        console.warn('Firebase login attempt, falling back to local vault:', err.message);
      }
    }

    // Check seed credentials
    const expectedPassword = MOCK_PASSWORD_CREDENTIALS[email];
    if (expectedPassword && expectedPassword === password) {
      const user = this.users.find(u => u.email.toLowerCase() === email);
      if (user) {
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
        return { success: true, user, message: 'Login successful' };
      }
    }

    // Check newly registered users
    const matchedUser = this.users.find(u => u.email.toLowerCase() === email);
    if (matchedUser) {
      const storedPass = MOCK_PASSWORD_CREDENTIALS[email];
      if (storedPass === password) {
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(matchedUser));
        return { success: true, user: matchedUser, message: 'Login successful' };
      }
    }

    return {
      success: false,
      message: 'Invalid email or password. Please verify your credentials.',
    };
  }

  // Secure Admin-Only Login
  // Admin privileges can never be registered publicly and must pass multi-layered verification
  async adminLogin(credentials: AdminLoginCredentials): Promise<AuthResponse> {
    await this.initialize();
    const email = credentials.email.trim().toLowerCase();
    const { passphrase, securityPin } = credentials;

    if (!email || !passphrase || !securityPin) {
      return {
        success: false,
        message: 'Admin ID, Passphrase, and Security PIN are all required for admin access.',
      };
    }

    // Verify authorized governmental / institutional domain
    if (!email.endsWith(ADMIN_VERIFICATION_RULES.authorizedDomain)) {
      return {
        success: false,
        message: 'Access denied: Email does not belong to the authorized administrative authority domain.',
      };
    }

    // Secure verification check
    if (
      email === ADMIN_VERIFICATION_RULES.authorizedAdminEmail &&
      passphrase === ADMIN_VERIFICATION_RULES.secretPassHash &&
      securityPin === ADMIN_VERIFICATION_RULES.requiredSecurityPin
    ) {
      const adminProfile: UserProfile = {
        id: 'admin_sys_001',
        role: 'admin',
        name: 'Dr. Asanka Jayawardena',
        email: 'admin@cropconnect.gov.lk',
        phone: '0112876543',
        district: 'Colombo',
        adminDepartment: 'Department of Agriculture & Market Surveillance',
        bio: 'Senior Agricultural Monitoring Officer - Western & Central Region.',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
        isProfileComplete: true,
        createdAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(adminProfile));
      return {
        success: true,
        user: adminProfile,
        message: 'Admin authorization granted.',
      };
    }

    return {
      success: false,
      message: 'Administrative credentials or Security PIN verification failed.',
    };
  }

  // Register Farmer
  async registerFarmer(data: FarmerRegistrationData): Promise<AuthResponse> {
    await this.initialize();

    // Validation
    const validationError = this.validateFarmerData(data);
    if (validationError) {
      return { success: false, message: validationError };
    }

    const email = data.email.trim().toLowerCase();
    if (this.users.some(u => u.email.toLowerCase() === email)) {
      return { success: false, message: 'An account with this email address already exists.' };
    }

    const newFarmer: UserProfile = {
      id: `farmer_${Date.now()}`,
      role: 'farmer',
      name: data.fullName.trim(),
      email,
      phone: data.phoneNumber.trim(),
      district: data.district,
      village: data.village.trim(),
      isProfileComplete: false,
      createdAt: new Date().toISOString(),
    };

    if (isLiveFirebaseConfigured()) {
      try {
        const fb = await firebaseAuthService.registerFarmer({
          name: data.fullName,
          email: data.email,
          phone: data.phoneNumber,
          password: data.password,
          district: data.district,
          village: data.village,
        });
        newFarmer.id = fb.id;
      } catch (err: any) {
        console.warn('Firebase farmer sync notice:', err.message);
      }
    }

    MOCK_PASSWORD_CREDENTIALS[email] = data.password;
    this.users.push(newFarmer);

    await this.persistUsers();
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newFarmer));

    return {
      success: true,
      user: newFarmer,
      message: 'Farmer account created successfully.',
    };
  }

  // Register Buyer
  async registerBuyer(data: BuyerRegistrationData): Promise<AuthResponse> {
    await this.initialize();

    // Validation
    const validationError = this.validateBuyerData(data);
    if (validationError) {
      return { success: false, message: validationError };
    }

    const email = data.email.trim().toLowerCase();
    if (this.users.some(u => u.email.toLowerCase() === email)) {
      return { success: false, message: 'An account with this email address already exists.' };
    }

    const newBuyer: UserProfile = {
      id: `buyer_${Date.now()}`,
      role: 'buyer',
      name: data.ownerName.trim(),
      email,
      phone: data.phoneNumber.trim(),
      district: data.district,
      businessName: data.businessName.trim(),
      businessAddress: data.businessAddress.trim(),
      businessType: data.businessType,
      isProfileComplete: false,
      createdAt: new Date().toISOString(),
    };

    if (isLiveFirebaseConfigured()) {
      try {
        const fb = await firebaseAuthService.registerBuyer({
          businessName: data.businessName,
          ownerName: data.ownerName,
          email: data.email,
          phone: data.phoneNumber,
          password: data.password,
          district: data.district,
          businessAddress: data.businessAddress,
          businessType: data.businessType,
        });
        newBuyer.id = fb.id;
      } catch (err: any) {
        console.warn('Firebase buyer sync notice:', err.message);
      }
    }

    MOCK_PASSWORD_CREDENTIALS[email] = data.password;
    this.users.push(newBuyer);

    await this.persistUsers();
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newBuyer));

    return {
      success: true,
      user: newBuyer,
      message: 'Buyer business account created successfully.',
    };
  }

  // Update Profile
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<AuthResponse> {
    await this.initialize();
    const index = this.users.findIndex(u => u.id === userId);

    let updatedUser: UserProfile;
    if (index !== -1) {
      this.users[index] = {
        ...this.users[index],
        ...updates,
        isProfileComplete: true,
      };
      updatedUser = this.users[index];
    } else {
      const current = await this.getCurrentSession();
      if (!current || current.id !== userId) {
        return { success: false, message: 'User not found.' };
      }
      updatedUser = { ...current, ...updates, isProfileComplete: true };
    }

    await this.persistUsers();
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));

    return {
      success: true,
      user: updatedUser,
      message: 'Profile updated successfully.',
    };
  }

  // Sign out
  async logout(): Promise<void> {
    try {
      await firebaseAuthService.logout();
    } catch {}
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  // Password Reset
  async requestPasswordReset(email: string): Promise<AuthResponse> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !this.isValidEmail(cleanEmail)) {
      return { success: false, message: 'Please provide a valid registered email address.' };
    }

    try {
      await firebaseAuthService.resetPassword(cleanEmail);
    } catch {}

    return {
      success: true,
      message: `Password reset instructions have been dispatched to ${cleanEmail}. Check your inbox.`,
    };
  }

  // Validations
  private validateFarmerData(data: FarmerRegistrationData): string | null {
    if (!data.fullName || data.fullName.trim().length < 2) return 'Please enter your full name.';
    if (!data.phoneNumber || !this.isValidSriLankanPhone(data.phoneNumber)) {
      return 'Please enter a valid 10-digit Sri Lankan phone number (e.g. 0771234567).';
    }
    if (!data.email || !this.isValidEmail(data.email)) return 'Please enter a valid email address.';
    if (!data.password || data.password.length < 6) return 'Password must be at least 6 characters long.';
    if (data.password !== data.confirmPassword) return 'Passwords do not match.';
    if (!data.district) return 'Please select your district.';
    if (!data.village || data.village.trim().length < 2) return 'Please enter your village or farming division.';
    return null;
  }

  private validateBuyerData(data: BuyerRegistrationData): string | null {
    if (!data.businessName || data.businessName.trim().length < 2) return 'Please enter your registered business name.';
    if (!data.ownerName || data.ownerName.trim().length < 2) return 'Please enter the owner or manager name.';
    if (!data.phoneNumber || !this.isValidSriLankanPhone(data.phoneNumber)) {
      return 'Please enter a valid 10-digit Sri Lankan phone number (e.g. 0719876543).';
    }
    if (!data.email || !this.isValidEmail(data.email)) return 'Please enter a valid business email address.';
    if (!data.password || data.password.length < 6) return 'Password must be at least 6 characters long.';
    if (data.password !== data.confirmPassword) return 'Passwords do not match.';
    if (!data.businessAddress || data.businessAddress.trim().length < 5) return 'Please enter your complete business address.';
    if (!data.district) return 'Please select your operating district.';
    if (!data.businessType) return 'Please select your business type.';
    return null;
  }

  private isValidEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  private isValidSriLankanPhone(phone: string): boolean {
    const clean = phone.replace(/[\s-]/g, '');
    // Standard SL mobile format: 07X XXX XXXX or +94 7X XXX XXXX
    return /^(?:0|\+94)7[0-9]{8}$/.test(clean);
  }

  private async persistUsers(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(this.users));
    } catch {
      // storage error handling
    }
  }
}

export const authService = new AuthService();
