"use client";

import { DatePicker } from "@/components/common/date-picker";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { movementType } from "@/constants/inventory";
import { useMovements } from "@/hooks/inventory/use-movements";
import { dayjs } from "@/lib/dayjs";
import { cn } from "@/lib/utils";
import { MovementWithItemAndUser } from "@/types/inventory";
import { zodResolver } from "@hookform/resolvers/zod";
import { Company, MovementType, User } from "@prisma/client";
import { useDebounce } from "@uidotdev/usehooks";
import { ChevronDown, Loader2, PackageOpen } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const movementTypeOptions = [
  {
    label: "Todas",
    id: "",
  },
  {
    label: movementType[MovementType.ENTRY] + "s",
    id: MovementType.ENTRY,
  },
  {
    label: movementType[MovementType.EGRESS] + "s",
    id: MovementType.EGRESS,
  },
];

const formSchema = z.object({
  search: z.string(),
  date: z.date(),
  type: z.enum(["", MovementType.ENTRY, MovementType.EGRESS]),
});

type FormSchema = z.infer<typeof formSchema>;

export function InventoryLastMovement({
  user,
}: {
  user?: User & { company: Company };
}) {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: "",
      date: undefined,
      type: "",
    },
  });

  const search = form.watch("search");
  const date = form.watch("date");
  const type = form.watch("type");

  const debouncedSearch = useDebounce(search, 300);

  return (
    <section className="mt-4 px-6">
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
                      type="search"
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
                            label="Selecionar data"
                            setDate={(date) => {
                              onChange(date);
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
                      <FormLabel className="mt-4">Filtrar por:</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-y-1 gap-4"
                        >
                          {movementTypeOptions.map((option) => (
                            <FormItem
                              key={option.id}
                              className="flex items-center space-x-2 space-y-0"
                            >
                              <FormControl>
                                <RadioGroupItem value={option.id} />
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
        type={type === "" ? undefined : type}
        user={user}
      />
    </section>
  );
}

type LastMovementList = {
  search?: string;
  date?: Date;
  user?: User & { company: Company };
  type?: MovementType;
};

function LastMovementList({ search, date, user, type }: LastMovementList) {
  const {
    data: movementsResponse,
    isLoading: isMovementsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMovements({
    type,
    date: date ? dayjs(date).format("YYYY-MM-DD") : undefined,
    companyId: user?.company.id,
    search,
  });

  const movements =
    movementsResponse?.pages.map((page) => page.result).flat() ?? [];

  if (isMovementsLoading) {
    return (
      <div className="mt-6 flex items-center justify-center">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        <span>Buscando movimentações de estoque...</span>
      </div>
    );
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
          <div className="w-full flex items-center justify-center">
            <Button
              className="mt-4 w-fit text-primary"
              variant="ghost"
              onClick={() => fetchNextPage()}
              isLoading={isFetchingNextPage}
            >
              Carregar mais
            </Button>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="mt-6 flex flex-col items-center justify-center gap-2 text-slate-500">
      <PackageOpen />
      <span className="text-sm">Nenhuma movimentação registrada.</span>
    </div>
  );
}

type MovementCardProps = {
  movement: MovementWithItemAndUser;
};

function MovementCard({ movement }: MovementCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row gap-4 justify-between items-start pb-3">
        <div>
          <CardTitle
            className={cn(
              movement.type === MovementType.ENTRY && "text-primary",
              movement.type === MovementType.EGRESS && "text-destructive",
              movement.type === MovementType.TRANSFER && "text-blue-800"
            )}
          >
            {movementType[movement.type]}
          </CardTitle>

          <CardDescription className="mt-1">
            <span className="text-black">Realizada por:</span>{" "}
            {movement.user.name}
          </CardDescription>
        </div>

        <div className="text-sm flex flex-col items-end">
          <span className="flex gap-1">
            Data:{" "}
            <span className="text-slate-500 flex items-center gap-1">
              {dayjs(movement.createdAt).format("DD/MM/YYYY")}
            </span>
          </span>

          <span className="flex gap-1">
            Hora:{" "}
            <span className="text-slate-500 flex items-center gap-1">
              {dayjs(movement.createdAt).format("HH:mm:ss")}
            </span>
          </span>
        </div>
      </CardHeader>

      <hr className="mx-6" />

      <CardContent className="mt-3">
        <ul className="text-sm mt-2">
          <li>
            <span className="flex gap-1">
              Item:{" "}
              <span className="text-slate-500 flex items-center gap-1">
                {movement.inventoryItem.description}
              </span>
            </span>
          </li>

          {movement.type === MovementType.TRANSFER && (
            <>
              <li>
                <span className="flex gap-1">
                  Câmara de origem:{" "}
                  <span className="text-slate-500 flex items-center gap-1">
                    {movement.originChamber.name}
                  </span>
                </span>
              </li>

              <li>
                <span className="flex gap-1">
                  Câmara de destino:{" "}
                  <span className="text-slate-500 flex items-center gap-1">
                    {movement.destinationChamber.name}
                  </span>
                </span>
              </li>
            </>
          )}

          <li>
            <span className="flex gap-1">
              Quantidade movimentada:{" "}
              <span
                className={cn(
                  "flex items-center gap-1 font-medium",
                  movement.type === MovementType.ENTRY && "text-primary",
                  movement.type === MovementType.EGRESS && "text-destructive",
                  movement.type === MovementType.TRANSFER && "text-blue-800"
                )}
              >
                {movement.type === MovementType.TRANSFER
                  ? ""
                  : movement.type === MovementType.ENTRY
                  ? "+"
                  : "-"}
                {movement.quantity}
              </span>
            </span>
          </li>

          {movement.type !== MovementType.ENTRY && (
            <li>
              <span className="flex gap-1">
                Motivo:{" "}
                <span className="text-slate-500 flex items-center gap-1">
                  {movement.reason}
                </span>
              </span>
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
