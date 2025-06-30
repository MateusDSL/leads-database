// app/login/page.tsx

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StyledCard } from '@/components/ui/styled-card';
import { Building2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Credenciais inválidas. Verifique seu e-mail e senha.");
    } else {
      router.push('/');
      router.refresh(); 
    }
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-slate-100 p-4">
        <StyledCard className="w-full max-w-4xl grid md:grid-cols-2 overflow-hidden p-0">
            
            {/* Coluna da Esquerda: Formulário */}
            <div className="flex flex-col justify-center p-8 sm:p-12 bg-white">
                <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <div className="flex aspect-square size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground mb-4 border-2 border-black">
                            <Building2 className="size-7" />
                        </div>
                        <h1 className="text-3xl font-bold">Bem-vindo de volta</h1>
                        <p className="text-muted-foreground text-balance">
                            Acesse sua conta para gerenciar seus leads.
                        </p>
                    </div>

                    <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="font-bold">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            className="border-2 border-black font-medium"
                        />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                        <Label htmlFor="password" className="font-bold">Senha</Label>
                        <Link
                            href="#"
                            className="ml-auto text-sm font-bold underline-offset-2 hover:underline"
                        >
                            Esqueceu sua senha?
                        </Link>
                        </div>
                        <Input 
                            id="password" 
                            type="password" 
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            className="border-2 border-black font-medium"
                        />
                    </div>
                    {error && (
                        <p className="text-sm font-medium text-destructive text-center">{error}</p>
                    )}
                    </div>
                    
                    <div className="flex flex-col gap-4">
                    <Button 
                        type="submit" 
                        className="w-full border-2 border-black bg-blue-500 text-white font-bold shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all" 
                        disabled={loading}
                    >
                        {loading ? 'Entrando...' : 'Login'}
                    </Button>
                    </div>

                    <div className="mt-4 text-center text-sm">
                        <span className="text-muted-foreground">Não tem uma conta?{" "}</span>
                        <Link href="/signup" className="font-bold underline underline-offset-4">
                            Cadastre-se
                        </Link>
                    </div>
                </div>
                </form>
            </div>

            {/* Coluna da Direita: Imagem de Fundo */}
            <div className="relative hidden items-end bg-gray-800 p-8 md:flex">
                {/* O código da imagem */}
                <img
                    src="/images/logo-login.jpg" 
                    alt="Pessoas em um escritório colaborando em um projeto."
                    className="absolute inset-0 h-full w-full object-cover opacity-40" // Estilos da imagem
                />              
            </div>
            
        </StyledCard>
    </main>
  )
}