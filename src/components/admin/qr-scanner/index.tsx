import { toast } from '@/components/ui/use-toast';
import { usePoints } from '@/contexts/points-context';
import { useCreateWallet } from '@/hooks/wallet/use-create-wallet';
import { useWallet } from '@/hooks/wallet/use-wallet';
import { serverSession } from '@/lib/auth/server';
import { User } from '@/types/user';
import { Wallet } from '@/types/wallet';
import { QrScanner as Scanner } from '@yudiel/react-qr-scanner';
import { Loader2, Scan } from "lucide-react";
import { useCallback, useEffect, useState } from 'react';

export function QrScanner() {
  const {
    setSelectedWallet,
    setIsScanUserModalOpen,
    setIsIdentifyUserModalOpen
  } = usePoints()

  const [customer, setCustomer] = useState<User | undefined>(undefined)
  const [decodeResult, setDecodeResult] = useState('')

  const { mutate: createWallet } = useCreateWallet()

  const { data: wallet } = useWallet({
    companyId: customer?.company?.id,
    customerId: decodeResult
  })

  const [isLoading, setIsLoading] = useState(false)

  async function onDecode(result: string) {
    setIsLoading(true)
    setDecodeResult(result)

    const session = await serverSession()

    const user = session?.user

    if (user) {
      if (wallet) {
        selectWallet(wallet)
      } else {
        createWallet({
          companyId: user.company.id,
          customerId: result,
        }, {
          async onSuccess(wallet) {
            selectWallet(wallet.data)
          },
          onError(error) {
            toast({
              title: 'Ops, algo não saiu como o esperado.',
              description: 'Ocorreu um erro ao criar a carteira. Tente novamente mais tarde.',
              variant: 'destructive',
            })
          }
        })
      }
    }
  }

  function selectWallet(wallet: Wallet) {
    setSelectedWallet(wallet)
    setIsScanUserModalOpen(false)
    setIsIdentifyUserModalOpen(true)

    setIsLoading(false)
  }

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

  if (isLoading) {
    return <Loader2 className="mx-auto h-4 w-4 animate-spin" />
  }

  return (
    <div className="rounded">
      <Scanner
        onDecode={onDecode}
        onError={(error) => console.log(error?.message)}
        viewFinderBorder={20}
        viewFinder={() => (
          <Scan
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-primary"
            size={310}
            strokeWidth={.25}
          />
        )}
      />
    </div>
  )
}