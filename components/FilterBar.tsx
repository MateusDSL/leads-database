// components/FilterBar.tsx

import React from 'react';
import { Search, Pencil } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { QualificationStatus } from '@/app/page';

interface FilterBarProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  sourceFilter: string;
  onSourceFilterChange: (source: string) => void;
  dateRange: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
  selectedRowsCount: number;
  isBulkEditDialogOpen: boolean;
  onBulkEditOpenChange: (open: boolean) => void;
  onNewBulkStatusChange: (status: QualificationStatus) => void;
  handleBulkUpdate: () => void;
  newBulkStatus: QualificationStatus | null;
}

const qualificationStatusOptions = [
    { value: "todos", label: "Todos os Status" },
    { value: "Novo", label: "Novo" },
    { value: "Quente", label: "Quente" },
    { value: "Morno", label: "Morno" },
    { value: "Frio", label: "Frio" },
    { value: "Venda", label: "Venda" },
];

// ### LINHA ALTERADA AQUI ###
const originFilterOptions = ["Todos", "Google", "Meta", "Não Rastreada", "Outros"];

const qualificationOptions: QualificationStatus[] = ['Novo', 'Quente', 'Morno', 'Frio', 'Venda'];


export function FilterBar({
  searchTerm,
  onSearchTermChange,
  statusFilter,
  onStatusFilterChange,
  sourceFilter,
  onSourceFilterChange,
  dateRange,
  onDateChange,
  selectedRowsCount,
  isBulkEditDialogOpen,
  onBulkEditOpenChange,
  onNewBulkStatusChange,
  handleBulkUpdate,
  newBulkStatus
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-4">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          id="search"
          placeholder="Buscar por nome ou empresa..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="pl-10 border-2 border-black rounded-lg"
        />
      </div>
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-full sm:w-auto min-w-[160px] border-2 border-black rounded-lg">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent className="border-2 border-black rounded-lg">
          {qualificationStatusOptions.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={sourceFilter} onValueChange={onSourceFilterChange}>
        <SelectTrigger className="w-full sm:w-auto min-w-[160px] border-2 border-black rounded-lg">
          <SelectValue placeholder="Origem" />
        </SelectTrigger>
        <SelectContent className="border-2 border-black rounded-lg">
          {originFilterOptions.map(opt => (
            <SelectItem key={opt} value={opt === "Todos" ? "todos" : opt}>{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <DateRangePicker date={dateRange} onDateChange={onDateChange} />
      <Dialog open={isBulkEditDialogOpen} onOpenChange={onBulkEditOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline" className="border-2 border-black font-bold" disabled={selectedRowsCount === 0}>
            <Pencil className="w-4 h-4 mr-2" />
            Editar ({selectedRowsCount})
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Leads em Massa</DialogTitle>
            <DialogDescription>
              Selecione a nova etiqueta para os {selectedRowsCount} leads selecionados.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <RadioGroup onValueChange={(value) => onNewBulkStatusChange(value as QualificationStatus)}>
              {qualificationOptions.map(status => (
                <div key={status} className="flex items-center space-x-2">
                  <RadioGroupItem value={status} id={status} />
                  <Label htmlFor={status}>{status}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => onBulkEditOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleBulkUpdate} disabled={!newBulkStatus}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}