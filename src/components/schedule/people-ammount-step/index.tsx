import { Button } from "@/components/ui/button";
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSchedule } from "@/contexts/schedule-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  adultsAmmount: z.number()
    .min(1, 'É necessário pelo menos 1 pessoa para realizar a reserva.')
    .int('A quantidade de adultos deve ser um número inteiro.')
    .positive('A quantidade de adultos deve ser um número positivo.'),
  includeKids: z.boolean().default(false),
  kidsAmmount: z.number()
    .int('A quantidade de crianças deve ser um número inteiro.')
    .positive('A quantidade de crianças deve ser um número positivo.')
    .optional()
}).refine(input => {
  if (input.includeKids && input.kidsAmmount === undefined) return false

  return true
})

type FormSchema = z.infer<typeof formSchema>

export function PeopleAmmountStep() {
  const { schedule, goToNextStep, goToPreviousStep, setSchedule } = useSchedule()

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      adultsAmmount: schedule?.adultsAmmount ?? 0,
      kidsAmmount: schedule?.kidsAmmount ?? undefined,
      includeKids: schedule?.kidsAmmount !== 0 ?? false
    },
  })

  const includeKids = form.watch('includeKids')

  function onSubmit(values: FormSchema) {
    setSchedule((schedule) => ({
      ...schedule,
      adultsAmmount: values.adultsAmmount,
      kidsAmmount: values.includeKids ? values.kidsAmmount : 0,
    }))

    goToNextStep()
  }

  return (
    <>
      <CardHeader className="p-5 pb-2">
        <CardTitle className="text-base">
          Para quantas pessoas gostaria de reservar?
        </CardTitle>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="p-5 pt-0 space-y-4">
            <FormField
              control={form.control}
              name="adultsAmmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adultos</FormLabel>
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
              name="includeKids"
              render={({ field }) => (
                <FormItem className="flex justify-between items-center gap-2">
                  <Label htmlFor="includeKids">Incluir crianças?</Label>
                  <FormControl>
                    <Switch
                      id="includeKids"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {includeKids && (
              <FormField
                control={form.control}
                name="kidsAmmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Crianças</FormLabel>
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
            )}

          </CardContent>

          <CardFooter className="pt-0 justify-between">
            <Button size='sm' variant='outline' onClick={goToPreviousStep}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>

            <Button size='sm'>
              Avançar
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </CardFooter>
        </form>
      </Form>
    </>
  )
}