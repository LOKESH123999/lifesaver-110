import mongoose, { Document, Schema } from 'mongoose';

export interface IUserDocument extends Document {
  email: string;
  passwordHash: string;
  role: 'DONOR' | 'HOSPITAL' | 'ADMIN';
  donorId?: mongoose.Types.ObjectId;
  hospitalId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDocument>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password hash is required'],
    minlength: [60, 'Password hash must be at least 60 characters']
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: {
      values: ['DONOR', 'HOSPITAL', 'ADMIN'],
      message: 'Role must be DONOR, HOSPITAL, or ADMIN'
    }
  },
  donorId: {
    type: Schema.Types.ObjectId,
    ref: 'Donor',
    validate: {
      validator: function(this: IUserDocument, value: any) {
        return this.role === 'DONOR' ? value != null : true;
      },
      message: 'donorId is required when role is DONOR'
    }
  },
  hospitalId: {
    type: Schema.Types.ObjectId,
    ref: 'Hospital',
    validate: {
      validator: function(this: IUserDocument, value: any) {
        return this.role === 'HOSPITAL' ? value != null : true;
      },
      message: 'hospitalId is required when role is HOSPITAL'
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.passwordHash;
      return ret;
    }
  }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

export const User = mongoose.model<IUserDocument>('User', userSchema);
