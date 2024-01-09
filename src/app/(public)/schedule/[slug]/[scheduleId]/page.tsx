'use client'

import { CompanyHeader } from "@/components/common/company-header";
import { Loader } from "@/components/common/loader";
import { ScheduleCard } from "@/components/schedule/schedule-card";
import { useCompanyBySlug } from "@/hooks/company/use-company-by-slug";
import { useSchedule } from "@/hooks/schedule/use-schedule";
import { Agenda, Company } from "@prisma/client";
import { notFound } from "next/navigation";

type SchedulePageProps = {
  params: {
    slug: string,
    scheduleId: string
  }
}

export default function SchedulePage({ params: { slug, scheduleId } }: SchedulePageProps) {
  const { data: schedule, isLoading: isScheduleLoading } = useSchedule(String(scheduleId))
  const { data: company, isLoading: isCompanyLoading } = useCompanyBySlug(slug)

  const isLoading = isScheduleLoading || isCompanyLoading

  if (isLoading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <Loader />
      </main>
    )
  }

  if (company) {
    return (
      <main className="flex-1">
        <CompanyHeader company={company} />

        <ScheduleCard
          company={company as Company & { agenda: Agenda }}
          schedule={schedule}
        />
      </main>
    )
  }

  return notFound()
}