import { DatePicker } from "@/components/common/date-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useSchedule } from "@/contexts/schedule-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  date: z.date(),
  time: z.date()
})

type FormSchema = z.infer<typeof formSchema>

export function DateStep() {
  const { schedule, goToNextStep, setSchedule } = useSchedule()

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: schedule?.date ?? new Date(),
      time: schedule?.time ?? new Date()
    },
  })

  function onSubmit(values: FormSchema) {
    setSchedule((schedule) => ({
      ...schedule,
      date: values.date,
      time: values.time
    }))

    goToNextStep()
  }

  return (
    <>
      <CardHeader className="p-5 pb-2">
        <CardTitle className="text-base">
          Quando gostaria de reservar?
        </CardTitle>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="p-5 pt-0 space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data</FormLabel>
                  <FormControl>
                    <DatePicker
                      date={field.value}
                      setDate={field.onChange}
                      label="Que dia será?"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horário</FormLabel>
                  <FormControl>
                    <ul className="flex gap-1">
                      <li>
                        <Badge variant="outline">10:00</Badge>
                      </li>
                      <li>
                        <Badge variant="outline">11:00</Badge>
                      </li>
                      <li>
                        <Badge variant="outline">12:00</Badge>
                      </li>
                    </ul>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="pt-0 justify-end">
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