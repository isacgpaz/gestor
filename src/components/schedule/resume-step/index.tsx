import { Button } from "@/components/ui/button";
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import dayjs from "dayjs";
import { Calendar, ChevronLeft, ChevronRight, Clock, FileText, Info, User, Users } from "lucide-react";

export function ResumeStep() {
  function onSubmit(values: any) {
    console.log(values)
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
              Responsável: {' '}
              <span className="text-slate-500">
                Mike Ross
              </span>
            </span>
          </li>

          <li className="flex items-center mt-1 text-sm">
            <Calendar className="mr-2 h-4 w-4" />

            <span>
              Data: {' '}
              <span className="text-slate-400">
                {dayjs().format('DD/MM/YYYY')}
              </span>
            </span>
          </li>

          <li className="flex items-center mt-1 text-sm">
            <Clock className="mr-2 h-4 w-4" />

            <span className="flex gap-1">
              Hora: {' '}

              <span className="text-slate-500 flex items-center gap-1">
                {dayjs().format('HH:mm')} à {dayjs().format('HH:mm')}

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3 h-3" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[300px] text-xs">
                      <p>
                        Serão considerados <strong>15 minutos</strong> de tolerância.
                        Caso não haja retorno por parte do responsável após
                        esse período, o horário será liberado para novos agendamentos.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
            </span>
          </li>

          <li className="flex items-center mt-1 text-sm">
            <Users className="mr-2 h-4 w-4" />

            <span>
              Qtd. de pessoas: {' '}
              <span className="text-slate-500">
                {20} adultos e {2} crianças
              </span>
            </span>
          </li>

          <li className="flex items-center mt-1 text-sm">
            <FileText className="mr-2 h-4 w-4" />

            <span>
              Observações: {' '}
              <span className="text-slate-500">
                Próximo ao parquinho
              </span>
            </span>
          </li>
        </ul>
      </CardContent>

      <CardFooter className="pt-0 justify-between">
        <Button size='sm' variant='outline'>
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