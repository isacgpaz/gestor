'use client'

import { Button, ButtonProps } from "@/components/ui/button";
import { CalendarCheck, LucideIcon, Package } from "lucide-react";
import Link from "next/link";

const shortcuts = [
  // <ScanUser key='scan-user' />,
  <Link href='/admin/inventory' key='inventory' >
    <ShortcutItem icon={Package} label='Estoque' variant='default' />
  </Link>,
  <Link href='/admin/agenda' key='calendar' >
    <ShortcutItem icon={CalendarCheck} label='Agenda' variant='secondary' />
  </Link>,
  // <Link href='/admin/catalog' key='menu' >
  //   <ShortcutItem icon={MenuSquare} />
  // </Link>,
  // <Link href='/admin/settings' key='settings'>
  //   <ShortcutItem icon={Settings} />
  // </Link>
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
  label: string,
  primary?: boolean,
} & ButtonProps

export function ShortcutItem({ label, icon: Icon, primary = false, ...props }: ShortcutItemProps) {
  return (
    <Button
      className="flex-shrink-0 px-0 w-full h-12"
      {...props}
    >
      <Icon className="w-4 h-4 mr-2" />
      {label}
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