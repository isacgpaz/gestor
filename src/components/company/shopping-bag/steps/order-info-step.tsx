import { Button } from "@/components/ui/button";
import { DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { brazilianStates } from "@/constants/brazilian-states";
import { useCatalogShoppingBag } from "@/contexts/catalog-shopping-bag-context";
import { useCompany } from "@/contexts/company-context";
import { useCreateOrder } from "@/hooks/order/user-create-order";
import { ShoppingBagItemTypeEnum } from "@/types/catalog";
import { CreateOrder, CreateOrderItem } from "@/types/order";
import { zodResolver } from "@hookform/resolvers/zod";
import { OrderType } from "@prisma/client";
import { ChevronRight, ExternalLink, MapPinned } from "lucide-react";
import { useEffect } from "react";
import { UseFormReturn, useForm } from "react-hook-form";
import { z } from "zod";
import { ShoppingBagTotalValue } from "../shopping-bag-total-value";

const formSchema = z.object({
  deliveryAddress: z.object({
    street: z.string({
      required_error: 'O endereço é obrigatório.'
    }),
    number: z.coerce
      .number({
        required_error: "O número é obrigatório.",
        invalid_type_error: "O número deve ser um número.",
      })
      .int("O número deve ser inteiro.")
      .positive("O número deve ser positivo.")
      .min(1, { message: "O número deve ser maior que 0." }),
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
  }).optional(),
  type: z.enum([OrderType.DELIVERY, OrderType.PICK_UP])
    .default(OrderType.DELIVERY),
});

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
      deliveryAddress: {
        city: order?.deliveryAddress?.city,
        state: order?.deliveryAddress?.state,
        area: order?.deliveryAddress?.area ?? undefined,
        complement: order?.deliveryAddress?.complement ?? undefined,
        street: order?.deliveryAddress?.street,
        number: Number(order?.deliveryAddress?.number),
      },
      type: OrderType.DELIVERY
    },
    resolver: zodResolver(formSchema),
  })

  const type = form.watch('type')

  const { mutate: createOrder, isPending } = useCreateOrder()

  function onSubmit(values: FormSchema) {
    const orderToCreate: Partial<CreateOrder> = {
      type: values.type,
      companyId: company?.id,
      customerId: customer?.id,
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
    }

    if (values.deliveryAddress && values.type === OrderType.DELIVERY) {
      orderToCreate.deliveryAddress = {
        ...values.deliveryAddress,
        number: String(values.deliveryAddress?.number),
        complement: values.deliveryAddress?.complement || null,
        zip: null,
      }
    }

    setOrder(orderToCreate)

    if (orderToCreate.customerId) {
      createOrder(orderToCreate, {
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
    if (type === OrderType.PICK_UP) {
      form.reset({
        deliveryAddress: undefined,
        type: OrderType.PICK_UP
      })
    }
  }, [form, type])

  useEffect(() => {
    if (type === OrderType.DELIVERY && company?.address) {
      console.log(company.address.state)
      form.reset({
        deliveryAddress: {
          city: company.address.city,
          state: company.address.state,
          area: undefined,
          number: undefined,
          street: undefined,
        },
        type: OrderType.DELIVERY
      })
    }
  }, [
    company,
    form,
    type
  ])

  useEffect(() => {
    form.clearErrors("deliveryAddress")
  }, [type, form])

  return (
    <>
      <DrawerHeader>
        <DrawerTitle>
          Escolher endereço
        </DrawerTitle>
      </DrawerHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <ScrollArea className="w-full h-[420px]">
            <div className="px-4 flex flex-col gap-3">
              <OrderTypeSection form={form} />

              <ShoppingBagTotalValue />
            </div>
          </ScrollArea>

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
  return (
    <Tabs
      value={form.watch('type')}
      onValueChange={(type) => form.setValue('type', type as "DELIVERY" | "PICK_UP")}
    >
      <TabsList>
        <TabsTrigger value={OrderType.DELIVERY} type='button'>
          Entrega
        </TabsTrigger>

        <TabsTrigger value={OrderType.PICK_UP} type='button'>
          Retirada
        </TabsTrigger>
      </TabsList>

      <TabsContent value={OrderType.DELIVERY}>
        <CustomerAddressForm form={form} />
      </TabsContent>

      <TabsContent value={OrderType.PICK_UP}>
        <CompanyAddress />
      </TabsContent>
    </Tabs>
  )
}

function CustomerAddressForm({ form }: { form: UseFormReturn<FormSchema> }) {
  return (
    <div className="space-y-1">
      <FormField
        control={form.control}
        name="deliveryAddress.street"
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
          name="deliveryAddress.number"
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
          name="deliveryAddress.area"
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
        name="deliveryAddress.complement"
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
          name="deliveryAddress.city"
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
          name="deliveryAddress.state"
          render={({ field }) => (
            <FormItem className="w-[30%]">
              <FormLabel>Estado</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
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

function CompanyAddress() {
  const { company } = useCompany()

  return (
    <div className="flex gap-3 my-4 px-1">
      <div className="bg-secondary text-primary rounded w-12 h-12 flex items-center justify-center flex-shrink-0">
        <MapPinned className="w-5 h-5" />
      </div>

      <div>
        <span className="block">
          {company?.address?.street}, {' '}
          {company?.address?.number} - {' '}
          {company?.address?.area}
        </span>

        <Button asChild variant='link' className="p-0 h-min" size='sm'>
          <a
            href={redirectToGoogleMapsLocation(`${company?.address?.street}, ${company?.address?.number} - ${company?.address?.area}`)}
            target="_blank"
            className="flex items-center"
          >
            Ver no mapa

            <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  )
}

function redirectToGoogleMapsLocation(location: string) {
  const locationFormatted = location.replace(/\s+/g, '+');

  const urlGoogleMaps = 'https://www.google.com/maps/search/?api=1&query=';

  const redirectUrl = urlGoogleMaps + locationFormatted;

  return redirectUrl
}
