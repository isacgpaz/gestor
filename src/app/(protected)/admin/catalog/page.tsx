import { CatalogGroups } from "@/components/admin/catalog/groups";
import { ProductsList } from "@/components/admin/catalog/products/products-list";
import { NavHeader } from "@/components/common/nav-header";
import { Button } from "@/components/ui/button";
import { serverSession } from "@/lib/auth/server";
import Link from "next/link";

export default async function CatalogPage() {
  const session = await serverSession()

  const user = session?.user

  return (
    <div className="py-6 flex flex-col min-h-screen">
      <div className="px-6">
        <NavHeader backHref="/admin/dashboard" title="Catálogo" />
      </div>

      <div className="flex flex-col flex-1 mt-6 w-full">
        <ul className="flex gap-3 w-full px-6 whitespace-nowrap overflow-auto scrollbar-hide">
          <li>
            <Button asChild size='sm' className="w-fit">
              <Link href='/admin/catalog/products'>
                Novo produto
              </Link>
            </Button>
          </li>

          <li>
            <CatalogGroups user={user} />
          </li>
        </ul>

        <ProductsList user={user} />
      </div>
    </div>
  )
}