'use client'

import { Shortcuts } from "@/components/admin/shortcuts"
import { PointsProvider } from "@/contexts/points-context"
import { Hammer } from "lucide-react"

function Dashboard() {
  return (
    <div className="mt-6 h-[80vh]">
      <Shortcuts />

      {/* <Wallets />

      <IdentifyUser />

      <DeleteWallet /> */}

      <div className="flex h-full">
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-500">
          <Hammer className="animate-bounce" />

          <div className="text-center">
            <span className="text-slate-700 font-medium block">
              Página em construção
            </span>

            <span className="text-sm">
              Para mais informações contate o desenvolvedor.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <PointsProvider>
      <Dashboard />
    </PointsProvider>
  )
}
