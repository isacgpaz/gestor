'use client'

import { DatePicker } from "@/components/common/date-picker"
import { Loader } from "@/components/common/loader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSchedulesMeta } from "@/hooks/schedule/use-schedule-meta"
import { SchedulesResponseProps, useSchedules } from "@/hooks/schedule/use-schedules"
import { dayjs } from "@/lib/dayjs"
import { cn } from "@/lib/utils"
import { formatPhone } from "@/utils/format-phone"
import { Company, Schedule, ScheduleStatus, User as UserType } from "@prisma/client"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { InfiniteData } from "@tanstack/react-query"
import { Check, ChevronDown, ClipboardEdit, Clock, FileText, MoreVertical, Phone, SearchX, Trash, Users } from "lucide-react"
import { useState } from "react"

const scheduleStatus = {
  PENDING: 'PENDENTE',
  READY: 'PRONTA',
  FINISHED: 'FINALIZADA',
}

function ScheduleListItem({ schedule }: { schedule: Schedule }) {
  return (
    <Card className="p-0">
      <CardHeader className="flex flex-row items-start justify-between gap-4 p-3">
        <div className="flex flex-wrap gap-2 flex-1">
          <CardTitle className="text-base">
            {schedule.contact.name}
          </CardTitle>

          <Badge variant='outline' className={cn(
            'text-white border-0',
            schedule.status === ScheduleStatus.PENDING && 'bg-orange-400',
            schedule.status === ScheduleStatus.READY && 'bg-primary',
            schedule.status === ScheduleStatus.FINISHED && 'bg-emerald-600',
          )}>
            {scheduleStatus[schedule.status as keyof typeof scheduleStatus]}
          </Badge>
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
        <ul className="text-black">
          <li className="flex items-center mt-1 text-sm">
            <Clock className="mr-2 h-4 w-4" />

            <span className="flex gap-1">
              Hora: {' '}

              <span className="text-slate-500 flex items-center gap-1">
                {dayjs(schedule?.startDate).format('HH:mm')} à {dayjs(schedule?.endDate).format('HH:mm')}
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

        <Collapsible>
          <CollapsibleTrigger className="mt-1 text-sm flex items-center font-medium">
            <ChevronDown className="mr-2 h-4 w-4" strokeWidth={3} />
            Ver detalhes
          </CollapsibleTrigger>

          <CollapsibleContent>
            <ul className="text-black">
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
                <Clock className="mr-2 h-4 w-4" />

                <span className="flex gap-1">
                  Criada em: {' '}

                  <span className="text-slate-500 flex items-center gap-1">
                    {dayjs(schedule?.createdAt).format('DD/MM/YYYY [às] HH:mm')}
                  </span>
                </span>
              </li>

              {schedule.status !== ScheduleStatus.PENDING && (
                <li className="flex items-center mt-1 text-sm">
                  <Clock className="mr-2 h-4 w-4" />

                  <span className="flex gap-1">
                    Atualizada em: {' '}

                    <span className="text-slate-500 flex items-center gap-1">
                      {dayjs(schedule?.updatedAt).format('HH:mm')}
                    </span>
                  </span>
                </li>
              )}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>

      <CardFooter className="py-3 px-4 pt-0 justify-end">
        {schedule.status === ScheduleStatus.PENDING && (
          <Button variant='link' size='sm' className="p-0 h-min hover:no-underline">
            <Check className="w-4 h-4 mr-2" />
            Marcar como pronta
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

type SchedulesListProps = {
  schedulesResponse?: InfiniteData<SchedulesResponseProps, unknown>,
  hasNextPage?: boolean,
  fetchNextPage?: () => void
}

function SchedulesList({
  schedulesResponse,
  hasNextPage,
  fetchNextPage
}: SchedulesListProps) {
  const result = schedulesResponse?.pages.map((page) => page.result).flat()

  if (result?.length) {
    return (
      <>
        <ul className="mt-2 flex flex-col gap-3 w-full">
          {result?.map((schedule) => (
            <li key={schedule.id}>
              <ScheduleListItem schedule={schedule} />
            </li>
          ))}
        </ul>

        {hasNextPage && (
          <Button
            className="mt-4 w-fit mx-auto text-primary"
            variant='ghost'
            onClick={fetchNextPage}
          >
            Carregar mais
          </Button>
        )}
      </>
    )
  }

  return (
    <div className="mt-6 flex flex-col items-center justify-center gap-2 text-slate-500">
      <SearchX />
      <span className="text-sm">Nenhuma reserva encontrada.</span>
    </div>
  )
}

function ScheduleTabs(
  { user, date }: {
    date: Date | undefined,
    user?: UserType & { company: Company }
  }) {
  const [status, setStatus] = useState<ScheduleStatus>(ScheduleStatus.PENDING)

  const {
    data: schedulesResponse,
    isLoading: isSchedulesLoading,
    isSuccess: isSchedulesSuccess,
    fetchNextPage,
    hasNextPage
  } = useSchedules({
    status,
    startDate: dayjs(date).format('YYYY-MM-DD'),
    companyId: user?.company.id,
  })

  const {
    data: schedulesMeta,
    isLoading: isSchedulesMetaLoading,
    isSuccess: isSchedulesMetaSuccess,
  } = useSchedulesMeta({
    startDate: dayjs(date).format('YYYY-MM-DD'),
    companyId: user?.company.id,
  })

  const isLoading = isSchedulesLoading || isSchedulesMetaLoading
  const isSuccess = isSchedulesSuccess || isSchedulesMetaSuccess

  return (
    <Tabs
      defaultValue="account"
      className="w-full flex flex-col flex-1"
      value={status}
      onValueChange={(value) => setStatus(value as ScheduleStatus)}
    >
      <TabsList className="w-full">
        <TabsTrigger value={ScheduleStatus.PENDING}>
          Pendentes

          {(isSuccess && typeof schedulesMeta?.totalPending !== 'undefined') ? (
            <Badge
              variant='secondary'
              className="ml-2 flex items-center justify-center h-5 w-5 text-xs"
            >
              {String(schedulesMeta?.totalPending).padStart(2, '0')}
            </Badge>
          ) : null}
        </TabsTrigger>

        <TabsTrigger value={ScheduleStatus.READY}>
          Prontas

          {(isSuccess && typeof schedulesMeta?.totalReady !== 'undefined') ? (
            <Badge
              variant='secondary'
              className="ml-2 flex items-center justify-center h-5 w-5 text-xs"
            >
              {String(schedulesMeta?.totalReady).padStart(2, '0')}
            </Badge>
          ) : null}
        </TabsTrigger>

        <TabsTrigger value={ScheduleStatus.FINISHED}>
          Finalizadas

          {(isSuccess && typeof schedulesMeta?.totalFinished !== 'undefined') ? (
            <Badge
              variant='secondary'
              className="ml-2 flex items-center justify-center h-5 w-5 text-xs"
            >
              {String(schedulesMeta?.totalFinished).padStart(2, '0')}
            </Badge>
          ) : null}
        </TabsTrigger>
      </TabsList>

      <TabsContent value={status} className="flex flex-col flex-1">
        {isLoading ? (
          <Loader label="Carregando reservas..." />
        ) : (
          <SchedulesList
            schedulesResponse={schedulesResponse}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
          />
        )}
      </TabsContent>
    </Tabs>
  )
}

export function Schedules({ user }: { user?: UserType & { company: Company } }) {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="flex flex-col flex-1 mt-6 w-full">
      <span className="block mb-2 text-sm text-slate-500">
        Para visualizar os agendamentos selecione uma data abaixo.
      </span>

      <DatePicker
        date={date}
        setDate={setDate}
        label="Selecionar data"
      />

      <div className="mt-2 flex flex-1">
        <ScheduleTabs user={user} date={date} />
      </div>
    </div>
  )
}