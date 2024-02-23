import { OrderItem } from "@prisma/client";

export type CreateOrderItem = Pick<
  OrderItem,
  'quantity'
  | 'composedProductsIds'
  | 'uniformProductId'
  | 'catalogVariantPropertyId'
  | 'price'
>