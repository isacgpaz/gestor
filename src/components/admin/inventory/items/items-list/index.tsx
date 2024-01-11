'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { useCreateItem } from "@/hooks/inventory/use-create-item"
import { useInventoryChambers } from "@/hooks/inventory/use-inventory-chambers"
import { useInventoryItems } from "@/hooks/inventory/use-inventory-items"
import { useUpdateItem } from "@/hooks/inventory/use-update-item"
import { dayjs } from "@/lib/dayjs"
import { queryClient } from "@/lib/query-client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Company, InventoryItem, User } from "@prisma/client"
import { Loader2, PackageOpen, PackagePlus } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const formSchema = z.object({
  search: z.string()
})

type FormSchema = z.infer<typeof formSchema>

export function InventoryItemsListContainer(
  { user }: {
    user?: User & { company: Company }
  }) {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | undefined>(undefined)
  const [isOpen, onOpenChange] = useState(false)

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: '',
    },
  })

  const search = form.watch('search')

  function selectItemAndOpenDrawer(item: InventoryItem | undefined) {
    setSelectedItem(item)
    onOpenChange(true)
  }

  return (
    <section>
      <div className="flex flex-col flex-1 mt-6 w-full">
        <Button
          size='sm'
          className="w-fit"
          onClick={() => onOpenChange(true)}
        >
          <PackagePlus className="mr-2 h-4 w-4" />
          Criar novo item
        </Button>
      </div>

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
                      placeholder="Procurar itens..."
                      type='search'
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>

      <InventoryItemsList
        search={search}
        user={user}
        selectItemAndOpenDrawer={selectItemAndOpenDrawer}
      />

      <ItemDetailsDrawer
        item={selectedItem}
        user={user}
        isOpen={isOpen}
        onOpenChange={(value) => {
          if (!value) {
            setSelectedItem(undefined)
          }

          onOpenChange(value)
        }}
      />
    </section>
  )
}

type InventoryItemsListProps = {
  user?: User & { company: Company },
  search?: string,
  selectItemAndOpenDrawer: (item: InventoryItem | undefined) => void
}

function InventoryItemsList({
  search,
  user,
  selectItemAndOpenDrawer
}: InventoryItemsListProps) {
  const {
    data: itemsResponse,
    isLoading: isItemsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInventoryItems({
    companyId: user?.company.id,
    search
  })

  const items = itemsResponse?.pages.map((page) => page.result).flat() ?? []

  if (isItemsLoading) {
    return (
      <div className="mt-6 flex items-center justify-center">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        <span>Buscando itens...</span>
      </div>
    )
  }

  if (items.length) {
    return (
      <>
        <ul className="mt-4 flex flex-col gap-4">
          {items.map((item) => (
            <li
              key={item.id}
              onClick={() => selectItemAndOpenDrawer(item)}
            >
              <ItemCard item={item} />
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
      <span className="text-sm">Nenhum item encontrado.</span>
    </div>
  )
}

type ItemCardProps = {
  item: InventoryItem
}

function ItemCard({ item }: ItemCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="line-clamp-1">
          {item.description}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex items-center justify-between gap-4">
        <div className="text-sm flex flex-col">
          <span className="flex gap-1">
            Quantidade em estoque: {' '}

            <span className="text-slate-500 flex items-center gap-1">
              {item.quantity}
            </span>
          </span>

          <span className="flex gap-1">
            Atualizado em: {' '}

            <span className="text-slate-500 flex items-center gap-1">
              {dayjs(item.updatedAt).format('DD/MM/YYYY [às] HH:mm:ss')}
            </span>
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

type ItemDetailsDrawerProps = {
  user?: User & { company: Company },
  item?: InventoryItem,
  isOpen: boolean,
  onOpenChange: (isOpen: boolean) => void
}

function ItemDetailsDrawer({
  user,
  item,
  isOpen,
  onOpenChange
}: ItemDetailsDrawerProps) {
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="flex flex-col items-center">
          <DrawerTitle className="text-2xl">
            {item?.description ?? 'Criar novo item'}
          </DrawerTitle>

          {item && (
            <DrawerDescription>
              <span className="flex gap-1 text-black">
                Quantidade em estoque: {' '}

                <span className="text-slate-500 flex items-center gap-1">
                  {item?.quantity}
                </span>
              </span>
            </DrawerDescription>
          )}
        </DrawerHeader>

        <ItemForm
          user={user}
          item={item}
          onOpenChange={onOpenChange}
        />
      </DrawerContent>
    </Drawer>
  )
}

type ItemFormProps = {
  user?: User & { company: Company },
  item?: InventoryItem,
  onOpenChange: (isOpen: boolean) => void
}

function getFormSchema(item?: InventoryItem) {
  return z.object({
    description: z.string().min(1, 'A descrição é obrigatória.'),
    weight: z.number({
      invalid_type_error: 'O peso deve ser maior ou igual a 0.'
    }).min(0, 'O peso deve ser maior ou igual a 0.')
      .optional(),
    cost: z.number({
      invalid_type_error: 'O custo deve ser maior ou igual a 0.'
    }).min(0, 'O custo deve ser maior ou igual a 0.')
      .optional(),
    minQuantity: z.number({
      invalid_type_error: item ? undefined : 'O estoque mínimo é obrigatório.'
    })
      .int(item ? undefined : 'O estoque mínimo deve ser um número inteiro.')
      .min(0, 'O estoque mínimo deve ser maior ou igual a 0.'),
    quantity: z.number({
      invalid_type_error: 'A estoque mínimo é obrigatório.'
    })
      .int('O estoque mínimo deve ser um número inteiro.')
      .min(0, 'O estoque mínimo deve ser maior ou igual a 0.'),
    chamberId: z.string().min(1, 'A câmara é obrigatória.'),
    gtin: item
      ? z.string().optional()
      : z.string().min(1, 'O código de barras é obrigatória.')
  })
}

const formItemSchema = getFormSchema()

type FormItemSchema = z.infer<typeof formItemSchema>

function ItemForm({
  user,
  item,
  onOpenChange
}: ItemFormProps) {
  const [isReadonly, setIsReadonly] = useState(true)

  const {
    data: chambersResponse
  } = useInventoryChambers({
    companyId: user?.company.id,
  })

  const chambers = chambersResponse?.pages.map((page) => page.result).flat() ?? []

  const form = useForm<FormItemSchema>({
    resolver: zodResolver(getFormSchema(item)),
    defaultValues: {
      description: item?.description ?? '',
      weight: item?.weight ?? 0,
      cost: item?.cost ?? 0,
      minQuantity: item?.minQuantity ?? 0,
      quantity: item?.quantity ?? 0,
      chamberId: item?.chamberId ?? '',
      gtin: item?.gtin ?? '',
    },
  })

  const {
    mutate: createItem,
    isPending: isCreateItemPending
  } = useCreateItem()

  const {
    mutate: updateItem,
    isPending: isUpdateItemPending
  } = useUpdateItem()

  const isPending = isUpdateItemPending || isCreateItemPending

  function onSubmit(values: FormItemSchema) {
    if (item) {
      updateItem({
        id: item?.id,
        chamberId: values.chamberId,
        companyId: item?.companyId,
        cost: values.cost,
        description: values.description,
        gtin: item?.gtin,
        minQuantity: values.minQuantity,
        weight: values.weight,
      }, {
        onSuccess() {
          setIsReadonly(true)

          queryClient.invalidateQueries({ queryKey: ['inventory-items'] })

          toast({
            title: 'Item atualizado com sucesso!',
            variant: 'default'
          })
        }
      })
    } else {
      createItem({
        chamberId: values.chamberId,
        companyId: user?.company.id,
        cost: values.cost,
        description: values.description,
        gtin: values?.gtin,
        minQuantity: values.minQuantity,
        quantity: values.quantity,
        weight: values.weight,
      }, {
        onSuccess() {
          setIsReadonly(true)

          queryClient.invalidateQueries({ queryKey: ['inventory-items'] })

          toast({
            title: 'Item criado com sucesso!',
            variant: 'default'
          })

          onOpenChange(false)
        }
      })

    }
  }

  useEffect(() => {
    if (!item) {
      setIsReadonly(false)
    }
  }, [item])


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="px-8 space-y-3">
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
                    placeholder="Adicionar descrição do item"
                    className="disabled:opacity-100"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            disabled={!!item}
            name="gtin"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Cód. de barras</FormLabel>

                <FormControl>
                  <Input
                    {...field}
                    placeholder="Adicionar código de barras do item"
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
              name="weight"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Peso (kg)</FormLabel>

                  <FormControl>
                    <Input
                      {...field}
                      onChange={(event) => field.onChange(event.target.valueAsNumber)}
                      placeholder="Adicionar peso do item"
                      type='number'
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
              name="cost"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Custo (R$)</FormLabel>

                  <FormControl>
                    <Input
                      {...field}
                      onChange={(event) => field.onChange(event.target.valueAsNumber)}
                      placeholder="Adicionar custo do item"
                      type='number'
                      className="disabled:opacity-100"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {!item && (
            <FormField
              control={form.control}
              disabled={isReadonly}
              name="quantity"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Quantidade inicial</FormLabel>

                  <FormControl>
                    <Input
                      {...field}
                      onChange={(event) => field.onChange(event.target.valueAsNumber)}
                      placeholder="Adicionar quantidade inicial do item"
                      type='number'
                      className="disabled:opacity-100"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            disabled={isReadonly}
            name="minQuantity"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Estoque mínimo</FormLabel>

                <FormControl>
                  <Input
                    {...field}
                    onChange={(event) => field.onChange(event.target.valueAsNumber)}
                    placeholder="Adicionar quantidade mínima do item"
                    type='number'
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
            name="chamberId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Câmara</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isReadonly}
                >
                  <FormControl>
                    <SelectTrigger className="disabled:opacity-100">
                      <SelectValue placeholder="Selecionar câmara" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {chambers.map((chamber) => (
                      <SelectItem
                        key={chamber.id}
                        value={chamber.id}
                      >
                        {chamber.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DrawerFooter className="flex-row gap-3 justify-end items-end px-8 mt-6">
          <Button
            type='button'
            variant='outline'
            onClick={(event) => {
              event.preventDefault()
              setIsReadonly(true)
              form.reset()

              if (isReadonly) {
                onOpenChange(false)
              }
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
              Editar item
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