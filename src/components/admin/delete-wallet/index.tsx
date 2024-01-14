import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { usePoints } from "@/contexts/points-context";
import { deleteWallet } from "@/services/wallet/delete";
import { useState } from "react";

export function DeleteWallet() {
  const {
    selectedWallet,
    isDeleteWalletModalOpen,
    setIsDeleteWalletModalOpen,
    setSelectedWallet,
    applyWalletFilters
  } = usePoints()

  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit() {
    setIsLoading(true)

    if (selectedWallet) {
      await deleteWallet(selectedWallet?.id).then(() => {
        setIsDeleteWalletModalOpen(false)
        applyWalletFilters()

        setSelectedWallet(undefined)

        toast({
          title: 'Carteira excluída com sucesso!',
          variant: 'success'
        })
      }).catch((e) => {
        toast({
          title: 'Ops, algo não saiu como o esperado.',
          description: "Ocorreu um erro ao excluir a carteira. Tente novamente.",
          variant: 'destructive'
        })
      }).finally(() => {
        setIsLoading(false)
      })
    }
  }

  if (!selectedWallet) {
    return null
  }

  return (
    <AlertDialog open={isDeleteWalletModalOpen} onOpenChange={setIsDeleteWalletModalOpen}>
      <AlertDialogContent className="max-w-xs">
        <AlertDialogHeader>
          <AlertDialogTitle>
            Tem certeza que quer excluir esta carteira
            de {selectedWallet.customer.name}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Essa ação não poderá ser desfeita e os dados desse cliente serão perdidos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <Button
            variant='destructive'
            onClick={onSubmit}
            disabled={!selectedWallet || isLoading}
            isLoading={isLoading}
          >
            Sim, excluir
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

  )
}