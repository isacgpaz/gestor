'use client'

import { Button } from "@/components/ui/button";
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { movementType } from "@/contants/inventory";
import { useCreateInventoryMovementContext } from "@/contexts/create-inventory-movement-context";
import { useCreateMovement } from "@/hooks/inventory/use-create-movement";
import { useInventoryItems } from "@/hooks/inventory/use-inventory-items";
import { InventoryItemWithChamber } from "@/types/inventory";
import { formatCurrency } from "@/utils/format-currency";
import { formatWeight } from "@/utils/format-weight";
import { zodResolver } from "@hookform/resolvers/zod";
import { Company, MovementType, User } from "@prisma/client";
import { useDebounce } from "@uidotdev/usehooks";
import { BadgeDollarSign, Boxes, ChevronLeft, ChevronRight, Package2, Ruler, Weight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  search: z.string(),
  inventoryItem: z.any(),
  quantity: z.number()
    .int('A quantidade a ser movimentada deve ser um número inteiro.')
    .positive('A quantidade a ser movimentada deve ser um número positivo.'),
})

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

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: '',
      inventoryItem: movement?.inventoryItem ?? undefined,
      quantity: 0
    },
  })

  const search = form.watch('search')
  const inventoryItem = form.watch('inventoryItem')

  function onSubmit(values: FormSchema) {
    if (movement && user) {
      createMovement({
        inventoryItemId: values.inventoryItem.id,
        quantity: values.quantity,
        type: movement.type!,
        userId: user.id!,
        companyId: user.company.id!
      }, {
        onSuccess() {
          toast({
            title: `${movement.type === MovementType.ENTRY ? 'Entrada em' : 'Saída de'} estoque realizada com sucesso!`,
            variant: 'default'
          })

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

                <FormField
                  control={form.control}
                  name="quantity"
                  defaultValue={0}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Quantidade para {movementType[movement?.type!].toLowerCase()}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(event) => field.onChange(event.target.valueAsNumber)}
                          type='number'
                          placeholder="Quantidade a ser movimentada"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
  setSearch,
  user,
  inventoryItemSelected,
  setInventoryItemSelected
}: {
  search: string,
  setSearch: (search: string) => void,
  user?: User & { company: Company },
  inventoryItemSelected: InventoryItemWithChamber | undefined,
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
              {inventoryItemSelected.quantity}
            </span>
          </span>
        </li>

        <li className="col-start-1">
          <span className="flex gap-1">
            <Weight className="h-4 w-4 mr-1" />

            Peso: {' '}

            <span className="text-slate-500 flex items-center gap-1">
              {formatWeight(inventoryItemSelected.weight)}
            </span>
          </span>
        </li>

        <li>
          <span className="flex gap-1">
            <Ruler className="h-4 w-4 mr-1" />
            Unidade: {' '}

            <span className="text-slate-500 flex items-center gap-1">
              {/* {inventoryItemSelected.unity} */}
            </span>
          </span>
        </li>

        <li className="col-start-1">
          <span className="flex gap-1">
            <BadgeDollarSign className="h-4 w-4 mr-1" />
            Custo: {' '}

            <span className="text-slate-500 flex items-center gap-1">
              {formatCurrency(inventoryItemSelected.cost)}
            </span>
          </span>
        </li>

        <li>
          <span className="flex gap-1">
            <Package2 className="h-4 w-4 mr-1" />
            Câmara: {' '}

            <span className="text-slate-500 flex items-center gap-1">
              {inventoryItemSelected.chamber.name}
            </span>
          </span>
        </li>
      </ul>
    </div>

  )
}