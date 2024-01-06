import { Button } from "@/components/ui/button";
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateScheduleContext } from "@/contexts/create-schedule-context";
import { useCreateSchedule } from "@/hooks/schedule/use-create-schedule";
import { formatPhone } from "@/utils/format-phone";
import { Schedule } from "@prisma/client";
import dayjs from "dayjs";
import { Calendar, ChevronLeft, ChevronRight, Clock, FileText, Phone, User, Users } from "lucide-react";
import { useRouter } from "next/navigation";

function storageSchedule(schedule: Schedule) {
  const storagedSchedules = localStorage.getItem('@gestor:schedules')

  let parsedSchedules = []

  if (storagedSchedules) {
    JSON.parse(storagedSchedules)
  }

  parsedSchedules.push(schedule)

  localStorage.setItem('@gestor:schedules', JSON.stringify(parsedSchedules))
}

export function ResumeStep() {
  const router = useRouter()

  const { schedule, company, goToPreviousStep } = useCreateScheduleContext()

  const { mutate: createSchedule, isPending, isSuccess } = useCreateSchedule()

  const startDate = dayjs(schedule?.date)
    .set('hours', dayjs(schedule?.time).hour())
    .set('minutes', dayjs(schedule?.time).minute())
    .set('seconds', 0)
    .set('milliseconds', 0)

  function onSubmit() {
    createSchedule({
      companyId: company?.id,
      startDate: startDate.toISOString(),
      contact: schedule?.contact,
      additionalInfo: schedule?.additionalInfo,
      adultsAmmount: schedule?.adultsAmmount,
      kidsAmmount: schedule?.kidsAmmount,
    }, {
      onSuccess({ data: scheduleCreated }) {
        storageSchedule(scheduleCreated)

        router.push(`/schedule/${company?.slug}/${scheduleCreated.id}`)
      }
    })
  }

  return (
    <>
      <CardHeader className="p-5 pb-2">
        <CardTitle className="text-base">
          Confira as informações da reserva
        </CardTitle>
      </CardHeader>

      <CardContent className="p-5 pt-0 space-y-4">
        <ul className="text-black">
          <li className="flex items-center text-sm">
            <User className="mr-2 h-4 w-4" />

            <span>
              Reservante: {' '}
              <span className="text-slate-500">
                {schedule?.contact?.name}
              </span>
            </span>
          </li>

          <li className="flex items-center mt-1 text-sm">
            <Phone className="mr-2 h-4 w-4" />

            <span>
              Telefone 1: {' '}
              <span className="text-slate-500">
                {formatPhone(String(schedule?.contact?.firstPhone))}
              </span>
            </span>
          </li>

          <li className="flex items-center mt-1 text-sm">
            <Phone className="mr-2 h-4 w-4" />

            <span>
              Telefone 2: {' '}
              <span className="text-slate-500">
                {formatPhone(String(schedule?.contact?.secondPhone))}
              </span>
            </span>
          </li>

          <li className="flex items-center mt-1 text-sm">
            <Calendar className="mr-2 h-4 w-4" />

            <span>
              Data: {' '}
              <span className="text-slate-500">
                {dayjs(schedule?.date).format('DD/MM/YYYY')}
              </span>
            </span>
          </li>

          <li className="flex items-center mt-1 text-sm">
            <Clock className="mr-2 h-4 w-4" />

            <span className="flex gap-1">
              Hora: {' '}

              <span className="text-slate-500 flex items-center gap-1">
                {dayjs(schedule?.time).format('HH:mm')} à {dayjs(schedule?.time).add(company?.agenda?.duration ?? 60, 'minutes').format('HH:mm')}
              </span>
            </span>
          </li>

          <li className="flex items-center mt-1 text-sm">
            <Users className="mr-2 h-4 w-4" />

            <span>
              Qtd. de pessoas: {' '}
              <span className="text-slate-500">
                {schedule?.adultsAmmount} adulto(s)

                {schedule?.kidsAmmount ?
                  ` e ${schedule?.kidsAmmount} criança(s)` : null}
              </span>
            </span>
          </li>

          {schedule?.additionalInfo && (
            <li className="flex items-center mt-1 text-sm">
              <FileText className="mr-2 h-4 w-4" />

              <span>
                Observações: {' '}
                <span className="text-slate-500">
                  {schedule.additionalInfo}
                </span>
              </span>
            </li>
          )}
        </ul>

        <p className="mt-2 text-xs text-slate-500">
          Serão considerados <strong>15 minutos de tolerância.</strong> Caso
          não haja retorno por parte do responsável após esse período, o
          horário será liberado para novos agendamentos.
        </p>
      </CardContent>

      <CardFooter className="pt-0 justify-between">
        <Button
          size='sm'
          variant='outline'
          onClick={schedule?.id ? router.back : goToPreviousStep}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        {!isSuccess && !schedule?.id && (
          <Button size='sm' onClick={onSubmit} isLoading={isPending}>
            Concluir
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </CardFooter>
    </>
  )
}