import { useCatalogShoppingBag } from "@/contexts/catalog-shopping-bag-context";
import { formatCurrency } from "@/utils/format-currency";

export function ShoppingBagTotalValue() {
  const { shoppingBag, shoppingBagValue } = useCatalogShoppingBag()

  return shoppingBag.length > 0 && (
    <div className="mx-2 mt-4 flex items-center justify-between gap-4 font-medium">
      <span>
        Total
      </span>

      <span>
        {formatCurrency(shoppingBagValue)}
      </span>
    </div>
  )
}
