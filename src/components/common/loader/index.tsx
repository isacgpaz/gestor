import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { ComponentProps } from "react";

type LoaderProps = {
  label?: string,
  hideLabel?: boolean
} & ComponentProps<'div'>

export function Loader({
  hideLabel = false,
  label = 'Carregando...',
  ...props
}: LoaderProps) {
  return (
    <div className={cn("flex items-center justify-center mt-6", props.className)}>
      <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />

      {!hideLabel && <span>{label}</span>}
    </div>
  )
}