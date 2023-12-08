import { findCompanyBySlug } from "@/services/company/find-by-slug";
import { Company } from "@prisma/client";
import { useParams } from "next/navigation";
import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type CompanyContextProp = {
  company: Company | undefined,
  setCompany: (company: Company | undefined) => void,
  isLoading: boolean,
  setIsLoading: (open: boolean) => void,
}

export const CompanyContext = createContext<CompanyContextProp>({} as CompanyContextProp)

export function CompanyProvider({ children }: PropsWithChildren) {
  const [company, setCompany] = useState<Company | undefined>(undefined);
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

  const value: CompanyContextProp = useMemo(() => ({
    company,
    setCompany,
    isLoading,
    setIsLoading,
  }), [
    company,
    isLoading,
    setIsLoading,
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

