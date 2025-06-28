"use client"

import React, { useState, useEffect } from "react"
import {
  Plus, Search, Filter, Download, TrendingUp, DollarSign, Calendar, Building2, Home, Settings, Target, Mail, Phone, BarChart3, FileText
} from "lucide-react"
import { addDays, startOfDay, endOfDay, startOfMonth } from "date-fns";

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarRail, SidebarTrigger } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

import { supabase } from "../supabaseClient"

type QualificationStatus = 'Quente' | 'Frio' | 'Morno' | 'Venda';

type Lead = {
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
};

// Dados para a navegação da Sidebar
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

const qualificationColors: { [key in QualificationStatus]: string } = {
  'Quente': "border-transparent bg-red-500 text-white hover:bg-red-500/80",
  'Frio': "border-transparent bg-blue-500 text-white hover:bg-blue-500/80",
  'Morno': "border-transparent bg-yellow-500 text-white hover:bg-yellow-500/80",
  'Venda': "border-transparent bg-green-500 text-white hover:bg-green-500/80",
};

// --- CÓDIGO ADICIONADO ---
// Função para formatar o número de telefone
const formatPhoneNumber = (phoneStr?: string) => {
  if (!phoneStr) return 'N/A';

  // Remove todos os caracteres que não são dígitos
  const digitsOnly = phoneStr.replace(/\D/g, '');

  // Trata números de celular com 9º dígito (11 dígitos no total)
  if (digitsOnly.length === 11) {
    return `+55 (${digitsOnly.substring(0, 2)}) ${digitsOnly.substring(2, 3)} ${digitsOnly.substring(3, 7)}-${digitsOnly.substring(7)}`;
  }

  // Trata números de telefone fixo (10 dígitos no total)
  if (digitsOnly.length === 10) {
    return `+55 (${digitsOnly.substring(0, 2)}) ${digitsOnly.substring(2, 6)}-${digitsOnly.substring(6)}`;
  }
  
  // Se não for um formato esperado, retorna o número como veio
  return phoneStr;
};

// --- CÓDIGO ADICIONADO ---
// Função para capitalizar a primeira letra do nome
const capitalizeFirstLetter = (str?: string) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Função para obter as iniciais do nome
const getInitials = (name?: string) => {
  if (!name) return "";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Adicione as opções de filtro de status para corresponder às etiquetas de qualificação
const qualificationStatusOptions: { value: string; label: string }[] = [
  { value: "todos", label: "Todos os Status" },
  { value: "Quente", label: "Quente" },
  { value: "Morno", label: "Morno" },
  { value: "Frio", label: "Frio" },
  { value: "Venda", label: "Venda" },
];

export default function LeadsDatabase() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [sourceFilter, setSourceFilter] = useState("todos");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "last7" | "month" | "custom">("all");
  const [customDateRange, setCustomDateRange] = useState<{ from: string; to: string }>({
    from: "",
    to: "",
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

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

  const filteredLeads = leads.filter((lead) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (lead.name?.toLowerCase() || '').includes(searchLower) ||
      (lead.email?.toLowerCase() || '').includes(searchLower) ||
      (lead.company?.toLowerCase() || '').includes(searchLower);
    
    // Filtro de status baseado em qualification_status
    const matchesStatus =
      statusFilter === "todos" ||
      lead.qualification_status === statusFilter;
    const matchesSource = sourceFilter === "todos" || lead.source === sourceFilter;

    // --- CÓDIGO ADICIONADO: Filtro de data ---
    let matchesDate = true;
    if (dateFilter !== "all") {
      const leadDate = new Date(lead.created_at);
      const now = new Date();
      if (dateFilter === "today") {
        matchesDate =
          leadDate >= startOfDay(now) && leadDate <= endOfDay(now);
      } else if (dateFilter === "last7") {
        const sevenDaysAgo = startOfDay(addDays(now, -6));
        matchesDate = leadDate >= sevenDaysAgo && leadDate <= endOfDay(now);
      } else if (dateFilter === "month") {
        matchesDate =
          leadDate >= startOfMonth(now) && leadDate <= endOfDay(now);
      } else if (dateFilter === "custom" && customDateRange.from && customDateRange.to) {
        const from = startOfDay(new Date(customDateRange.from));
        const to = endOfDay(new Date(customDateRange.to));
        matchesDate = leadDate >= from && leadDate <= to;
      }
    }

    return matchesSearch && matchesStatus && matchesSource && matchesDate;
  });

  // Calcula os leads filtrados para os cards e para comparação
  const filteredForCards = leads.filter((lead) => {
    // Filtros de status, origem e data (sem filtro de busca)
    const matchesStatus =
      statusFilter === "todos" ||
      lead.qualification_status === statusFilter;
    const matchesSource = sourceFilter === "todos" || lead.source === sourceFilter;

    let matchesDate = true;
    if (dateFilter !== "all") {
      const leadDate = new Date(lead.created_at);
      const now = new Date();
      if (dateFilter === "today") {
        matchesDate =
          leadDate >= startOfDay(now) && leadDate <= endOfDay(now);
      } else if (dateFilter === "last7") {
        const sevenDaysAgo = startOfDay(addDays(now, -6));
        matchesDate = leadDate >= sevenDaysAgo && leadDate <= endOfDay(now);
      } else if (dateFilter === "month") {
        matchesDate =
          leadDate >= startOfMonth(now) && leadDate <= endOfDay(now);
      } else if (dateFilter === "custom" && customDateRange.from && customDateRange.to) {
        const from = startOfDay(new Date(customDateRange.from));
        const to = endOfDay(new Date(customDateRange.to));
        matchesDate = leadDate >= from && leadDate <= to;
      }
    }

    return matchesStatus && matchesSource && matchesDate;
  });

  // --- CÓDIGO ADICIONADO: Cálculo para comparação (período anterior) ---
  function getPreviousPeriodRange() {
    const now = new Date();
    if (dateFilter === "today") {
      const prev = addDays(now, -1);
      return [startOfDay(prev), endOfDay(prev)];
    }
    if (dateFilter === "last7") {
      const end = addDays(startOfDay(now), -7);
      const start = addDays(end, -6);
      return [start, endOfDay(end)];
    }
    if (dateFilter === "month") {
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return [startOfMonth(prevMonth), endOfDay(new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0))];
    }
    if (dateFilter === "custom" && customDateRange.from && customDateRange.to) {
      const from = new Date(customDateRange.from);
      const to = new Date(customDateRange.to);
      const diff = to.getTime() - from.getTime();
      const prevTo = addDays(from, -1);
      const prevFrom = new Date(prevTo.getTime() - diff);
      return [startOfDay(prevFrom), endOfDay(prevTo)];
    }
    // Default: retorna período vazio
    return [null, null];
  }

  const [prevStart, prevEnd] = getPreviousPeriodRange();

  const filteredForCardsPrev = prevStart && prevEnd
    ? leads.filter((lead) => {
        const matchesStatus =
          statusFilter === "todos" ||
          lead.qualification_status === statusFilter;
        const matchesSource = sourceFilter === "todos" || lead.source === sourceFilter;
        const leadDate = new Date(lead.created_at);
        const matchesDate = leadDate >= prevStart && leadDate <= prevEnd;
        return matchesStatus && matchesSource && matchesDate;
      })
    : [];

  const totalLeads = filteredForCards.length;
  const qualifiedLeads = filteredForCards.filter((lead) => lead.status && ["qualificado", "proposta", "negociacao"].includes(lead.status)).length;
  const totalValue = filteredForCards.reduce((sum, lead) => sum + (lead.value || 0), 0);
  const conversionRate = totalLeads > 0 ? ((filteredForCards.filter((lead) => lead.status === "fechado").length / totalLeads) * 100).toFixed(1) : 0;

  // --- CÓDIGO ADICIONADO: Comparação com período anterior usando os mesmos filtros ---
  const prevTotalLeads = filteredForCardsPrev.length;
  const prevQualifiedLeads = filteredForCardsPrev.filter((lead) => lead.status && ["qualificado", "proposta", "negociacao"].includes(lead.status)).length;
  const prevTotalValue = filteredForCardsPrev.reduce((sum, lead) => sum + (lead.value || 0), 0);
  const prevConversionRate = prevTotalLeads > 0 ? ((filteredForCardsPrev.filter((lead) => lead.status === "fechado").length / prevTotalLeads) * 100).toFixed(1) : 0;

  function getDelta(current: number, prev: number) {
    if (prev === 0) return current > 0 ? 100 : 0;
    return (((current - prev) / prev) * 100).toFixed(1);
  }

  const handleAddLead = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const newLeadData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      company: formData.get("company") as string,
      status: "novo" as const,
      source: formData.get("source") as Lead['source'],
      value: Number.parseInt(formData.get("value") as string) || 0,
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
  
  return (
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
        <div className="min-h-screen bg-gray-50/50">
          <div className="border-b bg-white">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="-ml-1" />
                <div className="flex items-center justify-between flex-1">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Leads</h1>
                    <p className="text-gray-600">Gerencie e acompanhe seus leads de vendas</p>
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
                            <Label htmlFor="source">Origem</Label>
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
            </div>
          </div>

          <div className="container mx-auto px-4 py-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1 text-3xl font-bold">
                    {totalLeads}
                    <span className={`text-base ${Number(getDelta(totalLeads, prevTotalLeads)) >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {Number(getDelta(totalLeads, prevTotalLeads)) >= 0 ? "↑" : "↓"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getDelta(totalLeads, prevTotalLeads)}% vs. período anterior
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Leads Qualificados</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1 text-3xl font-bold">
                    {qualifiedLeads}
                    <span className={`text-base ${Number(getDelta(qualifiedLeads, prevQualifiedLeads)) >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {Number(getDelta(qualifiedLeads, prevQualifiedLeads)) >= 0 ? "↑" : "↓"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {totalLeads > 0 ? ((qualifiedLeads / totalLeads) * 100).toFixed(1) : 0}% vs. período anterior
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1 text-3xl font-bold">
                    R$ {totalValue.toLocaleString("pt-BR")}
                    <span className={`text-base ${Number(getDelta(totalValue, prevTotalValue)) >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {Number(getDelta(totalValue, prevTotalValue)) >= 0 ? "↑" : "↓"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getDelta(totalValue, prevTotalValue)}% vs. período anterior
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1 text-3xl font-bold">
                    {conversionRate}%
                    <span className={`text-base ${Number(getDelta(Number(conversionRate), Number(prevConversionRate))) >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {Number(getDelta(Number(conversionRate), Number(prevConversionRate))) >= 0 ? "↑" : "↓"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getDelta(Number(conversionRate), Number(prevConversionRate))}% vs. período anterior
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Leads</CardTitle>
                <CardDescription>Gerencie todos os seus leads em um só lugar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar por nome, email ou empresa..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {/* Filtro de Status com ícone */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px] min-w-[160px]">
                      <Filter className="w-4 h-4 mr-1" />
                      <SelectValue placeholder="Status" className="truncate" />
                    </SelectTrigger>
                    <SelectContent>
                      {qualificationStatusOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value} className="flex items-center">
                          {/* Ícones para cada status */}
                          {opt.value === "Quente" && <TrendingUp className="w-4 h-4 mr-1 text-red-500 inline" />}
                          {opt.value === "Morno" && <TrendingUp className="w-4 h-4 mr-1 text-yellow-500 inline" />}
                          {opt.value === "Frio" && <TrendingUp className="w-4 h-4 mr-1 text-blue-500 inline" />}
                          {opt.value === "Venda" && <DollarSign className="w-4 h-4 mr-1 text-green-500 inline" />}
                          <span className="truncate">{opt.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {/* Filtro de Origem com ícone */}
                  <Select value={sourceFilter} onValueChange={setSourceFilter}>
                    <SelectTrigger className="w-full sm:w-[180px] min-w-[160px]">
                      <Mail className="w-4 h-4 mr-1" />
                      <SelectValue placeholder="Origem" className="truncate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">
                        <span className="truncate">Todas as Origens</span>
                      </SelectItem>
                      <SelectItem value="website">
                        <Home className="w-4 h-4 mr-1 text-blue-500 inline" />
                        <span className="truncate">Website</span>
                      </SelectItem>
                      <SelectItem value="linkedin">
                        <Building2 className="w-4 h-4 mr-1 text-blue-700 inline" />
                        <span className="truncate">LinkedIn</span>
                      </SelectItem>
                      <SelectItem value="google-ads">
                        <BarChart3 className="w-4 h-4 mr-1 text-yellow-600 inline" />
                        <span className="truncate">Google Ads</span>
                      </SelectItem>
                      <SelectItem value="indicacao">
                        <Mail className="w-4 h-4 mr-1 text-green-600 inline" />
                        <span className="truncate">Indicação</span>
                      </SelectItem>
                      <SelectItem value="email">
                        <Mail className="w-4 h-4 mr-1 text-pink-600 inline" />
                        <span className="truncate">Email Marketing</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {/* Filtro de Período com ícone */}
                  <Select value={dateFilter} onValueChange={v => setDateFilter(v as any)}>
                    <SelectTrigger className="w-full sm:w-[180px] min-w-[160px]">
                      <Calendar className="w-4 h-4 mr-1" />
                      <SelectValue placeholder="Período" className="truncate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <span className="truncate">Todos os Períodos</span>
                      </SelectItem>
                      <SelectItem value="today">
                        <Calendar className="w-4 h-4 mr-1 text-blue-500 inline" />
                        <span className="truncate">Hoje</span>
                      </SelectItem>
                      <SelectItem value="last7">
                        <Calendar className="w-4 h-4 mr-1 text-yellow-500 inline" />
                        <span className="truncate">Últimos 7 dias</span>
                      </SelectItem>
                      <SelectItem value="month">
                        <Calendar className="w-4 h-4 mr-1 text-green-500 inline" />
                        <span className="truncate">Este mês</span>
                      </SelectItem>
                      <SelectItem value="custom">
                        <Calendar className="w-4 h-4 mr-1 text-purple-500 inline" />
                        <span className="truncate">Personalizado</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {dateFilter === "custom" && (
                    <div className="flex gap-2 items-center">
                      <Input
                        type="date"
                        value={customDateRange.from}
                        onChange={e => setCustomDateRange(r => ({ ...r, from: e.target.value }))}
                        className="w-[130px]"
                        placeholder="De"
                      />
                      <span className="text-muted-foreground">até</span>
                      <Input
                        type="date"
                        value={customDateRange.to}
                        onChange={e => setCustomDateRange(r => ({ ...r, to: e.target.value }))}
                        className="w-[130px]"
                        placeholder="Até"
                      />
                    </div>
                  )}
                </div>

                <div className="rounded-md border">
                  <Table>
                    {/* --- ATUALIZAÇÃO 1: Cabeçalho da tabela ajustado --- */}
                    <TableHeader>
                      <TableRow>
                        <TableHead className="py-3 font-bold">Data</TableHead>
                        <TableHead className="py-3 font-bold">Nome</TableHead>
                        <TableHead className="py-3 font-bold">Telefone</TableHead>
                        <TableHead className="py-3 font-bold">Qualificação</TableHead>
                        <TableHead className="py-3 font-bold">UTM Campaign</TableHead>
                        <TableHead className="py-3 font-bold">UTM Source</TableHead>
                        <TableHead className="py-3 font-bold">UTM Medium</TableHead>
                        <TableHead className="py-3 font-bold">UTM Term</TableHead>
                        <TableHead className="py-3 font-bold">UTM Content</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell className="py-3"><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell className="py-3"><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell className="py-3"><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell className="py-3"><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell className="py-3"><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell className="py-3"><Skeleton className="h-6 w-20 rounded-md" /></TableCell>
                            <TableCell className="py-3"><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell className="py-3"><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell className="py-3"><Skeleton className="h-5 w-24" /></TableCell>
                          </TableRow>
                        ))
                      ) : error ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center text-red-500 py-8">
                            Falha ao carregar os leads: {error}
                          </TableCell>
                        </TableRow>
                      ) : filteredLeads.length > 0 ? (
                        filteredLeads.map((lead, idx) => (
                          <TableRow
                            key={lead.id}
                            className={idx % 2 === 1 ? "bg-gray-50" : ""}
                          >
                            <TableCell className="py-3">{new Date(lead.created_at).toLocaleDateString("pt-BR")}</TableCell>
                            <TableCell className="font-medium py-3">
                              <div className="flex items-center gap-2">
                                {/* Avatar com iniciais */}
                                <span
                                  className="inline-flex items-center justify-center rounded-full bg-gray-200 text-gray-700 font-bold text-xs w-8 h-8"
                                  aria-label="Avatar"
                                >
                                  {getInitials(lead.name)}
                                </span>
                                {capitalizeFirstLetter(lead.name) ?? 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell className="py-3">{formatPhoneNumber(lead.phone)}</TableCell>
                            <TableCell className="py-3">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "h-auto rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                                      lead.qualification_status
                                        ? qualificationColors[lead.qualification_status]
                                        : "text-muted-foreground"
                                    )}
                                  >
                                    {lead.qualification_status ?? "Novo"}
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onSelect={() => handleQualificationChange(lead.id, 'Quente')}>Quente</DropdownMenuItem>
                                  <DropdownMenuItem onSelect={() => handleQualificationChange(lead.id, 'Morno')}>Morno</DropdownMenuItem>
                                  <DropdownMenuItem onSelect={() => handleQualificationChange(lead.id, 'Frio')}>Frio</DropdownMenuItem>
                                  <DropdownMenuItem onSelect={() => handleQualificationChange(lead.id, 'Venda')}>Venda</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                            <TableCell className="py-3">{lead.utm_campaign ?? 'N/A'}</TableCell>
                            <TableCell className="py-3">{lead.utm_source ?? 'N/A'}</TableCell>
                            <TableCell className="py-3">{lead.utm_medium ?? 'N/A'}</TableCell>
                            <TableCell className="py-3">{lead.utm_term ?? 'N/A'}</TableCell>
                            <TableCell className="py-3">{lead.utm_content ?? 'N/A'}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8">
                            Nenhum lead encontrado com os filtros aplicados.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}