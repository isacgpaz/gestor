'use client'

import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { useCatalogGroups } from "@/hooks/catalog/use-catalog-groups";
import { useCreateGroup } from "@/hooks/catalog/use-create-group";
import { queryClient } from "@/lib/query-client";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Company, User } from "@prisma/client";
import { Loader2, PackageOpen } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export function CatalogGroups({ user }: {
  user?: User & { company: Company }
}) {
  return (
    <Drawer>
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

        <GroupsTable user={user} />

        <DrawerFooter className="flex-row gap-3 justify-end items-end px-6 mt-6">
          <DrawerClose>
            <Button variant="outline">
              Fechar
            </Button>
          </DrawerClose>
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

function GroupsTable({ user }: {
  user?: User & { company: Company }
}) {
  const {
    data: catalogGroups,
    isLoading,
  } = useCatalogGroups({
    companyId: user?.company.id
  })

  if (isLoading) {
    return (
      <div className="mt-6 flex items-center justify-center">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        <span>Buscando grupos...</span>
      </div>
    )
  }

  if (catalogGroups?.length) {
    return (
      <div className="max-w-md mx-auto w-full mt-6 overflow-auto max-h-[450px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Grupo</TableHead>
              <TableHead className="w-[100px]">Ordem</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {catalogGroups.map((group) => (
              <TableRow key={group.id}>
                <TableCell>{group.name}</TableCell>
                <TableCell>{group.order}</TableCell>
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