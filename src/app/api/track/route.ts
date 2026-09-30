import { NextResponse, after } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { detectDevice, isLikelyBot } from '@/lib/activity';
import ActivityEvent, { ActivityType } from '@/models/ActivityEvent';

// Only client-originated events are accepted here. order_placed, login and
// signup are recorded server-side so they can't be spoofed from the browser.
const CLIENT_EVENT_TYPES = new Set<string>(['page_view', 'product_view', 'add_to_cart', 'wishlist_add', 'search', 'checkout_start']);

const clip = (value: unknown, max: number) =>
  typeof value === 'string' && value.length > 0 ? value.slice(0, max) : undefined;

export async function POST(req: Request) {
  const userAgent = req.headers.get('user-agent');
  if (isLikelyBot(userAgent)) return new NextResponse(null, { status: 204 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  if (typeof body.type !== 'string' || !CLIENT_EVENT_TYPES.has(body.type)) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const token = getTokenFromRequest(req);
  const session = token ? verifyToken(token) : null;

  const event = {
    type: body.type as ActivityType,
    path: clip(body.path, 300),
    productId: clip(body.productId, 100),
    productName: clip(body.productName, 200),
    query: clip(body.query, 120)?.toLowerCase().trim(),
    value: typeof body.value === 'number' && Number.isFinite(body.value) ? body.value : undefined,
    sessionId: clip(body.sessionId, 64),
    visitorId: clip(body.visitorId, 64),
    referrer: clip(body.referrer, 300),
    user: session?.userId && mongoose.Types.ObjectId.isValid(session.userId) ? session.userId : undefined,
    userName: session?.name,
    device: detectDevice(userAgent),
  };

  // Respond immediately; persist in the background.
  after(async () => {
    try {
      await connectToDatabase();
      await ActivityEvent.create(event);
    } catch (err) {
      console.warn('Track event failed:', (err as Error).message);
    }
  });

  return new NextResponse(null, { status: 204 });
}
