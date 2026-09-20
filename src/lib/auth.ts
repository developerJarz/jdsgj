import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env.local');
}

const JWT_SECRET: string = process.env.JWT_SECRET;

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(password, hashed);
}

export interface UserTokenPayload {
  userId: string;
  phone: string;
  email?: string;
  name: string;
  role: 'customer' | 'moderator' | 'admin' | 'superadmin';
  permissions?: string[];
}

export function signToken(payload: UserTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): UserTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserTokenPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookies
  const cookieHeader = req.headers.get('cookie');
  if (cookieHeader) {
    const match = cookieHeader.match(/shajgoj_token=([^;]+)/);
    if (match) return match[1];
  }

  return null;
}
