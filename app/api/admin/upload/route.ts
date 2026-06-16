import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  // Verify authentication
  const cookieHeader = request.headers.get('cookie');
  const token = cookieHeader?.split('; ').find(row => row.startsWith('auth-token='))?.split('=')[1];
  
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  if (!filename || !request.body) {
    return NextResponse.json({ error: 'Arquivo inválido' }, { status: 400 });
  }

  try {
    const blob = await put(filename, request.body, {
      access: 'public',
    });

    return NextResponse.json(blob);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Erro no upload' }, { status: 500 });
  }
}
