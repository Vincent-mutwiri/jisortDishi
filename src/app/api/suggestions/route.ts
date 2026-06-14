import { NextRequest, NextResponse } from 'next/server';
import { getMealSuggestions } from '@/src/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const suggestions = await getMealSuggestions({
      budget: Number(body.budget),
      items: body.items || [],
      preferences: body.preferences || [],
      currency: body.currency || 'KES',
      category: body.category || 'meal',
      meal_type: body.meal_type || 'any',
      people: Number(body.people) || 1,
      extra_notes: body.extra_notes || '',
    });

    return NextResponse.json(suggestions);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to generate suggestions' }, { status: 400 });
  }
}
