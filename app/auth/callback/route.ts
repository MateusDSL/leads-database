// app/auth/callback/route.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // se estiver usando PKCE, o Supabase gerencia isso automaticamente
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value
            },
            set(name: string, value: string, options: CookieOptions) {
                // Ignora no server-side, o cliente fará isso
            },
            remove(name: string, options: CookieOptions) {
                // Ignora no server-side
            },
          },
        }
    )
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // URL para redirecionar em caso de erro ou se não houver código
  return NextResponse.redirect(`${origin}/login?error=Authentication failed`);
}