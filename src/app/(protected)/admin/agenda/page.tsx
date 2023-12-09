'use client'

import { Schedules } from "@/components/admin/schedules";
import { DatePicker } from "@/components/common/date-picker";
import { NavHeader } from "@/components/common/nav-header";
import { useState } from "react";

export default function Agenda() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="p-6 flex flex-col min-h-screen">
      <NavHeader backHref="/admin/dashboard" title="Agenda" />

      <div className="flex-1 mt-6 w-full">
        <span className="block mb-2 text-sm text-slate-500">
          Para visualizar os agendamentos selecione uma data abaixo.
        </span>

        <DatePicker
          date={date}
          setDate={setDate}
          label="Selecionar data"
        />

        <Schedules />
      </div>
    </div>
  )
}