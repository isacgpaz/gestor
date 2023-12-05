'use client'

import { IdentifyUser } from "@/components/admin/indentify-user"
import { Shortcuts } from "@/components/admin/shortcuts"
import { signOut } from "next-auth/react"

export default function AdminDashboard() {
  return (
    <div className="mt-6">
      <Shortcuts />

      <IdentifyUser isOpen onOpenChange={() => { }} user={{}} />

      <button onClick={() => signOut({ callbackUrl: '/signin' })}>
        sair
      </button>
    </div>
  )
}
