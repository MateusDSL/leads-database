// components/StatsCards.tsx

import React from 'react';
import { StyledCard } from '@/components/ui/styled-card';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, Flame, Snowflake, Sun, CheckCircle2 } from 'lucide-react';

interface StatsCardsProps {
  loading: boolean;
  totalLeads: number;
  deltaLeads: string;
  hotLeads: number;
  deltaHot: string;
  coldLeads: number;
  deltaCold: string;
  warmLeads: number;
  deltaWarm: string;
  sales: number;
  deltaSales: string;
}

export function StatsCards({
  loading,
  totalLeads,
  deltaLeads,
  hotLeads,
  deltaHot,
  coldLeads,
  deltaCold,
  warmLeads,
  deltaWarm,
  sales,
  deltaSales,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <StyledCard className="p-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
          <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-3xl font-bold">
            {loading ? <Skeleton className="h-8 w-16"/> : totalLeads}
          </div>
          <p className="text-xs text-muted-foreground">{deltaLeads}% vs. período anterior</p>
        </CardContent>
      </StyledCard>

      <StyledCard className="p-4 bg-gradient-to-tr from-red-400 to-orange-400 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
          <CardTitle className="text-sm font-medium">Leads Quentes</CardTitle>
          <Flame className="h-4 w-4 text-white/80" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-3xl font-bold">
            {loading ? <Skeleton className="h-8 w-16 bg-white/20"/> : hotLeads}
          </div>
          <p className="text-xs text-white/80">{deltaHot}% vs. período anterior</p>
        </CardContent>
      </StyledCard>
      
      <StyledCard className="p-4 bg-gradient-to-tr from-sky-400 to-blue-400 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
          <CardTitle className="text-sm font-medium">Leads Frios</CardTitle>
          <Snowflake className="h-4 w-4 text-white/80" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-3xl font-bold">
            {loading ? <Skeleton className="h-8 w-16 bg-white/20"/> : coldLeads}
          </div>
          <p className="text-xs text-white/80">{deltaCold}% vs. período anterior</p>
        </CardContent>
      </StyledCard>

      <StyledCard className="p-4 bg-gradient-to-tr from-amber-400 to-yellow-400 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
          <CardTitle className="text-sm font-medium">Leads Mornos</CardTitle>
          <Sun className="h-4 w-4 text-white/80" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-3xl font-bold">
            {loading ? <Skeleton className="h-8 w-16 bg-white/20"/> : warmLeads}
          </div>
          <p className="text-xs text-white/80">{deltaWarm}% vs. período anterior</p>
        </CardContent>
      </StyledCard>

      <StyledCard className="p-4 bg-gradient-to-tr from-emerald-400 to-green-500 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-0">
          <CardTitle className="text-sm font-medium">Vendas</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-white/80" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-3xl font-bold">
            {loading ? <Skeleton className="h-8 w-16 bg-white/20"/> : sales}
          </div>
          <p className="text-xs text-white/80">{deltaSales}% vs. período anterior</p>
        </CardContent>
      </StyledCard>
    </div>
  );
}