"use client"

import * as React from "react"
import { addDays, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns"
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

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined
  onDateChange: (date: DateRange | undefined) => void
}

export function DateRangePicker({
  className,
  date,
  onDateChange,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  // Opções de períodos predefinidos
  const presets = [
    { label: "Hoje", range: { from: new Date(), to: new Date() } },
    { label: "Ontem", range: { from: addDays(new Date(), -1), to: addDays(new Date(), -1) } },
    { label: "Últimos 7 dias", range: { from: addDays(new Date(), -6), to: new Date() } },
    { label: "Últimos 30 dias", range: { from: addDays(new Date(), -29), to: new Date() } },
    { label: "Este mês", range: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) } },
    { label: "Mês passado", range: { from: startOfMonth(addDays(new Date(), -30)), to: endOfMonth(addDays(new Date(), -30)) } },
    { label: "Este ano", range: { from: startOfYear(new Date()), to: endOfYear(new Date()) } },
  ]

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[260px] justify-start text-left font-normal", // <-- Linha alterada
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y", { locale: ptBR })} -{" "}
                  {format(date.to, "LLL dd, y", { locale: ptBR })}
                </>
              ) : (
                format(date.from, "LLL dd, y", { locale: ptBR })
              )
            ) : (
              <span>Selecione um período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 flex" align="start">
          <div className="flex flex-col space-y-2 border-r p-4">
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  onDateChange(preset.range)
                  setIsOpen(false)
                }}
              >
                {preset.label}
              </Button>
            ))}
             <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  onDateChange(undefined) // Limpa o filtro
                  setIsOpen(false)
                }}
              >
                Todos
              </Button>
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={onDateChange}
            numberOfMonths={2}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}