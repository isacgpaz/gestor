import { Button } from "@/components/ui/button";
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCreateScheduleContext } from "@/contexts/create-schedule-context";
import { useAvailableToScheduleByDate } from "@/hooks/schedule/use-available-to-schedule-by-date";
import { dayjs } from "@/lib/dayjs";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

function getFormSchema(minimumQuantityForScheduling?: number) {
  return z.object({
    adultsAmmount: z.number()
      .min(
        minimumQuantityForScheduling ?? 1,
        `É necessário pelo menos ${minimumQuantityForScheduling ?? 1} adulto(s) para realizar a reserva.`)
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
}

const formSchema = getFormSchema()

type FormSchema = z.infer<typeof formSchema>

export function PeopleAmmountStep() {
  const { schedule, company, goToNextStep, goToPreviousStep, updateSchedule } = useCreateScheduleContext()

  const form = useForm<FormSchema>({
    resolver: zodResolver(
      getFormSchema(company?.scheduleSettings?.minimumQuantityForScheduling)
    ),
    defaultValues: {
      adultsAmmount: schedule?.adultsAmmount ?? undefined,
      kidsAmmount: schedule?.kidsAmmount ?? undefined,
      includeKids: Boolean(schedule?.kidsAmmount) ?? false
    },
  })

  const adultsAmmount = form.watch('adultsAmmount')
  const kidsAmmount = form.watch('kidsAmmount')
  const includeKids = form.watch('includeKids')

  const startDate = dayjs(schedule?.date)
    .set('hours', dayjs(schedule?.time).hour())
    .set('minutes', dayjs(schedule?.time).minute())
    .set('seconds', 0)
    .set('milliseconds', 0)

  const totalPeopleAmmount = adultsAmmount + (kidsAmmount ?? 0)

  const {
    data: availableAtMoment,
    isLoading: isAmmountAvailableToScheduleByDateLoading,
  } = useAvailableToScheduleByDate({
    companyId: company?.id,
    startDate:
      startDate.toISOString()
  })

  useEffect(() => {
    updateSchedule({
      adultsAmmount,
      kidsAmmount
    })
  }, [adultsAmmount, kidsAmmount, updateSchedule])

  function onSubmit(values: FormSchema) {
    updateSchedule({
      adultsAmmount: values.adultsAmmount,
      kidsAmmount: values.includeKids ? values.kidsAmmount : 0,
    })

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
              defaultValue={0}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adultos</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(event) => field.onChange(event.target.valueAsNumber)}
                      type='number'
                      placeholder="Quantidade de adultos"
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


            <p className={cn("mt-2 text-xs", totalPeopleAmmount > availableAtMoment
              ? 'text-destructive' : 'text-slate-500')}>
              {isAmmountAvailableToScheduleByDateLoading ? (
                'Buscando número de lugares disponíveis...'
              ) : (
                <>
                  Há <strong>{availableAtMoment}</strong> lugares disponíveis
                  em {startDate.format('DD [de] MMMM [às] HH:mm')}.
                </>
              )}
            </p>
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

            <Button size='sm' type='submit' disabled={totalPeopleAmmount > availableAtMoment}>
              Avançar
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </CardFooter>
        </form>
      </Form>
    </>
  )
}