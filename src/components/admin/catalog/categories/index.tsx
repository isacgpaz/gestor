'use client'

import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { useCatalogCategories } from "@/hooks/catalog/use-catalog-categories";
import { useCreateCategory } from "@/hooks/catalog/use-create-category";
import { useDeleteCategory } from "@/hooks/catalog/use-delete-category";
import { useUpdateCategoriesOrder } from "@/hooks/catalog/use-update-categories-order";
import { useUpdateCategory } from "@/hooks/catalog/use-update-category";
import { queryClient } from "@/lib/query-client";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { CatalogCategory, Company, User } from "@prisma/client";
import { ChevronDown, ChevronUp, ClipboardEdit, Loader2, MoreVertical, PackageOpen, Trash } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export function CatalogCategories({ user }: {
  user?: User & { company: Company }
}) {
  const [orderedCategories, setOrderedCategories] = useState<CatalogCategory[]>([])

  const [isReadonly, setIsReadonly] = useState(true)
  const [isOpen, onOpenChange] = useState(false)
  const [isCategoryUpdateEnabled, setIsCategoryUpdateEnabled] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CatalogCategory | undefined>(undefined)

  const {
    mutate: updateCategoriesOrder,
    isPending
  } = useUpdateCategoriesOrder()

  function onUpdateCategoriesOrder() {
    updateCategoriesOrder({
      companyId: user?.company?.id,
      categories: orderedCategories.map((category, index) => ({
        id: category.id,
        order: index + 1
      }))
    }, {
      onSuccess() {
        setIsReadonly(true)

        queryClient.invalidateQueries({ queryKey: ['catalog-categories'] })

        toast({
          title: 'Ordem das categorias atualizada com sucesso!',
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
          Categorias
        </Button>
      </DrawerTrigger>

      <DrawerContent className="max-h-[550px]">
        <DrawerHeader className="flex items-center justify-center">
          <DrawerTitle className="text-2xl">
            Categorias
          </DrawerTitle>
        </DrawerHeader>

        {isReadonly && (
          <CategoriesForm
            user={user}
            isCategoryUpdateEnabled={isCategoryUpdateEnabled}
            setIsCategoryUpdateEnabled={setIsCategoryUpdateEnabled}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        )}

        <CategoriesTable
          user={user}
          isReadonly={isReadonly}
          orderedCategories={orderedCategories}
          setOrderedCategories={setOrderedCategories}
          isCategoryUpdateEnabled={isCategoryUpdateEnabled}
          setIsCategoryUpdateEnabled={setIsCategoryUpdateEnabled}
          setSelectedCategory={setSelectedCategory}
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
              setIsCategoryUpdateEnabled(false)
              setSelectedCategory(undefined)
            }}
          >
            {isReadonly ? 'Fechar' : 'Cancelar'}
          </Button>

          {
            !isCategoryUpdateEnabled
            && orderedCategories.length
            && (
              isReadonly ? (
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
                  onClick={onUpdateCategoriesOrder}
                  isLoading={isPending}
                >
                  Salvar alterações
                </Button>
              )
            )
          }
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

const formSchema = z.object({
  name: z.string().min(1, 'O nome da categoria é obrigatório.')
})

type FormSchema = z.infer<typeof formSchema>

type CategoriesFormProps = {
  user?: User & { company: Company };
  isCategoryUpdateEnabled: boolean;
  setIsCategoryUpdateEnabled: Dispatch<SetStateAction<boolean>>;
  selectedCategory: CatalogCategory | undefined;
  setSelectedCategory: Dispatch<SetStateAction<CatalogCategory | undefined>>;
}

function CategoriesForm({
  user,
  isCategoryUpdateEnabled,
  setIsCategoryUpdateEnabled,
  selectedCategory,
  setSelectedCategory
}: CategoriesFormProps) {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  })

  const {
    mutate: createCategory,
    isPending: isCreateCategoryPending
  } = useCreateCategory()

  const {
    mutate: updateCategory,
    isPending: isUpdateCategoryPending
  } = useUpdateCategory()

  const isPending = isCreateCategoryPending || isUpdateCategoryPending

  function onSubmit(values: FormSchema) {
    if (isCategoryUpdateEnabled) {
      updateCategory({
        ...selectedCategory,
        name: values.name,
      }, {
        onSuccess() {
          queryClient.invalidateQueries({
            queryKey: ['catalog-categories']
          })
          queryClient.invalidateQueries({
            queryKey: ['products']
          })

          setIsCategoryUpdateEnabled(false)
          setSelectedCategory(undefined)

          form.reset({ name: '' })

          toast({
            title: "Categoria atualizada com sucesso!",
            variant: 'success'
          })
        }
      })
    } else {
      createCategory({
        name: values.name,
        companyId: user?.company.id
      }, {
        onSuccess() {
          queryClient.invalidateQueries({
            queryKey: ['catalog-categories']
          })
          queryClient.invalidateQueries({
            queryKey: ['products']
          })

          form.reset({ name: '' })

          toast({
            title: "Categoria adicionado com sucesso!",
            variant: 'success'
          })
        }
      })
    }
  }

  useEffect(() => {
    if (selectedCategory && isCategoryUpdateEnabled) {
      form.reset({ name: selectedCategory.name })
    }
  }, [selectedCategory, form, isCategoryUpdateEnabled])

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-xs mx-auto flex items-center justify-center"
      >
        <div className="w-full flex flex-col space-y-2 items-end">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>
                  {isCategoryUpdateEnabled ? 'Editar' : 'Adicionar'}  nova categoria
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Nome do categoria"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex space-x-2">
            {isCategoryUpdateEnabled && (
              <Button
                type='button'
                variant='outline'
                onClick={(event) => {
                  event.preventDefault();
                  setIsCategoryUpdateEnabled(false)
                  setSelectedCategory(undefined)
                  form.reset()
                }}
              >
                Cancelar
              </Button>
            )}

            <Button
              type='submit'
              isLoading={isPending}
            >
              {isCategoryUpdateEnabled ? 'Salvar' : 'Adicionar'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}

type CategoriesTableProps = {
  isReadonly: boolean,
  user?: User & { company: Company },
  orderedCategories: CatalogCategory[],
  setOrderedCategories: Dispatch<SetStateAction<CatalogCategory[]>>
  isCategoryUpdateEnabled: boolean,
  setIsCategoryUpdateEnabled: Dispatch<SetStateAction<boolean>>,
  setSelectedCategory: Dispatch<SetStateAction<CatalogCategory | undefined>>;
}

function CategoriesTable({
  isReadonly,
  user,
  orderedCategories,
  setOrderedCategories,
  isCategoryUpdateEnabled,
  setIsCategoryUpdateEnabled,
  setSelectedCategory
}: CategoriesTableProps) {
  const {
    data: catalogCategories,
    isLoading,
  } = useCatalogCategories({
    companyId: user?.company.id
  })

  useEffect(() => {
    setOrderedCategories(catalogCategories ?? [])
  }, [catalogCategories, setOrderedCategories, isReadonly])

  function onOrderCategories(triggerIndex: number, targetIndex: number) {
    if (
      triggerIndex >= 0
      && triggerIndex < orderedCategories.length
      && targetIndex >= 0
      && targetIndex < orderedCategories.length
    ) {
      const updatedArray = [...orderedCategories];

      const temp = updatedArray[triggerIndex];
      updatedArray[triggerIndex] = updatedArray[targetIndex];
      updatedArray[targetIndex] = temp;

      setOrderedCategories(updatedArray);
    }
  }

  if (isLoading) {
    return (
      <div className="mt-6 flex items-center justify-center">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        <span>Buscando categorias...</span>
      </div>
    )
  }

  if (orderedCategories?.length) {
    return (
      <div className={cn(
        "max-w-xs mx-auto w-full mt-6 overflow-auto max-h-[450px]",
        isCategoryUpdateEnabled && 'opacity-50'
      )}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">Ordem</TableHead>
              <TableHead>Categoria</TableHead>

              {!isReadonly && orderedCategories.length > 1 && (
                <TableHead className="text-right" />
              )}

              {isReadonly && (
                <TableHead className="text-right w-[20px]" />
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {orderedCategories.map((category, index) => (
              <TableRow key={category.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{category.name}</TableCell>

                {!isReadonly && orderedCategories.length > 1 && (
                  <TableCell className="flex gap-4 justify-end">
                    <Button
                      size='icon'
                      variant={index === 0 ? 'secondary' : 'default'}
                      className="w-6 h-6"
                      disabled={index === 0}
                      onClick={() => onOrderCategories(index, index - 1)}
                    >
                      <ChevronUp className="w-4 h-4" strokeWidth={3} />
                    </Button>

                    <Button
                      size='icon'
                      variant={index === orderedCategories.length - 1 ? 'secondary' : 'default'}
                      className="w-6 h-6"
                      disabled={index === orderedCategories.length - 1}
                      onClick={() => onOrderCategories(index, index + 1)}
                    >
                      <ChevronDown className="w-4 h-4" strokeWidth={3} />
                    </Button>
                  </TableCell>
                )}

                {isReadonly && (
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger disabled={isCategoryUpdateEnabled}>
                        <MoreVertical />
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setIsCategoryUpdateEnabled(true)
                            setSelectedCategory(category)
                          }}
                        >
                          <ClipboardEdit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                          <DeleteCategory category={category} />
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
      <span className="text-sm">Nenhuma categoria encontrada.</span>
    </div>
  )
}

function DeleteCategory({ category }: { category: CatalogCategory }) {
  const [open, onOpenChange] = useState(false)

  const {
    mutate: deleteCategory,
    isPending
  } = useDeleteCategory()

  function onDeleteCategory() {
    deleteCategory(category.id, {
      onSuccess() {
        onOpenChange(false)

        queryClient.invalidateQueries({
          queryKey: ['catalog-categories']
        })

        toast({
          title: 'Categoria excluída com sucesso.',
          variant: 'success'
        })
      }
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent hover:bg-accent w-full text-destructive">
        <Trash className="mr-2 h-4 w-4" />
        <span className="text-sm">Excluir</span>
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-xs">
        <AlertDialogHeader>
          <AlertDialogTitle>
            Tem certeza que deseja excluir esta categoria?
          </AlertDialogTitle>

          <AlertDialogDescription>
            Essa ação não poderá ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>

          <Button
            variant='destructive'
            onClick={onDeleteCategory}
            isLoading={isPending}
          >
            Sim, excluir
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

  )
}
