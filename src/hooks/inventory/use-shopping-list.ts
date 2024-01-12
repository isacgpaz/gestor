import { findShoppingList } from "@/services/inventory/find-shopping-list"
import { useQuery } from "@tanstack/react-query"

type ShoppingListProps = {
  companyId?: string,
}

export function useShoppingList(params: ShoppingListProps,) {
  const query = useQuery({
    queryKey: ['shopping-list', params],
    queryFn: () => findShoppingList(params),
  })

  return query
}