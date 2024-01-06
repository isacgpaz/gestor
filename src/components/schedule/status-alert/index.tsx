import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useCreateScheduleContext } from "@/contexts/create-schedule-context";
import { dayjs } from "@/lib/dayjs";
import { Schedule } from "@prisma/client";
import { CalendarCheck, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

function getStoragedSchedules() {
  const storagedSchedules = localStorage.getItem('@gestor:schedules')

  let parsedSchedules: Schedule[] = []

  if (storagedSchedules) {
    parsedSchedules = JSON.parse(storagedSchedules)

    parsedSchedules = parsedSchedules.filter((schedule) => dayjs(schedule.startDate).isAfter(dayjs()))

    localStorage.setItem('@gestor:schedules', JSON.stringify(parsedSchedules))
  }

  return parsedSchedules
}

export function StatusAlert({ schedule }: { schedule?: Schedule }) {
  const { company } = useCreateScheduleContext()

  const storagedSchedules = getStoragedSchedules()

  const hasStoragedSchedules = storagedSchedules.length

  const alertData = useMemo(() => {
    if (schedule) {
      return {
        title: 'Reserva confirmada',
        description: 'Já estamos preparando tudo para a sua reserva. Nos vemos em breve!',
        icon: CalendarCheck
      }
    }

    if (hasStoragedSchedules) {
      return {
        title: `Você possui ${hasStoragedSchedules} reserva(s) conosco.`,
        description: 'Toque aqui para conferir mais informações.',
        icon: CalendarCheck,
        footer: (
          <Collapsible className="w-full flex flex-col justify-center items-center pr-7 ">
            <CollapsibleTrigger className="data-[state=open]:rotate-180 transition-all">
              <ChevronDown className="h-4 w-4" color='white' />
            </CollapsibleTrigger>

            <CollapsibleContent className="flex w-full mt-1">
              <ul className="flex flex-wrap gap-2 w-full">
                {storagedSchedules?.map((storagedSchedule) => (
                  <li key={storagedSchedule.id}>
                    <Link href={`/schedule/${company?.slug}/${storagedSchedule.id}`}>
                      <Badge className="cursor-pointer" variant='secondary'>
                        {dayjs(storagedSchedule.startDate).format('DD/MM [às] HH:mm')}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        )
      }
    }

    return null
  }, [company?.slug, hasStoragedSchedules, schedule, storagedSchedules])

  const Icon = alertData?.icon

  if (alertData) {
    return (
      <Alert className="bg-primary text-primary-foreground w-full max-w-xs mx-auto mt-6">
        {Icon && <Icon className="h-4 w-4" color='white' />}

        <AlertTitle>{alertData?.title}</AlertTitle>

        <AlertDescription>
          {alertData?.description}
        </AlertDescription>

        {alertData?.footer}
      </Alert>
    )
  }

  return null
}