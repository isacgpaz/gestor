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
import { QrScanner } from '@yudiel/react-qr-scanner';
import { Scan, ScanText } from "lucide-react";

export function ScanUser() {
  return (
    <AlertDialog>
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

        <div className="qr-scanner rounded">
          <QrScanner
            onDecode={(result) => console.log(result)}
            onError={(error) => console.log(error?.message)}
            viewFinderBorder={20}
            viewFinder={() => <Scan
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-primary"
              size={310}
              strokeWidth={.25}
            />}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction>Continuar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
