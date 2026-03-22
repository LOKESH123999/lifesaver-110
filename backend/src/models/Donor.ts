import mongoose, { Document, Schema } from 'mongoose';

export interface IDonorDocument extends Document {
  fullName: string;
  email: string;
  phoneNumber: string;
  donorType: 'student' | 'citizen';
  collegeName?: string;
  studentId?: string;
  city: string;
  area: string;
  bloodGroup: string;
  lastDonationDate?: Date;
  isEligible: boolean;
  isActive: boolean;
  consentToCalls: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const donorSchema = new Schema<IDonorDocument>({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Full name must be at least 2 characters'],
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^\+?[\d\s-()]{10,}$/, 'Please enter a valid phone number']
  },
  donorType: {
    type: String,
    required: [true, 'Donor type is required'],
    enum: {
      values: ['student', 'citizen'],
      message: 'Donor type must be either student or citizen'
    },
    default: 'student'
  },
  collegeName: {
    type: String,
    trim: true,
    required: function(this: IDonorDocument) {
      return this.donorType === 'student';
    },
    minlength: [2, 'College name must be at least 2 characters'],
    maxlength: [100, 'College name cannot exceed 100 characters']
  },
  studentId: {
    type: String,
    trim: true,
    required: function(this: IDonorDocument) {
      return this.donorType === 'student';
    },
    minlength: [2, 'Student ID must be at least 2 characters']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    minlength: [2, 'City must be at least 2 characters'],
    maxlength: [50, 'City cannot exceed 50 characters']
  },
  area: {
    type: String,
    required: [true, 'Area is required'],
    trim: true,
    minlength: [2, 'Area must be at least 2 characters'],
    maxlength: [50, 'Area cannot exceed 50 characters']
  },
  bloodGroup: {
    type: String,
    required: [true, 'Blood group is required'],
    enum: {
      values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      message: 'Blood group must be a valid type (A+, A-, B+, B-, AB+, AB-, O+, O-)'
    }
  },
  lastDonationDate: {
    type: Date,
    validate: {
      validator: function(this: IDonorDocument, value: Date) {
        return !value || value <= new Date();
      },
      message: 'Last donation date cannot be in the future'
    }
  },
  isEligible: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  consentToCalls: {
    type: Boolean,
    required: [true, 'Consent to calls is required'],
    default: true
  }
}, {
  timestamps: true
});

donorSchema.index({ email: 1 });
donorSchema.index({ bloodGroup: 1 });
donorSchema.index({ city: 1, area: 1 });
donorSchema.index({ isActive: 1, consentToCalls: 1, isEligible: 1 });

export const Donor = mongoose.model<IDonorDocument>('Donor', donorSchema);
