import { NextRequest, NextResponse } from 'next/server';
import { setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Usuário e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const apiUrl = process.env.EXTERNAL_API_URL || 'https://dragonbux-api.squareweb.app';
    
    const response = await fetch(`${apiUrl}/v2/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: email,
        password: password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Credenciais inválidas' },
        { status: response.status }
      );
    }

    const token = data.token;
    await setAuthCookie(token);

    return NextResponse.json(
      { 
        message: 'Login realizado com sucesso', 
        admin: { 
          id: data.user.id, 
          username: data.user.username,
          name: data.user.name,
          role: data.user.role
        } 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer login' },
      { status: 500 }
    );
  }
}
