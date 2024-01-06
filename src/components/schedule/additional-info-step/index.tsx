import { Button } from "@/components/ui/button";
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSchedule } from "@/contexts/schedule-context";
import { phoneMask, phoneRegex } from "@/utils/format-phone";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMaskito } from '@maskito/react';
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1, 'O título da reserva é obrigatório.'),
  firstPhone: z.string().min(1, 'O telefone 1 é obrigatório.').refine((phone) => phoneRegex.test(phone), 'Telefone inválido.'),
  secondPhone: z.string().min(1, 'O telefone 2 é obrigatório.').refine((phone) => phoneRegex.test(phone), 'Telefone inválido.'),
  additionalInfo: z.string(),
})

type FormSchema = z.infer<typeof formSchema>

export function AdditionalInfoStep() {
  const { schedule, goToNextStep, goToPreviousStep, updateSchedule } = useSchedule()

  const firstPhoneRef = useMaskito({ options: phoneMask })
  const secondPhoneRef = useMaskito({ options: phoneMask })

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: schedule?.contact?.name ?? '',
      firstPhone: schedule?.contact?.firstPhone ?? '',
      secondPhone: schedule?.contact?.secondPhone ?? '',
      additionalInfo: schedule?.additionalInfo ?? '',
    },
  })

  function onSubmit(values: FormSchema) {
    updateSchedule({
      contact: {
        name: values.name,
        firstPhone: values.firstPhone,
        secondPhone: values.secondPhone,
      },
      additionalInfo: values.additionalInfo
    })

    goToNextStep()
  }

  return (
    <>
      <CardHeader className="p-5 pb-2">
        <CardTitle className="text-base">
          Informações adicionais
        </CardTitle>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="p-5 pt-0 space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título da reserva</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nome do reservante ou empresa" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="firstPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone 1</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      ref={firstPhoneRef}
                      onInput={(event) => field.onChange(event.currentTarget.value)}
                      placeholder="(88) 9 9999-9999"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="secondPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone 2</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      ref={secondPhoneRef}
                      onInput={(event) => field.onChange(event.currentTarget.value)}
                      placeholder="(88) 9 9999-9999"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="additionalInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Ex.: Quero minha mesa próxima ao parquinho" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="pt-0 justify-between">
            <Button
              size='sm'
              variant='outline'
              onClick={goToPreviousStep}
              type='button'
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>

            <Button size='sm' type='submit'>
              Avançar
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </CardFooter>
        </form>
      </Form>
    </>
  )
}