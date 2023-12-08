import { useCompany } from "@/contexts/company-context"
import { cn } from "@/lib/utils"
import { CheckCircle2, CircleDotDashed } from "lucide-react"
import { ShowCode } from "../show-code"

type WalletListItemProps = {
  isChecked: boolean
}

function WalletListItem({ isChecked }: WalletListItemProps) {
  return (
    <div className={cn(
      "w-12 h-12 rounded-full flex items-center justify-center text-white",
      isChecked ? "bg-primary" : "bg-slate-100 text-slate-300 animate-pulse"
    )}>
      {isChecked ? (
        <CheckCircle2 className="w-8 h-8" />
      ) : (
        <CircleDotDashed className="w-8 h-8 animate-spin-slow" />
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

  return (
    <ul className="flex items-center justify-center gap-4 flex-wrap">
      {walletItems.map((_, index) => (
        <li key={index}>
          <WalletListItem isChecked={index < wallet.points} />
        </li>
      ))}
    </ul>
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
