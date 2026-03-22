import mongoose, { Document, Schema } from 'mongoose';

export interface IHospitalDocument extends Document {
  hospitalName: string;
  officialEmail: string;
  address: string;
  city: string;
  area: string;
  contactNumber: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const hospitalSchema = new Schema<IHospitalDocument>({
  hospitalName: {
    type: String,
    required: [true, 'Hospital name is required'],
    trim: true,
    minlength: [2, 'Hospital name must be at least 2 characters'],
    maxlength: [150, 'Hospital name cannot exceed 150 characters']
  },
  officialEmail: {
    type: String,
    required: [true, 'Official email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid official email']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    minlength: [10, 'Address must be at least 10 characters'],
    maxlength: [500, 'Address cannot exceed 500 characters']
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
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required'],
    trim: true,
    match: [/^\+?[\d\s-()]{10,}$/, 'Please enter a valid contact number']
  },
  isVerified: {
    type: Boolean,
    default: false,
    comment: 'Whether the hospital has been verified by admin'
  }
}, {
  timestamps: true
});

hospitalSchema.index({ officialEmail: 1 });
hospitalSchema.index({ isVerified: 1 });

export const Hospital = mongoose.model<IHospitalDocument>('Hospital', hospitalSchema);
