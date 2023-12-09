'use client'

import { CompanyHeader } from "@/components/common/company-header"
import { NavHeader } from "@/components/common/nav-header"
import { Wallet } from "@/components/customer/wallet"
import { CompanyProvider, useCompany } from "@/contexts/company-context"
import { Loader2 } from "lucide-react"

function Company() {
  const { company, isLoading } = useCompany()

  if (isLoading) {
    return (
      <div className="mt-6 flex items-center justify-center">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        <span>Buscando empresa...</span>
      </div>
    )
  }

  if (!company) {
    return null
  }

  return (
    <div className="p-6">
      <NavHeader backHref="/dashboard" />

      <CompanyHeader company={company} />

      <Wallet />
    </div>
  )
}

export default function CompanyPage() {
  return (
    <CompanyProvider>
      <Company />
    </CompanyProvider>
  )
}