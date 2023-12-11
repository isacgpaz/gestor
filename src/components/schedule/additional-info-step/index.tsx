import { Button } from "@/components/ui/button";
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSchedule } from "@/contexts/schedule-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  title: z.string().min(1, 'O título da reserva é obrigatório.'),
  additionalInfo: z.string(),
})

type FormSchema = z.infer<typeof formSchema>

export function AdditionalInfoStep() {
  const { schedule, goToNextStep, goToPreviousStep, setSchedule } = useSchedule()

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: schedule?.title ?? '',
      additionalInfo: schedule?.additionalInfo ?? '',
    },
  })

  function onSubmit(values: FormSchema) {
    setSchedule((schedule) => ({
      ...schedule,
      title: values.title,
      additionalInfo: values.additionalInfo
    }))

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
              name="title"
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