'use client'

import { Button } from "@/components/ui/button";
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { translatedUnitsOfMeasurement } from "@/constants/units-of-measurement";
import { useCreateInventoryMovementContext } from "@/contexts/create-inventory-movement-context";
import { useCreateMovement } from "@/hooks/inventory/use-create-movement";
import { useInventoryChambers } from "@/hooks/inventory/use-inventory-chambers";
import { useInventoryItems } from "@/hooks/inventory/use-inventory-items";
import { InventoryItemWithChamber } from "@/types/inventory";
import { formatDecimal } from "@/utils/format-decimal";
import { zodResolver } from "@hookform/resolvers/zod";
import { Company, MovementType, User } from "@prisma/client";
import { useDebounce } from "@uidotdev/usehooks";
import { Boxes, ChevronLeft, ChevronRight, Minus, Package2, Plus, Ruler } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

function getFormSchema(
  item?: InventoryItemWithChamber,
  type?: MovementType
) {
  let quantityProps = z.coerce.number()
    .int('A quantidade a ser movimentada deve ser um número inteiro.')
    .positive('A quantidade a ser movimentada deve ser um número positivo.')

  let destinationChamberId = z.string()

  if (type == MovementType.EGRESS && item?.currentInventory) {
    quantityProps = quantityProps.max(
      item.currentInventory,
      `A quantidade máxima para saída deve ser ${item.currentInventory}.`
    )
  }

  if (type === MovementType.TRANSFER) {
    destinationChamberId = destinationChamberId.min(1, 'A câmara de destino é obrigatória.')
  }

  return z.object({
    search: z.string(),
    inventoryItem: z.any(),
    currentInventory: quantityProps,
    destinationChamberId
  })
}

const formSchema = getFormSchema()

type FormSchema = z.infer<typeof formSchema>

export function InventoryItemStep({ user }: {
  user?: User & { company: Company }
}) {
  const router = useRouter()

  const {
    movement,
    goToPreviousStep,
    updateMovement
  } = useCreateInventoryMovementContext()

  const {
    mutate: createMovement,
    isPending
  } = useCreateMovement()

  const {
    data: chambersResponse,
  } = useInventoryChambers({
    companyId: user?.company.id,
  })

  const chambers = chambersResponse?.pages.map((page) => page.result).flat() ?? []

  const form = useForm<FormSchema>({
    resolver: zodResolver(getFormSchema(
      movement?.inventoryItem,
      movement?.type
    )),
    defaultValues: {
      search: '',
      inventoryItem: movement?.inventoryItem ?? undefined,
      currentInventory: 1
    },
  })

  const search = form.watch('search')
  const inventoryItem = form.watch('inventoryItem')
  const currentInventory = form.watch('currentInventory')

  function onSubmit(values: FormSchema) {
    if (movement && user) {
      createMovement({
        inventoryItemId: values.inventoryItem.id,
        currentInventory: values.currentInventory,
        type: movement.type!,
        userId: user.id!,
        companyId: user.company.id!,
        destinationChamberId: values.destinationChamberId
      }, {
        onSuccess() {
          if (movement?.type === MovementType.TRANSFER) {
            toast({
              title: 'Transfêrencia de câmara realizada com sucesso!',
              variant: 'success'
            })
          } else {
            toast({
              title: `${movement.type === MovementType.ENTRY ? 'Entrada em' : 'Saída de'} estoque realizada com sucesso!`,
              variant: 'success'
            })
          }

          router.push('/admin/inventory')
        }
      })
    }
  }

  useEffect(() => {
    updateMovement({
      inventoryItem,
    })
  }, [updateMovement, inventoryItem])

  return (
    <>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          Identificação do item
        </CardTitle>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="relative">
            <InventoryItemsSearch
              search={search}
              setSearch={
                (search) => form.setValue('search', search)
              }
              user={user}
              inventoryItemSelected={inventoryItem}
              setInventoryItemSelected={
                (inventoryItem) => form.setValue('inventoryItem', inventoryItem)
              }
            />

            {inventoryItem && (
              <>
                <hr className="my-3" />

                <FormItem>
                  <FormLabel>Quantidade para movimentação</FormLabel>

                  <div className="flex gap-4 items-center justify-center mt-4">
                    <Button
                      type='button'
                      variant='outline'
                      className="rounded-full p-0 w-8 h-8"
                      disabled={currentInventory === 1}
                      onClick={() => form.setValue('currentInventory', currentInventory - 1)}
                    >
                      <Minus />
                    </Button>

                    <span className="font-medium">
                      {currentInventory}
                    </span>

                    <Button
                      type='button'
                      className="rounded-full p-0 w-8 h-8"
                      onClick={() => form.setValue('currentInventory', currentInventory + 1)}
                    >
                      <Plus />
                    </Button>
                  </div>

                  {form.formState.errors.currentInventory && (
                    <FormMessage>
                      {form.formState.errors.currentInventory.message}
                    </FormMessage>
                  )}
                </FormItem>

                {movement?.type === MovementType.TRANSFER && (
                  <FormField
                    control={form.control}
                    name="destinationChamberId"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Câmara de destino</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
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
                )}
              </>
            )}
          </CardContent>

          <CardFooter className="pt-0 justify-between">
            <Button
              size='sm'
              variant='outline'
              onClick={goToPreviousStep}
              type='button'
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>

            <Button
              size='sm'
              type='submit'
              disabled={!inventoryItem}
              isLoading={isPending}
            >
              Concluir
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </CardFooter>
        </form>
      </Form>
    </>
  )
}

function InventoryItemsSearch({
  search,
  user,
  inventoryItemSelected,
  setSearch,
  setInventoryItemSelected
}: {
  search: string,
  user?: User & { company: Company },
  inventoryItemSelected: InventoryItemWithChamber | undefined,
  setSearch: (search: string) => void,
  setInventoryItemSelected: (inventoryItemSelected: InventoryItemWithChamber | undefined) => void
}) {
  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading, isError } = useInventoryItems({
    search: debouncedSearch,
    companyId: user?.company.id
  })

  return (
    <div>
      <Combobox
        selected={inventoryItemSelected}
        setSelected={setInventoryItemSelected}
        data={data}
        isLoading={isLoading}
        isError={isError}
        searchQuery={search}
        setSearchQuery={setSearch}
      />

      {inventoryItemSelected && (
        <InventoryItemInfo inventoryItemSelected={inventoryItemSelected} />
      )}
    </div>
  )
}

function InventoryItemInfo({
  inventoryItemSelected
}: {
  inventoryItemSelected: InventoryItemWithChamber
}) {
  return (
    <div className="mt-4">
      <ul className="text-sm mt-2">
        <li>
          <span className="flex gap-1">
            <Boxes className="h-4 w-4 mr-1" />

            Quantidade em estoque: {' '}

            <span className="text-slate-500 flex items-center gap-1">
              {formatDecimal(inventoryItemSelected.currentInventory)}
            </span>
          </span>
        </li>

        <li>
          <span className="flex gap-1">
            <Ruler className="h-4 w-4 mr-1" />
            Unidade de medida: {' '}

            <span className="text-slate-500 flex items-center gap-1">
              {translatedUnitsOfMeasurement[inventoryItemSelected.unitOfMeasurement]}
            </span>
          </span>
        </li>

        <li>
          <span className="flex gap-1">
            <Package2 className="h-4 w-4 mr-1" />
            Câmara de origem: {' '}

            <span className="text-slate-500 flex items-center gap-1">
              {inventoryItemSelected.chamber.name}
            </span>
          </span>
        </li>
      </ul>
    </div>
  )
}