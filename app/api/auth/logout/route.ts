import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await clearAuthCookie();
    return NextResponse.json({ message: 'Logout realizado com sucesso' }, { status: 200 });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer logout' },
      { status: 500 }
    );
  }
}
