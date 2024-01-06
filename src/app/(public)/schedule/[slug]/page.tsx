'use client'

import { CompanyHeader } from "@/components/common/company-header";
import { Loader } from "@/components/common/loader";
import { ScheduleCard } from "@/components/schedule/schedule-card";
import { useCompanyBySlug } from "@/hooks/company/use-company-by-slug";
import { notFound } from "next/navigation";

type SchedulePageProps = {
  params: {
    slug: string
  }
}

export default function SchedulePage({ params: { slug } }: SchedulePageProps) {
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

        <ScheduleCard company={company} />
      </main>
    )
  }

  return notFound()
}