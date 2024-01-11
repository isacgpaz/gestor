import { InventoryLastMovement } from "@/components/admin/inventory/movements/last-movement";
import { NavHeader } from "@/components/common/nav-header";
import { Button } from "@/components/ui/button";
import { serverSession } from "@/lib/auth/server";
import Link from "next/link";

export default async function Inventory() {
  const session = await serverSession()

  const user = session?.user

  return (
    <div className="py-6 flex flex-col min-h-screen">
      <div className="px-6">
        <NavHeader backHref="/admin/dashboard" title="Estoque" />
      </div>

      <div className="flex flex-col flex-1 mt-6 w-full">
        <ul className="flex gap-3 w-full px-6 whitespace-nowrap overflow-auto scrollbar-hide">
          <li>
            <Button asChild size='sm' className="w-fit">
              <Link href='/admin/inventory/new-movement'>
                Nova movimentação
              </Link>
            </Button>
          </li>

          <li>
            <Button
              asChild size='sm'
              className="w-fit text-primary"
              variant='secondary'
            >
              <Link href='/admin/inventory/items'>
                Itens
              </Link>
            </Button>
          </li>

          <li>
            <Button
              asChild size='sm'
              className="w-fit text-primary"
              variant='secondary'
            >
              <Link href='/admin/inventory/shopping-list'>
                Lista de compras
              </Link>
            </Button>
          </li>
        </ul>

        <InventoryLastMovement user={user} />
      </div>
    </div>
  )
}