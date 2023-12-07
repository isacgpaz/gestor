import { Wallet } from "@prisma/client";
import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from "react";

type PointsContextProp = {
  selectedWallet: Wallet | undefined,
  setSelectedWallet: (wallet: Wallet | undefined) => void,
  isIdentifyUserModalOpen: boolean,
  setIsIdentifyUserModalOpen: (open: boolean) => void
  isScanUserModalOpen: boolean,
  setIsScanUserModalOpen: (open: boolean) => void
}

export const PointsContext = createContext<PointsContextProp>({} as PointsContextProp)

export function PointsProvider({ children }: PropsWithChildren) {
  const [selectedWallet, setSelectedWallet] = useState<Wallet | undefined>(undefined);
  const [isIdentifyUserModalOpen, setIsIdentifyUserModalOpen] = useState(false);
  const [isScanUserModalOpen, setIsScanUserModalOpen] = useState(false);

  useEffect(() => {
    if (!isIdentifyUserModalOpen) {
      setSelectedWallet(undefined)
    }
  }, [isIdentifyUserModalOpen])

  const value: PointsContextProp = useMemo(() => ({
    selectedWallet,
    setSelectedWallet,
    isIdentifyUserModalOpen,
    setIsIdentifyUserModalOpen,
    isScanUserModalOpen,
    setIsScanUserModalOpen
  }), [
    selectedWallet,
    setSelectedWallet,
    isIdentifyUserModalOpen,
    setIsIdentifyUserModalOpen,
    isScanUserModalOpen,
    setIsScanUserModalOpen
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

