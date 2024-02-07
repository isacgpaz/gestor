import { toast } from "@/components/ui/use-toast";
import { useCatalogShoppingBag } from "@/contexts/catalog-shopping-bag-context";
import { ProductWithVariant, ShoppingBagItemTypeEnum } from "@/types/catalog";
import { CatalogItem } from "../catalog-item";

type CatalogSectionListProps = {
  items: ProductWithVariant[];
}

export function CatalogSectionList({
  items,
}: CatalogSectionListProps) {
  const {
    productComposedVisible,
    setSelectedProduct,
    setSelectedComposedProduct,
    setShoppingBag,
    onProductOpenChange,
    onProductComposedVisibleChange
  } = useCatalogShoppingBag()

  function selectProductAndOpenDrawer(product: ProductWithVariant) {
    setSelectedProduct(product)
    onProductOpenChange(true)
  }

  function selectComposedProduct(product: ProductWithVariant) {
    setShoppingBag((previousShoppingBag) => previousShoppingBag.map(
      (bagProduct) => {
        let cost = product.cost ?? 0

        if (bagProduct.variantId) {
          const variantPropertyValue = product.variant.properties.find(
            (property) => property.catalogVariantPropertyId === bagProduct.variantId
          )?.value ?? 0

          cost = variantPropertyValue
        }

        if (bagProduct.type === ShoppingBagItemTypeEnum.COMPOSED) {
          return {
            ...bagProduct,
            cost: bagProduct.cost + cost / 2,
            secondProduct: {
              ...product,
              cost
            }
          }
        }

        return bagProduct
      }
    ))

    setSelectedProduct(undefined)
    setSelectedComposedProduct(undefined)
    onProductComposedVisibleChange(false)

    toast({
      title: 'Item adicionado com sucesso!',
      variant: 'success'
    })
  }

  return (
    <ul className="mt-4 flex flex-col gap-2">
      {items.map((product) => (
        <li
          key={product.id}
          onClick={() => {
            if (productComposedVisible) {
              selectComposedProduct(product)
            } else {
              selectProductAndOpenDrawer(product)
            }
          }}
        >
          <CatalogItem product={product} />
        </li>
      ))}
    </ul>
  )
}