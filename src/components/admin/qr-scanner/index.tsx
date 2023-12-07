import { usePoints } from '@/contexts/points-context';
import { serverSession } from '@/lib/auth/server';
import { findWalletByUserAndCompany } from '@/services/wallet/find-by-user-and-company';
import { Wallet } from '@prisma/client';
import { QrScanner as Scanner } from '@yudiel/react-qr-scanner';
import { Loader2, Scan } from "lucide-react";
import { useState } from 'react';

export function QrScanner() {
  const {
    setSelectedWallet,
    setIsScanUserModalOpen,
    setIsIdentifyUserModalOpen
  } = usePoints()

  const [isLoading, setIsLoading] = useState(false)

  async function onDecode(result: string) {
    setIsLoading(true)

    const session = await serverSession()

    const user = session?.user

    if (user) {
      await findWalletByUserAndCompany({
        companyId: user.company.id,
        customerId: result
      }).then(async (response) => {
        if (response.ok) {
          const wallet = await response.json() as Wallet;

          setSelectedWallet(wallet)
          setIsScanUserModalOpen(false)
          setIsIdentifyUserModalOpen(true)
        }
      }).catch((e) => {
        console.error(e)
      }).finally(() => {
        setIsLoading(false)
      })
    }
  }

  if (isLoading) {
    return <Loader2 className="mx-auto h-4 w-4 animate-spin" />
  }

  return (
    <div className="rounded">
      <Scanner
        onDecode={onDecode}
        onError={(error) => console.log(error?.message)}
        viewFinderBorder={20}
        viewFinder={() => <Scan
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-primary"
          size={310}
          strokeWidth={.25}
        />}
      />
    </div>
  )
}