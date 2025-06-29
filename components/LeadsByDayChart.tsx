// components/LeadsByDayChart.tsx

"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
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

// Definimos a estrutura dos dados que o gráfico espera receber
export interface ChartData {
  date: string
  leads: number
}

// Configuração do gráfico (cor e rótulo)
const chartConfig = {
  leads: {
    label: "Leads",
    color: "#2563eb", // Um tom de azul
  },
} satisfies ChartConfig

// O componente em si, que recebe os dados como propriedade
export function LeadsByDayChart({ data }: { data: ChartData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leads por Dia</CardTitle>
        <CardDescription>
          Novos leads recebidos no período selecionado
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => format(new Date(value), "dd/MM")}
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