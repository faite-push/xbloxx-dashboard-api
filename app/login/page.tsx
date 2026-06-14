'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao fazer login');
      }

      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="fixed inset-0 bg-[url('https://xbloxx.com/cdn/stores/22146/template_options/34603/background-image-0a944256.png')] bg-cover bg-center opacity-80"></div>
      <div className="fixed inset-0 bg-black/50"></div>

      <Card className="w-full max-w-lg bg-white/1 backdrop-blur-sm relative z-10">
        <CardHeader className="text-center">
          <img src="https://xbloxx.com/cdn/stores/22146/theme/b5cf652c-57c5-43d5-acf4-1aaf6590a91b.png" className='mx-auto' alt="Logo" width={100} height={100} />
          <CardTitle className="text-3xl font-bold text-white">Bem-vindo</CardTitle>
          <CardDescription className="text-zinc-400">Faça login para acessar o painel</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Usuário
              </Label>
              <Input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Usuário"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
                required
              />
            </div>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-white/10"></div>
              <span className="text-xs text-white/50">xbloxx.com</span>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>

            {error && (
              <div className="bg-destructive/15 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              variant="default"
              size="lg"
              className="w-full"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}