'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { translatedUnitsOfMeasurement } from "@/constants/units-of-measurement"
import { useCreateItem } from "@/hooks/inventory/use-create-item"
import { useInventoryChambers } from "@/hooks/inventory/use-inventory-chambers"
import { useInventoryItems } from "@/hooks/inventory/use-inventory-items"
import { useUpdateItem } from "@/hooks/inventory/use-update-item"
import { dayjs } from "@/lib/dayjs"
import { queryClient } from "@/lib/query-client"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { Company, InventoryItem, UnitOfMeasurement, User } from "@prisma/client"
import { useDebounce } from "@uidotdev/usehooks"
import { Loader2, PackageOpen, PackagePlus } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Chambers } from "../../chambers"

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
  const deboucedSearch = useDebounce(search, 300)

  function selectItemAndOpenDrawer(item: InventoryItem | undefined) {
    setSelectedItem(item)
    onOpenChange(true)
  }

  return (
    <section>
      <ul className="flex gap-3 mt-6 w-full">
        <li>
          <Button
            size='sm'
            className="w-fit"
            onClick={() => onOpenChange(true)}
          >
            <PackagePlus className="mr-2 h-4 w-4" />
            Criar novo item
          </Button>
        </li>

        <li>
          <Chambers user={user} />
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
        search={deboucedSearch}
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
          <span className={cn(
            "flex gap-1",
            item.currentInventory === item.minInventory && "text-orange-500",
            item.currentInventory < item.minInventory && "text-destructive",
          )}>
            Quantidade em estoque: {' '}

            <span className="flex items-center gap-1 text-slate-500">
              {item.currentInventory}
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
              <span className={cn(
                "flex gap-1 text-slate-500",
                item.currentInventory === item.minInventory && "text-orange-500",
                item.currentInventory < item.minInventory && "text-destructive",
              )}>
                Quantidade em estoque: {' '}

                <span className="flex items-center gap-1">
                  {item.currentInventory}
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

const formItemSchema = z.object({
  description: z.string().min(1, 'A descrição é obrigatória.'),
  cost: z.number({
    invalid_type_error: 'O custo deve ser maior ou igual a 0.'
  }).min(0, 'O custo deve ser maior ou igual a 0.')
    .optional(),
  minInventory: z.number({
    invalid_type_error: 'O estoque mínimo é obrigatório.'
  })
    .int('O estoque mínimo deve ser um número inteiro.')
    .min(0, 'O estoque mínimo deve ser maior ou igual a 0.'),
  currentInventory: z.number({
    invalid_type_error: 'A estoque mínimo é obrigatório.'
  })
    .int('O estoque mínimo deve ser um número inteiro.')
    .min(0, 'O estoque mínimo deve ser maior ou igual a 0.'),
  chamberId: z.string().min(1, 'A câmara é obrigatória.'),
  unitOfMeasurement: z.nativeEnum(UnitOfMeasurement),
  gtin: z.string().min(1, 'O código de barras é obrigatória.')
})

type FormItemSchema = z.infer<typeof formItemSchema>

const unitOfMeasurementOptions = [
  UnitOfMeasurement.UNIT,
  UnitOfMeasurement.GRAM,
  UnitOfMeasurement.MILLIGRAM,
  UnitOfMeasurement.KILOGRAM,
  UnitOfMeasurement.MILLILITER,
  UnitOfMeasurement.LITER,
]

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
    resolver: zodResolver(formItemSchema),
    defaultValues: {
      description: item?.description ?? '',
      cost: item?.cost ?? 0,
      minInventory: item?.minInventory ?? 0,
      currentInventory: item?.currentInventory ?? 0,
      chamberId: item?.chamberId ?? '',
      gtin: item?.gtin ?? '',
      unitOfMeasurement: item?.unitOfMeasurement ?? UnitOfMeasurement.UNIT,
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
        minInventory: values.minInventory,
      }, {
        onSuccess() {
          setIsReadonly(true)

          queryClient.invalidateQueries({ queryKey: ['inventory-items'] })

          toast({
            title: 'Item atualizado com sucesso!',
            variant: 'success'
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
        minInventory: values.minInventory,
        currentInventory: values.currentInventory,
        unitOfMeasurement: values.unitOfMeasurement
      }, {
        onSuccess() {
          setIsReadonly(true)

          queryClient.invalidateQueries({ queryKey: ['inventory-items'] })

          toast({
            title: 'Item criado com sucesso!',
            variant: 'success'
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

    form.reset()
  }, [form, item])

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
              disabled={!!item}
              name="unitOfMeasurement"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Unidade de medida</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!!item}
                  >
                    <FormControl>
                      <SelectTrigger className="disabled:opacity-100 disabled:bg-zinc-50">
                        <SelectValue placeholder="Selecionar unidade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {unitOfMeasurementOptions.map((unit) => (
                        <SelectItem
                          key={unit}
                          value={unit}
                        >
                          {translatedUnitsOfMeasurement[unit]}
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
                  <FormLabel>Custo unitário (R$)</FormLabel>

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
              name="currentInventory"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Estoque inicial</FormLabel>

                  <FormControl>
                    <Input
                      {...field}
                      onChange={(event) => field.onChange(event.target.valueAsNumber)}
                      placeholder="Adicionar estoque inicial do item"
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
            name="minInventory"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Estoque mínimo</FormLabel>

                <FormControl>
                  <Input
                    {...field}
                    onChange={(event) => field.onChange(event.target.valueAsNumber)}
                    placeholder="Adicionar estoque mínimo para o item"
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
                    <SelectTrigger className="disabled:opacity-100 disabled:bg-zinc-50">
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
              if (!item || isReadonly) {
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