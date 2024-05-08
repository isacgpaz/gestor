/* eslint-disable react-hooks/exhaustive-deps */
import { DatePicker } from "@/components/common/date-picker";
import { Loader } from "@/components/common/loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCreateScheduleContext } from "@/contexts/create-schedule-context";
import { useAgendaAvailableDates } from "@/hooks/agenda/use-agenda-available-dates";
import { dayjs } from "@/lib/dayjs";
import { AvailableTimesType } from "@/types/schedule";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  date: z.date({
    required_error: "Escolha um dia para continuar a reserva.",
  }),
  time: z.date({
    required_error: "Escolha um horário para continuar a reserva.",
  }),
  selectedMonth: z.date(),
});

type FormSchema = z.infer<typeof formSchema>;

export function DateStep() {
  const { schedule, goToNextStep, updateSchedule, company } =
    useCreateScheduleContext();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: schedule?.date,
      time: schedule?.time,
      selectedMonth: schedule?.date ?? new Date(),
    },
  });

  const selectedMonth = form.watch("selectedMonth");
  const date = form.watch("date");
  const time = form.watch("time");

  useEffect(() => {
    updateSchedule({ date, time });
  }, [date, time]);

  const {
    data: availableDays,
    isLoading: isAvailableDaysLoading,
    isSuccess: isAvailableDaysSuccess,
  } = useAgendaAvailableDates(
    {
      startDate: dayjs(selectedMonth).startOf("month").format("YYYY-MM-DD"),
      companyId: company?.id,
      type: AvailableTimesType.DAYS,
    },
    {
      enabled: !!company?.id && !!selectedMonth,
    }
  );

  const { data: availableTimes, isLoading: isAvailableTimesLoading } =
    useAgendaAvailableDates(
      {
        startDate: dayjs(date).format("YYYY-MM-DD"),
        companyId: company?.id,
        type: AvailableTimesType.HOURS,
      },
      {
        enabled: !!date && isAvailableDaysSuccess,
      }
    );

  function onSubmit(values: FormSchema) {
    updateSchedule({
      date: values.date,
      time: values.time,
    });

    goToNextStep();
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
            {isAvailableDaysLoading ? (
              <Loader label="Carregando dias disponíveis..." />
            ) : (
              <FormField
                control={form.control}
                name="date"
                render={({ field: { onChange } }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <DatePicker
                        date={date}
                        setDate={(date) => {
                          form.setValue("time", undefined as unknown as Date);
                          form.clearErrors("time");
                          onChange(date);
                        }}
                        label="Que dia será?"
                        month={selectedMonth}
                        onMonthChange={(month) =>
                          form.setValue("selectedMonth", dayjs(month).toDate())
                        }
                        fromDate={new Date()}
                        toDate={dayjs().add(60, "days").toDate()}
                        // disabled={(date) => !availableDays?.includes(dayjs(date).format('YYYY/MM/DD')) ?? false}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {isAvailableTimesLoading ? (
              <Loader label="Carregando horários disponíveis..." />
            ) : (
              date && (
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field: { value, onChange } }) => (
                    <FormItem>
                      <FormLabel>Horário</FormLabel>
                      <FormControl>
                        <ul className="flex flex-wrap gap-1">
                          {availableTimes?.map((availableTime) => (
                            <li
                              key={availableTime}
                              onClick={() => onChange(new Date(availableTime))}
                            >
                              <Badge
                                className="cursor-pointer"
                                variant={
                                  dayjs(availableTime).isSame(value)
                                    ? "default"
                                    : "outline"
                                }
                              >
                                {dayjs(availableTime).format("HH:mm")}
                              </Badge>
                            </li>
                          ))}
                        </ul>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )
            )}
          </CardContent>

          <CardFooter className="pt-0 justify-end">
            <Button size="sm" type="submit">
              Avançar
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </CardFooter>
        </form>
      </Form>
    </>
  );
}
