import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
import { User } from '../models';
import { IUserDocument } from '../types';

// Extend Request interface to include user
export interface AuthenticatedRequest extends Request {
  user?: IUserDocument;
}

// Authentication middleware
export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = verifyToken(token) as any;
    
    // Find user with populated related data
    const user = await User.findById(decoded.id)
      .populate('donorId')
      .populate('hospitalId');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    // Attach user to request object
    req.user = user as IUserDocument;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

// Role-based authorization middleware
export const authorize = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User not authenticated.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};
