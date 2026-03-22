import { Request, Response } from 'express';
import { User, Donor, Hospital } from '../models';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { 
  IUserDocument, 
  IDonorDocument, 
  IHospitalDocument,
  DonorRegistrationData,
  HospitalRegistrationData,
  LoginData
} from '../types';

// Register Donor
export const registerDonor = async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      email,
      phoneNumber,
      password,
      donorType,
      collegeName,
      studentId,
      city,
      area,
      bloodGroup,
      lastDonationDate,
      consentToCalls
    }: DonorRegistrationData = req.body;

    // Validate required fields
    if (!fullName || !email || !phoneNumber || !password || !donorType || !city || !area || !bloodGroup) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Validate donor type
    if (!['student', 'citizen'].includes(donorType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid donor type'
      });
    }

    // Validate blood group
    const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!validBloodGroups.includes(bloodGroup)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blood group'
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create donor document
    const donor = new Donor({
      fullName,
      email,
      phoneNumber,
      donorType,
      collegeName: donorType === 'student' ? collegeName : undefined,
      studentId: donorType === 'student' ? studentId : undefined,
      city,
      area,
      bloodGroup,
      lastDonationDate: lastDonationDate ? new Date(lastDonationDate) : undefined,
      consentToCalls
    });

    await donor.save();

    // Create user document
    const user = new User({
      email,
      passwordHash,
      role: 'DONOR',
      donorId: donor._id
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Donor registered successfully',
      data: {
        userId: user._id,
        donorId: donor._id,
        role: user.role,
        token
      }
    });
  } catch (error: any) {
    console.error('Donor registration error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists'
      });
    }

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
      message: 'Registration failed'
    });
  }
};

// Register Hospital
export const registerHospital = async (req: Request, res: Response) => {
  try {
    const {
      hospitalName,
      officialEmail,
      address,
      city,
      area,
      contactNumber,
      password
    }: HospitalRegistrationData = req.body;

    // Validate required fields
    if (!hospitalName || !officialEmail || !address || !city || !area || !contactNumber || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(officialEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email: officialEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create hospital document
    const hospital = new Hospital({
      hospitalName,
      officialEmail,
      address,
      city,
      area,
      contactNumber,
      isVerified: false
    });

    await hospital.save();

    // Create user document
    const user = new User({
      email: officialEmail,
      passwordHash,
      role: 'HOSPITAL',
      hospitalId: hospital._id
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Hospital registered successfully. Please wait for admin verification.',
      data: {
        userId: user._id,
        hospitalId: hospital._id,
        role: user.role,
        token,
        isVerified: hospital.isVerified
      }
    });
  } catch (error: any) {
    console.error('Hospital registration error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists'
      });
    }

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
      message: 'Registration failed'
    });
  }
};

// Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginData = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Find user with populated related data
    const user = await User.findOne({ email })
      .populate('donorId')
      .populate('hospitalId');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Compare password
    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Prepare response data
    const responseData: any = {
      userId: user._id,
      role: user.role,
      token
    };

    // Add role-specific data
    if (user.role === 'DONOR' && user.donorId) {
      responseData.donorId = user.donorId;
    } else if (user.role === 'HOSPITAL' && user.hospitalId) {
      responseData.hospitalId = user.hospitalId;
      responseData.isVerified = (user.hospitalId as any).isVerified;
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: responseData
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};
