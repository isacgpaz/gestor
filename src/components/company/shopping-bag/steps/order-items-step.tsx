import { Button } from "@/components/ui/button";
import { DrawerClose, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useCatalogShoppingBag } from "@/contexts/catalog-shopping-bag-context";
import { ChevronRight } from "lucide-react";
import { ShoppingBagList } from "../shopping-bag-list";
import { ShoppingBagTotalValue } from "../shopping-bag-total-value";

export function OrderItemsStep() {
  const {
    shoppingBag,
    onShoppingBagOpenChange,
    setStep
  } = useCatalogShoppingBag()

  return (
    <>
      <DrawerHeader>
        <DrawerTitle>
          Sacola de compras
        </DrawerTitle>
      </DrawerHeader>

      <div className="px-4 flex flex-col gap-3">
        <ShoppingBagList items={shoppingBag} />

        <ShoppingBagTotalValue />
      </div>

      <DrawerFooter>
        {shoppingBag.length ? (
          <Button
            onClick={() => setStep(1)}
          >
            Escolher endereço

            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={() => onShoppingBagOpenChange(false)}>
            Começar a adicionar itens
          </Button>
        )}

        <DrawerClose asChild>
          <Button variant='outline'>
            Voltar
          </Button>
        </DrawerClose>
      </DrawerFooter>
    </>
  )
}