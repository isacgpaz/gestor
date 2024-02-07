import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { useCatalogShoppingBag } from "@/contexts/catalog-shopping-bag-context";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/format-currency";
import { ShoppingBag as ShoppingBagIcon } from 'lucide-react';
import { ShoppingBagList } from "./shopping-bag-list";

export function ShoppingBag() {
  const {
    shoppingBag,
    shoppingBagItemsQuantity,
    shoppingBagValue,
    productComposedVisible,
    shoppingBagOpen,
    onShoppingBagOpenChange
  } = useCatalogShoppingBag()

  return (
    <div className={cn("fixed right-6 transition-all",
      shoppingBagItemsQuantity > 0
        ? productComposedVisible ? "bottom-[7.5rem]" : "bottom-[4.5rem]"
        : "-bottom-full"
    )}>
      <Drawer open={shoppingBagOpen} onOpenChange={onShoppingBagOpenChange}>
        <DrawerTrigger asChild>
          <Button className="w-fit shadow-lg relative rounded-full pr-6 py-6">
            <ShoppingBagIcon className="mr-3 w-5 h-5" />

            <div className="flex flex-col items-start gap-0">
              <span>Ver sacola</span>
              <span className="block text-xs font-normal">
                {formatCurrency(shoppingBagValue)}
              </span>
            </div>


            <span className="absolute -right-1 -top-1 w-5 h-5 bg-primary-foreground text-primary border border-primary rounded-full text-xs flex items-center justify-center shadow-lg">
              {shoppingBagItemsQuantity}
            </span>
          </Button>
        </DrawerTrigger>

        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              Sacola de compras
            </DrawerTitle>
          </DrawerHeader>

          <div className="px-4 flex flex-col gap-3">
            <ShoppingBagList items={shoppingBag} />

            {shoppingBag.length > 0 && (
              <div className="mx-2 mt-4 flex items-center justify-between gap-4 font-medium">
                <span>
                  Total
                </span>

                <span>
                  {formatCurrency(shoppingBagValue)}
                </span>
              </div>
            )}
          </div>

          <DrawerFooter>
            {shoppingBag.length ? (
              <Button>
                Finalizar pedido
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
        </DrawerContent>
      </Drawer>
    </div>
  )
}