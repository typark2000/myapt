import { NextResponse } from 'next/server';
import { calculateAffordability, pickBestScenario } from '@/lib/server/calc';
import { searchAffordableApartments } from '@/lib/server/search';
import { financeInputSchema, searchFiltersSchema } from '@/lib/server/validators';

export async function POST(req: Request) {
  const body = await req.json();
  const finance = financeInputSchema.parse(body.finance);
  const filters = searchFiltersSchema.parse(body.filters);
  const scenarios = calculateAffordability(finance);
  const best = pickBestScenario(scenarios);
  const results = searchAffordableApartments(filters, best);
  return NextResponse.json({ best, scenarios, results });
}
