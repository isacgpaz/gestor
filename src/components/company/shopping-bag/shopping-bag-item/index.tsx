import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useCatalogShoppingBag } from "@/contexts/catalog-shopping-bag-context";
import { ComposedShoppingBagItem, ShoppingBagItemTypeEnum, UnitShoppingBagItem } from "@/types/catalog";
import { formatCurrency } from "@/utils/format-currency";
import { Trash } from "lucide-react";

export function ShoppingBagItem({
  item
}: {
  item: UnitShoppingBagItem | ComposedShoppingBagItem
}) {
  const {
    setSelectedProduct,
    onProductOpenChange,
    onShoppingBagOpenChange,
    setShoppingBag,
    setSelectedOrderItem
  } = useCatalogShoppingBag()

  function selectProductAndOpenDrawer() {
    if (item.type === ShoppingBagItemTypeEnum.UNIT) {
      setSelectedProduct(item.product)
      setSelectedOrderItem(item)
      onProductOpenChange(true)
      onShoppingBagOpenChange(false)
    }
  }

  function removeItemFromShoppingBag() {
    setShoppingBag((previousShoppingBag) => previousShoppingBag.filter(
      (product) => product.id !== item.id
    ))

    toast({
      title: 'Item removido da sacola.',
      variant: 'success'
    })
  }

  return (
    <div className="flex items-center gap-3 p-2 rounded-md transition-colors hover:bg-slate-50">
      <div
        className="flex flex-col justify-center flex-1"
        onClick={selectProductAndOpenDrawer}
      >
        {item.type === ShoppingBagItemTypeEnum.COMPOSED ? (
          <span>
            {item.quantity} x {item.firstProduct?.name}/{item.secondProduct?.name}
          </span>
        ) : (
          <span>
            {item.quantity} x {item.product.name}
          </span>
        )}

        {item.variantId && (
          <ul>
            <li className="text-xs">
              {item.type === ShoppingBagItemTypeEnum.COMPOSED
                ? item.firstProduct?.variant.properties.find(
                  (property) => property.catalogVariantPropertyId === item.variantId
                )?.catalogVariantPropertyName
                : item.product?.variant.properties.find(
                  (property) => property.catalogVariantPropertyId === item.variantId
                )?.catalogVariantPropertyName
              }
            </li>

            {item.type === ShoppingBagItemTypeEnum.COMPOSED &&
              <li className="text-xs">
                Meio à meio
              </li>
            }
          </ul>
        )}

        <span className="font-medium text-sm">
          {formatCurrency(item.cost * item.quantity)}
        </span>
      </div>

      <Button
        variant='link'
        size='icon'
        className="text-destructive transition-colors hover:text-destructive"
        onClick={removeItemFromShoppingBag}
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  )
}