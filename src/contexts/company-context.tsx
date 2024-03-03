import { useCompanyBySlug } from "@/hooks/company/use-company-by-slug";
import { useWallet } from "@/hooks/wallet/use-wallet";
import { serverSession } from "@/lib/auth/server";
import { Wallet } from "@/types/wallet";
import { Company, User } from "@prisma/client";
import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type CompanyContextProp = {
  company: Company | undefined,
  wallet: Wallet | undefined,
  customer: User | undefined,
  isPending: boolean,
}

export const CompanyContext = createContext<CompanyContextProp>({} as CompanyContextProp)

export function CompanyProvider({
  children,
  slug
}: PropsWithChildren & { slug: string }) {
  const [customer, setCustomer] = useState<User | undefined>(undefined)

  const {
    data: company,
    isPending: isCompanyPending
  } = useCompanyBySlug(slug)

  const {
    data: wallet,
    isPending: isWalletPending
  } = useWallet({
    companyId: company?.id,
    customerId: customer?.id
  })

  const isPending = isCompanyPending && isWalletPending

  const getCustomer = useCallback(async () => {
    const session = await serverSession()

    const user = session?.user

    if (user) {
      setCustomer(user)
    }
  }, [])

  useEffect(() => {
    getCustomer()
  }, [getCustomer])

  const value: CompanyContextProp = useMemo(() => ({
    company,
    isPending,
    wallet,
    customer,
  }), [
    company,
    isPending,
    wallet,
    customer
  ])

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  )
}

export const useCompany = () => {
  const context = useContext(CompanyContext);

  if (!context) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }

  return context;
};

