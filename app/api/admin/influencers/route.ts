import { NextRequest, NextResponse } from 'next/server';
import { createInfluencer, updateInfluencer, deleteInfluencer, getAllInfluencers } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

function verifyAuth(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function POST(request: NextRequest) {
  try {
    const admin = verifyAuth(request);
    if (!admin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { name, followers_count, image_url, social_link } = await request.json();

    if (!name || !followers_count) {
      return NextResponse.json(
        { error: 'Nome e contagem de seguidores são obrigatórios' },
        { status: 400 }
      );
    }

    const influencers = await getAllInfluencers();
    const nextOrder = influencers.length > 0 ? Math.max(...influencers.map((i) => i.display_order)) + 1 : 1;

    const newInfluencer = await createInfluencer({
      name,
      followers_count,
      image_url: image_url || undefined,
      social_link: social_link || undefined,
      display_order: nextOrder,
    });

    return NextResponse.json(newInfluencer, { status: 201 });
  } catch (error) {
    console.error('Error creating influencer:', error);
    return NextResponse.json(
      { error: 'Erro ao criar influenciador' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = verifyAuth(request);
    if (!admin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id, name, followers_count, image_url, social_link } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID do influenciador é obrigatório' },
        { status: 400 }
      );
    }

    const updatedInfluencer = await updateInfluencer(id, {
      name,
      followers_count,
      image_url: image_url || undefined,
      social_link: social_link || undefined,
    });

    if (!updatedInfluencer) {
      return NextResponse.json(
        { error: 'Influenciador não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedInfluencer, { status: 200 });
  } catch (error) {
    console.error('Error updating influencer:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar influenciador' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = verifyAuth(request);
    if (!admin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID do influenciador é obrigatório' },
        { status: 400 }
      );
    }

    const success = await deleteInfluencer(parseInt(id));

    if (!success) {
      return NextResponse.json(
        { error: 'Influenciador não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Influenciador deletado com sucesso' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting influencer:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar influenciador' },
      { status: 500 }
    );
  }
}
