import { after } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import ActivityEvent, { ActivityType } from '@/models/ActivityEvent';

export function detectDevice(userAgent: string | null): 'mobile' | 'tablet' | 'desktop' {
  const ua = (userAgent || '').toLowerCase();
  if (/ipad|tablet|kindle|playbook/.test(ua)) return 'tablet';
  if (/mobi|android|iphone|ipod/.test(ua)) return 'mobile';
  return 'desktop';
}

export function isLikelyBot(userAgent: string | null) {
  return /bot|crawler|spider|crawling|headless|lighthouse|pingdom|preview/i.test(userAgent || '');
}

interface ServerActivity {
  type: ActivityType;
  req?: Request;
  userId?: string;
  userName?: string;
  path?: string;
  value?: number;
  productId?: string;
  productName?: string;
}

/**
 * Records a server-side activity event (order placed, login, signup) after the
 * response has been sent, so it never slows the user down or breaks the flow.
 */
export function recordServerActivity({ type, req, userId, userName, path, value, productId, productName }: ServerActivity) {
  const userAgent = req?.headers.get('user-agent') ?? null;

  after(async () => {
    try {
      await connectToDatabase();
      await ActivityEvent.create({
        type,
        path,
        value,
        productId,
        productName,
        user: userId && mongoose.Types.ObjectId.isValid(userId) ? userId : undefined,
        userName,
        device: detectDevice(userAgent),
      });
    } catch (err) {
      console.warn('Activity log failed:', (err as Error).message);
    }
  });
}
