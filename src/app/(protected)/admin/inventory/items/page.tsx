import { InventoryItemsListContainer } from "@/components/admin/inventory/items/items-list";
import { NavHeader } from "@/components/common/nav-header";
import { serverSession } from "@/lib/auth/server";

export default async function Items() {
  const session = await serverSession()

  const user = session?.user

  return (
    <div className="p-6 flex flex-col min-h-screen">
      <NavHeader backHref="/admin/inventory" title="Itens" />

      <div className="flex flex-col flex-1 w-full">
        <InventoryItemsListContainer user={user} />
      </div>
    </div>
  )
}