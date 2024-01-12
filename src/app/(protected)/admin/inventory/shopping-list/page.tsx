import { ShoppingListContainer } from "@/components/admin/inventory/shopping-list/shopping-list-container";
import { NavHeader } from "@/components/common/nav-header";
import { serverSession } from "@/lib/auth/server";

export default async function ShoppingListPage() {
  const session = await serverSession()

  const user = session?.user

  return (
    <div className="p-6 flex flex-col min-h-screen">
      <NavHeader backHref="/admin/inventory" title="Lista de compras" />

      <div className="flex flex-col flex-1 w-full">
        <ShoppingListContainer user={user} />
      </div>
    </div>
  )
}