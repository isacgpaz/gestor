'use client'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { usePoints } from "@/contexts/points-context";
import { addPointsToWallet } from "@/services/wallet/add-points";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";

export function IdentifyUser() {
  const {
    selectedWallet,
    isIdentifyUserModalOpen,
    setIsIdentifyUserModalOpen
  } = usePoints()


  const [points, setPoints] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  if (!selectedWallet) {
    return null
  }

  async function onSubmit() {
    setIsLoading(true)

    if (selectedWallet) {
      await addPointsToWallet({
        walletId: selectedWallet.id,
        points
      }).then(() => {
        toast({
          title: 'Carteira atualizada com sucesso!',
          description: `+${points} pts adicionados para ${selectedWallet.customer.name}`,
          variant: 'default',
        })

        setIsIdentifyUserModalOpen(false)
      })
    }

    setIsLoading(false)
  }

  return (
    <AlertDialog open={isIdentifyUserModalOpen} onOpenChange={setIsIdentifyUserModalOpen}>
      <AlertDialogContent className="max-w-xs">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar pontuação</AlertDialogTitle>
        </AlertDialogHeader>

        <div>
          <div className="flex gap-3 items-center">
            <Avatar className="w-14 h-14">
              <AvatarImage src='' alt={selectedWallet.customer.name} />
              <AvatarFallback>{selectedWallet.customer.name}</AvatarFallback>
            </Avatar>

            <div>
              <span className="font-medium text-lg block">{selectedWallet.customer.name}</span>

              <span>Pontuação atual: {selectedWallet.points} pts</span>
            </div>
          </div>

          <div className="flex gap-4 items-center justify-center mt-4">
            <Button
              variant='outline'
              className="rounded-full p-0 w-8 h-8"
              disabled={points === 1}
              onClick={() => setPoints(points - 1)}
            >
              <Minus />
            </Button>

            <span className="font-medium">
              {points}
            </span>

            <Button
              className="rounded-full p-0 w-8 h-8"
              onClick={() => setPoints(points + 1)}
            >
              <Plus />
            </Button>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Voltar</AlertDialogCancel>
          <Button
            onClick={onSubmit}
            disabled={!selectedWallet || isLoading}
            isLoading={isLoading}
          >
            Confirmar + {points} pts
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
