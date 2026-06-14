import { NextRequest, NextResponse } from 'next/server';
import { getAllInfluencers } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const influencers = getAllInfluencers();

    return NextResponse.json(influencers, { status: 200 });
  } catch (error) {
    console.error('Error fetching influencers:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar influenciadores' },
      { status: 500 }
    );
  }
}