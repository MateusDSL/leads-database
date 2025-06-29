// components/LeadsClientComponent.tsx

"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Plus } from "lucide-react";
import { addDays, startOfDay, endOfDay, startOfMonth, endOfYear, differenceInDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { StyledCard } from "@/components/ui/styled-card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarProvider, SidebarRail, SidebarTrigger
} from "@/components/ui/sidebar";
import { Building2, Home, Settings, Target, Mail, Phone, BarChart3, FileText } from "lucide-react";
import { LeadDetailSheet } from '@/components/LeadDetailSheet';
import { LeadsTable } from '@/components/LeadsTable';
import { StatsCards } from '@/components/StatsCards';
import { FilterBar } from "@/components/FilterBar";
import { NewLeadForm } from './NewLeadForm';
import { supabase } from "../supabaseClient";
import { Lead, QualificationStatus } from "@/app/page";

const navigationData = {
    navMain: [
      { title: "Principal", items: [ { title: "Dashboard", url: "#", icon: Home, isActive: true }, { title: "Leads", url: "#", icon: Settings }, { title: "Oportunidades", url: "#", icon: Target } ] },
      { title: "Comunicação", items: [ { title: "Email Marketing", url: "#", icon: Mail }, { title: "Chamadas", url: "#", icon: Phone } ] },
      { title: "Relatórios", items: [ { title: "Analytics", url: "#", icon: BarChart3 }, { title: "Relatórios", url: "#", icon: FileText } ] },
      { title: "Configurações", items: [ { title: "Empresa", url: "#", icon: Building2 }, { title: "Configurações", url: "#", icon: Settings } ] },
    ],
};

interface LeadsClientComponentProps {
  initialLeads: Lead[];
  serverError?: string;
}

export default function LeadsClientComponent({ initialLeads, serverError }: LeadsClientComponentProps) {
    const [allLeads, setAllLeads] = useState<Lead[]>(initialLeads);
    const [error, setError] = useState<string | null>(serverError || null);
    
    useEffect(() => {
        setAllLeads(initialLeads);
    }, [initialLeads]);
    
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("todos");
    const [sourceFilter, setSourceFilter] = useState("todos");
    const [dateRange, setDateRange] = useState<DateRange | undefined>({ from: startOfMonth(new Date()), to: endOfDay(new Date()), });
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const [isBulkEditDialogOpen, setIsBulkEditDialogOpen] = useState(false);
    const [newBulkStatus, setNewBulkStatus] = useState<QualificationStatus | null>(null);

    const getStandardizedOrigin = (source?: string, utm_source?: string): string => {
        if (utm_source === 'go-ads' || source === 'google-ads') return 'Google';
        if (utm_source === 'meta-ads') return 'Meta';
        if (source === 'linkedin') return 'LinkedIn';
        if (source === 'website') return 'Website';
        if (source === 'indicacao') return 'Indicação';
        if (source === 'email') return 'Email Marketing';
        if (!source && !utm_source) return 'Não Rastreada';
        return 'Outros';
    };

    const leadsWithOrigin = useMemo(() => allLeads.map(lead => ({ ...lead, origem: getStandardizedOrigin((lead as any).source, (lead as any).utm_source) })), [allLeads]);

    const filteredLeadsForTable = useMemo(() => leadsWithOrigin.filter((lead) => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = (lead.name?.toLowerCase() || '').includes(searchLower);
        const matchesStatus = statusFilter === "todos" || lead.qualification_status === statusFilter;
        const matchesSource = sourceFilter === "todos" || lead.origem === sourceFilter;
        let matchesDate = true;
        if (dateRange?.from) {
            const leadDate = new Date(lead.created_at);
            const fromDate = startOfDay(dateRange.from);
            const toDate = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
            matchesDate = leadDate >= fromDate && leadDate <= toDate;
        }
        return matchesSearch && matchesStatus && matchesSource && matchesDate;
    }), [leadsWithOrigin, searchTerm, statusFilter, sourceFilter, dateRange]);

    const filteredLeadsForCards = useMemo(() => leadsWithOrigin.filter((lead) => {
        const matchesStatus = statusFilter === "todos" || lead.qualification_status === statusFilter;
        const matchesSource = sourceFilter === "todos" || lead.origem === sourceFilter;
        let matchesDate = true;
        if (dateRange?.from) {
            const leadDate = new Date(lead.created_at);
            const fromDate = startOfDay(dateRange.from);
            const toDate = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);
            matchesDate = leadDate >= fromDate && leadDate <= toDate;
        }
        return matchesStatus && matchesSource && matchesDate;
    }), [leadsWithOrigin, statusFilter, sourceFilter, dateRange]);

    const {
      totalLeads, deltaLeads,
      hotLeads, deltaHot,
      coldLeads, deltaCold,
      warmLeads, deltaWarm,
      sales, deltaSales
    } = useMemo(() => {
        const getDelta = (current: number, prev: number) => { if (prev === 0) return current > 0 ? "100.0" : "0.0"; const delta = (((current - prev) / prev) * 100); return delta.toFixed(1); }
        const getPreviousPeriodRange = (): DateRange | undefined => { if (!dateRange || !dateRange.from) return undefined; const from = dateRange.from; const to = dateRange.to ?? from; const diff = differenceInDays(to, from); const prevTo = addDays(from, -1); const prevFrom = addDays(prevTo, -diff); return { from: startOfDay(prevFrom), to: endOfDay(prevTo) }; }
        
        const currentLeads = filteredLeadsForCards;
        
        const prevDateRange = getPreviousPeriodRange();
        const prevLeads = prevDateRange ? allLeads.filter(lead => { const matchesStatus = statusFilter === "todos" || lead.qualification_status === statusFilter; const matchesSource = sourceFilter === "todos" || lead.origem === sourceFilter; const leadDate = new Date(lead.created_at); const matchesDate = leadDate >= prevDateRange.from! && leadDate <= prevDateRange.to!; return matchesStatus && matchesSource && matchesDate; }) : [];

        const calculateMetrics = (leads: Lead[]) => ({
            total: leads.length,
            hot: leads.filter(l => l.qualification_status === 'Quente').length,
            cold: leads.filter(l => l.qualification_status === 'Frio').length,
            warm: leads.filter(l => l.qualification_status === 'Morno').length,
            sales: leads.filter(l => l.qualification_status === 'Venda').length,
        });

        const currentMetrics = calculateMetrics(currentLeads);
        const prevMetrics = calculateMetrics(prevLeads);

        return {
            totalLeads: currentMetrics.total,
            deltaLeads: getDelta(currentMetrics.total, prevMetrics.total),
            hotLeads: currentMetrics.hot,
            deltaHot: getDelta(currentMetrics.hot, prevMetrics.hot),
            coldLeads: currentMetrics.cold,
            deltaCold: getDelta(currentMetrics.cold, prevMetrics.cold),
            warmLeads: currentMetrics.warm,
            deltaWarm: getDelta(currentMetrics.warm, prevMetrics.warm),
            sales: currentMetrics.sales,
            deltaSales: getDelta(currentMetrics.sales, prevMetrics.sales),
        };
    }, [filteredLeadsForCards, allLeads, dateRange, statusFilter, sourceFilter]);

    const handleLeadAdded = (newLead: Lead) => { setAllLeads(prevLeads => [newLead, ...prevLeads]); };
    const handleQualificationChange = async (leadId: number, newQualification: QualificationStatus) => { const originalLeads = [...allLeads]; setAllLeads(currentLeads => currentLeads.map(lead => lead.id === leadId ? { ...lead, qualification_status: newQualification } : lead )); const { error } = await supabase.from('leads').update({ qualification_status: newQualification }).eq('id', leadId); if (error) { alert(`Erro ao atualizar o lead: ${error.message}`); setAllLeads(originalLeads); }};
    const handleRowSelect = (leadId: number) => { setSelectedRows(prev => prev.includes(leadId) ? prev.filter(id => id !== leadId) : [...prev, leadId]); };
    const handleSelectAll = (checked: boolean | 'indeterminate') => { if (checked === true) { setSelectedRows(filteredLeadsForTable.map(lead => lead.id)); } else { setSelectedRows([]); } };
    const handleBulkUpdate = async () => { if (!newBulkStatus || selectedRows.length === 0) return; const originalLeads = [...allLeads]; setAllLeads(prevLeads => prevLeads.map(lead => selectedRows.includes(lead.id) ? { ...lead, qualification_status: newBulkStatus } : lead )); const { error } = await supabase.from('leads').update({ qualification_status: newBulkStatus }).in('id', selectedRows); if (error) { alert(`Erro ao atualizar leads: ${error.message}`); setAllLeads(originalLeads); } setSelectedRows([]); setNewBulkStatus(null); setIsBulkEditDialogOpen(false); };


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
            <div className="min-h-screen bg-slate-100">
            <header className="border-b-2 border-black bg-white sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <SidebarTrigger className="-ml-1 border-2 border-black rounded-lg" />
                    <div className="flex items-center justify-between flex-1">
                        <div>
                            <h1 className="text-xl font-bold">WhatsFloat</h1>
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
                                <DialogContent className="sm:max-w-[550px]">
                                    <DialogHeader>
                                        <DialogTitle>Adicionar Novo Lead</DialogTitle>
                                        <DialogDescription>Preencha as informações do novo lead abaixo.</DialogDescription>
                                    </DialogHeader>
                                    <NewLeadForm
                                        onLeadAdded={handleLeadAdded}
                                        onClose={() => setIsAddDialogOpen(false)}
                                    />
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>
            </header>
            
            <main className="container mx-auto px-4 py-6 space-y-6">
                {error ? <p className="text-red-500">Erro ao carregar os dados: {error}</p> : (
                    <>
                        <StatsCards
                            loading={initialLeads.length === 0 && !error}
                            totalLeads={totalLeads}
                            deltaLeads={deltaLeads}
                            hotLeads={hotLeads}
                            deltaHot={deltaHot}
                            coldLeads={coldLeads}
                            deltaCold={deltaCold}
                            warmLeads={warmLeads}
                            deltaWarm={deltaWarm}
                            sales={sales}
                            deltaSales={deltaSales}
                        />
                        <StyledCard>
                            <CardHeader>
                                <CardTitle>Todos os Leads</CardTitle>
                            </CardHeader>
                            <CardContent>
                            <FilterBar
                                searchTerm={searchTerm}
                                onSearchTermChange={setSearchTerm}
                                statusFilter={statusFilter}
                                onStatusFilterChange={setStatusFilter}
                                sourceFilter={sourceFilter}
                                onSourceFilterChange={setSourceFilter}
                                dateRange={dateRange}
                                onDateChange={setDateRange}
                                selectedRowsCount={selectedRows.length}
                                isBulkEditDialogOpen={isBulkEditDialogOpen}
                                onBulkEditOpenChange={setIsBulkEditDialogOpen}
                                onNewBulkStatusChange={setNewBulkStatus}
                                handleBulkUpdate={handleBulkUpdate}
                                newBulkStatus={newBulkStatus}
                            />
                            <LeadsTable
                                loading={initialLeads.length === 0 && !error}
                                leads={filteredLeadsForTable}
                                selectedRows={selectedRows}
                                onRowSelect={handleRowSelect}
                                onSelectAll={handleSelectAll}
                                onQualificationChange={handleQualificationChange}
                                onLeadClick={(lead) => setSelectedLead(lead)}
                            />
                            </CardContent>
                        </StyledCard>
                    </>
                )}
            </main>
            </div>
        </SidebarInset>
        <LeadDetailSheet
            isOpen={!!selectedLead}
            onOpenChange={(isOpen) => { if (!isOpen) setSelectedLead(null); }}
            lead={selectedLead}
        />
    </SidebarProvider>
  );
}