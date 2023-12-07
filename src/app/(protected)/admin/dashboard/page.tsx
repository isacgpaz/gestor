'use client'

import { IdentifyUser } from "@/components/admin/indentify-user"
import { Shortcuts } from "@/components/admin/shortcuts"
import { PointsProvider } from "@/contexts/points-context"
import { signOut } from "next-auth/react"

function Dashboard() {
  return (
    <div className="mt-6">
      <Shortcuts />

      <IdentifyUser />

      <button onClick={() => signOut({ callbackUrl: '/signin' })}>
        sair
      </button>
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
