import { CallLog, BloodRequest } from '../models';
import { ICallLogDocument, IBloodRequestDocument, IDonorDocument } from '../types';

// Create call logs for matched donors
export const createCallLogsForDonors = async (
  request: IBloodRequestDocument, 
  donors: IDonorDocument[]
): Promise<ICallLogDocument[]> => {
  try {
    const callLogs: ICallLogDocument[] = [];

    for (const donor of donors) {
      const callLog = new CallLog({
        bloodRequestId: request._id,
        donorId: donor._id,
        callStatus: 'QUEUED',
        donorResponse: 'NO_RESPONSE'
      });

      await callLog.save();
      callLogs.push(callLog);
    }

    return callLogs;
  } catch (error) {
    console.error('Error creating call logs:', error);
    throw error;
  }
};

// Build Twilio call URL for initiating IVR call
export const buildTwilioCallUrl = (
  callLog: ICallLogDocument, 
  donor: IDonorDocument, 
  request: IBloodRequestDocument
): string => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  
  return `${baseUrl}/api/twilio/voice?bloodRequestId=${request._id}&donorId=${donor._id}&callLogId=${callLog._id}`;
};

// Update call log with Twilio status
export const updateCallLogStatus = async (
  callLogId: string,
  callStatus: string,
  callStartedAt?: Date,
  callEndedAt?: Date
): Promise<ICallLogDocument | null> => {
  try {
    const updateData: any = {
      callStatus
    };

    if (callStartedAt) updateData.callStartedAt = callStartedAt;
    if (callEndedAt) updateData.callEndedAt = callEndedAt;

    const callLog = await CallLog.findByIdAndUpdate(
      callLogId,
      updateData,
      { new: true }
    );

    return callLog;
  } catch (error) {
    console.error('Error updating call log:', error);
    throw error;
  }
};

// Update call log with donor response
export const updateCallLogDonorResponse = async (
  callLogId: string,
  donorResponse: string
): Promise<ICallLogDocument | null> => {
  try {
    const callLog = await CallLog.findByIdAndUpdate(
      callLogId,
      { donorResponse },
      { new: true }
    );

    return callLog;
  } catch (error) {
    console.error('Error updating donor response:', error);
    throw error;
  }
};

// Check if enough donors have responded YES to fulfill request
export const checkRequestFulfillment = async (
  bloodRequestId: string,
  unitsRequired: number
): Promise<{ fulfilled: boolean; unitsAvailable: number }> => {
  try {
    const callLogs = await CallLog.find({
      bloodRequestId,
      donorResponse: 'YES'
    });

    // For now, assume each donor provides 1 unit
    // In real implementation, this could be configurable per donor
    const unitsAvailable = callLogs.length;

    return {
      fulfilled: unitsAvailable >= unitsRequired,
      unitsAvailable
    };
  } catch (error) {
    console.error('Error checking fulfillment:', error);
    throw error;
  }
};
