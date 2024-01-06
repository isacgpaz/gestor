import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalendarCheck } from "lucide-react";

export function StatusAlert() {
  return (
    <Alert className="bg-primary text-primary-foreground w-full max-w-xs mx-auto mt-6">
      <CalendarCheck className="h-4 w-4" color='white' />

      <AlertTitle>Reserva confirmada!</AlertTitle>

      <AlertDescription>
        Já estamos preparando tudo para a sua reserva. Nos vemos em breve!
      </AlertDescription>
    </Alert>
  )
}