import mongoose, { Document, Schema } from 'mongoose';

export interface ISettingsDocument extends Document {
  minDaysBetweenDonations: number;
  maxCallsPerDonorPerMonth: number;
  maxDonorsToCallPerRequest: number;
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettingsDocument>({
  minDaysBetweenDonations: {
    type: Number,
    required: [true, 'Minimum days between donations is required'],
    default: 90,
    min: [1, 'Minimum days between donations must be at least 1'],
    max: [365, 'Minimum days between donations cannot exceed 365']
  },
  maxCallsPerDonorPerMonth: {
    type: Number,
    required: [true, 'Maximum calls per donor per month is required'],
    default: 3,
    min: [1, 'Maximum calls per donor per month must be at least 1'],
    max: [30, 'Maximum calls per donor per month cannot exceed 30']
  },
  maxDonorsToCallPerRequest: {
    type: Number,
    required: [true, 'Maximum donors to call per request is required'],
    default: 10,
    min: [1, 'Maximum donors to call per request must be at least 1'],
    max: [100, 'Maximum donors to call per request cannot exceed 100']
  }
}, {
  timestamps: true
});

settingsSchema.index({}, { unique: true });

export const Settings = mongoose.model<ISettingsDocument>('Settings', settingsSchema);
