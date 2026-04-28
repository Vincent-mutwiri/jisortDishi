import { NextRequest, NextResponse } from 'next/server';
import { getMealSuggestions } from '@/src/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const suggestions = await getMealSuggestions(
      Number(body.budget),
      body.items || [],
      body.preferences || [],
      body.currency || 'KES',
    );

    return NextResponse.json(suggestions);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to generate suggestions' }, { status: 400 });
  }
}
