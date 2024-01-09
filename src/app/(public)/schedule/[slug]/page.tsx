'use client'

import { CompanyHeader } from "@/components/common/company-header";
import { Loader } from "@/components/common/loader";
import { ScheduleCard } from "@/components/schedule/schedule-card";
import { useCompanyBySlug } from "@/hooks/company/use-company-by-slug";
import { Agenda, Company } from "@prisma/client";
import { notFound } from "next/navigation";

type CreateSchedulePageProps = {
  params: {
    slug: string
  }
}

export default function CreateSchedulePage({ params: { slug } }: CreateSchedulePageProps) {
  const { data: company, isLoading } = useCompanyBySlug(slug)

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

        <ScheduleCard company={company as Company & { agenda: Agenda }} />
      </main>
    )
  }

  return notFound()
}