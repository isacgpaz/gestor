import { Button } from "@/components/ui/button";
import { CalendarCheck, LucideIcon, MenuSquare, Settings } from "lucide-react";
import { ScanUser } from "../scan-user";

const shortcuts = [
  <ScanUser key='scan-user' />,
  <ShortcutItem icon={MenuSquare} key='menu' />,
  <ShortcutItem icon={CalendarCheck} key='calendar' />,
  <ShortcutItem icon={Settings} key='settings' />,
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

export function ShortcutItem({ icon: Icon, primary = false }: { icon: LucideIcon, primary?: boolean }) {
  return (
    <Button
      size='lg'
      variant={primary ? 'default' : 'secondary'}
      className="flex-shrink-0 w-full px-0"
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