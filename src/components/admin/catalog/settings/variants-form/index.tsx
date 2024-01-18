import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/use-toast"
import { useCreateVariant } from "@/hooks/catalog/use-create-variant"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { Company, User } from "@prisma/client"
import { ChevronLeft, PlusSquare, X } from "lucide-react"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"

type VariantsFormDrawerProps = {
  user?: User & { company: Company },
  open: boolean,
  onOpenChange: (open: boolean) => void,
  onSettingsDrawerOpenChange: (open: boolean) => void
}

export function VariantsFormDrawer({
  user,
  open,
  onOpenChange,
  onSettingsDrawerOpenChange
}: VariantsFormDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[550px]">
        <DrawerHeader className="flex items-center justify-center">
          <DrawerTitle className="text-2xl">
            Variantes
          </DrawerTitle>
        </DrawerHeader>

        <VariantsForm
          user={user}
          onOpenChange={onOpenChange}
          onSettingsDrawerOpenChange={onSettingsDrawerOpenChange}
        />
      </DrawerContent>
    </Drawer>
  )
}

type VariantsFormProps = {
  user?: User & { company: Company },
  onOpenChange: (open: boolean) => void,
  onSettingsDrawerOpenChange: (open: boolean) => void
}

const formSchema = z.object({
  name: z.string().min(1, 'O nome da categoria é obrigatório.'),
  properties: z.array(z.object({
    value: z.string().min(1, 'O nome da propriedade não pode ser vazio.')
  }))
})

type FormSchema = z.infer<typeof formSchema>

function VariantsForm({
  user,
  onOpenChange,
  onSettingsDrawerOpenChange
}: VariantsFormProps) {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      properties: [
        {
          value: ''
        },
        {
          value: ''
        }
      ]
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "properties",
  });

  function addPropertyField() {
    append({
      value: ''
    })
  }

  const {
    mutate: createVariant,
    isPending
  } = useCreateVariant()

  function onSubmit(values: FormSchema) {
    createVariant({
      name: values.name,
      properties: values.properties.map(
        (property) => property.value
      ),
      companyId: user?.company?.id
    }, {
      onSuccess() {
        toast({
          title: 'Variante adicionada com sucesso.',
          variant: 'success'
        })

        onOpenChange(false)
        onSettingsDrawerOpenChange(true)
      }
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full flex flex-col items-center justify-center"
      >
        <ScrollArea className="h-[300px] w-full">
          <div className="flex flex-col max-w-sm mx-auto space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>
                    Nome
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Nome da variante"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col space-y-2">
              <Label className={cn(
                "mb-0",
                !!form.formState.errors.properties && 'text-destructive'
              )}>
                Propriedades
              </Label>

              {fields.map((field, index) => (
                <div key={field.id} className="flex space-x-2" >
                  <FormField
                    control={form.control}
                    name={`properties.${index}.value`}
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={`Nome da propriedade ${index + 1}`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {fields.length > 2 && (
                    <Button
                      variant='destructive'
                      size='icon'
                      className="w-11"
                      onClick={() => remove(index)}
                    >
                      <X className="w-4 h-4" strokeWidth={3} />
                    </Button>
                  )}
                </div>
              ))}

              {fields.length < 4 && (
                <Button
                  type='button'
                  variant='secondary'
                  className="text-primary mt-2"
                  onClick={addPropertyField}
                >
                  <PlusSquare className="w-4 h-4 mr-2" />

                  Adicionar nova propriedade
                </Button>
              )}
            </div>
          </div>
        </ScrollArea>
        <DrawerFooter className="flex-row gap-3 justify-between items-end px-6 mt-6 w-full">
          <Button
            type='button'
            variant='outline'
            onClick={() => {
              onOpenChange(false)
              onSettingsDrawerOpenChange(true)
            }}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <Button type='submit' isLoading={isPending}>
            Adicionar variante
          </Button>
        </DrawerFooter>
      </form>
    </Form>
  )
}