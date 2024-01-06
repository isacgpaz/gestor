import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import dayjs from "dayjs"
import { Check, ChevronDown, ClipboardEdit, Clock, FileText, MoreVertical, Trash, User, Users } from "lucide-react"

function ScheduleListItem() {
  return (
    <Card className="p-0">
      <CardHeader className="flex flex-row items-start justify-between gap-4 p-3">
        <div className="flex flex-wrap gap-2 flex-1">
          <CardTitle className="text-base">
            Casa do Eletrecista
          </CardTitle>

          <Badge variant="secondary">Pendente</Badge>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <MoreVertical className="w-4 h-4" />
          </DropdownMenuTrigger>

          <DropdownMenuContent side="bottom" align="end" className="z-10 bg-white shadow rounded border">
            <DropdownMenuItem>
              <ClipboardEdit className="w-4 h-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-red-500">
              <Trash className="w-4 h-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </CardHeader>
      <CardContent className="p-3 pt-0">
        <ul className="text-slate-500">
          <li className="flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            <span className="text-sm">
              {dayjs().format('HH:mm')} à {dayjs().format('HH:mm')}
            </span>
          </li>

          <li className="flex items-center mt-1">
            <Users className="mr-2 h-4 w-4" />
            <span className="text-sm">{20} adultos e {2} crianças</span>
          </li>

          <li className="flex items-center mt-1">
            <FileText className="mr-2 h-4 w-4" />
            <span className="text-sm">Próximo ao parquinho</span>
          </li>
        </ul>

        <Collapsible>
          <CollapsibleTrigger className="mt-1 text-sm flex items-center font-medium">
            <ChevronDown className="mr-2 h-4 w-4" strokeWidth={3} />
            Ver detalhes
          </CollapsibleTrigger>

          <CollapsibleContent>
            <ul>
              <li className="flex items-center mt-1 text-slate-500">
                <User className="mr-2 h-4 w-4" />
                <span className="text-sm">Mike Ross</span>
              </li>

              <li className="flex items-center mt-1 text-slate-500">
                <Clock className="mr-2 h-4 w-4" />
                <span className="text-sm">Criada em {dayjs().format('DD/MM/YYYY - HH:mm')}</span>
              </li>

              <li className="flex items-center mt-1 text-slate-500">
                <Clock className="mr-2 h-4 w-4" />
                <span className="text-sm">Atualizada em {dayjs().format('DD/MM/YYYY - HH:mm')}</span>
              </li>
            </ul>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>

      <CardFooter className="py-3 px-4 pt-0 justify-end">
        <Button variant='link' size='sm' className="p-0 h-min hover:no-underline">
          <Check className="w-4 h-4 mr-2" />
          Marcar como pronto
        </Button>
      </CardFooter>
    </Card>
  )
}

function SchedulesList() {
  return (
    <ul className="mt-2 flex flex-col gap-3 w-full">
      <li>
        <ScheduleListItem />
      </li>
      <li>
        <ScheduleListItem />
      </li>
      <li>
        <ScheduleListItem />
      </li>
      <li>
        <ScheduleListItem />
      </li>
    </ul>
  )
}

export function Schedules() {
  return (
    <div className="mt-2 flex flex-col items-center">
      <SchedulesList />

      <Button
        className="mt-4 w-fit mx-auto text-primary"
        variant='ghost'
      // onClick={loadMore}
      >
        Carregar mais
      </Button>
    </div>
  )
}