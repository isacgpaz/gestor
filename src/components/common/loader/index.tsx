import { Loader2 } from "lucide-react";

type LoaderProps = {
  label?: string,
  hideLabel?: boolean
}

export function Loader({ hideLabel = false, label = 'Carregando...' }: LoaderProps) {
  return (
    <div className="flex items-center justify-center mt-6">
      <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />

      {!hideLabel && <span>{label}</span>}
    </div>
  )
}