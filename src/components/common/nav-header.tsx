import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

type NavHeader = {
  backHref: string;
  title?: string
}

export function NavHeader({ backHref, title }: NavHeader) {
  return (
    <header className="flex gap-2 items-center">
      <Button size='icon' variant='ghost' className="text-slate-500" asChild>
        <Link href={backHref}>
          <ArrowLeft />
        </Link>
      </Button>

      {title && (
        <h1 className="font-medium text-xl">{title}</h1>
      )}
    </header>
  )
}