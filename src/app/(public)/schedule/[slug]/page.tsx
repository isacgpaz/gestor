'use client'

import { CompanyHeader } from "@/components/common/company-header";
import { ScheduleCard } from "@/components/schedule/schedule-card";
import { ScheduleProvider, useSchedule } from "@/contexts/schedule-context";
import Image from "next/image";

function Schedule() {
  const { company } = useSchedule()

  if (!company) {
    return null
  }

  return (
    <div className="p-6 min-h-screen flex flex-col">
      <CompanyHeader company={company} />

      <main className="flex-1 mt-6">
        <ScheduleCard />
      </main>

      <footer className='flex items-center justify-center gap-2 text-slate-500'>
        <span className="text-xs">Powered by</span>

        <Image
          src='/logo.svg'
          alt=''
          className="dark:invert w-20"
          width={150}
          height={36}
          priority />
      </footer>
    </div>
  )
}

export default function SchedulePage() {
  return (
    <ScheduleProvider>
      <Schedule />
    </ScheduleProvider>
  )
}