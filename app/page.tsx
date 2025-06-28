"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Search, Filter, Download, TrendingUp, DollarSign, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { BarChart3, Settings, FileText, Target, Mail, Phone, Building2, Home } from "lucide-react"

const navigationData = {
  navMain: [
    {
      title: "Principal",
      items: [
        {
          title: "Dashboard",
          url: "#",
          icon: Home,
          isActive: true,
        },
        {
          title: "Leads",
          url: "#",
          icon: Settings,
        },
        {
          title: "Oportunidades",
          url: "#",
          icon: Target,
        },
      ],
    },
    {
      title: "Comunicação",
      items: [
        {
          title: "Email Marketing",
          url: "#",
          icon: Mail,
        },
        {
          title: "Chamadas",
          url: "#",
          icon: Phone,
        },
      ],
    },
    {
      title: "Relatórios",
      items: [
        {
          title: "Analytics",
          url: "#",
          icon: BarChart3,
        },
        {
          title: "Relatórios",
          url: "#",
          icon: FileText,
        },
      ],
    },
    {
      title: "Configurações",
      items: [
        {
          title: "Empresa",
          url: "#",
          icon: Building2,
        },
        {
          title: "Configurações",
          url: "#",
          icon: Settings,
        },
      ],
    },
  ],
}

// Mock data for leads
const mockLeads = [
  {
    id: 1,
    name: "Ana Silva",
    email: "ana.silva@email.com",
    phone: "(11) 99999-9999",
    company: "Tech Solutions",
    status: "novo",
    source: "website",
    value: 15000,
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    name: "Carlos Santos",
    email: "carlos@empresa.com",
    phone: "(21) 88888-8888",
    company: "Inovação Digital",
    status: "qualificado",
    source: "linkedin",
    value: 25000,
    createdAt: "2024-01-14",
  },
  {
    id: 3,
    name: "Maria Oliveira",
    email: "maria.oliveira@corp.com",
    phone: "(31) 77777-7777",
    company: "Global Corp",
    status: "proposta",
    source: "indicacao",
    value: 50000,
    createdAt: "2024-01-13",
  },
  {
    id: 4,
    name: "João Pereira",
    email: "joao@startup.com",
    phone: "(41) 66666-6666",
    company: "StartupXYZ",
    status: "negociacao",
    source: "google-ads",
    value: 35000,
    createdAt: "2024-01-12",
  },
  {
    id: 5,
    name: "Fernanda Costa",
    email: "fernanda@tech.com",
    phone: "(51) 55555-5555",
    company: "TechCorp",
    status: "fechado",
    source: "website",
    value: 80000,
    createdAt: "2024-01-11",
  },
]

const statusColors = {
  novo: "bg-blue-100 text-blue-800",
  qualificado: "bg-yellow-100 text-yellow-800",
  proposta: "bg-purple-100 text-purple-800",
  negociacao: "bg-orange-100 text-orange-800",
  fechado: "bg-green-100 text-green-800",
  perdido: "bg-red-100 text-red-800",
}

const sourceLabels = {
  website: "Website",
  linkedin: "LinkedIn",
  "google-ads": "Google Ads",
  indicacao: "Indicação",
  email: "Email Marketing",
}

export default function LeadsDatabase() {
  const [leads, setLeads] = useState(mockLeads)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [sourceFilter, setSourceFilter] = useState("todos")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Filter leads based on search and filters
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "todos" || lead.status === statusFilter
    const matchesSource = sourceFilter === "todos" || lead.source === sourceFilter

    return matchesSearch && matchesStatus && matchesSource
  })

  // Calculate statistics
  const totalLeads = leads.length
  const qualifiedLeads = leads.filter((lead) => ["qualificado", "proposta", "negociacao"].includes(lead.status)).length
  const totalValue = leads.reduce((sum, lead) => sum + lead.value, 0)
  const conversionRate =
    totalLeads > 0 ? ((leads.filter((lead) => lead.status === "fechado").length / totalLeads) * 100).toFixed(1) : 0

  const handleAddLead = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    const newLead = {
      id: leads.length + 1,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      company: formData.get("company") as string,
      status: "novo" as const,
      source: formData.get("source") as string,
      value: Number.parseInt(formData.get("value") as string) || 0,
      createdAt: new Date().toISOString().split("T")[0],
    }

    setLeads([newLead, ...leads])
    setIsAddDialogOpen(false)
    event.currentTarget.reset()
  }

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
          {/* Header */}
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
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalLeads}</div>
                  <p className="text-xs text-muted-foreground">+12% em relação ao mês anterior</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Leads Qualificados</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{qualifiedLeads}</div>
                  <p className="text-xs text-muted-foreground">
                    {totalLeads > 0 ? ((qualifiedLeads / totalLeads) * 100).toFixed(1) : 0}% do total
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ {totalValue.toLocaleString("pt-BR")}</div>
                  <p className="text-xs text-muted-foreground">Pipeline de vendas</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{conversionRate}%</div>
                  <p className="text-xs text-muted-foreground">Leads fechados</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
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
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Status</SelectItem>
                      <SelectItem value="novo">Novo</SelectItem>
                      <SelectItem value="qualificado">Qualificado</SelectItem>
                      <SelectItem value="proposta">Proposta</SelectItem>
                      <SelectItem value="negociacao">Negociação</SelectItem>
                      <SelectItem value="fechado">Fechado</SelectItem>
                      <SelectItem value="perdido">Perdido</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sourceFilter} onValueChange={setSourceFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Origem" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas as Origens</SelectItem>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="google-ads">Google Ads</SelectItem>
                      <SelectItem value="indicacao">Indicação</SelectItem>
                      <SelectItem value="email">Email Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Leads Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Empresa</TableHead>
                        <TableHead>Contato</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Origem</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeads.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell className="font-medium">{lead.name}</TableCell>
                          <TableCell>{lead.company}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm">{lead.email}</div>
                              <div className="text-xs text-gray-500">{lead.phone}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[lead.status as keyof typeof statusColors]}>
                              {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>{sourceLabels[lead.source as keyof typeof sourceLabels]}</TableCell>
                          <TableCell>R$ {lead.value.toLocaleString("pt-BR")}</TableCell>
                          <TableCell>{new Date(lead.createdAt).toLocaleDateString("pt-BR")}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {filteredLeads.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Nenhum lead encontrado com os filtros aplicados.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
