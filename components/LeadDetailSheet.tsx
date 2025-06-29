"use client"

import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Lead, getInitials, qualificationColors } from '@/app/page';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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

interface LeadDetailSheetProps {
  lead: Lead | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function LeadDetailSheet({ lead, isOpen, onOpenChange }: LeadDetailSheetProps) {
  if (!lead) return null;

  const renderDetail = (label: string, value: string | number | undefined | null) => {
    const displayValue = value ?? <span className="text-gray-400">N/A</span>;
    return (
      <div className="grid grid-cols-3 gap-2">
        <dt className="font-medium text-gray-600">{label}</dt>
        <dd className="col-span-2 text-gray-800">{displayValue}</dd>
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg p-0 flex flex-col">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{getInitials(lead.name)}</AvatarFallback>
            </Avatar>
            <span className="text-xl">{lead.name ?? 'Detalhes do Lead'}</span>
          </SheetTitle>
          <SheetDescription>
            {lead.company ?? 'Sem empresa'} • Lead desde {formatToBrasilia(lead.created_at, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            <dl className="space-y-2 text-sm">
              <h3 className="font-semibold mb-3 text-base">Informações do Lead</h3>
              {renderDetail("Email", lead.email)}
              {renderDetail("Telefone", lead.phone)}
              <div className="grid grid-cols-3 gap-2 items-center">
                  <dt className="font-medium text-gray-600">Qualificação</dt>
                  <dd className="col-span-2">
                      <Badge className={cn(qualificationColors[lead.qualification_status ?? 'Novo'])}>
                        {lead.qualification_status ?? 'Novo'}
                      </Badge>
                  </dd>
              </div>
              {renderDetail("Origem", lead.origem)}
              {renderDetail("Valor", lead.value ? `R$ ${lead.value.toLocaleString('pt-BR')}`: 'N/A')}
            </dl>

            <Separator />

            <dl className="space-y-2 text-sm">
              <h3 className="font-semibold mb-3 text-base">Detalhes de Marketing (UTM)</h3>
              {renderDetail("UTM Source", lead.utm_source)}
              {renderDetail("UTM Campaign", lead.utm_campaign)}
              {renderDetail("UTM Medium", lead.utm_medium)}
              {renderDetail("UTM Term", lead.utm_term)}
              {renderDetail("UTM Content", lead.utm_content)}
            </dl>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}