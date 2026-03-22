import mongoose, { Document, Schema } from 'mongoose';

export interface IBloodRequestDocument extends Document {
  hospitalId: mongoose.Types.ObjectId;
  requestedByUserId: mongoose.Types.ObjectId;
  patientCode: string;
  bloodGroupRequired: string;
  unitsRequired: number;
  urgencyLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  city: string;
  area: string;
  status: 'PENDING' | 'CALLING' | 'PARTIALLY_FULFILLED' | 'FULFILLED' | 'CLOSED';
  createdAt: Date;
  updatedAt: Date;
}

const bloodRequestSchema = new Schema<IBloodRequestDocument>({
  hospitalId: {
    type: Schema.Types.ObjectId,
    ref: 'Hospital',
    required: [true, 'Hospital ID is required']
  },
  requestedByUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Requested by user ID is required']
  },
  patientCode: {
    type: String,
    required: [true, 'Patient code is required'],
    trim: true,
    minlength: [1, 'Patient code must be at least 1 character'],
    maxlength: [20, 'Patient code cannot exceed 20 characters']
  },
  bloodGroupRequired: {
    type: String,
    required: [true, 'Blood group required is required'],
    enum: {
      values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      message: 'Blood group must be a valid type (A+, A-, B+, B-, AB+, AB-, O+, O-)'
    }
  },
  unitsRequired: {
    type: Number,
    required: [true, 'Units required is required'],
    min: [1, 'Units required must be at least 1'],
    max: [50, 'Units required cannot exceed 50']
  },
  urgencyLevel: {
    type: String,
    required: [true, 'Urgency level is required'],
    enum: {
      values: ['HIGH', 'MEDIUM', 'LOW'],
      message: 'Urgency level must be HIGH, MEDIUM, or LOW'
    }
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
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['PENDING', 'CALLING', 'PARTIALLY_FULFILLED', 'FULFILLED', 'CLOSED'],
      message: 'Status must be PENDING, CALLING, PARTIALLY_FULFILLED, FULFILLED, or CLOSED'
    },
    default: 'PENDING'
  }
}, {
  timestamps: true
});

bloodRequestSchema.index({ hospitalId: 1 });
bloodRequestSchema.index({ requestedByUserId: 1 });
bloodRequestSchema.index({ bloodGroupRequired: 1 });
bloodRequestSchema.index({ city: 1, area: 1 });
bloodRequestSchema.index({ status: 1 });
bloodRequestSchema.index({ createdAt: -1 });

export const BloodRequest = mongoose.model<IBloodRequestDocument>('BloodRequest', bloodRequestSchema);
