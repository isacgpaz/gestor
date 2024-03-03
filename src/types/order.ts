import { Order, OrderItem } from "@prisma/client";

export type CreateOrder = Pick<
  Order,
  'companyId'
  | 'type'
  | 'customerId'
  | 'deliveryAddress'
  | 'singleCustomer'
> & {
  items: Omit<Partial<CreateOrderItem>, 'price'>[]
}

export type CreateOrderItem = Pick<
  OrderItem,
  'quantity'
  | 'composedProductsIds'
  | 'uniformProductId'
  | 'catalogVariantPropertyId'
  | 'price'
>