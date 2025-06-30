"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { format } from 'date-fns'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Definimos a interface para os dados que o gráfico espera
interface ChartData {
  date: string;
  leads: number;
}

// 1. ATUALIZE O CHARTCONFIG PARA INCLUIR A COR
const chartConfig = {
  leads: {
    label: "Leads",
    // Esta linha diz ao gráfico para usar a cor primária do tema
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

// O componente em si, que recebe os dados como propriedade
export function LeadsByDayChart({ data }: { data: ChartData[] }) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Leads por Dia</CardTitle>
        <CardDescription>
          Novos leads recebidos no período selecionado
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart 
            accessibilityLayer 
            data={data} 
            margin={{ left: -10, right: 10, top: 10 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              // 3. CORREÇÃO DA DATA PARA IGNORAR FUSO HORÁRIO
              tickFormatter={(value) => {
                const [year, month, day] = value.split('-').map(Number);
                const date = new Date(year, month - 1, day);
                return format(date, "dd/MM");
              }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Bar 
              dataKey="leads" 
              fill="var(--color-leads)"
              radius={8} 
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}