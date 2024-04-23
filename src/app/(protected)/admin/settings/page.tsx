'use client'

import { NavHeader } from "@/components/common/nav-header";
import { Button } from "@/components/ui/button";
import { serverSession } from "@/lib/auth/server";
import { findCompany } from "@/services/company/find-unique";
import { Company } from "@prisma/client";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

export default function AdminSettings() {
  const [company, setCompany] = useState<Company | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)

  async function getUser() {
    const session = await serverSession()

    const user = session?.user

    return user
  }

  const getCompany = useCallback(async () => {
    setIsLoading(true)

    const user = await getUser()

    if (user) {
      await findCompany({ companyId: user.company.id }).then(async (response) => {
        if (response.ok) {
          const company = await response.json() as Company

          setCompany(company)
        }
      })
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    getCompany()
  }, [getCompany])

  return (
    <div className="p-6 flex flex-col min-h-screen">
      <NavHeader backHref="/admin/dashboard" title="Configurações" />

      {/* <div className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center mt-6">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Carregando...</span>
          </div>
        ) : company && <WalletSettings company={company} />}
      </div> */}

      <Button
        variant='secondary'
        onClick={() => signOut({ callbackUrl: '/signin' })}
        className="w-fit mx-auto mt-6"
        size='sm'
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sair
      </Button>
    </div>
  )
}