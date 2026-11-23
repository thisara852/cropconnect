export type UserRole = 'farmer' | 'buyer' | 'admin';

export interface UserProfile {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  phone: string;
  district: string;
  village?: string;             // For Farmer
  businessName?: string;        // For Buyer
  businessAddress?: string;     // For Buyer
  businessType?: string;        // For Buyer
  adminDepartment?: string;     // For Admin
  avatarUrl?: string;
  bio?: string;
  isProfileComplete: boolean;
  createdAt: string;
}

export interface FarmerRegistrationData {
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  district: string;
  village: string;
}

export interface BuyerRegistrationData {
  businessName: string;
  ownerName: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  businessAddress: string;
  district: string;
  businessType: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AdminLoginCredentials {
  email: string;
  passphrase: string;
  securityPin: string;
}

export interface AuthResponse {
  success: boolean;
  user?: UserProfile;
  message?: string;
}
