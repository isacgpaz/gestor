import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { updateWalletSettings } from "@/services/company/update-company-wallet-settings";
import { zodResolver } from "@hookform/resolvers/zod";
import { Company } from "@prisma/client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  size: z.union([z.number().int().positive().min(10, 'O tamanho mínimo para a carteira é 10.'), z.nan()])
})

type FormSchema = z.infer<typeof formSchema>

type WalletSettingsProps = {
  company: Company
}

export function WalletSettings({ company }: WalletSettingsProps) {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      size: 10
    },
  })

  const { reset } = form

  useEffect(() => {
    reset({ size: company.walletSettings?.size ?? 10 })
  }, [company, reset])

  const [isLoading, setIsLoading] = useState(false)
  const [isReadonly, setIsReadonly] = useState(true)

  async function onSubmit({ size }: FormSchema) {
    setIsLoading(true)

    await updateWalletSettings({
      companyId: company.id,
      size
    }).then(() => {
      toast({
        title: 'Configurações da carteira de fidelidade atualizadas com sucesso!',
        variant: 'success'
      })

      setIsReadonly(true)
    }).catch(() => {
      toast({
        title: 'Ops, algo não saiu como o esperado.',
        description: 'Ocorreu um erro ao atualizar a carteira de fidelidade. Tente novamente.',
        variant: 'destructive',
      })
    }).finally(() => {
      setIsLoading(false)
    })

  }

  return (
    <section className="mt-6">
      <header className="flex items-center justify-between gap-4">
        <h2 className="font-medium text-lg">Carteira de fidelidade</h2>

        <Button
          variant='link'
          size='sm'
          className={cn("hover:no-underline", isReadonly ? "text-primary" : "")}
          onClick={() => setIsReadonly(!isReadonly)}
        >
          {isReadonly ? 'Editar' : 'Cancelar'}
        </Button>
      </header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <FormField
            control={form.control}
            name="size"
            disabled={isReadonly}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tamanho</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(event) => field.onChange(parseInt(event.target.value))}
                    type='number'
                  />
                </FormControl>
                <FormDescription>
                  O tamanho da carteira é a quantidade de pontos necessários para
                  completar a carteira e resgatar o prêmio.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {!isReadonly && (
            <Button type="submit" isLoading={isLoading}>
              Salvar
            </Button>
          )}
        </form>
      </Form>
    </section>
  )
}