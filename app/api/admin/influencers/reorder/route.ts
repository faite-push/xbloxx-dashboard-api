import { NextRequest, NextResponse } from 'next/server';
import { reorderInfluencers } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// Helper function to verify authentication
function verifyAuth(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

// PUT - Reorder influencers
export async function PUT(request: NextRequest) {
  try {
    const admin = verifyAuth(request);
    if (!admin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Lista de IDs é obrigatória' },
        { status: 400 }
      );
    }

    reorderInfluencers(ids);

    return NextResponse.json({ message: 'Ordem atualizada com sucesso' }, { status: 200 });
  } catch (error) {
    console.error('Error reordering influencers:', error);
    return NextResponse.json(
      { error: 'Erro ao reordenar influenciadores' },
      { status: 500 }
    );
  }
}
