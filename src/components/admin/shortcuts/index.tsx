'use client'

import { Button, ButtonProps } from "@/components/ui/button";
import { CalendarCheck, LucideIcon, MenuSquare, Settings } from "lucide-react";
import Link from "next/link";
import { ScanUser } from "../scan-user";

const shortcuts = [
  <ScanUser key='scan-user' />,
  <ShortcutItem icon={MenuSquare} key='menu' disabled />,
  <ShortcutItem icon={CalendarCheck} key='calendar' disabled />,
  <Link href='/admin/settings' key='settings' >
    <ShortcutItem icon={Settings} />
  </Link>,
]

function ShortcutsList() {
  return (
    <ul className="flex gap-4 justify-normal items-center">
      {shortcuts.map((shortcut) => (
        <li className="flex-1" key={shortcut.key}>
          {shortcut}
        </li>
      ))}
    </ul>
  )
}

type ShortcutItemProps = {
  icon: LucideIcon,
  primary?: boolean,
} & ButtonProps

export function ShortcutItem({ icon: Icon, primary = false, ...props }: ShortcutItemProps) {
  return (
    <Button
      size='lg'
      variant={primary ? 'default' : 'secondary'}
      className="flex-shrink-0 w-full px-0"
      {...props}
    >
      <Icon />
    </Button>
  )
}

export function Shortcuts() {
  return (
    <div className="px-4">
      <ShortcutsList />
    </div>
  )
}