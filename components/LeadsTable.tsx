"use client"

import React, { useState, useEffect, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Lead, QualificationStatus } from '@/app/page'
import { format } from 'date-fns'

// Helper functions
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

interface LeadsTableProps {
  loading: boolean;
  leads: Lead[];
  selectedRows: number[];
  onRowSelect: (leadIds: number[]) => void;
  onQualificationChange: (leadId: number, newQualification: QualificationStatus) => void;
  onLeadClick: (lead: Lead) => void;
}

// 1. CRIAMOS UM MAPA PARA AS CORES DAS ETIQUETAS DE QUALIFICAÇÃO
const qualificationVariantMap: Record<QualificationStatus, React.ComponentProps<typeof Badge>['variant']> = {
  'Quente': 'destructive',
  'Morno': 'default',
  'Frio': 'secondary',
  'Novo': 'outline',
  'Venda': 'default',
};

export function LeadsTable({
  loading,
  leads,
  selectedRows,
  onRowSelect,
  onQualificationChange,
  onLeadClick,
}: LeadsTableProps) {
  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    onRowSelect(checked ? leads.map((lead) => lead.id) : [])
  }

  const isAllSelected = selectedRows.length > 0 && selectedRows.length === leads.length;
  const isSomeSelected = selectedRows.length > 0 && selectedRows.length < leads.length;

  // 2. FUNÇÃO AUXILIAR PARA RENDERIZAR A ORIGEM COM ÍCONE
  const renderOrigin = (origin: string | undefined) => {
    const isGoogle = origin?.toLowerCase() === 'google' || origin?.toLowerCase() === 'go-ads';

    if (isGoogle) {
      return (
        <div className="flex items-center gap-2">
          <div className="flex size-4 items-center justify-center rounded-full bg-white border border-gray-300">
            <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.3 1.62-3.85 1.62-4.64 0-8.59-3.82-8.59-8.59s3.95-8.59 8.59-8.59c2.52 0 4.22.98 5.4 2.01l2.6-2.6C18.09 1.76 15.47 0 12.48 0 5.88 0 .04 5.88.04 12.5s5.84 12.5 12.44 12.5c3.27 0 5.74-1.15 7.6-3.05 1.96-1.96 2.56-4.94 2.56-7.66 0-.85-.09-1.35-.19-1.84h-9.9z" fill="#4285F4"/>
            </svg>
          </div>
          <span>Google</span>
        </div>
      );
    }
    return <span>{origin}</span>;
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead style={{ width: '50px' }}>
                  <Checkbox
                    checked={isAllSelected ? true : isSomeSelected ? 'indeterminate' : false}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Qualificação</TableHead>
                <TableHead>Comentário</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="flex items-center gap-2">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : leads.length > 0 ? (
                leads.map((lead) => (
                  <TableRow 
                    key={lead.id} 
                    data-state={selectedRows.includes(lead.id) ? "selected" : "unselected"}
                    onClick={() => onLeadClick(lead)}
                    className="cursor-pointer"
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedRows.includes(lead.id)}
                        onCheckedChange={(checked) => {
                          const newSelectedRows = checked
                            ? [...selectedRows, lead.id]
                            : selectedRows.filter((id) => id !== lead.id);
                          onRowSelect(newSelectedRows);
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(lead.created_at), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarFallback>{lead.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        {lead.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatPhoneNumber(lead.phone)}</TableCell>
                    
                    {/* 3. CÉLULA DA ORIGEM USANDO A NOVA LÓGICA */}
                    <TableCell>{renderOrigin(lead.origem ?? 'N/A')}</TableCell>

                    {/* 4. CÉLULA DA QUALIFICAÇÃO COM CORES DINÂMICAS */}
                    <TableCell>
                      <Badge variant={qualificationVariantMap[lead.qualification_status ?? 'Novo'] || 'outline'}>
                        {lead.qualification_status ?? 'Novo'}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {lead.comment || "-"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Nenhum lead encontrado com os filtros aplicados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}