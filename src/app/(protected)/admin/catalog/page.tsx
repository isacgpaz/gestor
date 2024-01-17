import { ProductsListContainer } from "@/components/admin/catalog/products/products-list";
import { NavHeader } from "@/components/common/nav-header";
import { serverSession } from "@/lib/auth/server";

export default async function CatalogPage() {
  const session = await serverSession()

  const user = session?.user

  return (
    <div className="py-6 flex flex-col min-h-screen">
      <div className="px-6">
        <NavHeader backHref="/admin/dashboard" title="Catálogo" />
      </div>

      <div className="flex flex-col flex-1 mt-6 w-full">
        <ProductsListContainer user={user} />
      </div>
    </div>
  )
}