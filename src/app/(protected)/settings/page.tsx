'use client'

import { NavHeader } from "@/components/common/nav-header";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function Settings() {
  return (
    <div className="p-6 flex flex-col min-h-screen">
      <NavHeader backHref="/dashboard" title="Configurações" />

      <Button
        variant='secondary'
        onClick={() => signOut({ callbackUrl: '/signin' })}
        className="w-fit mx-auto"
        size='sm'
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sair
      </Button>
    </div>
  )
}