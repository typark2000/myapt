import { NextResponse } from 'next/server';
import { getAdminSummary } from '@/lib/server/admin';

export async function GET() {
  return NextResponse.json(getAdminSummary());
}
