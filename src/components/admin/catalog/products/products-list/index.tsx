'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { useCatalogCategories } from "@/hooks/catalog/use-catalog-categories"
import { useProducts } from "@/hooks/catalog/use-products"
import { useUpdateProduct } from "@/hooks/catalog/use-update-product"
import { queryClient } from "@/lib/query-client"
import { formatCurrency } from "@/utils/format-currency"
import { zodResolver } from "@hookform/resolvers/zod"
import { CatalogCategory, Company, Product, User } from "@prisma/client"
import { useDebounce } from "@uidotdev/usehooks"
import { Loader2, PackageOpen } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CatalogCategories } from "../../categories"
import { CatalogSettings } from "../../settings"

type ProductWithCategory = Product & { category: CatalogCategory }

const formSchema = z.object({
  search: z.string().optional(),
  categories: z.array(z.string())
})

type FormSchema = z.infer<typeof formSchema>

export function ProductsListContainer({
  user
}: {
  user?: User & { company: Company }
}) {
  const [selectedProduct, setSelectedProduct] = useState<ProductWithCategory | undefined>(undefined)
  const [isOpen, onOpenChange] = useState(false)

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: '',
      categories: [],
    },
  })

  const search = form.watch('search')
  const categories = form.watch('categories')

  const deboucedSearch = useDebounce(search, 300)

  function selectProductAndOpenDrawer(product: ProductWithCategory | undefined) {
    setSelectedProduct(product)
    onOpenChange(true)
  }

  return (
    <section className="px-6">
      <ul className="flex gap-3 w-full whitespace-nowrap overflow-auto scrollbar-hide">
        <li>
          <Button
            size='sm'
            className="w-fit"
            onClick={() => onOpenChange(true)}
          >
            Novo produto
          </Button>
        </li>

        <li>
          <CatalogCategories user={user} />
        </li>

        <li>
          <CatalogSettings user={user} />
        </li>
      </ul>

      <div className="flex gap-2">
        <Form {...form}>
          <form className="space-y-3 mt-4 w-full">
            <FormField
              control={form.control}
              name="search"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Procurar produtos..."
                      type='search'
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>

      <ProductsList
        user={user}
        search={deboucedSearch}
        categories={categories}
        selectProductAndOpenDrawer={selectProductAndOpenDrawer}
      />

      <ProductDetailsDrawer
        product={selectedProduct}
        user={user}
        isOpen={isOpen}
        onOpenChange={(value) => {
          if (!value) {
            setSelectedProduct(undefined)
          }

          onOpenChange(value)
        }}
      />
    </section>
  )
}

type ProductsListProps = {
  search?: string,
  categories?: string[],
  user?: User & { company: Company },
  selectProductAndOpenDrawer: (product: ProductWithCategory) => void
}

export function ProductsList({
  search,
  categories,
  user,
  selectProductAndOpenDrawer
}: ProductsListProps) {
  const {
    data: productsResponse,
    isLoading: isProductsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useProducts({
    companyId: user?.company.id,
    categories: categories?.join(','),
    search,
  })

  const products = productsResponse?.pages.map((page) => page.result).flat() ?? []

  if (isProductsLoading) {
    return (
      <div className="mt-6 flex items-center justify-center">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        <span>Buscando produtos...</span>
      </div>
    )
  }

  if (products.length) {
    return (
      <>
        <ul className="mt-4 flex flex-col gap-4">
          {products.map((product) => (
            <li
              key={product.id}
              onClick={() => selectProductAndOpenDrawer(product)}
            >
              <ProductCard product={product} />
            </li>
          ))}
        </ul>

        {hasNextPage && (
          <div className="w-full flex items-center justify-center">
            <Button
              className="mt-4 w-fit text-primary"
              variant='ghost'
              onClick={() => fetchNextPage()}
              isLoading={isFetchingNextPage}
            >
              Carregar mais
            </Button>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="mt-6 flex flex-col items-center justify-center gap-2 text-slate-500">
      <PackageOpen />
      <span className="text-sm">Nenhum produto encontrado.</span>
    </div>
  )
}

type ProductCardProps = {
  product: ProductWithCategory
}

function ProductCard({ product }: ProductCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="line-clamp-1">
          {product.name}
        </CardTitle>

        {product?.description && (
          <CardDescription>
            {product.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex items-center justify-between gap-4">
        <ul className="text-sm flex flex-col">
          <li className="flex gap-1">
            Categoria: {' '}

            <span className="text-slate-500 flex items-center gap-1">
              {product.category.name}
            </span>
          </li>

          <li className="flex gap-1">
            Preço: {' '}

            <span className="text-slate-500 flex items-center gap-1">
              {formatCurrency(product.cost)}
            </span>
          </li>
        </ul>
      </CardContent>
    </Card>
  )
}

type ProductDetailsDrawerProps = {
  user?: User & { company: Company },
  product?: ProductWithCategory,
  isOpen: boolean,
  onOpenChange: (isOpen: boolean) => void
}

function ProductDetailsDrawer({
  user,
  product,
  isOpen,
  onOpenChange
}: ProductDetailsDrawerProps) {
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="flex flex-col items-center">
          <DrawerTitle className="text-2xl">
            {product?.name ?? 'Criar novo produto'}
          </DrawerTitle>
        </DrawerHeader>

        <ProductForm
          user={user}
          product={product}
          onOpenChange={onOpenChange}
        />
      </DrawerContent>
    </Drawer>
  )
}

type ProductFormProps = {
  user?: User & { company: Company },
  product?: ProductWithCategory,
  onOpenChange: (isOpen: boolean) => void
}

const formProductSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório.'),
  description: z.string(),
  cost: z.number({
    invalid_type_error: 'O preço deve ser maior ou igual a 0.'
  }).min(0.1, 'O preço deve ser maior ou igual a 0,1.'),
  categoryId: z.string().min(1, 'A categoria é obrigatória.'),
})

type FormProductSchema = z.infer<typeof formProductSchema>

function ProductForm({
  user,
  product,
  onOpenChange
}: ProductFormProps) {
  const [isReadonly, setIsReadonly] = useState(true)

  const {
    data: categories
  } = useCatalogCategories({
    companyId: user?.company.id,
  })

  const form = useForm<FormProductSchema>({
    resolver: zodResolver(formProductSchema),
    defaultValues: {
      name: product?.name ?? '',
      description: product?.description ?? '',
      categoryId: product?.categoryId ?? '',
      cost: product?.cost ?? 0,
    },
  })

  const {
    mutate: createProduct,
    isPending: isCreateProductPending
  } = useUpdateProduct()

  const {
    mutate: updateProduct,
    isPending: isUpdateProductPending
  } = useUpdateProduct()

  const isPending = isUpdateProductPending || isCreateProductPending

  function onSubmit(values: FormProductSchema) {
    if (product) {
      updateProduct({
        id: product?.id,
        name: values.name,
        description: values.description,
        cost: values.cost,
        categoryId: values.categoryId,
        companyId: user?.company.id,
      }, {
        onSuccess() {
          setIsReadonly(true)

          queryClient.invalidateQueries({ queryKey: ['products'] })

          toast({
            title: 'Produto atualizado com sucesso!',
            variant: 'success'
          })
        }
      })
    } else {
      createProduct({
        name: values.name,
        description: values.description,
        cost: values.cost,
        categoryId: values.categoryId,
        companyId: user?.company.id,
      }, {
        onSuccess() {
          setIsReadonly(true)

          queryClient.invalidateQueries({ queryKey: ['products'] })

          toast({
            title: 'Produto criado com sucesso!',
            variant: 'success'
          })

          onOpenChange(false)
        }
      })

    }
  }

  useEffect(() => {
    if (!product) {
      setIsReadonly(false)
    }

    form.reset()
  }, [form, product])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="px-8 space-y-3">
          <FormField
            control={form.control}
            disabled={isReadonly}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Adicionar nome do produto"
                    className="disabled:opacity-100"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            disabled={isReadonly}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Adicionar descrição do produto"
                    className="disabled:opacity-100"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-3 w-full">
            <FormField
              control={form.control}
              disabled={isReadonly}
              name="categoryId"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Categoria</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isReadonly}
                  >
                    <FormControl>
                      <SelectTrigger className="disabled:opacity-100 disabled:bg-zinc-50">
                        <SelectValue placeholder="Selecionar categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              disabled={isReadonly}
              name="cost"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Preço (R$)</FormLabel>

                  <FormControl>
                    <Input
                      {...field}
                      onChange={(event) => field.onChange(event.target.valueAsNumber)}
                      placeholder="Adicionar custo do produto"
                      type='number'
                      className="disabled:opacity-100"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Collapsible>
            <CollapsibleTrigger className="text-primary text-sm">
              Habilitar variações
            </CollapsibleTrigger>

            <CollapsibleContent className="p-4 border rounded-md mt-2">
              <FormField
                control={form.control}
                disabled={isReadonly}
                name="categoryId"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Variante</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isReadonly}
                    >
                      <FormControl>
                        <SelectTrigger className="disabled:opacity-100 disabled:bg-zinc-50">
                          <SelectValue placeholder="Selecionar categoria do produto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CollapsibleContent>
          </Collapsible>

        </div>

        <DrawerFooter className="flex-row gap-3 justify-end items-end px-8 mt-6">
          <Button
            type='button'
            variant='outline'
            onClick={(event) => {
              if (!product || isReadonly) {
                onOpenChange(false)
              }

              event.preventDefault()
              setIsReadonly(true)
              form.reset()
            }}
          >
            {isReadonly ? 'Fechar' : 'Cancelar'}
          </Button>

          {isReadonly ? (
            <Button
              type='button'
              variant='outline'
              className="text-primary hover:text-primary"
              onClick={(event) => {
                event.preventDefault()
                setIsReadonly(false)
              }}
            >
              Editar produto
            </Button>
          ) : (
            <Button type='submit' isLoading={isPending}>
              Salvar alterações
            </Button>
          )}
        </DrawerFooter>
      </form>
    </Form>
  )
}