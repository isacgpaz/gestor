import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

type NavHeader = {
  backHref: string;
}

export function NavHeader({ backHref }: NavHeader) {
  return (
    <header>
      <Button size='icon' variant='ghost' className="text-slate-500" asChild>
        <Link href={backHref}>
          <ArrowLeft />
        </Link>
      </Button>
    </header>
  )
}