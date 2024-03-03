import { Button } from "@/components/ui/button";
import { DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { brazilianStates } from "@/constants/brazilian-states";
import { useCatalogShoppingBag } from "@/contexts/catalog-shopping-bag-context";
import { useCompany } from "@/contexts/company-context";
import { useCreateOrder } from "@/hooks/order/user-create-order";
import { ShoppingBagItemTypeEnum } from "@/types/catalog";
import { CreateOrderItem } from "@/types/order";
import { zodResolver } from "@hookform/resolvers/zod";
import { OrderType } from "@prisma/client";
import { ChevronRight } from "lucide-react";
import { useEffect } from "react";
import { UseFormReturn, useForm } from "react-hook-form";
import { z } from "zod";
import { ShoppingBagTotalValue } from "../shopping-bag-total-value";

const formSchema = z.object({
  street: z.string({
    required_error: 'O endereço é obrigatório.'
  }),
  number: z.number({
    required_error: 'O número é obrigatório.'
  })
    .int('O número deve ser inteiro')
    .positive('O número deve ser positivo.'),
  area: z.string({
    required_error: 'O bairro é obrigatório.'
  }),
  complement: z.string().optional(),
  city: z.string({
    required_error: 'A cidade é obrigatória.'
  }),
  state: z.string({
    required_error: 'O estado é obrigatório.'
  }),
})

type FormSchema = z.infer<typeof formSchema>

export function OrderInfoStep() {
  const {
    shoppingBag,
    order,
    setStep,
    setOrder,
    onShoppingBagOpenChange,
    resetShoppingBag
  } = useCatalogShoppingBag()

  const { company, customer } = useCompany()

  const form = useForm<FormSchema>({
    defaultValues: {
      city: company?.address?.city,
      state: company?.address?.state,
      area: order?.deliveryAddress?.area ?? undefined,
      complement: order?.deliveryAddress?.complement ?? undefined,
      street: order?.deliveryAddress?.street,
      number: Number(order?.deliveryAddress?.number),
    },
    resolver: zodResolver(formSchema),
  })

  const { mutate: createOrder, isPending } = useCreateOrder()

  function onSubmit(values: FormSchema) {
    const customerId = customer?.id

    setOrder({
      type: OrderType.DELIVERY,
      companyId: company?.id,
      customerId,
      deliveryAddress: {
        ...values,
        number: String(values.number),
        complement: values.complement || null,
        zip: null,
      },
      items: shoppingBag.map((shoppingBagItem) => {
        const item: Omit<Partial<CreateOrderItem>, 'price'> = {}

        if (shoppingBagItem.type === ShoppingBagItemTypeEnum.COMPOSED) {
          item.composedProductsIds = [
            shoppingBagItem.firstProduct!.id,
            shoppingBagItem.secondProduct!.id,
          ]
        }

        if (shoppingBagItem.type === ShoppingBagItemTypeEnum.UNIT) {
          item.uniformProductId = shoppingBagItem.product?.id
        }

        return {
          quantity: shoppingBagItem.quantity,
          catalogVariantPropertyId: shoppingBagItem.variantId,
          ...item
        }
      })
    })

    if (customerId) {
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
    } else {
      setStep(2)
    }
  }

  useEffect(() => {
    form.reset({
      city: company?.address?.city,
      state: company?.address?.state,
    })
  }, [
    company?.address?.city,
    company?.address?.state,
    form,
  ])

  return (
    <>
      <DrawerHeader>
        <DrawerTitle>
          Escolher endereço
        </DrawerTitle>
      </DrawerHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="px-4 flex flex-col gap-3">
            <OrderTypeSection form={form} />

            <ShoppingBagTotalValue />
          </div>

          <DrawerFooter>
            <Button type='submit' isLoading={isPending}>
              {customer ? "Finalizar pedido" : "Avançar"}

              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>

            <Button variant='outline' onClick={() => setStep(0)}>
              Voltar
            </Button>
          </DrawerFooter>
        </form>
      </Form>
    </>
  )
}

function OrderTypeSection({ form }: { form: UseFormReturn<FormSchema> }) {
  const { company } = useCompany()

  return (
    <Tabs defaultValue="a">
      <TabsList>
        <TabsTrigger value="a">
          Entrega
        </TabsTrigger>
        {/* <TabsTrigger value="b">
          Retirada
        </TabsTrigger> */}
      </TabsList>

      <TabsContent value="a">
        <CustomerAddressForm form={form} />
      </TabsContent>

      {/* <TabsContent value="b">
        {company?.address?.street}
      </TabsContent> */}
    </Tabs>
  )
}


export function CustomerAddressForm({ form }: { form: UseFormReturn<FormSchema> }) {
  return (
    <div className="space-y-1">
      <FormField
        control={form.control}
        name="street"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Endereço</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex items-center gap-4">
        <FormField
          control={form.control}
          name="number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nº</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(event) => field.onChange(event.target.valueAsNumber)}
                  type='number'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="area"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bairro</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="complement"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Complemento (opcional)</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex items-center gap-4">
        <FormField
          control={form.control}
          name="city"
          disabled
          render={({ field }) => (
            <FormItem className="w-[70%]">
              <FormLabel>Cidade</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="state"
          disabled
          render={({ field }) => (
            <FormItem className="w-[30%]">
              <FormLabel>Estado</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger disabled>
                    <SelectValue placeholder="Selecionar estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {brazilianStates?.map((state) => (
                    <SelectItem
                      key={state.uf}
                      value={state.uf}
                    >
                      {state.uf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}