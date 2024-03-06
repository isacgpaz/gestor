import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { useCatalogShoppingBag } from "@/contexts/catalog-shopping-bag-context";
import { useCompany } from "@/contexts/company-context";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/format-currency";
import { ShoppingBag as ShoppingBagIcon } from 'lucide-react';
import { OrderCustomerStep } from "./steps/order-customer-step";
import { OrderInfoStep } from "./steps/order-info-step";
import { OrderItemsStep } from "./steps/order-items-step";

export function ShoppingBag() {
  const {
    shoppingBagItemsQuantity,
    shoppingBagValue,
    productComposedVisible,
    shoppingBagOpen,
    step,
    onShoppingBagOpenChange,
  } = useCatalogShoppingBag()

  const { customer } = useCompany()

  const shoppingBagSteps = [
    <OrderItemsStep key='items' />,
    <OrderInfoStep key='info' />,
    <OrderCustomerStep key='customer' />
  ]

  return (
    <div className={cn("fixed right-6 transition-all",
      shoppingBagItemsQuantity > 0
        ? productComposedVisible ? "bottom-[7.5rem]" : customer ? "bottom-[4.5rem]" : "bottom-[1.5rem]"
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
          {shoppingBagSteps[step]}
        </DrawerContent>
      </Drawer>
    </div>
  )
}