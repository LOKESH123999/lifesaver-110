import { Request } from 'express';
import { 
  IUserDocument, 
  IDonorDocument, 
  IHospitalDocument, 
  IBloodRequestDocument, 
  ICallLogDocument, 
  ISettingsDocument 
} from '../models';

// Re-export model interfaces for use across application
export {
  IUserDocument,
  IDonorDocument,
  IHospitalDocument,
  IBloodRequestDocument,
  ICallLogDocument,
  ISettingsDocument
};

// Common types used across the application
export type UserRole = 'DONOR' | 'HOSPITAL' | 'ADMIN';
export type DonorType = 'student' | 'citizen';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type UrgencyLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type BloodRequestStatus = 'PENDING' | 'CALLING' | 'PARTIALLY_FULFILLED' | 'FULFILLED' | 'CLOSED';
export type CallStatus = 'QUEUED' | 'RINGING' | 'ANSWERED' | 'NO_ANSWER' | 'FAILED';
export type DonorResponse = 'YES' | 'NO' | 'NO_RESPONSE';

// Request/Response types for API
export interface AuthRequest extends Request {
  user?: IUserDocument;
}

export interface AuthenticatedRequest extends Request {
  user?: IUserDocument;
}

export interface DonorRegistrationData {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  donorType: DonorType;
  collegeName?: string;
  studentId?: string;
  city: string;
  area: string;
  bloodGroup: BloodGroup;
  lastDonationDate?: Date;
  consentToCalls: boolean;
}

export interface HospitalRegistrationData {
  hospitalName: string;
  officialEmail: string;
  password: string;
  address: string;
  city: string;
  area: string;
  contactNumber: string;
}

export interface BloodRequestData {
  patientCode: string;
  bloodGroupRequired: BloodGroup;
  unitsRequired: number;
  urgencyLevel: UrgencyLevel;
  city: string;
  area: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
  profile?: any;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Matching algorithm types
export interface DonorMatchCriteria {
  bloodGroup: BloodGroup;
  city: string;
  area: string;
  unitsNeeded: number;
}

export interface DonorMatchResult {
  donor: IDonorDocument;
  score: number;
  distance?: number;
  lastDonationDaysAgo?: number;
}

// Statistics types
export interface DashboardStats {
  totalDonors: number;
  activeDonors: number;
  totalHospitals: number;
  verifiedHospitals: number;
  totalRequests: number;
  pendingRequests: number;
  fulfilledRequests: number;
  averageResponseRate: number;
}

export interface DonorStats {
  totalDonations: number;
  lastDonationDate?: Date;
  eligibilityStatus: boolean;
  callsReceivedThisMonth: number;
  responseRate: number;
}

export interface HospitalStats {
  totalRequests: number;
  fulfilledRequests: number;
  averageFulfillmentTime: number;
  successRate: number;
}
