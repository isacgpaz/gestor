import { CatalogShoppingBag, ComposedShoppingBagItem, ProductWithVariant, ShoppingBagItemTypeEnum, UnitShoppingBagItem } from "@/types/catalog";
import { CreateOrder } from "@/types/order";
import { OrderType } from "@prisma/client";
import { Dispatch, PropsWithChildren, SetStateAction, createContext, useCallback, useContext, useMemo, useState } from "react";

type CatalogShoppingBagContextProp = {
  shoppingBag: CatalogShoppingBag,
  setShoppingBag: Dispatch<SetStateAction<CatalogShoppingBag>>,
  order: Partial<CreateOrder>,
  setOrder: Dispatch<SetStateAction<Partial<CreateOrder>>>,
  selectedProduct: ProductWithVariant | undefined,
  setSelectedProduct: Dispatch<SetStateAction<ProductWithVariant | undefined>>,
  selectedComposedProduct: ComposedShoppingBagItem | undefined,
  setSelectedComposedProduct: Dispatch<SetStateAction<ComposedShoppingBagItem | undefined>>,
  productOpen: boolean,
  onProductOpenChange: Dispatch<SetStateAction<boolean>>,
  productComposedVisible: boolean,
  onProductComposedVisibleChange: Dispatch<SetStateAction<boolean>>,
  shoppingBagOpen: boolean,
  onShoppingBagOpenChange: Dispatch<SetStateAction<boolean>>,
  isComingFromShoppingBag: boolean,
  setIsComingFromShoppingBag: Dispatch<SetStateAction<boolean>>,
  shoppingBagItemsQuantity: number,
  shoppingBagValue: number,
  selectedOrderItem: UnitShoppingBagItem | ComposedShoppingBagItem | undefined,
  setSelectedOrderItem: Dispatch<SetStateAction<UnitShoppingBagItem | ComposedShoppingBagItem | undefined>>,
  resetShoppingBag: () => void,
  step: number,
  setStep: Dispatch<SetStateAction<number>>
}

export const CatalogShoppingBagContext = createContext<CatalogShoppingBagContextProp>({} as CatalogShoppingBagContextProp)

export function CatalogShoppingBagProvider({
  children,
}: PropsWithChildren) {
  const [shoppingBag, setShoppingBag] = useState<CatalogShoppingBag>([]);
  const [order, setOrder] = useState<Partial<CreateOrder>>({
    type: OrderType.DELIVERY
  });

  const [selectedProduct, setSelectedProduct] = useState<ProductWithVariant | undefined>(undefined)
  const [selectedComposedProduct, setSelectedComposedProduct] = useState<ComposedShoppingBagItem | undefined>(undefined)
  const [selectedOrderItem, setSelectedOrderItem] = useState<UnitShoppingBagItem | ComposedShoppingBagItem | undefined>(undefined)

  const [productOpen, onProductOpenChange] = useState(false)
  const [productComposedVisible, onProductComposedVisibleChange] = useState(false);
  const [shoppingBagOpen, onShoppingBagOpenChange] = useState(false)

  const [step, setStep] = useState(0)

  const [isComingFromShoppingBag, setIsComingFromShoppingBag] = useState(false)

  const shoppingBagItemsQuantity = useMemo(() => {
    const quantity = shoppingBag.reduce(
      (total, orderItem) => {
        if (
          orderItem.type === ShoppingBagItemTypeEnum.UNIT
          || (!!orderItem.firstProduct && !!orderItem.secondProduct)
        ) {
          return total + orderItem.quantity
        }

        return total
      }, 0
    );

    return quantity
  }, [shoppingBag]
  )

  const shoppingBagValue = useMemo(() => {
    const quantity = shoppingBag.reduce(
      (total, orderItem) => {
        if (
          orderItem.type === ShoppingBagItemTypeEnum.UNIT
          || (!!orderItem.firstProduct && !!orderItem.secondProduct)
        ) {
          return total + orderItem.quantity * orderItem.cost
        }


        return total
      }, 0
    );

    return quantity
  }, [shoppingBag]
  )

  const resetShoppingBag = useCallback(() => {
    setShoppingBag([])
    setSelectedProduct(undefined)
    setSelectedComposedProduct(undefined)
    setSelectedOrderItem(undefined)
    setOrder({ type: OrderType.DELIVERY })
    setStep(0)
  }, [])

  const value: CatalogShoppingBagContextProp = useMemo(() => ({
    shoppingBag,
    setShoppingBag,
    order,
    setOrder,
    selectedProduct,
    setSelectedProduct,
    productOpen,
    onProductOpenChange,
    productComposedVisible,
    onProductComposedVisibleChange,
    shoppingBagOpen,
    onShoppingBagOpenChange,
    selectedComposedProduct,
    setSelectedComposedProduct,
    shoppingBagItemsQuantity,
    shoppingBagValue,
    isComingFromShoppingBag,
    setIsComingFromShoppingBag,
    selectedOrderItem,
    setSelectedOrderItem,
    resetShoppingBag,
    step,
    setStep
  }), [
    shoppingBag,
    setShoppingBag,
    order,
    setOrder,
    selectedProduct,
    setSelectedProduct,
    productOpen,
    onProductOpenChange,
    productComposedVisible,
    onProductComposedVisibleChange,
    shoppingBagOpen,
    onShoppingBagOpenChange,
    selectedComposedProduct,
    setSelectedComposedProduct,
    shoppingBagItemsQuantity,
    shoppingBagValue,
    isComingFromShoppingBag,
    setIsComingFromShoppingBag,
    selectedOrderItem,
    setSelectedOrderItem,
    resetShoppingBag,
    step,
    setStep
  ])

  return (
    <CatalogShoppingBagContext.Provider value={value}>
      {children}
    </CatalogShoppingBagContext.Provider>
  )
}

export const useCatalogShoppingBag = () => {
  const context = useContext(CatalogShoppingBagContext);

  if (!context) {
    throw new Error("useCatalogShoppingBagContext must be used within a CatalogShoppingBagProvider");
  }

  return context;
};

