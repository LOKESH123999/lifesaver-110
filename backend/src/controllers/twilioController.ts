import { Request, Response } from 'express';
import { CallLog, BloodRequest, Donor } from '../models';
import { 
  ICallLogDocument,
  IBloodRequestDocument,
  IDonorDocument,
  CallStatus,
  DonorResponse
} from '../types';
import { 
  updateCallLogStatus, 
  updateCallLogDonorResponse,
  checkRequestFulfillment 
} from '../services/callService';

// Simple webhook secret validation
const validateWebhookSecret = (req: Request): boolean => {
  const secret = req.query.secret || req.headers['x-twilio-webhook-secret'];
  const expectedSecret = process.env.TWILIO_WEBHOOK_SECRET;
  
  return secret === expectedSecret;
};

// Generate TwiML for IVR call
const generateIVRTwiML = (
  donor: IDonorDocument,
  request: IBloodRequestDocument,
  callLog: ICallLogDocument
): string => {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="1" timeout="10" numDigits="1">
    <Say voice="alice">
      Hello ${donor.fullName}. This is LifeSaver 110 emergency blood request service.
    </Say>
    <Pause length="1"/>
    <Say voice="alice">
      A nearby hospital in ${request.city} needs ${request.bloodGroupRequired} blood urgently.
    </Say>
    <Pause length="1"/>
    <Say voice="alice">
      If you are available and willing to donate now, press 1.
    </Say>
    <Pause length="1"/>
    <Say voice="alice">
      If you are not available or cannot donate, press 2.
    </Say>
    <Pause length="1"/>
    <Say voice="alice">
      If you want to skip this request, press 3.
    </Say>
  </Gather>
  
  <!-- Handle the digit response -->
  <Redirect method="POST">
    ${process.env.BASE_URL}/api/twilio/voice?bloodRequestId=${request._id}&donorId=${donor._id}&callLogId=${callLog._id}&action=process_response
  </Redirect>
</Response>`;

  return twiml;
};

// Handle digit response from IVR
const handleDigitResponse = async (digit: string, callLog: ICallLogDocument): Promise<string> => {
  try {
    let donorResponse: DonorResponse;
    let message: string;

    switch (digit) {
      case '1':
        donorResponse = 'YES';
        message = 'Thank you for your willingness to donate. We will contact you shortly with donation details.';
        break;
      case '2':
        donorResponse = 'NO';
        message = 'Thank you for your response. We understand you are not available at this time.';
        break;
      case '3':
        donorResponse = 'NO_RESPONSE';
        message = 'Thank you. We have noted your preference to skip this request.';
        break;
      default:
        donorResponse = 'NO_RESPONSE';
        message = 'Invalid selection. Thank you for your time.';
        break;
    }

    // Update call log with donor response
    await updateCallLogDonorResponse(callLog._id, donorResponse);

    // Generate final TwiML
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">
    ${message}
  </Say>
  <Pause length="2"/>
  <Say voice="alice">
    Goodbye.
  </Say>
  <Hangup/>
</Response>`;

    return twiml;
  } catch (error) {
    console.error('Error handling digit response:', error);
    
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">
    Sorry, we encountered an error processing your response. Goodbye.
  </Say>
  <Hangup/>
</Response>`;

    return errorTwiml;
  }
};

// Twilio voice webhook - handles IVR interactions
export const handleVoiceWebhook = async (req: Request, res: Response) => {
  try {
    // Validate webhook secret
    if (!validateWebhookSecret(req)) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized webhook'
      });
    }

    const { 
      bloodRequestId, 
      donorId, 
      callLogId, 
      action,
      Digits 
    } = req.body;

    if (action === 'process_response' && Digits) {
      // Find the call log
      const callLog = await CallLog.findById(callLogId);
      if (!callLog) {
        return res.status(404).json({
          success: false,
          message: 'Call log not found'
        });
      }

      // Handle digit response
      const twiml = await handleDigitResponse(Digits, callLog);
      
      // Set content type to TwiML
      res.setHeader('Content-Type', 'text/xml');
      res.send(twiml);
      return;
    }

    // Initial call setup
    if (bloodRequestId && donorId && callLogId && !action) {
      // Find request and donor
      const [request, donorRecord] = await Promise.all([
        BloodRequest.findById(bloodRequestId).populate('hospitalId'),
        Donor.findById(donorId)
      ]);

      if (!request || !donorRecord) {
        return res.status(404).json({
          success: false,
          message: 'Request or donor not found'
        });
      }

      // Find call log
      const callLog = await CallLog.findById(callLogId);
      if (!callLog) {
        return res.status(404).json({
          success: false,
          message: 'Call log not found'
        });
      }

      // Update call log status to RINGING
      await updateCallLogStatus(callLogId, 'RINGING');

      // Generate IVR TwiML
      const twiml = generateIVRTwiML(donorRecord, request, callLog);
      
      // Set content type to TwiML
      res.setHeader('Content-Type', 'text/xml');
      res.send(twiml);
      return;
    }

    res.status(400).json({
      success: false,
      message: 'Invalid webhook request'
    });
  } catch (error) {
    console.error('Voice webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
};

// Twilio status webhook - handles call status updates
export const handleStatusWebhook = async (req: Request, res: Response) => {
  try {
    // Validate webhook secret
    if (!validateWebhookSecret(req)) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized webhook'
      });
    }

    const { CallSid, CallStatus, CallDuration } = req.body;

    if (!CallSid) {
      return res.status(400).json({
        success: false,
        message: 'Call SID is required'
      });
    }

    // Find call log by Twilio Call SID (you'd need to store this when creating calls)
    // For now, we'll use a simple approach - in production, you'd store CallSid when initiating calls
    console.log(`Call status update: ${CallStatus} for call ${CallSid}, duration: ${CallDuration}`);

    // Map Twilio statuses to our CallStatus enum
    let mappedStatus: CallStatus;
    switch (CallStatus.toLowerCase()) {
      case 'queued':
        mappedStatus = 'QUEUED';
        break;
      case 'ringing':
        mappedStatus = 'RINGING';
        break;
      case 'in-progress':
        mappedStatus = 'ANSWERED';
        break;
      case 'completed':
        mappedStatus = 'ANSWERED';
        break;
      case 'no-answer':
        mappedStatus = 'NO_ANSWER';
        break;
      case 'failed':
      mappedStatus = 'FAILED';
        break;
      case 'busy':
        mappedStatus = 'FAILED';
        break;
      default:
        mappedStatus = 'FAILED';
        break;
    }

    // For this demo, we'll just log the status
    // In production, you'd update the actual CallLog record
    res.json({
      success: true,
      message: 'Status update received',
      data: {
        callSid: CallSid,
        status: mappedStatus,
        duration: CallDuration
      }
    });
  } catch (error) {
    console.error('Status webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Status webhook processing failed'
    });
  }
};
