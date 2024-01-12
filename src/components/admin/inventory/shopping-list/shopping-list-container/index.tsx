'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { useShoppingList } from "@/hooks/inventory/use-shopping-list"
import { ShoppingListStatus } from "@/types/inventory"
import { formatCurrency } from "@/utils/format-currency"
import { zodResolver } from "@hookform/resolvers/zod"
import { Company, InventoryItem, User } from "@prisma/client"
import { Loader2, PackageOpen, ShoppingCart } from "lucide-react"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

type CartInventoryItem = InventoryItem & {
  cost: number,
  isAddedToCart: boolean,
  newQuantity: number
}

export function ShoppingListContainer({ user }: {
  user?: User & { company: Company }
}) {
  const [isOpen, onOpenChange] = useState(false)
  const [selectedItem, setSelectedItem] = useState<CartInventoryItem | undefined>(undefined)

  const {
    data,
    isLoading
  } = useShoppingList({
    companyId: user?.company.id
  })

  const [shoppingList, setShoppingList] = useState<CartInventoryItem[]>([])

  const pendingShoppingList = shoppingList.filter((item) => !item.isAddedToCart)
  const addedShoppingList = shoppingList.filter((item) => item.isAddedToCart)

  useEffect(() => {
    setShoppingList(
      data?.map((inventoryItem) => ({
        ...inventoryItem,
        isAddedToCart: false,
        cost: 0,
        newQuantity: 0
      })) ?? []
    )
  }, [data])

  function selectItemAndOpenDrawer(item: CartInventoryItem | undefined) {
    setSelectedItem(item)
    onOpenChange(true)
  }

  return (
    <section className="mt-4">
      <header className="flex">
        <span className="block mb-2 text-sm text-slate-500">
          Abaixo estão listados os itens que estão operando próximas ou abaixo
          da quantidade mínima em estoque.
        </span>
      </header>

      <div className="mt-2 flex flex-1">
        <ShoppingListTabs
          pendingShoppingList={pendingShoppingList}
          addedShoppingList={addedShoppingList}
          isLoading={isLoading}
          selectItemAndOpenDrawer={selectItemAndOpenDrawer}
        />
      </div>

      <AddItemToCartDrawer
        item={selectedItem}
        user={user}
        isOpen={isOpen}
        setShoppingList={setShoppingList}
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

type ShoppingListTabsProps = {
  addedShoppingList: CartInventoryItem[],
  pendingShoppingList: CartInventoryItem[],
  isLoading: boolean,
  selectItemAndOpenDrawer: (item: CartInventoryItem | undefined) => void
}

function ShoppingListTabs({
  pendingShoppingList,
  addedShoppingList,
  isLoading,
  selectItemAndOpenDrawer
}: ShoppingListTabsProps) {
  return (
    <Tabs
      defaultValue={ShoppingListStatus.PENDING}
      className="w-full flex flex-col flex-1"
    >
      <TabsList className="w-full flex gap-1">
        <TabsTrigger value={ShoppingListStatus.PENDING} className="text-xs px-1">
          Pendentes

          <Badge
            variant='secondary'
            className="ml-2 flex items-center justify-center h-5 w-5 text-xs"
          >
            {String(pendingShoppingList.length).padStart(2, '0')}
          </Badge>
        </TabsTrigger>

        <TabsTrigger value={ShoppingListStatus.ADDED} className="text-xs px-1">
          Adicionados

          <Badge
            variant='secondary'
            className="ml-2 flex items-center justify-center h-5 w-5 text-xs"
          >
            {String(addedShoppingList.length).padStart(2, '0')}
          </Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent value={ShoppingListStatus.PENDING} className="flex flex-col flex-1">
        <ShoppingList
          type={ShoppingListStatus.PENDING}
          shoppingList={pendingShoppingList}
          isLoading={isLoading}
          selectItemAndOpenDrawer={selectItemAndOpenDrawer}
        />
      </TabsContent>

      <TabsContent value={ShoppingListStatus.ADDED} className="flex flex-col flex-1">
        <ShoppingList
          type={ShoppingListStatus.ADDED}
          shoppingList={addedShoppingList}
          isLoading={isLoading}
          selectItemAndOpenDrawer={selectItemAndOpenDrawer}
        />
      </TabsContent>
    </Tabs>
  )
}

type ShoppingListProps = {
  shoppingList: CartInventoryItem[],
  isLoading: boolean,
  type: ShoppingListStatus,
  selectItemAndOpenDrawer: (item: CartInventoryItem | undefined) => void
}

function ShoppingList({
  selectItemAndOpenDrawer,
  shoppingList,
  type,
  isLoading,
}: ShoppingListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center mt-6">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        <span>Carregando lista de compras...</span>
      </div>
    )
  }

  if (shoppingList?.length) {
    return (
      <ul className="mt-4 flex flex-col gap-4">
        {shoppingList.map((inventoryItem) => (
          <li
            key={inventoryItem.id}
            onClick={() => selectItemAndOpenDrawer(inventoryItem)}
          >
            <ShoppingListInventoryItemCard
              inventoryItem={inventoryItem}
            />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="mt-6 flex flex-col items-center justify-center gap-2 text-slate-500">
      <PackageOpen />
      <span className="text-sm">
        {type === ShoppingListStatus.PENDING ? (
          'Lista de itens pendentes vazia.'
        ) : 'Nenhum item adicionado à lista de compras.'}
      </span>
    </div>
  )
}

type ShoppingListInventoryItemCardProps = {
  inventoryItem: CartInventoryItem
}

function ShoppingListInventoryItemCard(
  { inventoryItem }: ShoppingListInventoryItemCardProps
) {
  return (
    <Card>
      <CardHeader className="flex flex-row gap-4 justify-between items-start pb-3">
        <CardTitle>
          {inventoryItem.description}
        </CardTitle>
      </CardHeader>

      <hr className="mx-6" />

      <CardContent className="mt-3">
        <ul className="text-sm mt-2">
          {inventoryItem.isAddedToCart ? (
            <>
              <li>
                <span className="flex gap-1">
                  Quantidade adicionada: {' '}

                  <span className="text-primary flex items-center gap-1 font-medium">
                    +{inventoryItem.newQuantity}
                  </span>
                </span>
              </li>

              <li>
                <span className="flex gap-1">
                  Valor unitário: {' '}

                  <span className="text-slate-500 flex items-center gap-1">
                    {formatCurrency(inventoryItem.cost)}
                  </span>
                </span>
              </li>

              <li>
                <span className="flex gap-1">
                  Valor total: {' '}

                  <span className="text-slate-500 flex items-center gap-1">
                    {formatCurrency(inventoryItem.newQuantity * inventoryItem.cost)}
                  </span>
                </span>
              </li>
            </>
          ) : (
            <>
              <li>
                <span className="flex gap-1">
                  Quantidade em estoque: {' '}

                  <span className="text-slate-500 flex items-center gap-1">
                    {inventoryItem.quantity}
                  </span>
                </span>
              </li>

              <li className="text-destructive">
                <span className="flex gap-1">
                  Quantidade em mínima: {' '}

                  <span className="flex items-center gap-1 font-medium">
                    {inventoryItem.quantity}
                  </span>
                </span>
              </li>
            </>
          )}
        </ul>
      </CardContent>
    </Card>
  )
}

type AddItemToCartDrawerProps = {
  user?: User & { company: Company },
  item?: CartInventoryItem,
  isOpen: boolean,
  setShoppingList: Dispatch<SetStateAction<CartInventoryItem[]>>,
  onOpenChange: (isOpen: boolean) => void
}

function AddItemToCartDrawer({
  item,
  isOpen,
  setShoppingList,
  onOpenChange
}: AddItemToCartDrawerProps) {
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="flex flex-col items-center">
          <DrawerTitle className="text-2xl">
            {item?.description}
          </DrawerTitle>
        </DrawerHeader>

        <ItemForm
          item={item}
          setShoppingList={setShoppingList}
          onOpenChange={onOpenChange}
        />
      </DrawerContent>
    </Drawer>
  )
}

type ItemFormProps = {
  item?: CartInventoryItem,
  setShoppingList: Dispatch<SetStateAction<CartInventoryItem[]>>,
  onOpenChange: (isOpen: boolean) => void
}

const formItemSchema = z.object({
  cost: z.number({
    invalid_type_error: 'O custo deve ser maior que 0.'
  }).positive('O custo deve ser um número positivo.'),
  newQuantity: z.number({
    invalid_type_error: 'A quantidade deve ser maior ou igual a 1.'
  }).min(1, 'A quantidade deve ser maior ou igual a 1.')
    .positive('A quantidade deve ser um número positivo.'),
})

type FormItemSchema = z.infer<typeof formItemSchema>

function ItemForm({
  item,
  setShoppingList,
  onOpenChange
}: ItemFormProps) {
  const form = useForm<FormItemSchema>({
    resolver: zodResolver(formItemSchema),
    defaultValues: {
      cost: item?.cost ?? 0,
      newQuantity: item?.newQuantity ?? 0
    },
  })

  const newQuantity = form.watch('newQuantity')
  const cost = form.watch('cost')

  const totalValue = newQuantity * cost

  function toogleToCart(cartInventoryItem: CartInventoryItem) {
    setShoppingList(previousShoppingList => previousShoppingList.map(
      (inventoryItem) => {
        if (inventoryItem.id === cartInventoryItem.id) {
          return cartInventoryItem
        }

        return inventoryItem
      })
    )
  }

  function onSubmit(values: FormItemSchema) {
    if (item) {
      toogleToCart({
        ...item,
        isAddedToCart: !item.isAddedToCart,
        cost: item.isAddedToCart ? 0 : values.cost,
        newQuantity: item.isAddedToCart ? 0 : values.newQuantity,
      })

      onOpenChange(false)

      if (item.isAddedToCart) {
        toast({
          title: 'Item removido do carrinho.'
        })
      } else {
        toast({
          title: 'Item adicionado ao carrinho.'
        })
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex px-8 space-x-3">
          <FormField
            control={form.control}
            name="newQuantity"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Quantidade</FormLabel>

                <FormControl>
                  <Input
                    {...field}
                    onChange={(event) => field.onChange(event.target.valueAsNumber)}
                    placeholder="Adicionar quantidade"
                    type='number'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cost"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Valor unitário (R$)</FormLabel>

                <FormControl>
                  <Input
                    {...field}
                    onChange={(event) => field.onChange(event.target.valueAsNumber)}
                    placeholder="Valor unitário"
                    type='number'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="px-8 mt-2 flex justify-end text-slate-500">
          <span className="flex gap-1 text-sm">
            Valor total: {' '}

            <span className="flex items-center">
              {formatCurrency(
                isNaN(totalValue) ? 0 : totalValue
              )}
            </span>
          </span>
        </div>

        <DrawerFooter className="flex-row gap-3 justify-end items-end px-8 mt-6">
          <Button
            type='button'
            variant='outline'
            onClick={(event) => {
              event.preventDefault()
              form.reset()
              onOpenChange(false)
            }}
          >
            Fechar
          </Button>

          <Button
            type='submit'
            variant={item?.isAddedToCart ? 'destructive' : 'default'}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {item?.isAddedToCart ? 'Remover do carrinho' : 'Marcar como adicionado'
            }
          </Button>
        </DrawerFooter>
      </form>
    </Form>
  )
}
