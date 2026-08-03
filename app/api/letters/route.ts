import { NextResponse } from 'next/server';
import { getLetters } from '@/lib/letters';

// Ensure this API runs on Node.js runtime on Vercel (not Edge)
export const runtime = 'nodejs';

export async function GET() {
  const letters = await getLetters();
  return NextResponse.json(letters);
}
