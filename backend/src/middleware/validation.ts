import { Request, Response, NextFunction } from 'express';

export const validateDonorRegistration = (req: Request, res: Response, next: NextFunction) => {
  const { fullName, email, password, phoneNumber, donorType, city, area, bloodGroup, consentToCalls } = req.body;

  const errors = [];

  if (!fullName || fullName.trim().length < 2) {
    errors.push('Full name is required and must be at least 2 characters');
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Valid email is required');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (!phoneNumber || !/^\+?[\d\s-()]+$/.test(phoneNumber)) {
    errors.push('Valid phone number is required');
  }

  if (!donorType || !['student', 'citizen'].includes(donorType)) {
    errors.push('Donor type must be either student or citizen');
  }

  if (donorType === 'student') {
    if (!req.body.collegeName || req.body.collegeName.trim().length < 2) {
      errors.push('College name is required for students');
    }
    if (!req.body.studentId || req.body.studentId.trim().length < 2) {
      errors.push('Student ID is required for students');
    }
  }

  if (!city || city.trim().length < 2) {
    errors.push('City is required');
  }

  if (!area || area.trim().length < 2) {
    errors.push('Area is required');
  }

  if (!bloodGroup || !['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(bloodGroup)) {
    errors.push('Valid blood group is required');
  }

  if (typeof consentToCalls !== 'boolean') {
    errors.push('Consent to calls must be a boolean value');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};

export const validateHospitalRegistration = (req: Request, res: Response, next: NextFunction) => {
  const { hospitalName, officialEmail, password, address, city, area, contactNumber } = req.body;

  const errors = [];

  if (!hospitalName || hospitalName.trim().length < 2) {
    errors.push('Hospital name is required and must be at least 2 characters');
  }

  if (!officialEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(officialEmail)) {
    errors.push('Valid official email is required');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (!address || address.trim().length < 5) {
    errors.push('Address is required and must be at least 5 characters');
  }

  if (!city || city.trim().length < 2) {
    errors.push('City is required');
  }

  if (!area || area.trim().length < 2) {
    errors.push('Area is required');
  }

  if (!contactNumber || !/^\+?[\d\s-()]+$/.test(contactNumber)) {
    errors.push('Valid contact number is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};

export const validateBloodRequest = (req: Request, res: Response, next: NextFunction) => {
  const { patientCode, bloodGroupRequired, unitsRequired, urgencyLevel, city, area } = req.body;

  const errors = [];

  if (!patientCode || patientCode.trim().length < 1) {
    errors.push('Patient code is required');
  }

  if (!bloodGroupRequired || !['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(bloodGroupRequired)) {
    errors.push('Valid blood group is required');
  }

  if (!unitsRequired || unitsRequired < 1 || unitsRequired > 50) {
    errors.push('Units required must be between 1 and 50');
  }

  if (!urgencyLevel || !['HIGH', 'MEDIUM', 'LOW'].includes(urgencyLevel)) {
    errors.push('Valid urgency level is required (HIGH, MEDIUM, LOW)');
  }

  if (!city || city.trim().length < 2) {
    errors.push('City is required');
  }

  if (!area || area.trim().length < 2) {
    errors.push('Area is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  const errors = [];

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Valid email is required');
  }

  if (!password || password.length < 1) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};
