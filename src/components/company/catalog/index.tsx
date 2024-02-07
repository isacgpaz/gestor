import { Loader } from "@/components/common/loader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Form } from "@/components/ui/form"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { useCatalogShoppingBag } from "@/contexts/catalog-shopping-bag-context"
import { useCatalog } from "@/hooks/catalog/use-catalog"
import { cn } from "@/lib/utils"
import { Catalog, ComposedShoppingBagItem, ShoppingBagItemTypeEnum } from "@/types/catalog"
import { formatCurrency } from "@/utils/format-currency"
import { CatalogCategory, Company } from "@prisma/client"
import * as Dialog from "@radix-ui/react-dialog"
import { CircleSlash, Minus, Plus, ShoppingBag } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { v4 as uuidv4 } from "uuid"
import { z } from "zod"
import { CatalogSectionList } from "./catalog-section-list"

export function Catalog({ company }: { company: Company }) {
  const {
    selectedProduct,
    productComposedVisible,
  } = useCatalogShoppingBag()

  const {
    data: catalog,
    isPending,
  } = useCatalog({
    companyId: company.id
  })

  const catalogCategories = catalog?.map(({ category }) => category) ?? []

  const catalogFilteredByComposedProduct = catalog?.filter(
    (catalog) => catalog.category.id === selectedProduct?.categoryId
  ).map((catalog) => ({
    ...catalog,
    items: catalog.items.filter((product) => product.id !== selectedProduct?.id)
  })) ?? []

  if (isPending) {
    return <Loader />
  }

  return (
    <div>
      {!productComposedVisible && (
        <CatalogCategoriesList categories={catalogCategories} />
      )}

      <CatalogSectionsList
        catalog={productComposedVisible
          ? catalogFilteredByComposedProduct
          : catalog ?? []}
      />

      {selectedProduct && (
        <>
          <CatalogItemDrawer />

          <ComposedDialog />
        </>
      )}
    </div>
  )
}

type Category = Pick<CatalogCategory, 'id' | 'name' | 'order'>

type CatalogCategoriesListProps = {
  categories: Category[],
}


function CatalogCategoriesList({
  categories,
}: CatalogCategoriesListProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined)

  return (
    <ul className="flex gap-3 px-6 whitespace-nowrap overflow-auto scrollbar-hide">
      <li>
        <Button
          asChild
          variant={!selectedCategoryId ? 'default' : 'secondary'}
          className={cn(selectedCategoryId && "text-primary")}
          onClick={() => setSelectedCategoryId(undefined)}
        >
          <a href="#all">
            Todos
          </a>
        </Button>
      </li>

      {categories.map((category) => (
        <li key={category.id}>
          <Button
            asChild
            variant={selectedCategoryId === category.id ? 'default' : 'secondary'}
            className={cn(selectedCategoryId !== category.id && "text-primary")}
            onClick={() => setSelectedCategoryId(category.id)}
          >
            <a href={`#${category.id}`}>
              {category.name}
            </a>
          </Button>
        </li>
      ))}
    </ul>
  )
}

type CatalogSectionsListParams = {
  catalog: Catalog[];
}

function CatalogSectionsList({
  catalog,
}: CatalogSectionsListParams) {
  return (
    <div className="p-6">
      {catalog.map((catalog) => (
        <CatalogSection
          key={catalog.category.id}
          catalog={catalog}
        />
      ))}
    </div>
  )
}

type CatalogSectionProps = {
  catalog: Catalog
}

function CatalogSection({
  catalog,
}: CatalogSectionProps) {
  const { productComposedVisible } = useCatalogShoppingBag()

  return (
    <section className="mb-6" id={catalog.category.id}>
      <h2 className="font-medium text-lg">
        {productComposedVisible ? 'Escolher segundo sabor:' : catalog.category.name}
      </h2>

      <CatalogSectionList items={catalog.items} />
    </section>
  )
}

const formSchema = z.object({
  quantity: z.number(),
  variantId: z.string().optional(),
})

type FormSchema = z.infer<typeof formSchema>

function CatalogItemDrawer() {
  const {
    selectedProduct: product,
    productOpen,
    productComposedVisible,
    selectedComposedProduct,
    isComingFromShoppingBag,
    selectedOrderItem,
    setShoppingBag,
    setSelectedComposedProduct,
    setSelectedOrderItem,
    onProductOpenChange,
    onProductComposedVisibleChange,
    onShoppingBagOpenChange,
    setIsComingFromShoppingBag
  } = useCatalogShoppingBag()

  const enableWrite = product?.id !== selectedComposedProduct?.firstProduct?.id

  const form = useForm<FormSchema>({
    defaultValues: {
      quantity: 1,
      variantId: selectedComposedProduct?.variantId ?? undefined
    }
  })

  const quantity = form.watch('quantity')
  const variantId = form.watch('variantId')

  const orderValue = useMemo(() => {
    const selectedVariantPrice = product?.variant?.properties.find(
      (property) => property.catalogVariantPropertyId === variantId
    )?.value

    if (selectedVariantPrice) {
      return selectedVariantPrice * quantity
    }

    if (product?.cost) {
      return product?.cost * quantity
    }

    return 0
  }, [
    product,
    quantity,
    variantId
  ])

  function onSubmit(values: FormSchema) {
    if (product) {
      let cost = product.cost ?? 0

      if (values.variantId) {
        const variantPropertyValue = product.variant.properties.find(
          (property) => property.catalogVariantPropertyId === values.variantId
        )?.value ?? 0

        cost = variantPropertyValue
      }

      const productData = {
        id: uuidv4(),
        quantity: values.quantity,
        variantId: values.variantId,
        cost
      }

      if (productComposedVisible) {
        productData.cost = cost / 2

        const composedProduct: ComposedShoppingBagItem = {
          ...productData,
          firstProduct: {
            ...product,
            cost
          },
          secondProduct: undefined,
          type: ShoppingBagItemTypeEnum.COMPOSED
        }

        if (selectedOrderItem) {
          setShoppingBag((previousShoppingBag) =>
            previousShoppingBag.map((shoppingBagItem) => {
              if (shoppingBagItem.id === selectedOrderItem.id) {
                return {
                  ...selectedOrderItem,
                  ...composedProduct
                }
              }

              return shoppingBagItem
            }),
          )
        } else {
          setShoppingBag((previousShoppingBag) => [
            ...previousShoppingBag,
            composedProduct
          ])
        }

        setSelectedComposedProduct(composedProduct)
      } else {
        if (selectedOrderItem) {
          setShoppingBag((previousShoppingBag) =>
            previousShoppingBag.map((shoppingBagItem) => {
              if (shoppingBagItem.id === selectedOrderItem.id) {
                return {
                  ...selectedOrderItem,
                  ...productData,
                  product: {
                    ...product,
                    cost
                  },
                  type: ShoppingBagItemTypeEnum.UNIT
                }
              }

              return shoppingBagItem
            }),
          )
        } else {
          setShoppingBag((previousShoppingBag) => [
            ...previousShoppingBag,
            {
              ...productData,
              product: {
                ...product,
                cost
              },
              type: ShoppingBagItemTypeEnum.UNIT
            }
          ])
        }

        toast({
          title: 'Item adicionado com sucesso!',
          variant: 'success'
        })

      }
    }

    if (isComingFromShoppingBag) {
      onShoppingBagOpenChange(true)
      setSelectedOrderItem(undefined)
    }

    onProductOpenChange(false)
  }

  useEffect(() => {
    form.reset({
      quantity: selectedOrderItem?.quantity ?? 1,
      variantId:
        selectedOrderItem?.variantId
        ?? product?.variant?.properties.find(
          (property) => property.catalogVariantPropertyId === selectedOrderItem?.variantId
        )?.catalogVariantPropertyId
        ?? product?.variant?.properties[0].catalogVariantPropertyId
    })
  },
    [
      form,
      product?.variant?.properties,
      selectedComposedProduct?.quantity,
      selectedComposedProduct?.variantId,
      selectedOrderItem?.quantity,
      selectedOrderItem?.variantId
    ]
  )

  if (!product) {
    return null
  }

  return (
    <Drawer open={productOpen} onOpenChange={(open) => {
      if (!open) {
        form.reset()
        setSelectedOrderItem(undefined)
        setIsComingFromShoppingBag(false)
      }

      onProductOpenChange(open)
    }}>
      <DrawerContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex gap-4 p-6">
              <div className="w-32 h-32 bg-slate-300 rounded-sm flex-shrink-0"></div>

              <div className="flex flex-col justify-start gap-2 flex-1">
                <DrawerHeader className="justify-start text-left p-0">
                  <DrawerTitle className="text-2xl">
                    {product?.name}
                  </DrawerTitle>

                  {product.description && (
                    <DrawerDescription>
                      {product.description}
                    </DrawerDescription>
                  )}
                </DrawerHeader>

                {!!product.cost && (
                  <span className="text-slate-500 text-sm mb-6">
                    {formatCurrency(product.cost)}
                  </span>
                )}

                {product.variant && (
                  <div className="max-w-xs my-4 w-full flex flex-col justify-center">
                    <Label>
                      Selecionar {product?.variant.catalogVariantName.toLowerCase()}:
                    </Label>

                    <ul className="flex flex-wrap items-center gap-4 mt-3">
                      {product?.variant.properties.map((property) => (
                        <li
                          key={property.catalogVariantPropertyId}
                          className="flex flex-col gap-1 items-center justify-center"
                        >
                          <Badge
                            variant={variantId === property.catalogVariantPropertyId
                              ? 'default'
                              : 'secondary'
                            }
                            className="cursor-pointer transition-all"
                            onClick={() => form.setValue('variantId', property.catalogVariantPropertyId)}
                          >
                            {property.catalogVariantPropertyName}
                          </Badge>

                          <span className={cn(
                            "text-sm transition-all",
                            variantId === property.catalogVariantPropertyId
                              ? 'font-medium'
                              : 'text-slate-500'
                          )}>
                            {formatCurrency(
                              productComposedVisible
                                ? property.value / 2
                                : property.value
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {enableWrite && (
                  <>
                    <div className="w-fit flex items-center justify-center space-x-8 mb-4">
                      <Button
                        type='button'
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 shrink-0 rounded-full"
                        onClick={() => form.setValue('quantity', quantity - 1)}
                        disabled={quantity === 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>

                      <span className="font-medium">
                        {quantity}
                      </span>

                      <Button
                        type='button'
                        size="icon"
                        className="h-8 w-8 shrink-0 rounded-full"
                        onClick={() => form.setValue('quantity', quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {product.allowComposition && (
                      <Button
                        className="w-full text-primary hover:text-primary "
                        variant='secondary'
                        onClick={() => {
                          onProductComposedVisibleChange(true)
                          setIsComingFromShoppingBag(false)
                        }}
                      >
                        <CircleSlash className="mr-2 w-4 h-4 block rotate-[130deg]" />
                        Adicionar meio a meio
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>

            <DrawerFooter className="flex-row items-end justify-between gap-4">
              <DrawerClose asChild>
                <Button
                  variant='outline'
                  size={productComposedVisible ? 'icon' : 'default'}
                  type='button'
                  className={cn(productComposedVisible && 'w-12')}
                  onClick={() => {
                    if (isComingFromShoppingBag) {
                      onShoppingBagOpenChange(true)
                    }
                  }}
                >
                  Fechar
                </Button>
              </DrawerClose>

              {enableWrite && (
                <Button className="w-fit">
                  <ShoppingBag className="mr-2 w-4 h-4" />
                  {isComingFromShoppingBag ? 'Atualizar ' : 'Adicionar '}
                  {formatCurrency(orderValue)}
                </Button>
              )}
            </DrawerFooter>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  )
}

function ComposedDialog() {
  const {
    selectedProduct: firstProduct,
    selectedComposedProduct,
    productComposedVisible,
    setShoppingBag,
    setSelectedComposedProduct,
    onProductComposedVisibleChange,
    onProductOpenChange,
  } = useCatalogShoppingBag()

  const firstProductVariantOriginalPrice = firstProduct?.variant?.properties.find(
    (prop) => prop.catalogVariantPropertyId === selectedComposedProduct?.variantId
  )?.value ?? 0

  const firstProductVariantComposedPrice = firstProductVariantOriginalPrice / 2

  function onCancelProductComposition() {
    setShoppingBag((previousShoppingBag) => previousShoppingBag.filter(
      (product) => product.id !== selectedComposedProduct?.id
    ))

    setSelectedComposedProduct(undefined)
    onProductComposedVisibleChange(false)
  }

  if (!firstProduct) {
    return null
  }

  return (
    <Dialog.Root open={productComposedVisible} modal={false}>
      <Dialog.Content className="fixed px-6 w-full z-20 transition-all data-[state=open]:bottom-4 data-[state=closed]:-bottom-4 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
        <div
          className="bg-primary rounded-md p-4 flex items-center justify-between gap-4"
          onClick={(e) => {
            if ((e.target as HTMLButtonElement).tagName !== "BUTTON") {
              onProductOpenChange(true)
            }
          }}
        >
          <div className="flex flex-col flex-1">
            <span className="font-medium text-primary-foreground">
              Escolher sabor 2 de 2
            </span>

            <span className="text-slate-200 text-sm">
              <span className="font-medium">
                Sabor 1:{' '}
              </span>
              {firstProduct.name}
            </span>

            <span className="text-slate-200 text-sm">
              <span className="font-medium">
                Valor: {' '}
              </span>
              {formatCurrency(firstProductVariantComposedPrice)}
            </span>
          </div>

          <Dialog.DialogClose asChild>
            <Button
              size='sm'
              variant='secondary'
              className="text-primary"
              onClick={onCancelProductComposition}
            >
              Cancelar
            </Button>
          </Dialog.DialogClose>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  )
}