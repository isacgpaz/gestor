import { CatalogShoppingBag, ComposedShoppingBagItem, ProductWithVariant } from "@/types/catalog";
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
}

export const CatalogShoppingBagContext = createContext<CatalogShoppingBagContextProp>({} as CatalogShoppingBagContextProp)

export function CatalogShoppingBagProvider({
  children,
}: PropsWithChildren) {
  const [shoppingBag, setShoppingBag] = useState<CatalogShoppingBag>([]);

  const [selectedProduct, setSelectedProduct] = useState<ProductWithVariant | undefined>(undefined)
  const [selectedComposedProduct, setSelectedComposedProduct] = useState<ComposedShoppingBagItem | undefined>(undefined)

  const [productOpen, onProductOpenChange] = useState(false)
  const [productComposedVisible, onProductComposedVisibleChange] = useState(false);

  const value: CatalogShoppingBagContextProp = useMemo(() => ({
    shoppingBag,
    setShoppingBag,
    selectedProduct,
    setSelectedProduct,
    productOpen,
    onProductOpenChange,
    productComposedVisible,
    onProductComposedVisibleChange,
    selectedComposedProduct,
    setSelectedComposedProduct
  }), [
    shoppingBag,
    setShoppingBag,
    selectedProduct,
    setSelectedProduct,
    productOpen,
    onProductOpenChange,
    productComposedVisible,
    onProductComposedVisibleChange,
    selectedComposedProduct,
    setSelectedComposedProduct
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

