'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { useCatalogCategories } from "@/hooks/catalog/use-catalog-categories"
import { useCatalogVariants } from "@/hooks/catalog/use-catalog-variants"
import { useCreateProduct } from "@/hooks/catalog/use-create-product"
import { useProducts } from "@/hooks/catalog/use-products"
import { useUpdateProduct } from "@/hooks/catalog/use-update-product"
import { queryClient } from "@/lib/query-client"
import { cn } from "@/lib/utils"
import { CatalogVariantWithProperties } from "@/types/catalog"
import { formatCurrency } from "@/utils/format-currency"
import { zodResolver } from "@hookform/resolvers/zod"
import { CatalogCategory, Company, Product, User } from "@prisma/client"
import { useDebounce } from "@uidotdev/usehooks"
import { Filter, Loader2, PackageOpen, X } from "lucide-react"
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

  const {
    data: categories,
    isFetching
  } = useCatalogCategories({
    companyId: user?.company.id,
  })

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: '',
      categories: [],
    },
  })

  const search = form.watch('search')
  const selectedCategories = form.watch('categories')

  const deboucedSearch = useDebounce(search, 300)

  function selectProductAndOpenDrawer(product: ProductWithCategory | undefined) {
    setSelectedProduct(product)
    onOpenChange(true)
  }

  return (
    <section>
      <ul className="flex gap-3 w-full whitespace-nowrap overflow-auto scrollbar-hide px-6">
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

      <Form {...form}>
        <form>
          <div className="flex gap-2 px-6">
            <div className="flex space-x-2 mt-4 w-full">
              <FormField
                control={form.control}
                name="search"
                render={({ field }) => (
                  <FormItem className="w-full">
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

              <Popover>
                <PopoverTrigger asChild>
                  <Button size='icon' className="w-11" isLoading={isFetching}>
                    <Filter className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent
                  align="end"
                  className="flex flex-col space-y-2 w-44"
                >
                  {categories?.map((category) => (
                    <FormField
                      key={category.id}
                      control={form.control}
                      name="categories"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={category.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(category.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, category.id])
                                    : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== category.id
                                      )
                                    )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {category.name}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {selectedCategories.length ? (
            <div className="flex items-center space-x-2 px-6 my-2">
              <FormLabel>Filtros:</FormLabel>

              {selectedCategories.map((selectedCategory) => (
                <Badge key={selectedCategory} className="space-x-1">
                  {categories?.find(
                    (category) => category.id === selectedCategory
                  )?.name}

                  <button onClick={(event) => {
                    event.preventDefault()

                    form.setValue('categories', selectedCategories.filter(
                      (category) => category !== selectedCategory
                    ))
                  }}>
                    <X className="ml-1 w-4 h-4" strokeWidth={2} />
                  </button>
                </Badge>
              ))}
            </div>
          ) : null}
        </form>
      </Form>

      <ProductsList
        user={user}
        search={deboucedSearch}
        categories={selectedCategories}
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
    </section >
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
        <ul className="mt-4 px-6 flex flex-col gap-4">
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

          {!!product.variant && (
            <li className="flex gap-1 text-primary font-medium">
              Ver variantes
            </li>
          )}

          {!!product.cost && (
            <li className="flex gap-1">
              Preço: {' '}

              <span className="text-slate-500 flex items-center gap-1">
                {formatCurrency(product?.cost)}
              </span>
            </li>
          )}
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
  }),
  categoryId: z.string().min(1, 'A categoria é obrigatória.'),
  enableVariants: z.boolean(),
  allowComposition: z.boolean(),
  variant: z.object({
    catalogVariantId: z.string({ required_error: 'A variante é obrigatória.' }),
    properties: z.array(
      z.object({
        catalogVariantPropertyId: z.string(),
        value: z.number({
          required_error: `O preço da propriedade é obrigatório.`,
          invalid_type_error: 'O preço da propriedade deve ser maior ou igual a 0.',
        }).min(0.1, 'O preço da propriedade deve ser maior ou igual a 0,1.'),
      }))
  }).optional(),
}).superRefine(({ enableVariants, cost }, context) => {
  if (!enableVariants && cost <= 0.1) {
    context.addIssue({
      path: ['cost'],
      message: 'O preço deve ser maior ou igual a 0,1.',
      minimum: 0.1,
      type: 'number',
      code: 'too_small',
      inclusive: false
    })
  }
})

type FormProductSchema = z.infer<typeof formProductSchema>

function ProductForm({
  user,
  product,
  onOpenChange
}: ProductFormProps) {
  const [isReadonly, setIsReadonly] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState<
    CatalogVariantWithProperties | undefined
  >(undefined)

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
      enableVariants: !!product?.variant ?? false,
      allowComposition: !!product?.allowComposition ?? false,
      variant: product?.variant ? {
        catalogVariantId: product?.variant?.catalogVariantId,
        properties: product?.variant?.properties.map((property) => ({
          catalogVariantPropertyId: property.catalogVariantPropertyId,
          value: property.value
        }))
      } : undefined
    },
  })

  const enableVariants = form.watch('enableVariants')
  const catalogVariantId = form.watch('variant.catalogVariantId')

  const {
    data: catalogVariants,
  } = useCatalogVariants({
    companyId: user?.company.id,
  })

  const {
    mutate: createProduct,
    isPending: isCreateProductPending
  } = useCreateProduct()

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
        allowComposition: values.allowComposition,
        variant: values.variant ? {
          catalogVariantId: values.variant.catalogVariantId,
          properties: values.variant.properties.map((property) => ({
            catalogVariantPropertyId: property.catalogVariantPropertyId,
            value: property.value
          }))
        } : undefined
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
        allowComposition: values.allowComposition,
        variant: values.variant ? {
          catalogVariantId: values.variant.catalogVariantId,
          properties: values.variant.properties.map((property) => ({
            catalogVariantPropertyId: property.catalogVariantPropertyId,
            value: property.value
          }))
        } : undefined
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

  useEffect(() => {
    if (!enableVariants) {
      form.setValue('variant', undefined)
    } else {
      form.setValue(
        'variant.properties',
        selectedVariant?.properties.map((property) => ({
          catalogVariantPropertyId: property.id,
          value: product?.variant?.properties.find(
            (productProperty) => productProperty.catalogVariantPropertyId === property.id
          )?.value ?? 0
        })) ?? []
      )
    }
  }, [
    product?.variant?.properties,
    enableVariants,
    form,
    selectedVariant
  ])

  useEffect(() => {
    if (catalogVariantId) {
      setSelectedVariant(catalogVariants?.find(
        (variant) => variant.id === catalogVariantId
      ))
    }
  }, [catalogVariants, catalogVariantId])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <ScrollArea className={cn(
          "w-full",
          enableVariants ? 'h-[420px]' : 'h-[300px]'
        )}>
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

              {!enableVariants && (
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
              )}
            </div>

            {!product && (
              <FormField
                control={form.control}
                name="enableVariants"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-2">
                    <FormControl className="mt-1.5">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isReadonly}
                      />
                    </FormControl>

                    <FormLabel>
                      Habilitar variantes
                    </FormLabel>
                  </FormItem>
                )}
              />
            )}

            {enableVariants && (
              <div className="p-4 rounded-md border space-y-2">
                <FormField
                  control={form.control}
                  disabled={isReadonly}
                  name="variant.catalogVariantId"
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
                            <SelectValue placeholder="Selecionar variante" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {catalogVariants?.map((variant) => (
                            <SelectItem
                              key={variant.id}
                              value={variant.id}
                            >
                              {variant.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedVariant && (
                  <div>
                    <Label>Propriedades (R$)</Label>

                    <div className="grid gap-2">
                      {selectedVariant.properties.map((property, index) => (
                        <FormField
                          key={property.id}
                          control={form.control}
                          disabled={isReadonly}
                          name={`variant.properties.${index}.value`}
                          render={({ field }) => (
                            <FormItem className="grid grid-cols-3 place-items-end items-center gap-4">
                              <FormLabel>
                                {property.name}
                              </FormLabel>

                              <div className="col-span-2 w-full">
                                <FormControl>
                                  <Input
                                    {...field}
                                    onChange={(event) => {
                                      field.onChange(event.target.valueAsNumber)
                                      form.setValue(
                                        `variant.properties.${index}.catalogVariantPropertyId`,
                                        property.id
                                      )
                                    }}
                                    placeholder='Adicionar preço (R$)'
                                    className="disabled:opacity-100"
                                    type='number'
                                  />
                                </FormControl>
                                <FormMessage className="mt-2" />
                              </div>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <FormField
              control={form.control}
              name="allowComposition"
              render={({ field }) => (
                <FormItem className="flex items-start space-x-2">
                  <FormControl className="mt-1.5">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isReadonly}
                    />
                  </FormControl>

                  <FormLabel>
                    Habilitar composição
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>
        </ScrollArea>

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