'use client'

import { Button, ButtonProps } from "@/components/ui/button"
import { customerBottomBar } from "@/constants/bottom-bar"
import { User, UserRole } from "@prisma/client"
import Link from "next/link"
import { ElementType } from "react"

type BottomBarItemProps = {
  path: string,
  icon: ElementType
} & ButtonProps

export function BottomBarItem({ icon: Icon, path, ...props }: BottomBarItemProps) {
  return (
    <Button variant='ghost' className="text-slate-600" size='icon' {...props}>
      <Link href={path}>
        <Icon className="h-6 w-6" />
      </Link>
    </Button>
  )
}

type BottomBarProps = {
  user: User
}

export function BottomBar({ user }: BottomBarProps) {
  const bottomBarItems = user?.role === UserRole.ADMIN ? [] : customerBottomBar

  return (
    <ul className="fixed bottom-0 left-0 right-0 p-3 border-t flex items-center justify-evenly gap-4">
      {bottomBarItems.map((bottomBarItem) => (
        <li key={bottomBarItem.key} className="flex items-center justify-center">
          {bottomBarItem}
        </li>
      ))}
    </ul>
  )
}