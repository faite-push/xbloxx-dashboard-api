'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, GripVertical, ChevronUp, ChevronDown, ExternalLink, Edit, Trash2, LogOut, PlusCircle } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import InfluencerModal from '@/components/InfluencerModal';
import { Button } from '@/components/ui/button';

interface Influencer {
  id: number;
  name: string;
  followers_count: string;
  image_url?: string;
  social_link?: string;
  display_order: number;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInfluencer, setEditingInfluencer] = useState<Influencer | undefined>();
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInfluencers();
  }, []);

  const fetchInfluencers = async () => {
    try {
      const response = await fetch('/api/influencers');
      if (!response.ok) throw new Error('Erro ao buscar influenciadores');
      const data = await response.json();
      setInfluencers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
      router.push('/login');
    }
  };

  const handleSaveInfluencer = async (data: any) => {
    const url = editingInfluencer ? '/api/admin/influencers' : '/api/admin/influencers';
    const method = editingInfluencer ? 'PUT' : 'POST';
    const payload = editingInfluencer ? { ...data, id: editingInfluencer.id } : data;

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao salvar influenciador');
    }

    await fetchInfluencers();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar este influenciador?')) return;

    try {
      const response = await fetch(`/api/admin/influencers?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao deletar influenciador');

      await fetchInfluencers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar');
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newOrder = [...influencers];
    [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
    await handleReorder(newOrder);
  };

  const handleMoveDown = async (index: number) => {
    if (index === influencers.length - 1) return;
    const newOrder = [...influencers];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    await handleReorder(newOrder);
  };

  const handleReorder = async (newOrder: Influencer[]) => {
    try {
      const response = await fetch('/api/admin/influencers/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: newOrder.map((inf) => inf.id) }),
      });

      if (!response.ok) throw new Error('Erro ao reordenar');

      setInfluencers(newOrder);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao reordenar');
    }
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(influencers);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    await handleReorder(items);
  };

  const openModal = (influencer?: Influencer) => {
    setEditingInfluencer(influencer);
    setModalOpen(true);
  };

  const closeModal = () => {
    setEditingInfluencer(undefined);
    setModalOpen(false);
  };

  const formatFollowers = (count: string) => {
    const num = parseInt(count.replace(/\D/g, ''));
    if (isNaN(num)) return count;

    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse font-medium">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 bg-[url('https://xbloxx.com/cdn/stores/22146/template_options/34603/background-image-0a944256.png')] bg-cover bg-center opacity-80"></div>
      <div className="fixed inset-0 bg-black/50"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Influenciadores</h1>
            <p className="text-white/60">Gerencie os criadores de conteúdo da sua loja</p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleLogout}
              variant="destructive"
              size="lg"
            >
              <LogOut className='w-4 h-4' />
              <span className="hidden sm:inline">Sair</span>
            </Button>
            <Button
              variant="default"
              size="lg"
              onClick={() => openModal()}
            >
              <PlusCircle className='w-4 h-4' />
              Adicionar
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {influencers.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-12 text-center max-w-lg mx-auto mt-12">
            <p className="text-zinc-400 text-lg mb-6">Nenhum influenciador cadastrado</p>
            <Button
              onClick={() => openModal()}
              size="lg"
            >
              <PlusCircle className="w-5 h-5" />
              Adicionar Primeiro Influenciador
            </Button>
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="influencers">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3"
                >
                  {influencers.map((influencer, index) => (
                    <Draggable
                      key={influencer.id}
                      draggableId={String(influencer.id)}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`bg-white/2 select-none backdrop-blur-md border ${snapshot.isDragging ? 'border-primary/70' : 'border-white/5'
                            } rounded-lg p-4 transition-colors`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              {...provided.dragHandleProps}
                              className="text-zinc-500 hover:text-zinc-300 cursor-grab active:cursor-grabbing"
                            >
                              <GripVertical size={20} />
                            </div>

                            <div className="flex-shrink-0">
                              {influencer.image_url ? (
                                <img
                                  src={influencer.image_url}
                                  alt={influencer.name}
                                  className="w-12 h-12 rounded-full object-cover select-none pointer-events-none"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                                  <span className="text-zinc-500 text-lg font-bold">
                                    {influencer.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex-grow min-w-0">
                              <h3 className="text-white font-semibold truncate">{influencer.name}</h3>
                              <p className="text-white/60 text-xs">
                                {formatFollowers(influencer.followers_count)} seguidores
                              </p>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Button
                                onClick={() => handleMoveUp(index)}
                                variant="ghost"
                                size="icon"
                                disabled={index === 0}
                                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Mover para cima"
                              >
                                <ChevronUp size={20} />
                              </Button>

                              <Button
                                onClick={() => handleMoveDown(index)}
                                variant="ghost"
                                size="icon"
                                disabled={index === influencers.length - 1}
                                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Mover para baixo"
                              >
                                <ChevronDown size={20} />
                              </Button>

                              {influencer.social_link && (
                                <a
                                  href={influencer.social_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition"
                                  title="Abrir link"
                                >
                                  <ExternalLink size={15} />
                                </a>
                              )}

                              <Button
                                onClick={() => openModal(influencer)}
                                variant="outline"
                                size="icon"
                                title="Editar"
                              >
                                <Edit size={20} />
                              </Button>
                              
                              <Button
                                onClick={() => handleDelete(influencer.id)}
                                variant="destructive"
                                size="icon"
                                title="Deletar"
                              >
                                <Trash2 size={20} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      <InfluencerModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSave={handleSaveInfluencer}
        influencer={editingInfluencer}
      />
    </div>
  );
}
