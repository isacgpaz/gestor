'use client'

import { DatePicker } from "@/components/common/date-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { movementType } from "@/contants/inventory";
import { useMovements } from "@/hooks/inventory/use-movements";
import { dayjs } from "@/lib/dayjs";
import { cn } from "@/lib/utils";
import { MovementWithItemAndUser } from "@/types/inventory";
import { formatCurrency } from "@/utils/format-currency";
import { formatWeight } from "@/utils/format-weight";
import { zodResolver } from "@hookform/resolvers/zod";
import { Company, MovementType, User } from "@prisma/client";
import { useDebounce } from "@uidotdev/usehooks";
import { BadgeDollarSign, ChevronDown, Loader2, Package2, PackageOpen, Ruler, Weight } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const movementTypeOptions = [
  {
    label: 'Todas',
    value: '',
  },
  {
    label: movementType[MovementType.ENTRY] + 's',
    value: MovementType.ENTRY,
  },
  {
    label: movementType[MovementType.EGRESS] + 's',
    value: MovementType.EGRESS,
  },
]

const formSchema = z.object({
  search: z.string(),
  date: z.date(),
  type: z.enum(['', MovementType.ENTRY, MovementType.EGRESS]),
})

type FormSchema = z.infer<typeof formSchema>

export function InventoryLastMovement(
  { user }: {
    user?: User & { company: Company }
  }) {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: '',
      date: undefined,
      type: '',
    },
  })

  const search = form.watch('search')
  const date = form.watch('date')
  const type = form.watch('type')

  const debouncedSearch = useDebounce(search, 300)

  return (
    <section className="mt-4">
      <header className="flex">
        <h2 className="font-medium text-lg">Últimas movimentações</h2>
      </header>

      <span className="block mb-2 text-sm text-slate-500">
        Para visualizar as movimentações por data selecione um período abaixo.
      </span>

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

            <Collapsible className="w-full flex flex-col items-end">
              <CollapsibleTrigger className="mt-1 text-sm text-primary flex items-center">
                Busca avançada
                <ChevronDown className="ml-1 h-4 w-4" />
              </CollapsibleTrigger>

              <CollapsibleContent className="flex flex-col mt-2 w-full">
                <div className="w-full">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field: { value, onChange } }) => (
                      <FormItem>
                        <FormControl>
                          <DatePicker
                            date={value}
                            label='Selecionar data'
                            setDate={(date) => {
                              onChange(date)
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="space-y-3 flex items-center gap-2">
                      <FormLabel className="mt-3">Filtrar por:</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-y-1 gap-4"
                        >
                          {movementTypeOptions.map((option) => (
                            <FormItem
                              key={option.value}
                              className="flex items-center space-x-2 space-y-0"
                            >
                              <FormControl>
                                <RadioGroupItem value={option.value} />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {option.label}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CollapsibleContent>
            </Collapsible>

          </form>
        </Form>
      </div>

      <LastMovementList
        search={debouncedSearch}
        date={date}
        type={type === '' ? undefined : type}
        user={user}
      />
    </section>
  )
}

type LastMovementList = {
  search?: string,
  date?: Date,
  user?: User & { company: Company },
  type?: MovementType
}

function LastMovementList({
  search,
  date,
  user,
  type
}: LastMovementList) {
  const {
    data: movementsResponse,
    isLoading: isMovementsLoading,
    fetchNextPage,
    hasNextPage
  } = useMovements({
    type,
    date: date ? dayjs(date).format('YYYY-MM-DD') : undefined,
    companyId: user?.company.id,
    search
  })

  const movements = movementsResponse?.pages.map((page) => page.result).flat() ?? []

  if (isMovementsLoading) {
    return (
      <div className="mt-6 flex items-center justify-center">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        <span>Buscando movimentações de estoque...</span>
      </div>
    )
  }

  if (movements.length) {
    return (
      <>
        <ul className="mt-4 flex flex-col gap-4">
          {movements.map((movement) => (
            <li key={movement.id}>
              <MovementCard movement={movement} />
            </li>
          ))}
        </ul>

        {hasNextPage && (
          <Button
            className="mt-4 w-fit mx-auto text-primary"
            variant='ghost'
            onClick={() => fetchNextPage()}
          >
            Carregar mais
          </Button>
        )}
      </>
    )
  }

  return (
    <div className="mt-6 flex flex-col items-center justify-center gap-2 text-slate-500">
      <PackageOpen />
      <span className="text-sm">Nenhuma movimentação registrada.</span>
    </div>
  )
}

type MovementCardProps = {
  movement: MovementWithItemAndUser
}

function MovementCard({ movement }: MovementCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row gap-4 justify-between items-start pb-3">
        <div>
          <CardTitle className={cn(
            movement.type === MovementType.ENTRY && 'text-primary',
            movement.type === MovementType.EGRESS && 'text-destructive',
          )}>
            {movementType[movement.type]}
          </CardTitle>

          <CardDescription className="mt-1">
            <span className="text-black">
              Realizada por:
            </span> {movement.user.name}
          </CardDescription>
        </div>

        <div className="text-sm flex flex-col items-end">
          <span className="flex gap-1">
            Data: {' '}

            <span className="text-slate-500 flex items-center gap-1">
              {dayjs(movement.createdAt).format('DD/MM/YYYY')}
            </span>
          </span>

          <span className="flex gap-1">
            Hora: {' '}

            <span className="text-slate-500 flex items-center gap-1">
              {dayjs(movement.createdAt).format('HH:mm:ss')}
            </span>
          </span>
        </div>
      </CardHeader>

      <hr className="mx-6" />

      <CardContent className="mt-3">
        <h2 className="text-base font-medium">
          Informações do item
        </h2>

        <ul className="text-sm mt-2">
          <li>
            <span className="flex gap-1">
              Descrição: {' '}

              <span className="text-slate-500 flex items-center gap-1">
                {movement.inventoryItem.description}
              </span>
            </span>
          </li>

          <li>
            <span className="flex gap-1">
              Quantidade movimentada: {' '}

              <span className={cn(
                "flex items-center gap-1 font-medium",
                movement.type === MovementType.ENTRY && 'text-primary',
                movement.type === MovementType.EGRESS && 'text-destructive',
              )}>
                {movement.type === MovementType.ENTRY ? '+' : '-'}
                {movement.quantity}
              </span>
            </span>
          </li>
        </ul>

        <Collapsible>
          <CollapsibleTrigger className="my-1 text-sm flex items-center font-medium">
            <ChevronDown className="mr-2 h-4 w-4" strokeWidth={3} />
            Ver detalhes
          </CollapsibleTrigger>

          <CollapsibleContent>
            <ul className="text-black text-sm">
              <li className="col-start-1">
                <span className="flex gap-1">
                  <Weight className="h-4 w-4 mr-1" />
                  Peso: {' '}

                  <span className="text-slate-500 flex items-center gap-1">
                    {formatWeight(movement.inventoryItem.weight)}
                  </span>
                </span>
              </li>

              <li>
                <span className="flex gap-1">
                  <Ruler className="h-4 w-4 mr-1" />
                  Unidade: {' '}

                  <span className="text-slate-500 flex items-center gap-1">
                    {/* {movement.inventoryItem.unity} */}
                  </span>
                </span>
              </li>

              <li className="col-start-1">
                <span className="flex gap-1">
                  <BadgeDollarSign className="h-4 w-4 mr-1" />
                  Custo: {' '}

                  <span className="text-slate-500 flex items-center gap-1">
                    {formatCurrency(movement.inventoryItem.cost)}
                  </span>
                </span>
              </li>

              <li>
                <span className="flex gap-1">
                  <Package2 className="h-4 w-4 mr-1" />
                  Câmara: {' '}

                  <span className="text-slate-500 flex items-center gap-1">
                    {movement.inventoryItem.chamber.name}
                  </span>
                </span>
              </li>
            </ul>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}
