"use client"

import * as React from "react"
import { format, startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from "date-fns" // 1. Importar funções adicionais do date-fns
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "./separator"

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined
  onDateChange: (date: DateRange | undefined) => void
}

// 2. Definir a lista de períodos pré-definidos
const presets = [
    { name: "Hoje",       getDate: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) }) },
    { name: "Ontem",      getDate: () => ({ from: startOfDay(subDays(new Date(), 1)), to: endOfDay(subDays(new Date(), 1)) }) },
    { name: "Últimos 7 dias",  getDate: () => ({ from: subDays(new Date(), 6), to: new Date() }) },
    { name: "Últimos 30 dias", getDate: () => ({ from: subDays(new Date(), 29), to: new Date() }) },
    { name: "Este mês",   getDate: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
    { name: "Mês passado", getDate: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }) },
    { name: "Este ano",   getDate: () => ({ from: startOfYear(new Date()), to: endOfYear(new Date()) }) },
    { name: "Últimos 12 meses", getDate: () => ({ from: subMonths(new Date(), 12), to: new Date() }) },
]

export function DateRangePicker({
  className,
  date,
  onDateChange,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  // 3. Função para lidar com a seleção de um período pré-definido
  const handlePresetSelect = (preset: typeof presets[0]) => {
    onDateChange(preset.getDate())
    setIsOpen(false) // Fecha o popover após a seleção
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-bold border-2 border-black rounded-lg",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd 'de' LLL, y", { locale: ptBR })} -{" "}
                  {format(date.to, "dd 'de' LLL, y", { locale: ptBR })}
                </>
              ) : (
                format(date.from, "dd 'de' LLL, y", { locale: ptBR })
              )
            ) : (
              <span>Selecione um período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 flex" align="start">
          {/* 4. Barra lateral com os botões de períodos */}
          <div className="flex flex-col space-y-1 p-2 border-r">
            {presets.map((preset) => (
              <Button
                key={preset.name}
                variant="ghost"
                className="w-full justify-start text-sm"
                onClick={() => handlePresetSelect(preset)}
              >
                {preset.name}
              </Button>
            ))}
          </div>

          {/* 5. O Calendário agora fica ao lado da barra lateral */}
          <div className="flex flex-col">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={onDateChange}
              numberOfMonths={2}
              locale={ptBR}
            />
            {/* 6. Adicionar os botões de Cancelar e Aplicar (opcional, mas bom para usabilidade) */}
            <div className="flex justify-end gap-2 p-4 border-t">
                 <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancelar</Button>
                 <Button onClick={() => setIsOpen(false)}>Aplicar</Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}