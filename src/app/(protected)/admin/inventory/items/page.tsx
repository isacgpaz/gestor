import { InventoryItemsListContainer } from "@/components/admin/inventory/items/items-list";
import { NavHeader } from "@/components/common/nav-header";
import { Button } from "@/components/ui/button";
import { serverSession } from "@/lib/auth/server";
import { PackagePlus } from "lucide-react";
import Link from "next/link";

export default async function Items() {
  const session = await serverSession()

  const user = session?.user

  return (
    <div className="p-6 flex flex-col min-h-screen">
      <div className="flex items-center justify-between gap-4">
        <NavHeader backHref="/admin/inventory" title="Itens" />

        <Button asChild size='sm' className="w-fit">
          <Link href='/admin/inventory/items/new-item'>
            <PackagePlus className="mr-2 h-4 w-4" />
            Novo item
          </Link>
        </Button>
      </div>

      <div className="flex flex-col flex-1  w-full">
        <InventoryItemsListContainer user={user} />
      </div>
    </div>
  )
}