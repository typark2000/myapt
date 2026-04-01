import { NextResponse } from 'next/server';
import { calculateAffordability, pickBestScenario } from '@/lib/server/calc';
import { financeInputSchema } from '@/lib/server/validators';

export async function POST(req: Request) {
  const body = await req.json();
  const input = financeInputSchema.parse(body);
  const scenarios = calculateAffordability(input);
  return NextResponse.json({ scenarios, best: pickBestScenario(scenarios) });
}
