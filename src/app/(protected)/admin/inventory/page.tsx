import { InventoryLastMovement } from "@/components/admin/inventory/movements/last-movement";
import { NavHeader } from "@/components/common/nav-header";
import { Button } from "@/components/ui/button";
import { serverSession } from "@/lib/auth/server";
import Link from "next/link";

export default async function Inventory() {
  const session = await serverSession()

  const user = session?.user

  return (
    <div className="p-6 flex flex-col min-h-screen">
      <NavHeader backHref="/admin/dashboard" title="Estoque" />

      <div className="flex flex-col flex-1 mt-6 w-full">
        <ul className="flex gap-3 w-full">
          <li>
            <Button
              asChild size='sm'
              className="w-fit text-primary"
              variant='secondary'
            >
              <Link href='/admin/inventory/items'>
                Ver itens cadastrados
              </Link>
            </Button>
          </li>

          <li>
            <Button asChild size='sm' className="w-fit">
              <Link href='/admin/inventory/new-movement'>
                Nova movimentação
              </Link>
            </Button>
          </li>
        </ul>

        <InventoryLastMovement user={user} />
      </div>
    </div>
  )
}