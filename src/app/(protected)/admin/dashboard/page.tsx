'use client'

import { DeleteWallet } from "@/components/admin/delete-wallet"
import { IdentifyUser } from "@/components/admin/indentify-user"
import { Shortcuts } from "@/components/admin/shortcuts"
import { Wallets } from "@/components/admin/wallets"
import { PointsProvider } from "@/contexts/points-context"

function Dashboard() {
  return (
    <div className="mt-6">
      <Shortcuts />

      <Wallets />

      <IdentifyUser />

      <DeleteWallet />
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
