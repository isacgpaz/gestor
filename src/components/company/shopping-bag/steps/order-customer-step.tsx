import { Button } from "@/components/ui/button";
import { DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useCatalogShoppingBag } from "@/contexts/catalog-shopping-bag-context";
import { useCompany } from "@/contexts/company-context";
import { useCreateOrder } from "@/hooks/order/user-create-order";
import { phoneMask, phoneRegex } from "@/utils/format-phone";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMaskito } from "@maskito/react";
import { ChevronRight } from "lucide-react";
import { UseFormReturn, useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  name: z.string({
    required_error: 'O endereço é obrigatório.'
  }),
  whatsapp: z.string()
    .min(1, 'O WhatsApp é obrigatório.')
    .refine((phone) => phoneRegex.test(phone), 'Telefone inválido.'),
})

type FormSchema = z.infer<typeof formSchema>

export function OrderCustomerStep() {
  const {
    setStep,
    setOrder,
    onShoppingBagOpenChange,
    resetShoppingBag,
    order
  } = useCatalogShoppingBag()

  const { customer } = useCompany()

  const form = useForm<FormSchema>({
    defaultValues: {
      name: customer?.name,
    },
    resolver: zodResolver(formSchema),
  })

  const { mutate: createOrder, isPending } = useCreateOrder()

  function onSubmit(values: FormSchema) {
    setOrder((order) => ({
      ...order,
      singleCustomer: {
        name: values.name,
        whatsapp: values.whatsapp
      }
    }))

    createOrder(order, {
      onSuccess() {
        toast({
          title: 'Pedido enviado com sucesso!',
          variant: 'success'
        })

        onShoppingBagOpenChange(false)
        resetShoppingBag()
      },
      onError() {
        toast({
          title: 'Ocorreu um erro ao criar o pedido.',
          variant: 'destructive'
        })
      }
    })
  }

  return (
    <>
      <DrawerHeader>
        <DrawerTitle>
          Finalizar pedido
        </DrawerTitle>
      </DrawerHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="px-4 flex flex-col gap-3">
            <CustomerNameAnfPhoneForm form={form} />
          </div>

          <DrawerFooter>
            <Button type='submit' isLoading={isPending}>
              Finalizar pedido

              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>

            <Button variant='outline' onClick={() => setStep(1)}>
              Voltar
            </Button>
          </DrawerFooter>
        </form>
      </Form>
    </>
  )
}
export function CustomerNameAnfPhoneForm({ form }: { form: UseFormReturn<FormSchema> }) {
  const phoneRef = useMaskito({ options: phoneMask })

  return (
    <div className="space-y-1">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="whatsapp"
        render={({ field }) => (
          <FormItem>
            <FormLabel>WhatsApp</FormLabel>
            <FormControl>
              <Input {...field}
                ref={phoneRef}
                onInput={(event) => field.onChange(event.currentTarget.value)}
                placeholder="(88) 9 9999-9999"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}