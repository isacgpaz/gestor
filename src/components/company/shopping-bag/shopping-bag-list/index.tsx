import { CatalogShoppingBag } from "@/types/catalog";
import { ShoppingBasket } from "lucide-react";
import { ShoppingBagItem } from "../shopping-bag-item";

type ShoppingBagListProps = {
  items: CatalogShoppingBag;
}

export function ShoppingBagList({
  items,
}: ShoppingBagListProps) {
  if (items.length) {
    return (
      <ul className="mt-4 flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.id}>
            <ShoppingBagItem item={item} />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="my-4 flex flex-col items-center justify-center gap-2 text-slate-500">
      <ShoppingBasket />
      <span className="text-sm text-center">
        Sua sacola está vazia. <br /> Vamos adicionar alguns itens?
      </span>
    </div>
  )
}