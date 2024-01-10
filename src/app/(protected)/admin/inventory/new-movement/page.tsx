import { InventoryNewMovement } from "@/components/admin/inventory/movements/new-movement";
import { NavHeader } from "@/components/common/nav-header";
import { serverSession } from "@/lib/auth/server";

export default async function NewMovementPage() {
  const session = await serverSession()

  const user = session?.user

  return (
    <div className="p-6 flex flex-col min-h-screen">
      <NavHeader backHref="/admin/inventory" title="Nova movimentação" />

      <div className="flex flex-col flex-1 mt-6 w-full">
        <InventoryNewMovement user={user} />
      </div>
    </div>
  )
}