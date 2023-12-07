import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { usePoints } from "@/contexts/points-context";
import { ScanText } from "lucide-react";
import { QrScanner } from "../qr-scanner";

export function ScanUser() {
  const {
    selectedWallet,
    isScanUserModalOpen,
    setIsIdentifyUserModalOpen,
    setIsScanUserModalOpen
  } = usePoints()

  return (
    <AlertDialog open={isScanUserModalOpen} onOpenChange={setIsScanUserModalOpen}>
      <AlertDialogTrigger asChild>
        <Button
          size='lg'
          className="flex-shrink-0 w-full px-0"
        >
          <ScanText />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-xs">
        <AlertDialogHeader>
          <AlertDialogTitle>Escanear código do cliente</AlertDialogTitle>

          <AlertDialogDescription>
            Aponte a câmera para o dispositivo do cliente para adicionar pontos.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <QrScanner />

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => setIsIdentifyUserModalOpen(true)}
            disabled={!selectedWallet}
          >
            Continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
