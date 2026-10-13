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

  // Resolve privileges from the database on every request. A role change or
  // suspension must take effect even when a 30-day login token is still valid.
  await connectDB();
  const dbUser = await User.findById(payload.userId).select('name phone email role permissions isActive').lean();
  if (!dbUser || dbUser.isActive === false) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { success: false, error: 'This account is unavailable. Please log in again.' },
        { status: 401 }
      ),
    };
  }

  return {
    user: {
      userId: payload.userId,
      _id: payload.userId,
      name: dbUser.name,
      phone: dbUser.phone,
      email: dbUser.email,
      role: dbUser.role,
      permissions: dbUser.permissions || [],
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
