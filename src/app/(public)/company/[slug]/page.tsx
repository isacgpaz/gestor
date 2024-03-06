'use client'

import { CompanyHeader } from "@/components/common/company-header"
import { Loader } from "@/components/common/loader"
import { NavHeader } from "@/components/common/nav-header"
import { Catalog } from "@/components/company/catalog"
import { ShoppingBag } from "@/components/company/shopping-bag"
import { CatalogShoppingBagProvider } from "@/contexts/catalog-shopping-bag-context"
import { CompanyProvider, useCompany } from "@/contexts/company-context"

function Company() {
  const { company, isPending } = useCompany()

  if (isPending) {
    return (
      <Loader />
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

      <CatalogShoppingBagProvider>
        <Catalog />
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
  return (
    <CompanyProvider slug={slug}>
      <Company />
    </CompanyProvider>
  )
}