import type { Metadata } from 'next'
import { Poppins } from 'next/font/google' // 1. Importar a fonte
import './globals.css'

// 2. Configurar a fonte com os pesos que vamos usar
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans', // Opcional, mas bom para Tailwind
})

export const metadata: Metadata = {
  title: 'Leads CRM', // Título atualizado para refletir melhor o projeto
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      {/* 3. Aplicar a classe da fonte ao body */}
      <body className={poppins.className}>{children}</body>
    </html>
  )
}