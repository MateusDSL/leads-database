"use client"

import React, { useState, useEffect } from "react"
import Image from 'next/image';
import {
  Plus, Search, Filter, Download, TrendingUp, DollarSign, Calendar, Building2, Home, Settings, Target, Mail, Phone, BarChart3, FileText,
  Flame, Snowflake, Sun, CheckCircle2, Sparkles, Pencil
} from "lucide-react"
import { addDays, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, differenceInDays } from "date-fns";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StyledCard } from "@/components/ui/styled-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarRail, SidebarTrigger } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { LeadDetailSheet } from '@/components/LeadDetailSheet';
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import { supabase } from "../supabaseClient"

export type QualificationStatus = 'Quente' | 'Frio' | 'Morno' | 'Venda' | 'Novo';

export type Lead = {
  id: number;
  created_at: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  status?: 'novo' | 'qualificado' | 'proposta' | 'negociacao' | 'fechado' | 'perdido';
  source?: 'website' | 'linkedin' | 'google-ads' | 'indicacao' | 'email';
  value?: number;
  utm_source?: string;
  utm_campaign?: string;
  utm_medium?: string;
  utm_term?: string;
  utm_content?: string;
  qualification_status?: QualificationStatus;
  origem?: string;
};

const navigationData = {
  navMain: [
    {
      title: "Principal",
      items: [
        { title: "Dashboard", url: "#", icon: Home, isActive: true },
        { title: "Leads", url: "#", icon: Settings },
        { title: "Oportunidades", url: "#", icon: Target },
      ],
    },
    {
      title: "Comunicação",
      items: [
        { title: "Email Marketing", url: "#", icon: Mail },
        { title: "Chamadas", url: "#", icon: Phone },
      ],
    },
    {
      title: "Relatórios",
      items: [
        { title: "Analytics", url: "#", icon: BarChart3 },
        { title: "Relatórios", url: "#", icon: FileText },
      ],
    },
    {
      title: "Configurações",
      items: [
        { title: "Empresa", url: "#", icon: Building2 },
        { title: "Configurações", url: "#", icon: Settings },
      ],
    },
  ],
};

export const qualificationColors: { [key in QualificationStatus]: string } = {
  'Novo': "border-slate-300 bg-slate-50 text-slate-600 hover:bg-slate-100",
  'Quente': "border-red-300 bg-red-50 text-red-600 hover:bg-red-100",
  'Frio': "border-blue-300 bg-blue-50 text-blue-600 hover:bg-blue-100",
  'Morno': "border-orange-300 bg-orange-50 text-orange-600 hover:bg-orange-100",
  'Venda': "border-green-300 bg-green-50 text-green-600 hover:bg-green-100",
};

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

const capitalizeFirstLetter = (str?: string) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const getInitials = (name?: string) => {
  if (!name) return "";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const qualificationStatusOptions: { value: string; label: string }[] = [
  { value: "todos", label: "Todos os Status" },
  { value: "Quente", label: "Quente" },
  { value: "Morno", label: "Morno" },
  { value: "Frio", label: "Frio" },
  { value: "Venda", label: "Venda" },
];

const formatToBrasilia = (dateInput: string | Date, options: Intl.DateTimeFormatOptions) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return new Intl.DateTimeFormat('pt-BR', {
      ...options,
      timeZone: 'America/Sao_Paulo',
    }).format(date);
};

export default function LeadsDatabase() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [sourceFilter, setSourceFilter] = useState("todos");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfDay(new Date()),
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isBulkEditDialogOpen, setIsBulkEditDialogOpen] = useState(false);
  const [newBulkStatus, setNewBulkStatus] = useState<QualificationStatus | null>(null);

  useEffect(() => {
    async function getLeads() {
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (data) setLeads(data as Lead[]);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Ocorreu um erro desconhecido.");
      } finally {
        setLoading(false);
      }
    }
    getLeads();
  }, []);

  const getStandardizedOrigin = (source: string | undefined, utm_source: string | undefined): string => {
    if (utm_source === 'go-ads' || source === 'google-ads') return 'Google';
    if (utm_source === 'meta-ads') return 'Meta';
    if (source === 'linkedin') return 'LinkedIn';
    if (source === 'website') return 'Website';
    if (source === 'indicacao') return 'Indicação';
    if (source === 'email') return 'Email Marketing';
    if (!source && !utm_source) return 'Não Rastreada';
    return 'Outros';
  }

  const filteredLeads = leads.filter((lead) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (lead.name?.toLowerCase() || '').includes(searchLower) ||
      (lead.email?.toLowerCase() || '').includes(searchLower) ||
      (lead.company?.toLowerCase() || '').includes(searchLower);
    const matchesStatus =
      statusFilter === "todos" ||
      lead.qualification_status === statusFilter;
    const matchesSource = sourceFilter === "todos" || lead.origem === sourceFilter;
    let matchesDate = true;
    if (dateRange?.from) {
        const leadDate = new Date(lead.created_at);
        const fromDate = startOfDay(dateRange.from);
        const toDate = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
        matchesDate = leadDate >= fromDate && leadDate <= toDate;
    }
    return matchesSearch && matchesStatus && matchesSource && matchesDate;
  });
  
  const filteredForCards = leads.filter((lead) => {
    const matchesStatus =
      statusFilter === "todos" ||
      lead.qualification_status === statusFilter;
    const matchesSource = sourceFilter === "todos" || lead.origem === sourceFilter;
    let matchesDate = true;
    if (dateRange?.from) {
        const leadDate = new Date(lead.created_at);
        const fromDate = startOfDay(dateRange.from);
        const toDate = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
        matchesDate = leadDate >= fromDate && leadDate <= toDate;
    }
    return matchesStatus && matchesSource && matchesDate;
  });

  function getPreviousPeriodRange(): DateRange | undefined {
    if (!dateRange || !dateRange.from) return undefined;
    const from = dateRange.from;
    const to = dateRange.to ?? from;
    const diff = differenceInDays(to, from);
    const prevTo = addDays(from, -1);
    const prevFrom = addDays(prevTo, -diff);
    return { from: prevFrom, to: prevTo };
  }

  const prevDateRange = getPreviousPeriodRange();
  
  const filteredForCardsPrev = prevDateRange?.from
    ? leads.filter((lead) => {
        const leadDate = new Date(lead.created_at);
        const fromDate = startOfDay(prevDateRange.from!);
        const toDate = prevDateRange.to ? endOfDay(prevDateRange.to) : endOfDay(prevDateRange.from!);
        return leadDate >= fromDate && leadDate <= toDate;
      })
    : [];

  const totalLeads = filteredForCards.length;
  const qualifiedLeads = filteredForCards.filter((lead) => lead.status && ["qualificado", "proposta", "negociacao"].includes(lead.status)).length;
  const totalValue = filteredForCards.reduce((sum, lead) => sum + (lead.value || 0), 0);
  const conversionRate = totalLeads > 0 ? ((filteredForCards.filter((lead) => lead.status === "fechado").length / totalLeads) * 100).toFixed(1) : 0;

  const prevTotalLeads = filteredForCardsPrev.length;
  const prevQualifiedLeads = filteredForCardsPrev.filter((lead) => lead.status && ["qualificado", "proposta", "negociacao"].includes(lead.status)).length;
  const prevTotalValue = filteredForCardsPrev.reduce((sum, lead) => sum + (lead.value || 0), 0);
  const prevConversionRate = prevTotalLeads > 0 ? ((filteredForCardsPrev.filter((lead) => lead.status === "fechado").length / prevTotalLeads) * 100).toFixed(1) : 0;

  function getDelta(current: number, prev: number) {
    if (prev === 0) return current > 0 ? 100 : 0;
    const delta = (((current - prev) / prev) * 100);
    if (delta > -0.05 && delta < 0) return (0.0).toFixed(1);
    return delta.toFixed(1);
  }

  const handleAddLead = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const source = formData.get("source") as Lead['source'];
    const utm_source = undefined;
    const newLeadData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      company: formData.get("company") as string,
      status: "novo" as const,
      qualification_status: "Novo" as const,
      source: source,
      value: Number.parseInt(formData.get("value") as string) || 0,
      origem: getStandardizedOrigin(source, utm_source)
    };
    const { data, error } = await supabase.from('leads').insert([newLeadData]).select();
    if (error) {
      setError(error.message);
    } else if (data) {
      setLeads([data[0], ...leads]);
      setIsAddDialogOpen(false);
      event.currentTarget.reset();
    }
  };

  const handleQualificationChange = async (leadId: number, newQualification: QualificationStatus) => {
    setLeads(currentLeads => 
      currentLeads.map(lead => 
        lead.id === leadId 
          ? { ...lead, qualification_status: newQualification } 
          : lead
      )
    );
    const { error } = await supabase
      .from('leads')
      .update({ qualification_status: newQualification })
      .eq('id', leadId);
    if (error) {
      alert(`Erro ao atualizar o lead: ${error.message}`);
      setLeads(leads);
    }
  };
  
  const handleRowSelect = (leadId: number) => {
    setSelectedRows(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedRows(filteredLeads.map(lead => lead.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleBulkUpdate = async () => {
    if (!newBulkStatus || selectedRows.length === 0) return;

    setLeads(prevLeads =>
      prevLeads.map(lead =>
        selectedRows.includes(lead.id)
          ? { ...lead, qualification_status: newBulkStatus }
          : lead
      )
    );

    const updatePromises = selectedRows.map(id =>
      supabase
        .from('leads')
        .update({ qualification_status: newBulkStatus })
        .eq('id', id)
    );
    
    await Promise.all(updatePromises);

    setSelectedRows([]);
    setNewBulkStatus(null);
    setIsBulkEditDialogOpen(false);
  };

  const originFilterOptions = ["Todos", "Google", "Meta", "Não Rastreada"];

  return (
    <>
      <TooltipProvider>
        <SidebarProvider>
          <Sidebar>
            <SidebarHeader>
              <div className="flex items-center gap-2 px-4 py-2">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Building2 className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">CRM Pro</span>
                  <span className="text-xs text-muted-foreground">v2.0</span>
                </div>
              </div>
            </SidebarHeader>
            <SidebarContent>
              {navigationData.navMain.map((group) => (
                <SidebarGroup key={group.title}>
                  <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild isActive={item.isActive}>
                            <a href={item.url} className="flex items-center gap-2">
                              <item.icon className="size-4" />
                              {item.title}
                            </a>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}
            </SidebarContent>
            <SidebarRail />
          </Sidebar>
          <SidebarInset>
            <div className="min-h-screen bg-slate-100">
              <header className="border-b-2 border-black bg-white sticky top-0 z-10">
                  <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                      <SidebarTrigger className="-ml-1 border-2 border-black rounded-lg" />
                      <div className="flex items-center justify-between flex-1">
                          <div>
                              <h1 className="text-xl font-bold">Postcraft</h1>
                              <p className="text-sm text-gray-600">Seja bem-vindo de volta!</p>
                          </div>
                          <div className="flex gap-2">
                              <Button variant="outline" className="border-2 border-black font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all">
                                  Configurações
                              </Button>
                              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button className="border-2 border-black font-bold bg-blue-500 text-white shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all">
                                      <Plus className="w-4 h-4 mr-2" />
                                      Novo Lead
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                    <DialogTitle>Adicionar Novo Lead</DialogTitle>
                                    <DialogDescription>Preencha as informações do novo lead abaixo.</DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleAddLead} className="space-y-4">
                                      {/* ... Formulário de Novo Lead ... */}
                                    </form>
                                </DialogContent>
                              </Dialog>
                          </div>
                      </div>
                  </div>
              </header>
              
              <main className="container mx-auto px-4 py-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StyledCard className="p-4 bg-gradient-to-tr from-purple-400 to-pink-500 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
                      <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
                      <Building2 className="h-4 w-4 text-white/80" />
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="text-3xl font-bold">
                        {loading ? <Skeleton className="h-8 w-16 bg-white/20"/> : totalLeads}
                      </div>
                      <p className="text-xs text-white/80">{getDelta(totalLeads, prevTotalLeads)}% vs. período anterior</p>
                    </CardContent>
                  </StyledCard>
                   <StyledCard className="p-4 bg-gradient-to-tr from-blue-400 to-cyan-400 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
                      <CardTitle className="text-sm font-medium">Leads Qualificados</CardTitle>
                      <TrendingUp className="h-4 w-4 text-white/80" />
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="text-3xl font-bold">
                        {loading ? <Skeleton className="h-8 w-16 bg-white/20"/> : qualifiedLeads}
                      </div>
                      <p className="text-xs text-white/80">{getDelta(qualifiedLeads, prevQualifiedLeads)}% vs. período anterior</p>
                    </CardContent>
                  </StyledCard>
                   <StyledCard className="p-4">
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
                      <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="text-3xl font-bold">
                        {loading ? <Skeleton className="h-8 w-24"/> : `R$ ${totalValue.toLocaleString("pt-BR")}`}
                      </div>
                      <p className="text-xs text-muted-foreground">{getDelta(totalValue, prevTotalValue)}% vs. período anterior</p>
                    </CardContent>
                  </StyledCard>
                   <StyledCard className="p-4">
                     <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
                      <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
                      <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="text-3xl font-bold">
                        {loading ? <Skeleton className="h-8 w-16"/> : `${conversionRate}%`}
                      </div>
                      <p className="text-xs text-muted-foreground">{getDelta(Number(conversionRate), Number(prevConversionRate))}% vs. período anterior</p>
                    </CardContent>
                  </StyledCard>
                </div>

                <StyledCard>
                  <CardHeader>
                      <CardTitle>Todos os Leads</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input id="search" placeholder="Buscar por nome ou empresa..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 border-2 border-black rounded-lg"/>
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-auto min-w-[160px] border-2 border-black rounded-lg"><SelectValue placeholder="Status" /></SelectTrigger>
                            <SelectContent className="border-2 border-black rounded-lg">
                            {qualificationStatusOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <Select value={sourceFilter} onValueChange={setSourceFilter}>
                            <SelectTrigger className="w-full sm:w-auto min-w-[160px] border-2 border-black rounded-lg"><SelectValue placeholder="Origem" /></SelectTrigger>
                            <SelectContent className="border-2 border-black rounded-lg">
                            {originFilterOptions.map(opt => (
                                <SelectItem key={opt} value={opt === "Todos" ? "todos" : opt}>{opt}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <DateRangePicker date={dateRange} onDateChange={setDateRange} />
                        <Dialog open={isBulkEditDialogOpen} onOpenChange={setIsBulkEditDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="border-2 border-black font-bold" disabled={selectedRows.length === 0}>
                              <Pencil className="w-4 h-4 mr-2"/>
                              Editar ({selectedRows.length})
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Editar Leads em Massa</DialogTitle>
                              <DialogDescription>
                               Selecione a nova etiqueta para os {selectedRows.length} leads selecionados.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <RadioGroup onValueChange={(value) => setNewBulkStatus(value as QualificationStatus)}>
                                {qualificationOptions.map(status => (
                                  <div key={status} className="flex items-center space-x-2">
                                    <RadioGroupItem value={status} id={status} />
                                    <Label htmlFor={status}>{status}</Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </div>
                            <DialogFooter>
                              <Button variant="ghost" onClick={() => setIsBulkEditDialogOpen(false)}>Cancelar</Button>
                              <Button onClick={handleBulkUpdate} disabled={!newBulkStatus}>Salvar Alterações</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                    </div>
                    
                    <div className="rounded-lg border-2 border-black overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b-2 border-black bg-slate-50">
                            <TableHead className="w-[50px]">
                              <Checkbox
                                checked={
                                  filteredLeads.length > 0 && selectedRows.length === filteredLeads.length
                                    ? true
                                    : selectedRows.length > 0 
                                    ? "indeterminate"
                                    : false
                                }
                                onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                aria-label="Selecionar todos"
                              />
                            </TableHead>
                            <TableHead className="font-bold text-black">Nome</TableHead>
                            <TableHead className="font-bold text-black">Telefone</TableHead>
                            <TableHead className="font-bold text-black">Origem</TableHead>
                            <TableHead className="font-bold text-black">Qualificação</TableHead>
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
                              </TableRow>
                            ))
                          ) : filteredLeads.length > 0 ? (
                            filteredLeads.map((lead) => (
                                <TableRow 
                                    key={lead.id} 
                                    className="border-b-2 border-black last:border-b-0"
                                    data-state={selectedRows.includes(lead.id) && "selected"}
                                >
                                <TableCell>
                                  <Checkbox
                                    checked={selectedRows.includes(lead.id)}
                                    onCheckedChange={() => handleRowSelect(lead.id)}
                                    aria-label="Selecionar linha"
                                  />
                                </TableCell>
                                <TableCell 
                                  className="font-bold cursor-pointer"
                                  onClick={() => setSelectedLead(lead)}
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
                                    {lead.origem === 'Google' ? (
                                      <img
                                        src="/images/logo.webp"
                                        alt="Logo do Google"
                                        className="w-4 h-4"
                                      />
                                    ) : null}
                                    <span>{lead.origem ?? 'N/A'}</span>
                                  </div>
                                </TableCell>

                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "px-2 py-1 h-auto text-xs font-bold border-2 border-black",
                                                    qualificationColors[lead.qualification_status ?? 'Novo']
                                                )}
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
                                                        onSelect={() => handleQualificationChange(lead.id, status)}
                                                    >
                                                        <Icon className="w-4 h-4 mr-2" />
                                                        {status}
                                                    </DropdownMenuItem>
                                                )
                                            })}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                                </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                                Nenhum lead encontrado com os filtros aplicados.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </StyledCard>
              </main>
            </div>
          </SidebarInset>
        </SidebarProvider>
        <LeadDetailSheet 
          isOpen={!!selectedLead}
          onOpenChange={(isOpen) => { if (!isOpen) setSelectedLead(null); }}
          lead={selectedLead}
        />
      </TooltipProvider>
    </>
  )
}