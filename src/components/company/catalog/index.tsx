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
import { Catalog, ComposedShoppingBagItem, ProductWithVariant, ShoppingBagItemTypeEnum } from "@/types/catalog"
import { formatCurrency } from "@/utils/format-currency"
import { CatalogCategory, Company } from "@prisma/client"
import * as Dialog from "@radix-ui/react-dialog"
import { CircleSlash, Minus, Plus, ShoppingBag } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { v4 as uuidv4 } from "uuid"
import { z } from "zod"

export function Catalog({ company }: { company: Company }) {
  const {
    selectedProduct,
    shoppingBag,
    productComposedVisible,
  } = useCatalogShoppingBag()

  const {
    data: catalog,
    isPending,
  } = useCatalog({
    companyId: company.id
  })

  const catalogCategories = catalog?.map(({ category }) => category) ?? []

  console.log(shoppingBag)

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
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const selectedCategory = searchParams.get('category')

  function updateSelectedCategory(categoryId?: string) {
    const params = new URLSearchParams(searchParams.toString())

    if (categoryId) {
      params.set('category', categoryId)
    } else {
      params.delete('category')
    }

    router.push(pathname + '?' + params.toString(), { scroll: false })
  }

  return (
    <ul className="flex gap-3 px-6">
      <li>
        <Button
          variant={!selectedCategory ? 'default' : 'secondary'}
          className={cn(selectedCategory && "text-primary")}
          onClick={() => updateSelectedCategory(undefined)}
        >
          Todos
        </Button>
      </li>

      {categories.map((category) => (
        <li key={category.id}>
          <Button
            variant={category.id === selectedCategory ? 'default' : 'secondary'}
            className={cn(category.id !== selectedCategory && "text-primary")}
            onClick={() => updateSelectedCategory(category.id)}
          >
            {category.name}
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
    <section className="mb-6">
      <h2 className="font-medium text-lg">
        {productComposedVisible ? 'Escolher segundo sabor:' : catalog.category.name}
      </h2>

      <CatalogSectionList items={catalog.items} />
    </section>
  )
}

type CatalogSectionListProps = {
  items: ProductWithVariant[];
}

function CatalogSectionList({
  items,
}: CatalogSectionListProps) {
  const {
    productComposedVisible,
    setSelectedProduct,
    setShoppingBag,
    onProductOpenChange,
    onProductComposedVisibleChange
  } = useCatalogShoppingBag()

  function selectProductAndOpenDrawer(product: ProductWithVariant) {
    setSelectedProduct(product)
    onProductOpenChange(true)
  }

  function selectComposedProduct(product: ProductWithVariant) {
    setShoppingBag((previousShoppingBag) => previousShoppingBag.map(
      (bagProduct) => {
        if (bagProduct.type === ShoppingBagItemTypeEnum.COMPOSED) {
          return {
            ...bagProduct,
            secondProductId: product.id
          }
        }

        return bagProduct
      }
    ))

    setSelectedProduct(undefined)
    onProductComposedVisibleChange(false)

    toast({
      title: 'Item adicionado com sucesso!',
      variant: 'success'
    })
  }

  return (
    <ul className="mt-4 flex flex-col gap-2">
      {items.map((product) => (
        <li
          key={product.id}
          onClick={() => {
            if (productComposedVisible) {
              selectComposedProduct(product)
            } else {
              selectProductAndOpenDrawer(product)
            }
          }}
        >
          <CatalogItem product={product} />
        </li>
      ))}
    </ul>
  )
}

function CatalogItem({ product }: { product: ProductWithVariant }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-md transition-colors hover:bg-slate-50">
      <div className="rounded-md bg-slate-300 h-16 w-16"></div>

      <div className="flex flex-col justify-center flex-1">
        <span>
          {product.name}
        </span>

        <span className="text-sm text-slate-500">
          {product.description}
        </span>

        {!!product.cost && (
          <span className="font-medium text-sm">
            {formatCurrency(product.cost)}
          </span>
        )}

        {!!product.variant && (
          <Button
            variant='link'
            size='sm'
            className="w-fit p-0 mt-1 h-fit hover:no-underline"
          >
            Ver {product.variant.catalogVariantName.toLowerCase()}
          </Button>
        )}
      </div>

      <Button
        className="mr-1 relative text-primary"
        variant='secondary'
        size='icon'>
        <ShoppingBag className="w-5 h-5" />

        <div className="absolute -bottom-1 -right-2 bg-primary text-primary-foreground rounded-full">
          <Plus className="w-4 h-4" />
        </div>
      </Button>
    </div>
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
    setShoppingBag,
    setSelectedComposedProduct,
    onProductOpenChange,
    onProductComposedVisibleChange,
  } = useCatalogShoppingBag()

  const form = useForm<FormSchema>({
    defaultValues: {
      quantity: 1,
      variantId: undefined
    }
  })

  const quantity = form.watch('quantity')
  const variantId = form.watch('variantId')

  function onSubmit(values: FormSchema) {
    if (product) {
      const productData = {
        id: uuidv4(),
        quantity: values.quantity,
        variantId: values.variantId,
      }

      if (productComposedVisible) {
        const composedProduct: ComposedShoppingBagItem = {
          ...productData,
          firstProductId: product.id,
          secondProductId: undefined,
          type: ShoppingBagItemTypeEnum.COMPOSED
        }

        setShoppingBag((previousShoppingBag) => [
          ...previousShoppingBag,
          composedProduct
        ])

        setSelectedComposedProduct(composedProduct)
      } else {
        setShoppingBag((previousShoppingBag) => [
          ...previousShoppingBag,
          {
            ...productData,
            productId: product.id,
            type: ShoppingBagItemTypeEnum.UNIT
          }
        ])

        toast({
          title: 'Item adiciondo com sucesso!',
          variant: 'success'
        })
      }
    }

    onProductOpenChange(false)
  }

  if (!product) {
    return null
  }

  return (
    <Drawer open={productOpen} onOpenChange={(open) => {
      if (!open) {
        form.reset()
      }

      onProductOpenChange(open)
    }}>
      <DrawerContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex gap-4 p-6">
              <div className="w-32 h-32 bg-slate-300 rounded-sm flex-shrink-0"></div>

              <div className="flex flex-col justify-between flex-1">
                <DrawerHeader className="justify-start text-left pl-0 pt-0">
                  <DrawerTitle className="text-2xl">
                    {product?.name}
                  </DrawerTitle>

                  {product.description && (
                    <DrawerDescription>
                      {product.description}
                    </DrawerDescription>
                  )}
                </DrawerHeader>

                {product.variant && (
                  <div className="max-w-xs my-4 w-full flex flex-col justify-center">
                    <Label>
                      Selecionar {product?.variant.catalogVariantName}:
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
                            {formatCurrency(property.value)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="w-fit flex items-center justify-center space-x-8">
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
              </div>
            </div>

            <DrawerFooter className="flex-row justify-between gap-4">
              <DrawerClose asChild>
                <Button variant='outline' type='button'>Fechar</Button>
              </DrawerClose>

              <div className="flex gap-2">
                {productComposedVisible ? (
                  <Button className="w-fit">
                    <CircleSlash className="mr-2 w-4 h-4" />
                    Adicionar metade
                  </Button>
                ) : (
                  <>
                    <Button
                      className="w-fit text-primary"
                      variant='secondary'
                      onClick={() => {
                        onProductComposedVisibleChange(true)
                      }}
                    >
                      <CircleSlash className="mr-2 w-4 h-4 block rotate-[130deg]" />
                      Meio a meio
                    </Button>

                    <Button className="w-fit">
                      <ShoppingBag className="mr-2 w-4 h-4" />
                      Adicionar à sacola
                    </Button>
                  </>
                )}
              </div>
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
    onProductComposedVisibleChange,
    onProductOpenChange,
  } = useCatalogShoppingBag()

  function onCancelProductComposition() {
    setShoppingBag((previousShoppingBag) => previousShoppingBag.filter(
      (product) => product.id !== selectedComposedProduct?.id
    ))

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