import { serverSession } from "@/lib/auth/server";
import { findWallets } from "@/services/wallet/find";
import { Wallet } from "@prisma/client";
import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type WalletFilters = {
  page: number,
  companyId?: string,
  search?: string
}

type WalletsList = {
  result: Wallet[],
  meta: {
    total: number,
    page: number,
    rowsPerPage: number,
    hasNextPage: boolean,
    hasPreviousPage: boolean,
  }
}

type PointsContextProp = {
  selectedWallet: Wallet | undefined,
  setSelectedWallet: (wallet: Wallet | undefined) => void,
  isIdentifyUserModalOpen: boolean,
  setIsIdentifyUserModalOpen: (open: boolean) => void
  isScanUserModalOpen: boolean,
  setIsScanUserModalOpen: (open: boolean) => void,
  isDeleteWalletModalOpen: boolean,
  setIsDeleteWalletModalOpen: (open: boolean) => void,
  isLoading: boolean,
  setIsLoading: (open: boolean) => void,
  walletsList: WalletsList,
  setWalletsList: (walletsList: WalletsList) => void,
  filters: WalletFilters,
  updateFilters: (filters: Partial<WalletFilters>) => void,
  applyWalletFilters: () => Promise<void>
}

export const PointsContext = createContext<PointsContextProp>({} as PointsContextProp)

export function PointsProvider({ children }: PropsWithChildren) {
  const [selectedWallet, setSelectedWallet] = useState<Wallet | undefined>(undefined);
  const [isIdentifyUserModalOpen, setIsIdentifyUserModalOpen] = useState(false);
  const [isScanUserModalOpen, setIsScanUserModalOpen] = useState(false);
  const [isDeleteWalletModalOpen, setIsDeleteWalletModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [walletsList, setWalletsList] = useState<WalletsList>({
    result: [],
    meta: {
      page: 1,
      rowsPerPage: 10,
      total: 0,
      hasNextPage: false,
      hasPreviousPage: false
    }
  })
  const [filters, setFilters] = useState<WalletFilters>({
    page: 1,
  });

  useEffect(() => {
    if (!isIdentifyUserModalOpen) {
      setSelectedWallet(undefined)
    }
  }, [isIdentifyUserModalOpen])

  const updateFilters = useCallback((filters: Partial<WalletFilters>) => {
    setFilters((previousFilters) => ({
      ...previousFilters,
      ...filters,
    }))
  }, [])

  async function getCompanyId() {
    const session = await serverSession()

    const user = session?.user

    if (user) {
      return user.company.id
    }

    return ''
  }

  const applyWalletFilters = useCallback(async () => {
    setIsLoading(true)

    await findWallets({
      ...filters,
      companyId: await getCompanyId()
    }).then(async (response) => {
      if (response.ok) {
        const data = await response.json() as WalletsList

        setWalletsList(data)
      }
    }).catch((e) => {
      console.error(e)
    }).finally(() => {
      setIsLoading(false)
    })
  }, [filters])

  useEffect(() => {
    applyWalletFilters()
  }, [applyWalletFilters])

  const value: PointsContextProp = useMemo(() => ({
    selectedWallet,
    setSelectedWallet,
    isIdentifyUserModalOpen,
    setIsIdentifyUserModalOpen,
    isScanUserModalOpen,
    setIsScanUserModalOpen,
    walletsList,
    setWalletsList,
    filters,
    updateFilters,
    isLoading,
    setIsLoading,
    applyWalletFilters,
    isDeleteWalletModalOpen,
    setIsDeleteWalletModalOpen
  }), [
    selectedWallet,
    setSelectedWallet,
    isIdentifyUserModalOpen,
    setIsIdentifyUserModalOpen,
    isScanUserModalOpen,
    setIsScanUserModalOpen,
    walletsList,
    setWalletsList,
    filters,
    updateFilters,
    isLoading,
    setIsLoading,
    applyWalletFilters,
    isDeleteWalletModalOpen,
    setIsDeleteWalletModalOpen
  ])

  return (
    <PointsContext.Provider value={value}>
      {children}
    </PointsContext.Provider>
  )
}

export const usePoints = () => {
  const context = useContext(PointsContext);

  if (!context) {
    throw new Error("usePoints must be used within a PointsProvider");
  }

  return context;
};

