'use client'

import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { useCreateChamber } from "@/hooks/inventory/use-create-chamber";
import { useInventoryChambers } from "@/hooks/inventory/use-inventory-chambers";
import { dayjs } from "@/lib/dayjs";
import { queryClient } from "@/lib/query-client";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Company, User } from "@prisma/client";
import { Loader2, PackageOpen } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export function Chambers({ user }: {
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
          Câmaras
        </Button>
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader className="flex items-center justify-center">
          <DrawerTitle className="text-2xl">
            Câmaras
          </DrawerTitle>
        </DrawerHeader>

        <ChamberForm user={user} />

        <ChambersTable user={user} />

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
  name: z.string().min(1, 'O nome da câmara é obrigatório.')
})

type FormSchema = z.infer<typeof formSchema>

function ChamberForm({ user }: {
  user?: User & { company: Company }
}) {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  })

  const {
    mutate: createChamber,
    isPending
  } = useCreateChamber()


  function onSubmit(values: FormSchema) {
    createChamber({
      name: values.name,
      companyId: user?.company.id
    }, {
      onSuccess() {
        queryClient.invalidateQueries({
          queryKey: ['inventory-chambers']
        })

        form.reset()

        toast({
          title: "Câmara adicionada com sucesso!",
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
        <div className="flex max-w-sm mx-auto w-full items-end space-x-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Adicionar nova câmara</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Nome da câmara"
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

function ChambersTable({ user }: {
  user?: User & { company: Company }
}) {
  const {
    data: chambersResponse,
    isLoading,
  } = useInventoryChambers({
    companyId: user?.company.id
  })

  const chambers = chambersResponse?.pages.map(page => page.result).flat() ?? []

  if (isLoading) {
    return (
      <div className="mt-6 flex items-center justify-center">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        <span>Buscando câmaras...</span>
      </div>
    )
  }

  if (chambers.length) {
    return (
      <div className="max-w-sm mx-auto w-full mt-6 overflow-auto max-h-[450px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Câmara</TableHead>
              <TableHead className="w-[100px]">Criada em</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {chambers.map((chamber) => (
              <TableRow key={chamber.id}>
                <TableCell>{chamber.name}</TableCell>
                <TableCell>
                  {dayjs(chamber.createdAt).format('DD/MM/YYYY')}
                </TableCell>
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
      <span className="text-sm">Nenhuma câmara encontrada.</span>
    </div>
  )
}