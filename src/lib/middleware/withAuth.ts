import { NextResponse } from 'next/server';
import { getTokenFromRequest, verifyToken, UserTokenPayload } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

export interface AuthenticatedUser extends UserTokenPayload {
  _id: string;
}

export async function authenticateRequest(
  req: Request
): Promise<{ user: AuthenticatedUser | null; errorResponse: NextResponse | null }> {
  const token = getTokenFromRequest(req);

  if (!token) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { success: false, error: 'Authentication required. Please log in.' },
        { status: 401 }
      ),
    };
  }

  const payload = verifyToken(token);
  if (!payload) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { success: false, error: 'Invalid or expired session. Please log in again.' },
        { status: 401 }
      ),
    };
  }

  // Ensure DB connected & attach clean object
  await connectDB();

  return {
    user: {
      ...payload,
      _id: payload.userId,
    },
    errorResponse: null,
  };
}

export function withAuth(
  handler: (req: Request, context: { params: any; user: AuthenticatedUser }) => Promise<NextResponse>
) {
  return async (req: Request, context: { params: any }) => {
    const { user, errorResponse } = await authenticateRequest(req);
    if (errorResponse || !user) return errorResponse!;
    return handler(req, { ...context, user });
  };
}
