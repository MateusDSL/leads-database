"use client"

import * as React from "react"
import { Label, Pie, PieChart, ResponsiveContainer, Sector } from "recharts"
import { PieSectorDataItem } from "recharts/types/polar/Pie"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartStyle, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Lead } from "@/app/page";

// Interface para definir que nosso componente recebe a lista de leads
interface LeadsBySourcePieChartProps {
  leads: Lead[];
}

export function LeadsBySourcePieChart({ leads }: LeadsBySourcePieChartProps) {
  const id = "leads-by-source-pie"
  
  // A lógica de processamento de dados para contar leads por origem
  const dataBySource = React.useMemo(() => {
    const sourceCounts: { [key: string]: number } = {}
    leads.forEach(lead => {
      const origin = lead.origem || 'Não Rastreada';
      sourceCounts[origin] = (sourceCounts[origin] || 0) + 1;
    });

    // Filtra apenas as origens que têm leads
    return Object.keys(sourceCounts)
      .filter(source => sourceCounts[source] > 0)
      .map(source => ({
        source: source,
        count: sourceCounts[source],
        fill: `var(--color-${source.toLowerCase().replace(/ /g, '-')})` // Cria uma cor baseada no nome
      }));
  }, [leads]);
  
  // Estado para controlar a origem ativa, começando com a primeira da lista
  const [activeSource, setActiveSource] = React.useState(dataBySource[0]?.source || '');

  // Configuração dinâmica do gráfico baseada nas origens encontradas
  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      count: {
        label: "Leads",
      },
    };
    const chartColors = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5", "chart-6"];
    dataBySource.forEach((item, index) => {
      config[item.source.toLowerCase().replace(/ /g, '-')] = {
        label: item.source,
        color: `hsl(var(--${chartColors[index % chartColors.length]}))`,
      };
    });
    return config;
  }, [dataBySource]);

  const activeIndex = React.useMemo(
    () => dataBySource.findIndex((item) => item.source === activeSource),
    [activeSource, dataBySource]
  );
  
  const sources = React.useMemo(() => dataBySource.map((item) => item.source), [dataBySource]);
  
  return (
    // 1. GARANTIR QUE O CARD OCUPE TODA A ALTURA DISPONÍVEL
    <Card data-chart={id} className="h-full flex flex-col min-h-[260px]">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle>Leads por Origem</CardTitle>
          <CardDescription>Distribuição por canal</CardDescription>
        </div>
        <Select value={activeSource} onValueChange={setActiveSource}>
          {/* ...existing SelectTrigger and SelectContent... */}
          <SelectTrigger className="ml-auto h-7 w-[130px] rounded-lg pl-2.5" aria-label="Selecione uma origem">
            <SelectValue placeholder="Selecione a origem" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {sources.map((key) => {
              const configKey = key.toLowerCase().replace(/ /g, '-');
              const config = chartConfig[configKey as keyof typeof chartConfig];
              if (!config) return null;

              return (
                <SelectItem key={key} value={key} className="rounded-lg [&_span]:flex">
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-sm"
                      style={{ backgroundColor: `var(--color-${configKey})` }}
                    />
                    {config.label}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 items-center pb-0">
        {/* ===== ÁREA MODIFICADA ===== */}
        {/* Diminuindo a altura máxima do container do gráfico de 250px para 200px */}
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-full max-h-[200px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={dataBySource}
                dataKey="count"
                nameKey="source"
                innerRadius={60}
                strokeWidth={5}
                activeIndex={activeIndex}
                activeShape={({
                  outerRadius = 0,
                  ...props
                }: PieSectorDataItem) => (
                  <g>
                    <Sector {...props} outerRadius={outerRadius + 4} />
                    <Sector
                      {...props}
                      outerRadius={outerRadius + 10}
                      innerRadius={outerRadius + 6}
                      fill="hsl(var(--primary))"
                    />
                  </g>
                )}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox && activeIndex !== -1) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                            {dataBySource[activeIndex].count.toLocaleString()}
                          </tspan>
                          <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                            Leads
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        {/* ===== FIM DA ÁREA MODIFICADA ===== */}
      </CardContent>
    </Card>
  )
}