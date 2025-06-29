"use client"

import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Lead, getInitials, qualificationColors } from '@/app/page';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { cn } from '@/lib/utils';

// Função helper para formatar a data usando a API Intl nativa
const formatToBrasilia = (dateInput: string | Date, options: Intl.DateTimeFormatOptions) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return new Intl.DateTimeFormat('pt-BR', {
      ...options,
      timeZone: 'America/Sao_Paulo',
    }).format(date);
};

// Função para formatar o telefone, para que o componente seja independente
const formatPhoneNumber = (phoneStr?: string) => {
    if (!phoneStr) return 'N/A';
    const digitsOnly = phoneStr.replace(/\D/g, '');
    if (digitsOnly.length === 11) {
      return `+55 (${digitsOnly.substring(0, 2)}) ${digitsOnly.substring(2, 3)} ${digitsOnly.substring(3, 7)}-${digitsOnly.substring(7)}`;
    }
    if (digitsOnly.length === 10) {
      return `+55 (${digitsOnly.substring(0, 2)}) ${digitsOnly.substring(2, 6)}-${digitsOnly.substring(6)}`;
    }
    return phoneStr;
};

interface LeadDetailSheetProps {
  lead: Lead | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function LeadDetailSheet({ lead, isOpen, onOpenChange }: LeadDetailSheetProps) {
  if (!lead) return null;

  // Helper para renderizar um detalhe, evitando repetição
  const renderDetail = (label: string, value: string | number | undefined | null) => {
    const displayValue = value ?? <span className="text-gray-400">N/A</span>;
    return (
      <div className="grid grid-cols-3 gap-2 py-2">
        <dt className="font-medium text-gray-500">{label}</dt>
        <dd className="col-span-2 text-gray-800">{displayValue}</dd>
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg p-0 flex flex-col">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{getInitials(lead.name)}</AvatarFallback>
            </Avatar>
            <span className="text-xl">{lead.name ?? 'Detalhes do Lead'}</span>
          </SheetTitle>
          <SheetDescription>
            {lead.company ?? 'Sem empresa'} • Lead desde {formatToBrasilia(lead.created_at, { day: '2-digit', month: 'long', year: 'numeric'})}
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-4">
            
            <div>
                <h3 className="font-semibold mb-2 text-base text-gray-800">Informações do Lead</h3>
                <dl className="space-y-1 text-sm divide-y">
                    {renderDetail("Email", lead.email)}
                    {renderDetail("Telefone", formatPhoneNumber(lead.phone))}
                    <div className="grid grid-cols-3 gap-2 py-2 items-center">
                        <dt className="font-medium text-gray-500">Qualificação</dt>
                        <dd className="col-span-2">
                            <span className={cn(
                                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
                                qualificationColors[lead.qualification_status ?? 'Novo']
                            )}>
                                {lead.qualification_status ?? 'Novo'}
                            </span>
                        </dd>
                    </div>
                    {renderDetail("Origem", lead.origem)}
                    {renderDetail("Valor", lead.value ? `R$ ${lead.value.toLocaleString('pt-BR')}`: 'N/A')}
                </dl>
            </div>

            <Separator />

            <div>
                <h3 className="font-semibold mb-2 text-base text-gray-800">Detalhes de Marketing (UTM)</h3>
                <dl className="space-y-1 text-sm divide-y">
                    {renderDetail("UTM Source", lead.utm_source)}
                    {renderDetail("UTM Campaign", lead.utm_campaign)}
                    {renderDetail("UTM Medium", lead.utm_medium)}
                    {renderDetail("UTM Term", lead.utm_term)}
                    {renderDetail("UTM Content", lead.utm_content)}
                </dl>
            </div>

          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}