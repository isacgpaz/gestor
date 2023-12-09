import { Button } from "@/components/ui/button";
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useSchedule } from "@/contexts/schedule-context";
import dayjs from "dayjs";
import { Calendar, ChevronLeft, ChevronRight, Clock, FileText, User, Users } from "lucide-react";

export function ResumeStep() {
  const { schedule, goToNextStep, goToPreviousStep } = useSchedule()

  function onSubmit(values: any) {
    console.log(values)
    goToNextStep()
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
              Título: {' '}
              <span className="text-slate-500">
                {schedule?.title}
              </span>
            </span>
          </li>

          <li className="flex items-center mt-1 text-sm">
            <Calendar className="mr-2 h-4 w-4" />

            <span>
              Data: {' '}
              <span className="text-slate-400">
                {dayjs(schedule?.date).format('DD/MM/YYYY')}
              </span>
            </span>
          </li>

          <li className="flex items-center mt-1 text-sm">
            <Clock className="mr-2 h-4 w-4" />

            <span className="flex gap-1">
              Hora: {' '}

              <span className="text-slate-500 flex items-center gap-1">
                {dayjs().format('HH:mm')} à {dayjs().add(2.5, 'hours').format('HH:mm')}
              </span>
            </span>
          </li>

          <li className="flex items-center mt-1 text-sm">
            <Users className="mr-2 h-4 w-4" />

            <span>
              Qtd. de pessoas: {' '}
              <span className="text-slate-500">
                {schedule?.adultsAmmount} adultos

                {schedule?.kidsAmmount ?
                  ` e ${schedule?.kidsAmmount} crianças` : null}
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
        <Button size='sm' variant='outline' onClick={goToPreviousStep}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <Button size='sm'>
          Concluir
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </CardFooter>
    </>
  )
}