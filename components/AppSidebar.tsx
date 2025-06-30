// components/AppSidebar.tsx

"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Users, 
  BarChart3, 
  Settings, 
  Building2,
  Target,
  // [!code focus:4]
  // --- Ícones novos para a secção de Campanhas ---
  Megaphone,
  TrendingUp,
  PieChart
} from 'lucide-react';
import { UserNav } from './user-nav';

const navGroups = [
  {
    title: "Principal",
    items: [
      { id: 'dashboard', title: "Painel Principal", icon: Home, href: "#" },
      { id: 'leads', title: "Todos os Leads", icon: Users, href: "#" },
      { id: 'opportunities', title: "Oportunidades", icon: Target, href: "#" },
    ]
  },
  // [!code focus:8]
  // --- NOVA SECÇÃO "CAMPANHAS" ADICIONADA ---
  {
    title: "Campanhas",
    items: [
      { id: 'meta-ads', title: "Meta Ads", icon: Megaphone, href: "#" },
      { id: 'google-ads', title: "Google Ads", icon: TrendingUp, href: "#" },
      { id: 'analytics', title: "Analytics", icon: PieChart, href: "#" },
    ]
  },
  {
    title: "Análise",
    items: [
      { id: 'reports', title: "Relatórios", icon: BarChart3, href: "#" },
    ]
  }
];

export function AppSidebar() {
  const [activeItem, setActiveItem] = useState('dashboard');

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-50 border-r-2 border-black">
      {/* Cabeçalho da Sidebar (sem alterações) */}
      <div className="flex items-center h-20 px-4 border-b-2 border-black">
        <div className="flex items-center gap-3">
          <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-black">WhatsFloat</span>
            <span className="text-xs text-slate-500">versão 2.0</span>
          </div>
        </div>
      </div>

      {/* Navegação Principal (sem alterações no código, apenas nos dados) */}
      <nav className="flex-1 px-2 py-4 space-y-4">
        {navGroups.map((group) => (
          <div key={group.title}>
            <h3 className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {group.title}
            </h3>
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    onClick={() => setActiveItem(item.id)}
                    className={cn(
                      "flex items-center justify-between gap-3 p-3 mx-2 rounded-lg text-sm font-bold transition-all duration-200",
                      "hover:bg-blue-100 hover:text-blue-700",
                      activeItem === item.id 
                        ? "bg-blue-500 text-white shadow-[3px_3px_0px_rgba(0,0,0,1)]" 
                        : "text-slate-600"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="size-5" />
                      <span>{item.title}</span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Rodapé com Perfil e Configurações (sem alterações) */}
      <footer className="p-2 mt-auto border-t-2 border-black">
        <div className="flex items-center justify-between">
          <a
            href="#"
            onClick={() => setActiveItem('settings')}
            title="Configurações"
            className={cn(
              "flex items-center justify-center p-2 rounded-lg transition-colors",
              activeItem === 'settings' ? "bg-blue-200 text-blue-700" : "text-slate-600 hover:bg-slate-200"
            )}
          >
            <Settings className="size-5" />
          </a>
          <UserNav />
        </div>
      </footer>
    </aside>
  );
}