export interface User {
  _id: string
  email: string
  role: 'DONOR' | 'HOSPITAL' | 'ADMIN'
  donorId?: string
  hospitalId?: string
}

export interface Donor {
  _id: string
  fullName: string
  email: string
  phoneNumber: string
  donorType: 'student' | 'citizen'
  collegeName?: string
  studentId?: string
  bloodGroup: string
  city: string
  area: string
  lastDonationDate?: string
  isEligible: boolean
  isActive: boolean
  consentToCalls: boolean
}

export interface Hospital {
  _id: string
  hospitalName: string
  officialEmail: string
  address: string
  city: string
  area: string
  contactNumber: string
  isVerified: boolean
  createdAt: string
}

export interface BloodRequest {
  _id: string
  hospitalId: string
  patientCode: string
  bloodGroupRequired: string
  unitsRequired: number
  urgencyLevel: 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'PENDING' | 'CALLING' | 'PARTIALLY_FULFILLED' | 'FULFILLED' | 'CLOSED'
  city: string
  area: string
  createdAt: string
  matchedDonors?: DonorResponse[]
  callLogIds?: string[]
}

export interface DonorResponse {
  donorId: string
  fullName: string
  phoneNumber: string
  city: string
  area: string
  bloodGroup: string
  lastDonationDate?: string
  twilioCallUrl?: string
}

export interface CallLog {
  _id: string
  bloodRequestId: string
  donorId: string
  callStatus: 'QUEUED' | 'RINGING' | 'ANSWERED' | 'NO_ANSWER' | 'FAILED'
  donorResponse: 'YES' | 'NO' | 'NO_RESPONSE'
  callStartedAt?: string
  callEndedAt?: string
  response: 'YES' | 'NO' | 'NO_RESPONSE'
}

export interface AuthContextType {
  user: User | null
  token: string | null
  role: 'DONOR' | 'HOSPITAL' | 'ADMIN' | null
  login: (token: string, user: User) => void
  logout: () => void
  isAuthenticated: boolean
  loading: boolean
}
