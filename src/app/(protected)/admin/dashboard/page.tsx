'use client'

import { signOut } from "next-auth/react"

export default function AdminDashboard() {
  return (
    <div>
      AdminDashboard

      <button onClick={() => signOut({ callbackUrl: '/signin' })}>
        sair
      </button>
    </div>
  )
}
