import { Loader } from "@/components/common/loader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Form } from "@/components/ui/form"
import { Label } from "@/components/ui/label"
import { useCatalog } from "@/hooks/catalog/use-catalog"
import { useCatalogVariants } from "@/hooks/catalog/use-catalog-variants"
import { cn } from "@/lib/utils"
import { Catalog, CatalogVariantWithProperties } from "@/types/catalog"
import { formatCurrency } from "@/utils/format-currency"
import { CatalogCategory, Company, Product } from "@prisma/client"
import { Minus, Plus, ShoppingCart } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

type Category = Pick<CatalogCategory, 'id' | 'name' | 'order'>

export function Catalog({ company }: { company: Company }) {
  const searchParams = useSearchParams()

  const selectedCategory = searchParams.get('category')

  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined)
  const [open, onOpenChange] = useState(false)

  const {
    data: catalog,
    isPending,
  } = useCatalog({
    companyId: company.id
  })

  let catalogCategories = catalog?.map(({ category }) => category) ?? []

  function selectProductAndOpenDrawer(product: Product) {
    setSelectedProduct(product)
    onOpenChange(true)
  }

  if (isPending) {
    return <Loader />
  }

  return (
    <div>
      <CatalogCategoriesList
        categories={catalogCategories}
        selectedCategory={selectedCategory}
      />

      <CatalogSectionsList
        catalog={catalog ?? []}
        selectProductAndOpenDrawer={selectProductAndOpenDrawer}
      />

      {selectedProduct && (
        <CatalogItemDrawer
          product={selectedProduct}
          open={open}
          onOpenChange={onOpenChange}
        />
      )}
    </div>
  )
}

type CatalogCategoriesListProps = {
  categories: Category[],
  selectedCategory: string | null,
}

function CatalogCategoriesList({
  categories,
  selectedCategory,
}: CatalogCategoriesListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()


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
  selectProductAndOpenDrawer: (product: Product) => void
}

function CatalogSectionsList({
  catalog,
  selectProductAndOpenDrawer
}: CatalogSectionsListParams) {
  return (
    <div className="p-6">
      {catalog.map((catalog) => (
        <CatalogSection
          key={catalog.category.id}
          catalog={catalog}
          selectProductAndOpenDrawer={selectProductAndOpenDrawer}
        />
      ))}
    </div>
  )
}

type CatalogSectionProps = {
  catalog: Catalog
  selectProductAndOpenDrawer: (product: Product) => void
}

function CatalogSection({
  catalog,
  selectProductAndOpenDrawer
}: CatalogSectionProps) {
  return (
    <section className="mb-6">
      <h2 className="font-medium text-lg">
        {catalog.category.name}
      </h2>

      <CatalogSectionList
        items={catalog.items}
        selectProductAndOpenDrawer={selectProductAndOpenDrawer}
      />
    </section>
  )
}

type CatalogSectionListProps = {
  items: Product[];
  selectProductAndOpenDrawer: (product: Product) => void
}

function CatalogSectionList({
  items,
  selectProductAndOpenDrawer
}: CatalogSectionListProps) {
  return (
    <ul className="mt-4 flex flex-col gap-2">
      {items.map((product) => (
        <li
          key={product.id}
          onClick={() => selectProductAndOpenDrawer(product)}
        >
          <CatalogItem product={product} />
        </li>
      ))}
    </ul>
  )
}

function CatalogItem({ product }: { product: Product }) {
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
      </div>

      <div className="mr-1">
        <span className="font-medium text-sm">
          {formatCurrency(product.cost)}
        </span>
      </div>
    </div>
  )
}

type CatalogItemDrawerProps = {
  product: Product;
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>
}

const formSchema = z.object({
  quantity: z.number(),
  variant: z.string().optional(),
})

type FormSchema = z.infer<typeof formSchema>

function CatalogItemDrawer({
  product,
  open,
  onOpenChange
}: CatalogItemDrawerProps) {
  const [selectedVariant, setSelectedVariant] = useState<
    CatalogVariantWithProperties | undefined
  >(undefined)

  const form = useForm<FormSchema>({
    defaultValues: {
      quantity: 1,
      variant: undefined
    }
  })

  const quantity = form.watch('quantity')
  const variant = form.watch('variant')

  const {
    data: catalogVariants,
  } = useCatalogVariants({
    companyId: product?.companyId,
  })

  function onSubmit() {

  }

  useEffect(() => {
    if (product.variant?.catalogVariantId) {
      setSelectedVariant(catalogVariants?.find(
        (variant) => variant.id === product.variant?.catalogVariantId
      ))
    }
  }, [catalogVariants, product.variant?.catalogVariantId])

  return (
    <Drawer open={open} onOpenChange={(open) => {
      if (!open) {
        form.setValue('quantity', 0)
      }

      onOpenChange(open)
    }}>
      <DrawerContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
          >
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
                      Selecionar {selectedVariant?.name.toLocaleLowerCase()}:
                    </Label>

                    <ul className="flex flex-wrap items-center gap-4 mt-3">
                      {product?.variant.properties.map((property) => (
                        <li
                          key={property.catalogVariantPropertyId}
                          className="flex flex-col gap-1 items-center justify-center"
                        >
                          <Badge
                            variant={variant === property.catalogVariantPropertyId
                              ? 'default'
                              : 'secondary'
                            }
                            className="cursor-pointer transition-colors"
                            onClick={() => form.setValue('variant', property.catalogVariantPropertyId)}
                          >
                            {selectedVariant?.properties.find(
                              (selectedProperty) => selectedProperty.id === property.catalogVariantPropertyId
                            )?.name}
                          </Badge>

                          <span className={cn(
                            "text-sm transition-colors",
                            variant === property.catalogVariantPropertyId ? 'font-medium' : 'text-slate-500'
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
              <DrawerClose>
                <Button variant='outline'>Fechar</Button>
              </DrawerClose>

              <Button className="w-fit">
                <ShoppingCart className="mr-2 w-4 h-4" />
                Adicionar ao carrinho
              </Button>
            </DrawerFooter>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  )
}