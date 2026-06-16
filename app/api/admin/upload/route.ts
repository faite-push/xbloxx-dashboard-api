import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function POST(request: Request): Promise<NextResponse> {
  // Verify local authentication
  const cookieHeader = request.headers.get('cookie');
  const token = cookieHeader?.split('; ').find(row => row.startsWith('auth-token='))?.split('=')[1];
  
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    const apiUrl = process.env.EXTERNAL_API_URL || 'https://dragonbux-api.squareweb.app';
    
    // Prepare external FormData
    const externalFormData = new FormData();
    externalFormData.append('file', file);

    const response = await fetch(`${apiUrl}/v1/cdn/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: externalFormData
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Erro no upload para o CDN externo' }, { status: response.status });
    }

    // Adjust URL if it's returning a local IP or wrong domain (unlikely but safe)
    return NextResponse.json({
      url: data.url,
      filename: data.filename
    });
  } catch (error) {
    console.error('Upload proxy error:', error);
    return NextResponse.json({ error: 'Erro interno ao processar upload' }, { status: 500 });
  }
}
