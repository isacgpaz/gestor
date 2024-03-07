"use client"

import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar, CalendarProps } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { ptBR } from "date-fns/locale"
import { useState } from "react"

type DatePickerProps = {
  date: Date | undefined,
  setDate: (date: Date | undefined) => void,
  label?: string,
} & Pick<CalendarProps, 'month' | 'onMonthChange' | 'disabled' | 'fromDate' | 'toDate'>

export function DatePicker({
  label,
  date,
  setDate,
  ...props
}: DatePickerProps) {
  const [open, onOpenChange] = useState(false)

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />

          {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : <span>{label}</span>}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(date) => {
            setDate(date)
            onOpenChange(false)
          }}
          initialFocus
          {...props}
        />
      </PopoverContent>
    </Popover>
  )
}
