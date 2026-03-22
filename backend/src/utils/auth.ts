import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { IUserDocument } from '../models';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (user: IUserDocument): string => {
  const payload = {
    id: user._id, 
    email: user.email, 
    role: user.role,
    donorId: user.donorId,
    hospitalId: user.hospitalId
  };
  
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn']
  };
  
  return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};
