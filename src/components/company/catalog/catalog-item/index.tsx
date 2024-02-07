import { Button } from "@/components/ui/button";
import { ProductWithVariant } from "@/types/catalog";
import { formatCurrency } from "@/utils/format-currency";
import { Plus, ShoppingBag } from "lucide-react";

export function CatalogItem({ product }: { product: ProductWithVariant }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-md transition-colors hover:bg-slate-50">
      <div className="rounded-md bg-slate-300 h-16 w-16"></div>

      <div className="flex flex-col justify-center flex-1">
        <span>
          {product.name}
        </span>

        <span className="text-sm text-slate-500">
          {product.description}
        </span>

        {!!product.cost && (
          <span className="font-medium text-sm">
            {formatCurrency(product.cost)}
          </span>
        )}

        {!!product.variant && (
          <Button
            variant='link'
            size='sm'
            className="w-fit p-0 mt-1 h-fit hover:no-underline"
          >
            Ver {product.variant.catalogVariantName.toLowerCase()}s
          </Button>
        )}
      </div>

      <Button
        className="mr-1 relative text-primary"
        variant='secondary'
        size='icon'>
        <ShoppingBag className="w-5 h-5" />

        <div className="absolute -bottom-1 -right-2 bg-primary text-primary-foreground rounded-full">
          <Plus className="w-4 h-4" />
        </div>
      </Button>
    </div>
  )
}