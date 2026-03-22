import mongoose, { Document, Schema } from 'mongoose';

export interface ICallLogDocument extends Document {
  bloodRequestId: mongoose.Types.ObjectId;
  donorId: mongoose.Types.ObjectId;
  callStatus: 'QUEUED' | 'RINGING' | 'ANSWERED' | 'NO_ANSWER' | 'FAILED';
  donorResponse?: 'YES' | 'NO' | 'NO_RESPONSE';
  callStartedAt?: Date;
  callEndedAt?: Date;
  createdAt: Date;
}

const callLogSchema = new Schema<ICallLogDocument>({
  bloodRequestId: {
    type: Schema.Types.ObjectId,
    ref: 'BloodRequest',
    required: [true, 'Blood request ID is required']
  },
  donorId: {
    type: Schema.Types.ObjectId,
    ref: 'Donor',
    required: [true, 'Donor ID is required']
  },
  callStatus: {
    type: String,
    required: [true, 'Call status is required'],
    enum: {
      values: ['QUEUED', 'RINGING', 'ANSWERED', 'NO_ANSWER', 'FAILED'],
      message: 'Call status must be QUEUED, RINGING, ANSWERED, NO_ANSWER, or FAILED'
    },
    default: 'QUEUED'
  },
  donorResponse: {
    type: String,
    enum: {
      values: ['YES', 'NO', 'NO_RESPONSE'],
      message: 'Donor response must be YES, NO, or NO_RESPONSE'
    },
    validate: {
      validator: function(this: ICallLogDocument, value: string) {
        // Donor response is only required when call is answered
        return this.callStatus !== 'ANSWERED' || value != null;
      },
      message: 'Donor response is required when call status is ANSWERED'
    }
  },
  callStartedAt: {
    type: Date,
    validate: {
      validator: function(this: ICallLogDocument, value: Date) {
        return !value || value <= new Date();
      },
      message: 'Call start time cannot be in the future'
    }
  },
  callEndedAt: {
    type: Date,
    validate: {
      validator: function(this: ICallLogDocument, value: Date) {
        return !value || !this.callStartedAt || value >= this.callStartedAt;
      },
      message: 'Call end time must be after call start time'
    }
  }
}, {
  timestamps: true
});

callLogSchema.index({ bloodRequestId: 1 });
callLogSchema.index({ donorId: 1 });
callLogSchema.index({ callStatus: 1 });
callLogSchema.index({ donorResponse: 1 });
callLogSchema.index({ createdAt: -1 });

export const CallLog = mongoose.model<ICallLogDocument>('CallLog', callLogSchema);
