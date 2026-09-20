import { NextResponse } from 'next/server';
import { authenticateRequest, AuthenticatedUser } from './withAuth';
import User from '@/models/User';

export async function authorizePermission(
  req: Request,
  requiredPermission: string
): Promise<{ user: AuthenticatedUser | null; errorResponse: NextResponse | null }> {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse || !user) return { user: null, errorResponse };

  // superadmin and admin have all permissions by default
  if (user.role === 'superadmin' || user.role === 'admin') {
    return { user, errorResponse: null };
  }

  // Check moderator permissions (fetch fresh from DB if not in token)
  let permissions = user.permissions || [];
  if (!permissions.length) {
    const dbUser = await User.findById(user._id).select('permissions').lean();
    if (dbUser && (dbUser as any).permissions) {
      permissions = (dbUser as any).permissions;
    }
  }

  const hasPermission = permissions.includes(requiredPermission) || permissions.includes('*');

  if (!hasPermission) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        {
          success: false,
          error: `Permission Denied: Missing required permission '${requiredPermission}'.`,
        },
        { status: 403 }
      ),
    };
  }

  return { user, errorResponse: null };
}

export function withPermission(
  requiredPermission: string,
  handler: (req: Request, context: { params: any; user: AuthenticatedUser }) => Promise<NextResponse>
) {
  return async (req: Request, context: { params: any }) => {
    const { user, errorResponse } = await authorizePermission(req, requiredPermission);
    if (errorResponse || !user) return errorResponse!;
    return handler(req, { ...context, user });
  };
}
