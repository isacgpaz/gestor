'use client'

import { DatePicker } from "@/components/common/date-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { movementType } from "@/contants/inventory";
import { useMovements } from "@/hooks/inventory/use-movements";
import { dayjs } from "@/lib/dayjs";
import { cn } from "@/lib/utils";
import { MovementWithItemAndUser } from "@/types/inventory";
import { formatCurrency } from "@/utils/format-currency";
import { formatWeight } from "@/utils/format-weight";
import { Company, MovementType, User } from "@prisma/client";
import { BadgeDollarSign, ChevronDown, Filter, Loader2, Package2, PackageOpen, Ruler, Weight } from "lucide-react";
import { useState } from "react";

const movementTypeOptions = [
  {
    label: 'Todas',
    value: '',
  },
  {
    label: movementType[MovementType.ENTRY],
    value: MovementType.ENTRY,
  },
  {
    label: movementType[MovementType.EGRESS],
    value: MovementType.EGRESS,
  },
]

export function InventoryLastMovement({ user }: { user?: User & { company: Company } }) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [type, setType] = useState<MovementType | ''>('')

  return (
    <section className="mt-4">
      <header className="flex">
        <h2 className="font-medium text-lg">Últimas movimentações</h2>
      </header>

      <span className="block mb-2 text-sm text-slate-500">
        Para visualizar as movimentações por data selecione um período abaixo.
      </span>

      <div className="flex gap-2">
        <DatePicker
          date={date}
          setDate={setDate}
          label="Selecionar data"
        />

        <Popover>
          <PopoverTrigger asChild>
            <Button size='icon' className="flex-shrink-0">
              <Filter className="h-4 w-4" />
            </Button>
          </PopoverTrigger>

          <PopoverContent side="top" align="end" className="grid-cols-3">
            <span className="text-sm text-slate-500 mb-1 block">Filtrar por:</span>

            <RadioGroup
              defaultValue={undefined}
              value={type}
              onValueChange={(value) => setType(value as MovementType | '')}
            >
              {movementTypeOptions.map((option) => (
                <div className="flex items-center space-x-2" key={option.value}>
                  <RadioGroupItem
                    value={option.value}
                    id={option.value}
                  />

                  <Label
                    htmlFor={option.value}
                    className={cn(option.value === type ? "font-medium" : "font-normal")}
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </PopoverContent>
        </Popover>
      </div>

      <LastMovementList
        date={date}
        type={type === '' ? undefined : type}
        user={user}
      />
    </section>
  )
}

type LastMovementList = {
  date?: Date,
  user?: User & { company: Company },
  type?: MovementType
}

function LastMovementList({
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
    date: dayjs(date).format('YYYY-MM-DD'),
    companyId: user?.company.id,
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
      <ul className="mt-4 flex flex-col gap-4">
        {movements.map((movement) => (
          <li key={movement.id}>
            <MovementCard movement={movement} />
          </li>
        ))}
      </ul>
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

              <span className="text-slate-500 flex items-center gap-1">
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
