import { NextResponse } from 'next/server';
import { ensureDatabaseSeeded } from '@/lib/seed';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const force = searchParams.get('force') === 'true';
    await ensureDatabaseSeeded(force);
    return NextResponse.json({ success: true, message: `Database successfully ${force ? 're-seeded' : 'seeded'}!` });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
