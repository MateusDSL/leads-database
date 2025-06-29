// components/LeadsTable.tsx

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Lead, QualificationStatus, qualificationColors } from '@/app/page';
import { Flame, Snowflake, Sun, CheckCircle2, Sparkles } from "lucide-react";


const qualificationIcons: { [key in QualificationStatus]: React.ComponentType<{ className?: string }> } = {
  'Novo': Sparkles,
  'Quente': Flame,
  'Frio': Snowflake,
  'Morno': Sun,
  'Venda': CheckCircle2,
};

const qualificationOptions: QualificationStatus[] = ['Novo', 'Quente', 'Morno', 'Frio', 'Venda'];

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

const getInitials = (name?: string) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const capitalizeFirstLetter = (str?: string) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};


interface LeadsTableProps {
  loading: boolean;
  leads: Lead[];
  selectedRows: number[];
  onRowSelect: (leadId: number) => void;
  onSelectAll: (checked: boolean | 'indeterminate') => void;
  onQualificationChange: (leadId: number, newQualification: QualificationStatus) => void;
  onLeadClick: (lead: Lead) => void;
}

export function LeadsTable({
  loading,
  leads,
  selectedRows,
  onRowSelect,
  onSelectAll,
  onQualificationChange,
  onLeadClick,
}: LeadsTableProps) {
  return (
    <div className="rounded-lg border-2 border-black overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b-2 border-black bg-slate-50 hover:bg-slate-100">
            <TableHead className="w-[50px]">
              <Checkbox
                checked={
                  leads.length > 0 && selectedRows.length === leads.length
                    ? true
                    : selectedRows.length > 0
                    ? 'indeterminate'
                    : false
                }
                onCheckedChange={(checked) => onSelectAll(!!checked)}
                aria-label="Selecionar todos"
              />
            </TableHead>
            <TableHead className="font-bold text-black">Nome</TableHead>
            <TableHead className="font-bold text-black">Telefone</TableHead>
            <TableHead className="font-bold text-black">Origem</TableHead>
            <TableHead className="font-bold text-black">Qualificação</TableHead>
            <TableHead className="font-bold text-black">Comentário</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <TableRow key={i} className="border-b-2 border-black">
                <TableCell><Skeleton className="h-5 w-5"/></TableCell>
                <TableCell className="py-3"><Skeleton className="h-5 w-full" /></TableCell>
                <TableCell className="py-3"><Skeleton className="h-5 w-full" /></TableCell>
                <TableCell className="py-3"><Skeleton className="h-5 w-full" /></TableCell>
                <TableCell className="py-3"><Skeleton className="h-5 w-full" /></TableCell>
                <TableCell className="py-3"><Skeleton className="h-5 w-full" /></TableCell>
              </TableRow>
            ))
          ) : leads.length > 0 ? (
            leads.map((lead) => (
              <TableRow
                key={lead.id}
                className="border-b-2 border-black last:border-b-0"
                data-state={selectedRows.includes(lead.id) ? "selected" : "unselected"}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedRows.includes(lead.id)}
                    onCheckedChange={() => onRowSelect(lead.id)}
                    aria-label="Selecionar linha"
                  />
                </TableCell>
                <TableCell
                  className="font-bold cursor-pointer"
                  onClick={() => onLeadClick(lead)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border-2 border-black">
                      <AvatarFallback className="font-bold">{getInitials(lead.name)}</AvatarFallback>
                    </Avatar>
                    <span>{capitalizeFirstLetter(lead.name) ?? 'N/A'}</span>
                  </div>
                </TableCell>
                <TableCell>{formatPhoneNumber(lead.phone)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {lead.origem === 'Google' && (
                      <img src="/images/logo.webp" alt="Logo do Google" className="w-4 h-4" />
                    )}
                    <span>{lead.origem ?? 'N/A'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("px-2 py-1 h-auto text-xs font-bold border-2 border-black", qualificationColors[lead.qualification_status ?? 'Novo'])}
                      >
                        {lead.qualification_status ?? "Novo"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {qualificationOptions.map(status => {
                        const Icon = qualificationIcons[status];
                        return (
                          <DropdownMenuItem
                            key={status}
                            onSelect={() => onQualificationChange(lead.id, status)}
                          >
                            <Icon className="w-4 h-4 mr-2" />
                            {status}
                          </DropdownMenuItem>
                        )
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
                <TableCell className="text-sm text-gray-600 max-w-[200px] truncate">
                  {lead.comment || "-"}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                Nenhum lead encontrado com os filtros aplicados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}