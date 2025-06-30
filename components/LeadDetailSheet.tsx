// components/LeadDetailSheet.tsx

"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Lead, QualificationStatus, qualificationColors } from "@/app/page";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';
import { supabase } from '@/supabaseClient';

const formatToBrasilia = (dateInput: string | Date, options: Intl.DateTimeFormatOptions) => {
    if (!dateInput) return '';
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return new Intl.DateTimeFormat('pt-BR', { ...options, timeZone: 'America/Sao_Paulo' }).format(date);
};
const formatPhoneNumber = (phoneStr?: string) => {
    if (!phoneStr) return 'N/A';
    const digitsOnly = phoneStr.replace(/\D/g, '');
    if (digitsOnly.length === 11) return `+55 (${digitsOnly.substring(0, 2)}) ${digitsOnly.substring(2, 3)} ${digitsOnly.substring(3, 7)}-${digitsOnly.substring(7)}`;
    if (digitsOnly.length === 10) return `+55 (${digitsOnly.substring(0, 2)}) ${digitsOnly.substring(2, 6)}-${digitsOnly.substring(6)}`;
    return phoneStr;
};
const getInitials = (name?: string) => {
  if (!name) return "";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const headerGradientColors: { [key in QualificationStatus]?: string } = {
    'Quente': 'bg-gradient-to-tr from-red-400 to-orange-400',
    'Frio': 'bg-gradient-to-tr from-sky-400 to-blue-400',
    'Morno': 'bg-gradient-to-tr from-amber-400 to-yellow-400',
    'Venda': 'bg-gradient-to-tr from-emerald-400 to-green-500',
    'Novo': 'bg-slate-100',
};

interface LeadDetailSheetProps {
  lead: Lead | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function LeadDetailSheet({ lead, isOpen, onOpenChange }: LeadDetailSheetProps) {
  const router = useRouter();
  const [comment, setComment] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (lead) {
      setComment(lead.comment || '');
    }
  }, [lead]);

  // A linha 'if (!lead) return null;' foi removida daqui para permitir a animação de saída.

  const handleSaveChanges = async () => {
    if (!lead) return; // Proteção extra
    setIsSaving(true);
    const { error } = await supabase
      .from('leads')
      .update({ comment: comment })
      .eq('id', lead.id);

    if (error) {
      alert("Erro ao salvar o comentário: " + error.message);
      setIsSaving(false);
    } else {
      setIsSaving(false);
      onOpenChange(false);
      router.refresh();
    }
  };

  const renderDetail = (label: string, value: React.ReactNode) => (
    <div className="grid grid-cols-3 gap-2 py-2">
        <dt className="font-medium text-gray-500">{label}</dt>
        <dd className="col-span-2 text-gray-800">{value ?? <span className="text-gray-400">N/A</span>}</dd>
    </div>
  );

  const status = lead?.qualification_status ?? 'Novo';
  const isColoredHeader = status !== 'Novo';

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg p-0 flex flex-col border-l-2 border-black">
        <SheetHeader className={cn(
            "p-6 border-b-2 border-black",
            headerGradientColors[status],
            isColoredHeader && 'text-white'
        )}>
          <SheetTitle className={cn( "flex items-center gap-3", isColoredHeader && 'text-white' )}>
            <Avatar className={cn( "h-10 w-10 border-2 border-black", isColoredHeader && 'bg-white/30 border-white/50 text-white' )}>
              <AvatarFallback className="font-bold bg-transparent">{getInitials(lead?.name)}</AvatarFallback>
            </Avatar>
            <span className="text-xl font-bold">{lead?.name ?? 'Detalhes do Lead'}</span>
          </SheetTitle>
          <SheetDescription className={cn(isColoredHeader && 'text-white/80')}>
             Lead desde {formatToBrasilia(lead?.created_at ?? '', { day: '2-digit', month: 'long', year: 'numeric'})}
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="flex-1 bg-white">
          <div className="p-6 space-y-4">
            <div>
                <h3 className="font-semibold mb-2 text-base text-gray-800">Informações do Lead</h3>
                <dl className="space-y-1 text-sm divide-y">
                    {renderDetail("Telefone", formatPhoneNumber(lead?.phone))}
                    <div className="grid grid-cols-3 gap-2 py-2 items-center">
                        <dt className="font-medium text-gray-500">Qualificação</dt>
                        <dd className="col-span-2">
                            <span className={cn( "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold", "border-transparent text-white", headerGradientColors[status])}>
                                {status}
                            </span>
                        </dd>
                    </div>
                    {renderDetail("Origem", lead?.origem)}
                </dl>
            </div>
            <Separator className="bg-slate-200"/>
            <div>
              <h3 className="font-semibold mb-2 text-base text-gray-800">Comentários</h3>
              <div className="space-y-2">
                <Label htmlFor="comment-textarea" className="text-gray-600">
                  Adicionar ou editar anotações sobre o lead:
                </Label>
                <Textarea id="comment-textarea" placeholder="Ex: Cliente demonstrou interesse no produto X, agendar follow-up para a próxima semana..." value={comment} onChange={(e) => setComment(e.target.value)} className="min-h-[120px] border-2 border-black rounded-lg" />
              </div>
            </div>
            <Separator className="bg-slate-200"/>
            <div>
                <h3 className="font-semibold mb-2 text-base text-gray-800">Detalhes de Marketing (UTM)</h3>
                <dl className="space-y-1 text-sm divide-y">
                    {renderDetail("UTM Source", lead?.utm_source)}
                    {renderDetail("UTM Campaign", lead?.utm_campaign)}
                    {renderDetail("UTM Medium", lead?.utm_medium)}
                    {renderDetail("UTM Term", lead?.utm_term)}
                    {renderDetail("UTM Content", lead?.utm_content)}
                </dl>
            </div>
          </div>
        </ScrollArea>
        <SheetFooter className="p-4 border-t-2 border-black bg-slate-50">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-2 border-black font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all">Cancelar</Button>
          <Button onClick={handleSaveChanges} disabled={isSaving} className="border-2 border-black font-bold bg-primary text-primary-foreground shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-all">
            {isSaving ? "A salvar..." : "Salvar Alterações"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}