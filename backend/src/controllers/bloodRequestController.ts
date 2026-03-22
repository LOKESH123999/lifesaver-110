import { Request, Response } from 'express';
import { BloodRequest } from '../models';
import { 
  IBloodRequestDocument,
  BloodRequestData,
  AuthenticatedRequest,
  BloodRequestStatus,
  UrgencyLevel,
  BloodGroup
} from '../types';
import { matchDonorsForRequest } from '../services/matchingService';
import { createCallLogsForDonors, buildTwilioCallUrl } from '../services/callService';
import { ICallLogDocument, IDonorDocument } from '../types';

// Helper function to extract donor properties safely
const extractDonorData = (donor: IDonorDocument) => {
  const { _id, fullName, phoneNumber, city, area, bloodGroup, lastDonationDate, email, donorType, isEligible, isActive, consentToCalls } = donor;
  return {
    donorId: _id,
    fullName,
    phoneNumber,
    city,
    area,
    bloodGroup,
    lastDonationDate,
    email,
    donorType,
    isEligible,
    isActive,
    consentToCalls
  };
};

// Create blood request
export const createBloodRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      patientCode,
      bloodGroupRequired,
      unitsRequired,
      urgencyLevel,
      city,
      area
    }: BloodRequestData = req.body;

    // Validate required fields
    if (!patientCode || !bloodGroupRequired || !unitsRequired || !urgencyLevel || !city || !area) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate blood group
    const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!validBloodGroups.includes(bloodGroupRequired)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blood group'
      });
    }

    // Validate urgency level
    const validUrgencyLevels = ['HIGH', 'MEDIUM', 'LOW'];
    if (!validUrgencyLevels.includes(urgencyLevel)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid urgency level'
      });
    }

    // Validate units required
    if (unitsRequired < 1 || unitsRequired > 50) {
      return res.status(400).json({
        success: false,
        message: 'Units required must be between 1 and 50'
      });
    }

    // Get user's hospital ID
    if (!req.user?.hospitalId) {
      return res.status(403).json({
        success: false,
        message: 'Only hospital users can create blood requests'
      });
    }

    // Create blood request
    const bloodRequest = new BloodRequest({
      hospitalId: req.user.hospitalId,
      requestedByUserId: req.user._id,
      patientCode,
      bloodGroupRequired,
      unitsRequired,
      urgencyLevel,
      city,
      area,
      status: 'PENDING' as BloodRequestStatus
    });

    await bloodRequest.save();

    res.status(201).json({
      success: true,
      message: 'Blood request created successfully',
      data: bloodRequest
    });
  } catch (error: any) {
    console.error('Create blood request error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create blood request'
    });
  }
};

// Get blood requests (with pagination and filtering)
export const getBloodRequests = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      hospitalId,
      city,
      status,
      startDate,
      endDate
    } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = {};

    // If user is HOSPITAL, only show their own requests
    if (req.user?.role === 'HOSPITAL' && req.user?.hospitalId) {
      query.hospitalId = req.user.hospitalId;
    } else if (req.user?.role === 'ADMIN') {
      // Admin can filter by hospital
      if (hospitalId) {
        query.hospitalId = hospitalId;
      }
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Add optional filters
    if (city) query.city = city;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) query.createdAt.$lte = new Date(endDate as string);
    }

    // Get total count
    const total = await BloodRequest.countDocuments(query);

    // Get requests with pagination
    const requests = await BloodRequest.find(query)
      .populate('hospitalId', 'hospitalName city area')
      .populate('requestedByUserId', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: requests,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get blood requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blood requests'
    });
  }
};

// Get single blood request
export const getBloodRequestById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Request ID is required'
      });
    }

    const request = await BloodRequest.findById(id)
      .populate('hospitalId', 'hospitalName city area')
      .populate('requestedByUserId', 'email');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    // Check permissions
    if (req.user?.role === 'HOSPITAL' && req.user?.hospitalId) {
      if (request.hospitalId._id.toString() !== req.user.hospitalId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own requests.'
        });
      }
    }

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Get blood request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blood request'
    });
  }
};

// Match donors for a blood request
export const findMatchingDonorsForRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { autoCreateCallLogs = false } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Request ID is required'
      });
    }

    // Find the blood request
    const bloodRequest = await BloodRequest.findById(id);
    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      });
    }

    // Check permissions
    if (req.user?.role === 'HOSPITAL' && req.user?.hospitalId) {
      // Handle both populated object and ObjectId
      let userHospitalId: string;
      if (typeof req.user.hospitalId === 'object' && req.user.hospitalId._id) {
        userHospitalId = req.user.hospitalId._id.toString();
      } else {
        userHospitalId = req.user.hospitalId.toString();
      }
      
      if (bloodRequest.hospitalId.toString() !== userHospitalId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only match donors for your own requests.'
        });
      }
    }

    // Get matching donors
    const matchedDonors = await matchDonorsForRequest(bloodRequest);

    // Create call logs if requested
    let callLogs: ICallLogDocument[] = [];
    if (autoCreateCallLogs) {
      callLogs = await createCallLogsForDonors(bloodRequest, matchedDonors);
    }

    // Format donor data for response
    const donorData = matchedDonors.map((donor: IDonorDocument) => extractDonorData(donor));

    // Build Twilio call URLs for each donor
    const donorDataWithUrls = donorData.map((donor, index): any => {
      const callLog = callLogs[index];
      const donorInfo = extractDonorData(donor as any);
      return {
        donorId: donorInfo.donorId,
        fullName: donorInfo.fullName,
        phoneNumber: donorInfo.phoneNumber,
        city: donorInfo.city,
        area: donorInfo.area,
        bloodGroup: donorInfo.bloodGroup,
        lastDonationDate: donorInfo.lastDonationDate,
        email: donorInfo.email,
        donorType: donorInfo.donorType,
        isEligible: donorInfo.isEligible,
        isActive: donorInfo.isActive,
        consentToCalls: donorInfo.consentToCalls,
        twilioCallUrl: callLog ? buildTwilioCallUrl(callLog, donor as any, bloodRequest) : undefined
      };
    });

    res.json({
      success: true,
      data: {
        requestId: bloodRequest._id,
        bloodGroupRequired: bloodRequest.bloodGroupRequired,
        unitsRequired: bloodRequest.unitsRequired,
        urgencyLevel: bloodRequest.urgencyLevel,
        matchedDonors: donorDataWithUrls,
        callLogIds: callLogs.map(log => log._id)
      }
    });
  } catch (error) {
    console.error('Match donors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to match donors'
    });
  }
};
