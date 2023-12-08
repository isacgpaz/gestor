import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useCompany } from "@/contexts/company-context";
import { serverSession } from "@/lib/auth/server";
import { AlertDialogAction } from "@radix-ui/react-alert-dialog";
import { Trophy } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import QRCode from "react-qr-code";

export function ShowCode() {
  const { company, wallet } = useCompany()

  const [customerId, setCustomerId] = useState<string>('')

  const getUser = useCallback(async () => {
    const session = await serverSession()

    const user = session?.user

    if (user) {
      setCustomerId(user?.id)
    }
  }, [])

  useEffect(() => {
    getUser()
  }, [getUser])

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="w-fit">
          <Trophy className="mr-2" />
          <span>
            {company?.walletSettings?.size === wallet?.points ?
              'Começar nova carteira' : 'Adicionar pontos'}
          </span>
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-xs">
        <AlertDialogHeader>
          <AlertDialogTitle>Adicionar pontos</AlertDialogTitle>

          <AlertDialogDescription>
            Mostre o código abaixo para o responsável pelo seu atendimento para
            acumular pontos em {company?.name}.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex items-center justify-center rounded">
          <QRCode value={customerId} size={264} className="rounded" />
        </div>

        <AlertDialogFooter>
          <AlertDialogAction asChild>
            <Button variant='link' className="hover:no-underline w-fit mx-auto">
              Fechar
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
