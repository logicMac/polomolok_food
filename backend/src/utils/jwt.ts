import jwt from 'jsonwebtoken';
import { TokenPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m'; // Default: 15 minutes
const JWT_REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d'; // Default: 7 days

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

export const generateAccessToken = (payload: Omit<TokenPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_ACCESS_TOKEN_EXPIRY } as jwt.SignOptions);
};

export const generateRefreshToken = (payload: Omit<TokenPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_REFRESH_TOKEN_EXPIRY } as jwt.SignOptions);
};

export const verifyToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    throw new Error('Invalid token');
  }
};

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
