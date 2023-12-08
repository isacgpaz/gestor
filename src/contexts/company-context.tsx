import { serverSession } from "@/lib/auth/server";
import { findCompanyBySlug } from "@/services/company/find-by-slug";
import { findWalletByUserAndCompany } from "@/services/wallet/find-by-user-and-company";
import { Company, Wallet } from "@prisma/client";
import { useParams } from "next/navigation";
import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type CompanyContextProp = {
  company: Company | undefined,
  setCompany: (company: Company | undefined) => void,
  wallet: Wallet | undefined,
  setWallet: (wallet: Wallet | undefined) => void,
  isLoading: boolean,
  setIsLoading: (open: boolean) => void,
}

export const CompanyContext = createContext<CompanyContextProp>({} as CompanyContextProp)

export function CompanyProvider({ children }: PropsWithChildren) {
  const [company, setCompany] = useState<Company | undefined>(undefined);
  const [wallet, setWallet] = useState<Wallet | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const params = useParams()
  const { slug } = params

  const getCompany = useCallback(async () => {
    if (slug) {
      setIsLoading(true)

      await findCompanyBySlug({ slug: slug as string }).then(async (response) => {
        if (response.ok) {
          const company = await response.json() as Company

          setCompany(company)
        }
      }).catch((e) => {
        console.error(e)
      }).finally(() => {
        setIsLoading(false)
      })
    }
  }, [slug])

  useEffect(() => {
    getCompany()
  }, [getCompany])

  async function getCustomerId() {
    const session = await serverSession()

    const user = session?.user

    if (user) {
      return user.id
    }

    return ''
  }

  const getCompanyWallet = useCallback(async () => {
    if (company) {
      setIsLoading(true)

      const customerId = await getCustomerId()

      await findWalletByUserAndCompany({
        companyId: company.id,
        customerId
      }).then(async (response) => {
        if (response.ok) {
          const wallet = await response.json() as Wallet

          setWallet(wallet)
        }
      }).catch((e) => {
        console.error(e)
      }).finally(() => {
        setIsLoading(false)
      })
    }
  }, [company])

  useEffect(() => {
    getCompanyWallet()
  }, [getCompanyWallet])

  const value: CompanyContextProp = useMemo(() => ({
    company,
    setCompany,
    isLoading,
    setIsLoading,
    wallet,
    setWallet
  }), [
    company,
    isLoading,
    setIsLoading,
    wallet,
    setWallet
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

