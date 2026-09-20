import { NextResponse } from 'next/server';
import { authenticateRequest, AuthenticatedUser } from './withAuth';

export type AllowedRole = 'customer' | 'moderator' | 'admin' | 'superadmin';

export async function authorizeRole(
  req: Request,
  allowedRoles: AllowedRole[]
): Promise<{ user: AuthenticatedUser | null; errorResponse: NextResponse | null }> {
  const { user, errorResponse } = await authenticateRequest(req);
  if (errorResponse || !user) return { user: null, errorResponse };

  // superadmin has access to everything
  if (user.role === 'superadmin') {
    return { user, errorResponse: null };
  }

  // admin has access to admin and moderator roles
  if (user.role === 'admin' && (allowedRoles.includes('admin') || allowedRoles.includes('moderator'))) {
    return { user, errorResponse: null };
  }

  if (!allowedRoles.includes(user.role as AllowedRole)) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { success: false, error: 'Forbidden: Insufficient privileges for this operation.' },
        { status: 403 }
      ),
    };
  }

  return { user, errorResponse: null };
}

export function withRole(
  allowedRoles: AllowedRole[],
  handler: (req: Request, context: { params: any; user: AuthenticatedUser }) => Promise<NextResponse>
) {
  return async (req: Request, context: { params: any }) => {
    const { user, errorResponse } = await authorizeRole(req, allowedRoles);
    if (errorResponse || !user) return errorResponse!;
    return handler(req, { ...context, user });
  };
}
