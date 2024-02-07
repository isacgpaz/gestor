'use client'

import { CompanyHeader } from "@/components/common/company-header"
import { NavHeader } from "@/components/common/nav-header"
import { Catalog } from "@/components/company/catalog"
import { ShoppingBag } from "@/components/company/shopping-bag"
import { CatalogShoppingBagProvider } from "@/contexts/catalog-shopping-bag-context"
import { CompanyProvider, useCompany } from "@/contexts/company-context"
import { useCompanyBySlug } from "@/hooks/company/use-company-by-slug"
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
    <div>
      <div className="p-6">
        <NavHeader backHref="/dashboard" />

        <CompanyHeader company={company} />
      </div>

      {/* <Wallet /> */}

      <CatalogShoppingBagProvider>
        <Catalog company={company} />
        <ShoppingBag />
      </CatalogShoppingBagProvider>
    </div>
  )
}

type CompanyPageProps = {
  params: {
    slug: string
  }
}

export default function CompanyPage({ params: { slug } }: CompanyPageProps) {
  const { data: company } = useCompanyBySlug(slug)

  return (
    <CompanyProvider company={company}>
      <Company />
    </CompanyProvider>
  )
}