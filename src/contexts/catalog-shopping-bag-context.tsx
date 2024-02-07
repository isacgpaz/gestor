import { CatalogShoppingBag, ComposedShoppingBagItem, ProductWithVariant, ShoppingBagItemTypeEnum, UnitShoppingBagItem } from "@/types/catalog";
import { Dispatch, PropsWithChildren, SetStateAction, createContext, useContext, useMemo, useState } from "react";

type CatalogShoppingBagContextProp = {
  shoppingBag: CatalogShoppingBag,
  setShoppingBag: Dispatch<SetStateAction<CatalogShoppingBag>>,
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
}

export const CatalogShoppingBagContext = createContext<CatalogShoppingBagContextProp>({} as CatalogShoppingBagContextProp)

export function CatalogShoppingBagProvider({
  children,
}: PropsWithChildren) {
  const [shoppingBag, setShoppingBag] = useState<CatalogShoppingBag>([]);

  const [selectedProduct, setSelectedProduct] = useState<ProductWithVariant | undefined>(undefined)
  const [selectedComposedProduct, setSelectedComposedProduct] = useState<ComposedShoppingBagItem | undefined>(undefined)
  const [selectedOrderItem, setSelectedOrderItem] = useState<UnitShoppingBagItem | ComposedShoppingBagItem | undefined>(undefined)

  const [productOpen, onProductOpenChange] = useState(false)
  const [productComposedVisible, onProductComposedVisibleChange] = useState(false);
  const [shoppingBagOpen, onShoppingBagOpenChange] = useState(false)
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

  const value: CatalogShoppingBagContextProp = useMemo(() => ({
    shoppingBag,
    setShoppingBag,
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
    setSelectedOrderItem
  }), [
    shoppingBag,
    setShoppingBag,
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
    setSelectedOrderItem
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

