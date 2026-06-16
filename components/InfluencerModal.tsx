'use client';

import { useState, useEffect } from 'react';
import { X, Image, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface Influencer {
  id?: number;
  name: string;
  followers_count: string;
  image_url?: string;
  social_link?: string;
}

interface InfluencerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Influencer) => Promise<void>;
  influencer?: Influencer;
}

export default function InfluencerModal({ isOpen, onClose, onSave, influencer }: InfluencerModalProps) {
  const [formData, setFormData] = useState<Influencer>({
    name: '',
    followers_count: '',
    image_url: '',
    social_link: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (influencer) {
      setFormData(influencer);
      setImagePreview(influencer.image_url || '');
    } else {
      setFormData({
        name: '',
        followers_count: '',
        image_url: '',
        social_link: '',
      });
      setImagePreview('');
    }
    setError('');
  }, [influencer, isOpen]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Imagem muito grande (máximo 10MB)');
        return;
      }

      setLoading(true);
      setError('');
      
      try {
        const response = await fetch(`/api/admin/upload?filename=${file.name}`, {
          method: 'POST',
          body: file,
        });

        if (!response.ok) {
          throw new Error('Falha no upload da imagem');
        }

        const blob = await response.json();
        setImagePreview(blob.url);
        setFormData({ ...formData, image_url: blob.url });
      } catch (err) {
        setError('Erro ao enviar imagem. Tente novamente.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setError('');
    setLoading(true);

    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar influenciador');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-black opacity-100 border border-white/10 rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            {influencer ? 'Editar Influenciador' : 'Novo Influenciador'}
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
          >
            <X size={24} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-2">
                Nome
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: João Silva"
                required
              />
            </div>

            <div>
              <Label htmlFor="followers" className="block text-sm font-medium text-zinc-300 mb-2">
                Seguidores
              </Label>
              <Input
                id="followers"
                type="text"
                value={formData.followers_count}
                onChange={(e) => setFormData({ ...formData, followers_count: e.target.value })}
                placeholder="Ex: 150000"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="image" className="block text-sm font-medium text-zinc-300 mb-2">
              Foto do Influenciador
            </Label>
            <div className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center hover:border-zinc-600 transition-colors relative">
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 rounded-full object-cover mx-auto"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImagePreview('');
                      setFormData({ ...formData, image_url: '' });
                    }}
                    className="absolute z-20 -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div>
                  <Image size={48} className="mx-auto text-zinc-500 mb-4" />
                  <p className="text-zinc-400 mb-2">
                    Clique para enviar ou arraste a imagem aqui
                  </p>
                  <p className="text-zinc-500 text-sm">PNG, JPG, WEBP até 10MB</p>
                </div>
              )}
              <Input
                id="image"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="social_link" className="block text-sm font-medium text-zinc-300 mb-2">
              Link do YouTube
            </Label>
            <Input
              id="social_link"
              type="url"
              value={formData.social_link || ''}
              onChange={(e) => setFormData({ ...formData, social_link: e.target.value })}
              placeholder="https://youtube.com/@usuario"
            />
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="submit"
              variant="default"
              size="lg"
              className='flex-2'
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className='flex-1'
              onClick={onClose}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
