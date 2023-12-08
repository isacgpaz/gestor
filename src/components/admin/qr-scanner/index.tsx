import { toast } from '@/components/ui/use-toast';
import { usePoints } from '@/contexts/points-context';
import { serverSession } from '@/lib/auth/server';
import { createWallet } from '@/services/wallet/create';
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
      const response = await findWalletByUserAndCompany({
        companyId: user.company.id,
        customerId: result
      })

      if (response.ok) {
        await selectWallet(response)
      } else {
        await createWallet({
          companyId: user.company.id,
          customerId: result,
          points: 1
        }).then(async (response) => {
          await selectWallet(response)
        }).catch((e) => {
          toast({
            title: 'Ops, algo não saiu como o esperado.',
            description: 'Ocorreu um erro ao criar a carteira. Tente novamente mais tarde.',
            variant: 'destructive',
          })
        })
      }
    }
  }

  async function selectWallet(response: Response) {
    const wallet = await response.json() as Wallet;

    setSelectedWallet(wallet)
    setIsScanUserModalOpen(false)
    setIsIdentifyUserModalOpen(true)

    setIsLoading(false)
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