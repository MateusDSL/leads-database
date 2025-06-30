// components/StatsCards.tsx

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, Flame, Snowflake, Sun, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const StatCard = ({ title, value, delta, Icon, iconColorClass }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("h-4 w-4 text-muted-foreground", iconColorClass)} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? <Skeleton className="h-8 w-16" /> : value}
        </div>
        <p className="text-xs text-muted-foreground">{delta}% vs. período anterior</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard title="Total de Leads" value={totalLeads} delta={deltaLeads} Icon={Building2} />
      <StatCard title="Leads Quentes" value={hotLeads} delta={deltaHot} Icon={Flame} iconColorClass="text-red-500" />
      <StatCard title="Leads Frios" value={coldLeads} delta={deltaCold} Icon={Snowflake} iconColorClass="text-blue-500" />
      <StatCard title="Leads Mornos" value={warmLeads} delta={deltaWarm} Icon={Sun} iconColorClass="text-orange-500" />
      <StatCard title="Vendas" value={sales} delta={deltaSales} Icon={CheckCircle2} iconColorClass="text-green-600" />
    </div>
  );
}