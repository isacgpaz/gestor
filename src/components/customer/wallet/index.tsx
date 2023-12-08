import { useCompany } from "@/contexts/company-context"
import { cn } from "@/lib/utils"
import { CheckCircle2, CircleDashed } from "lucide-react"
import Image from "next/image"
import { ShowCode } from "../show-code"

type WalletListItemProps = {
  index: number,
  isChecked: boolean
}

function WalletListItem({ index, isChecked }: WalletListItemProps) {
  return (
    <div className={cn(
      "w-12 h-12 rounded-full flex items-center justify-center text-white",
      isChecked ? "bg-primary" : "bg-slate-100 text-slate-300 animate-pulse"
    )}>
      {isChecked ? (
        <CheckCircle2 className="w-8 h-8" />
      ) : (
        <div className="relative">
          <CircleDashed className="w-10 h-10 animate-spin-slow" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-medium">
            {index}
          </span>
        </div>
      )}
    </div>
  )
}

function WalletList() {
  const { company, wallet } = useCompany()

  const walletItems = Array.from({ length: company?.walletSettings?.size ?? 10 })

  if (!wallet) {
    return null
  }

  if (walletItems.length === wallet.points) {
    return (
      <div className="text-center">
        <span className="font-medium text-3xl block mb-1">Parabéns!</span>
        <span className="text-slate-500">
          Você completou uma carteira!
          Procure o responsável pelo seu atendimento para resgatar seu prêmio.
        </span>
        <Image src='/gift.svg' alt='Presente' width={500} height={500} />
      </div>
    )
  }

  return (
    <div>
      <p className="text-slate-500 text-center block mb-4">
        Complete <span className="font-medium">{company?.walletSettings?.size} pontos</span> para
        completar a carteira e resgatar seu prêmio.
      </p>

      <ul className="flex items-center justify-center gap-4 flex-wrap">
        {walletItems.map((_, index) => (
          <li key={index}>
            <WalletListItem isChecked={index < wallet.points} index={index + 1} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Wallet() {
  return (
    <div className="mt-6 mx-auto max-w-xs flex flex-col gap-6 items-center justify-center">
      <WalletList />

      <ShowCode />
    </div>
  )
}
