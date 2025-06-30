import type { Metadata } from 'next'
import { Inter } from 'next/font/google' // Mude de Poppins para Inter
import './globals.css'
import { cn } from '@/lib/utils'

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Leads CRM',
  description: 'Dashboard de Leads com design shadcn/ui',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-sans antialiased', fontSans.variable)}>
        {children}
      </body>
    </html>
  )
}