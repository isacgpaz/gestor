'use client'

import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { useCatalogGroups } from "@/hooks/catalog/use-catalog-groups";
import { useCreateGroup } from "@/hooks/catalog/use-create-group";
import { useUpdateGroupsOrder } from "@/hooks/catalog/use-update-groups-order";
import { queryClient } from "@/lib/query-client";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { CatalogGroup, Company, User } from "@prisma/client";
import { ChevronDown, ChevronUp, Loader2, PackageOpen } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export function CatalogGroups({ user }: {
  user?: User & { company: Company }
}) {
  const [orderedGroups, setOrderedGroups] = useState<CatalogGroup[]>([])

  const [isReadonly, setIsReadonly] = useState(true)
  const [isOpen, onOpenChange] = useState(false)

  const {
    mutate: updateGroupsOrder,
    isPending
  } = useUpdateGroupsOrder()

  function onUpdateGroupsOrder() {
    updateGroupsOrder({
      companyId: user?.company?.id,
      groups: orderedGroups.map((group, index) => ({
        id: group.id,
        order: index + 1
      }))
    }, {
      onSuccess() {
        setIsReadonly(true)

        queryClient.invalidateQueries({ queryKey: ['catalog-groups'] })

        toast({
          title: 'Ordem dos grupos atualizada com sucesso!',
          variant: 'success'
        })
      }
    })
  }

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        <Button
          size='sm'
          className="w-fit text-primary"
          variant='secondary'
        >
          Grupos
        </Button>
      </DrawerTrigger>

      <DrawerContent className="max-h-[550px]">
        <DrawerHeader className="flex items-center justify-center">
          <DrawerTitle className="text-2xl">
            Grupos
          </DrawerTitle>
        </DrawerHeader>

        <GroupsForm user={user} />

        <GroupsTable
          isReadonly={isReadonly}
          user={user}
          orderedGroups={orderedGroups}
          setOrderedGroups={setOrderedGroups}
        />

        <DrawerFooter className="flex-row gap-3 justify-end items-end px-6 mt-6">
          <Button
            type='button'
            variant='outline'
            onClick={(event) => {
              if (isReadonly) {
                onOpenChange(false)
              }

              event.preventDefault()
              setIsReadonly(true)
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
              Editar ordenação
            </Button>
          ) : (
            <Button
              onClick={onUpdateGroupsOrder}
              isLoading={isPending}
            >
              Salvar alterações
            </Button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

const formSchema = z.object({
  name: z.string().min(1, 'O nome do grupo é obrigatório.')
})

type FormSchema = z.infer<typeof formSchema>

function GroupsForm({ user }: {
  user?: User & { company: Company }
}) {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  })

  const {
    mutate: createGroup,
    isPending
  } = useCreateGroup()

  function onSubmit(values: FormSchema) {
    createGroup({
      name: values.name,
      companyId: user?.company.id
    }, {
      onSuccess() {
        queryClient.invalidateQueries({
          queryKey: ['catalog-groups']
        })

        form.reset()

        toast({
          title: "Grupo adicionado com sucesso!",
          variant: 'success'
        })
      }
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full flex items-center justify-center"
      >
        <div className="flex max-w-md mx-auto w-full items-end space-x-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Adicionar novo grupo</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Nome do grupo"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type='submit'
            isLoading={isPending}
            className={cn(form.formState.errors.name && "mb-7")}
          >
            Adicionar
          </Button>
        </div>
      </form>
    </Form>
  )
}

type GroupsTableProps = {
  isReadonly: boolean,
  user?: User & { company: Company },
  orderedGroups: CatalogGroup[],
  setOrderedGroups: Dispatch<SetStateAction<CatalogGroup[]>>
}

function GroupsTable({
  isReadonly,
  user,
  orderedGroups,
  setOrderedGroups
}: GroupsTableProps) {
  const {
    data: catalogGroups,
    isLoading,
  } = useCatalogGroups({
    companyId: user?.company.id
  })

  useEffect(() => {
    setOrderedGroups(catalogGroups ?? [])
  }, [catalogGroups, setOrderedGroups])

  function onOrderGroups(triggerIndex: number, targetIndex: number) {
    if (
      triggerIndex >= 0
      && triggerIndex < orderedGroups.length
      && targetIndex >= 0
      && targetIndex < orderedGroups.length
    ) {
      const updatedArray = [...orderedGroups];

      const temp = updatedArray[triggerIndex];
      updatedArray[triggerIndex] = updatedArray[targetIndex];
      updatedArray[targetIndex] = temp;

      setOrderedGroups(updatedArray);
    }
  }

  if (isLoading) {
    return (
      <div className="mt-6 flex items-center justify-center">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        <span>Buscando grupos...</span>
      </div>
    )
  }

  if (orderedGroups?.length) {
    return (
      <div className="max-w-md mx-auto w-full mt-6 overflow-auto max-h-[450px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Grupo</TableHead>
              <TableHead className="w-[100px]">Ordem</TableHead>

              {!isReadonly && (
                <TableHead className="w-[60px]">Movimentar</TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {orderedGroups.map((group, index) => (
              <TableRow key={group.id}>
                <TableCell>{group.name}</TableCell>
                <TableCell>{index + 1}</TableCell>

                {!isReadonly && (
                  <TableCell className="flex gap-4">
                    <Button
                      size='icon'
                      variant='secondary'
                      className="w-6 h-6 text-primary disabled:text-secondary-foreground disabled:cursor-not-allowed"
                      disabled={index === 0}
                      onClick={() => onOrderGroups(index, index - 1)}
                    >
                      <ChevronUp className="w-4 h-4" strokeWidth={3} />
                    </Button>

                    <Button
                      size='icon'
                      variant='secondary'
                      className="w-6 h-6 text-primary disabled:text-secondary-foreground disabled:cursor-not-allowed"
                      disabled={index === orderedGroups.length - 1}
                      onClick={() => onOrderGroups(index, index + 1)}
                    >
                      <ChevronDown className="w-4 h-4" strokeWidth={3} />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="mt-6 flex flex-col items-center justify-center gap-2 text-slate-500">
      <PackageOpen />
      <span className="text-sm">Nenhum grupo encontrado.</span>
    </div>
  )
}