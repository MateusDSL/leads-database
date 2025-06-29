"use client"

import React, { useState, useEffect } from "react"
import {
  Plus, Search, Filter, Download, TrendingUp, DollarSign, Calendar, Building2, Home, Settings, Target, Mail, Phone, BarChart3, FileText,
  Flame, Snowflake, Sun, CheckCircle2, Sparkles
} from "lucide-react"
import { addDays, startOfDay, endOfDay, startOfMonth, differenceInDays } from "date-fns";
import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
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
  'Novo': "border-transparent bg-slate-100 text-slate-700 hover:bg-slate-200",
  'Quente': "border-transparent bg-red-100 text-red-700 hover:bg-red-200",
  'Frio': "border-transparent bg-blue-100 text-blue-700 hover:bg-blue-200",
  'Morno': "border-transparent bg-orange-100 text-orange-700 hover:bg-orange-200",
  'Venda': "border-transparent bg-green-100 text-green-700 hover:bg-green-200",
};

const qualificationIcons: { [key in QualificationStatus]: React.ComponentType<{ className?: string }> } = {
  'Novo': Sparkles,
  'Quente': Flame,
  'Frio': Snowflake,
  'Morno': Sun,
  'Venda': CheckCircle2,
};

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
            <div className="min-h-screen bg-slate-50">
              <header className="border-b bg-background sticky top-0 z-10">
                  <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                      <SidebarTrigger className="-ml-1" />
                      <div className="flex items-center justify-between flex-1">
                          <div>
                              <h1 className="text-xl font-bold text-gray-900">Olá, João! 👋</h1>
                              <p className="text-sm text-gray-600">Aqui está o resumo dos seus leads hoje.</p>
                          </div>
                          <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                  <Download className="w-4 h-4 mr-2" />
                                  Exportar
                              </Button>
                              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                              <DialogTrigger asChild>
                                  <Button size="sm">
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
                                  <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                      <Label htmlFor="name">Nome</Label>
                                      <Input id="name" name="name" required />
                                      </div>
                                      <div className="space-y-2">
                                      <Label htmlFor="company">Empresa</Label>
                                      <Input id="company" name="company" required />
                                      </div>
                                  </div>
                                  <div className="space-y-2">
                                      <Label htmlFor="email">Email</Label>
                                      <Input id="email" name="email" type="email" required />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                      <Label htmlFor="phone">Telefone</Label>
                                      <Input id="phone" name="phone" />
                                      </div>
                                      <div className="space-y-2">
                                      <Label htmlFor="value">Valor Potencial</Label>
                                      <Input id="value" name="value" type="number" placeholder="0" />
                                      </div>
                                  </div>
                                  <div className="space-y-2">
                                      <Label htmlFor="source">Origem do Formulário</Label>
                                      <Select name="source" required>
                                      <SelectTrigger>
                                          <SelectValue placeholder="Selecione a origem" />
                                      </SelectTrigger>
                                      <SelectContent>
                                          <SelectItem value="website">Website</SelectItem>
                                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                                          <SelectItem value="google-ads">Google Ads</SelectItem>
                                          <SelectItem value="indicacao">Indicação</SelectItem>
                                          <SelectItem value="email">Email Marketing</SelectItem>
                                      </SelectContent>
                                      </Select>
                                  </div>
                                  <div className="flex justify-end gap-2 pt-4">
                                      <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                      Cancelar
                                      </Button>
                                      <Button type="submit">Adicionar Lead</Button>
                                  </div>
                                  </form>
                              </DialogContent>
                              </Dialog>
                          </div>
                      </div>
                  </div>
              </header>
              
              <main className="container mx-auto px-4 py-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
                      <div className="p-2 bg-blue-100 rounded-lg">
                          <Building2 className="h-4 w-4 text-blue-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline gap-2 text-3xl font-bold">
                        {loading ? <Skeleton className="h-8 w-16"/> : totalLeads}
                        <span className={`text-sm font-medium ${Number(getDelta(totalLeads, prevTotalLeads)) >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {loading ? <Skeleton className="h-4 w-12"/> : `${getDelta(totalLeads, prevTotalLeads)}%`}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">vs. período anterior</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Leads Qualificados</CardTitle>
                      <div className="p-2 bg-orange-100 rounded-lg">
                          <TrendingUp className="h-4 w-4 text-orange-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline gap-2 text-3xl font-bold">
                        {loading ? <Skeleton className="h-8 w-16"/> : qualifiedLeads}
                        <span className={`text-sm font-medium ${Number(getDelta(qualifiedLeads, prevQualifiedLeads)) >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {loading ? <Skeleton className="h-4 w-12"/> : `${getDelta(qualifiedLeads, prevQualifiedLeads)}%`}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">vs. período anterior</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                      <div className="p-2 bg-green-100 rounded-lg">
                          <DollarSign className="h-4 w-4 text-green-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline gap-2 text-3xl font-bold">
                        {loading ? <Skeleton className="h-8 w-24"/> : `R$ ${totalValue.toLocaleString("pt-BR")}`}
                        <span className={`text-sm font-medium ${Number(getDelta(totalValue, prevTotalValue)) >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {loading ? <Skeleton className="h-4 w-12"/> : `${getDelta(totalValue, prevTotalValue)}%`}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">vs. período anterior</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
                      <div className="p-2 bg-purple-100 rounded-lg">
                          <Target className="h-4 w-4 text-purple-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline gap-2 text-3xl font-bold">
                        {loading ? <Skeleton className="h-8 w-16"/> : `${conversionRate}%`}
                        <span className={`text-sm font-medium ${Number(getDelta(Number(conversionRate), Number(prevConversionRate))) >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {loading ? <Skeleton className="h-4 w-12"/> : `${getDelta(Number(conversionRate), Number(prevConversionRate))}%`}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">vs. período anterior</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardContent className="p-0">
                    <div className="p-4 border-b bg-slate-50/50">
                      <div className="flex flex-wrap items-center gap-4">
                          <div className="relative flex-1 min-w-[200px]">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                              <Input
                              placeholder="Buscar por nome ou empresa..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10 bg-white"
                              />
                          </div>
                          <Select value={statusFilter} onValueChange={setStatusFilter}>
                              <SelectTrigger className="w-full sm:w-auto min-w-[160px] bg-white">
                              <Filter className="w-4 h-4 mr-2" />
                              <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                              {qualificationStatusOptions.map(opt => (
                                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                              </SelectContent>
                          </Select>
                          <Select value={sourceFilter} onValueChange={setSourceFilter}>
                              <SelectTrigger className="w-full sm:w-auto min-w-[160px] bg-white">
                              <Mail className="w-4 h-4 mr-2" />
                              <SelectValue placeholder="Origem" />
                              </SelectTrigger>
                              <SelectContent>
                              {originFilterOptions.map(opt => (
                                  <SelectItem key={opt} value={opt === "Todos" ? "todos" : opt}>{opt}</SelectItem>
                              ))}
                              </SelectContent>
                          </Select>
                          <DateRangePicker date={dateRange} onDateChange={setDateRange} />
                      </div>
                    </div>

                    <div className="rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[120px]">Data</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Telefone</TableHead>
                            <TableHead>Origem</TableHead>
                            <TableHead>Qualificação</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loading ? (
                            Array.from({ length: 8 }).map((_, i) => (
                              <TableRow key={i} className="border-b">
                                <TableCell className="py-3"><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell className="py-3"><Skeleton className="h-5 w-32" /></TableCell>
                                <TableCell className="py-3"><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell className="py-3"><Skeleton className="h-5 w-20" /></TableCell>
                                <TableCell className="py-3"><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                              </TableRow>
                            ))
                          ) : error ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center text-red-500 py-8">
                                Falha ao carregar os leads: {error}
                              </TableCell>
                            </TableRow>
                          ) : filteredLeads.length > 0 ? (
                            filteredLeads.map((lead) => {
                              const Icon = qualificationIcons[lead.qualification_status ?? 'Novo'] || Sparkles;
                              return (
                                  <TableRow 
                                      key={lead.id} 
                                      className="border-b transition-colors hover:bg-gray-50 cursor-pointer"
                                      onClick={() => setSelectedLead(lead)}
                                  >
                                  <TableCell className="py-3 text-muted-foreground">
                                      {formatToBrasilia(lead.created_at, { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                  </TableCell>
                                  <TableCell className="font-medium text-gray-800">
                                      <div className="flex items-center gap-3">
                                      <Avatar className="h-9 w-9">
                                          <AvatarFallback>{getInitials(lead.name)}</AvatarFallback>
                                      </Avatar>
                                      <div>
                                          {capitalizeFirstLetter(lead.name) ?? 'N/A'}
                                          <div className="text-xs text-muted-foreground">{lead.email}</div>
                                      </div>
                                      </div>
                                  </TableCell>
                                  <TableCell className="text-muted-foreground">{formatPhoneNumber(lead.phone)}</TableCell>
                                  <TableCell className="text-muted-foreground">{lead.origem ?? 'N/A'}</TableCell>
                                  
                                  {/* --- CÉLULA DE QUALIFICAÇÃO CORRIGIDA E MELHORADA --- */}
                                  <TableCell>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                              <span className={cn(
                                                  "inline-flex items-center gap-1.5 cursor-pointer rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors",
                                                  qualificationColors[lead.qualification_status ?? 'Novo']
                                              )}>
                                                <Icon className="h-3 w-3" />
                                                {lead.qualification_status ?? "Novo"}
                                              </span>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                              <DropdownMenuItem onSelect={() => handleQualificationChange(lead.id, 'Quente')}>Quente</DropdownMenuItem>
                                              <DropdownMenuItem onSelect={() => handleQualificationChange(lead.id, 'Morno')}>Morno</DropdownMenuItem>
                                              <DropdownMenuItem onSelect={() => handleQualificationChange(lead.id, 'Frio')}>Frio</DropdownMenuItem>
                                              <DropdownMenuItem onSelect={() => handleQualificationChange(lead.id, 'Venda')}>Venda</DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Clique para alterar</p>
                                        </TooltipContent>
                                      </Tooltip>
                                  </TableCell>
                                  </TableRow>
                              )
                            })
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
                </Card>
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