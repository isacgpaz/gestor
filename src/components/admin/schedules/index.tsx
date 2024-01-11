'use client'

import { DatePicker } from "@/components/common/date-picker"
import { Loader } from "@/components/common/loader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useMarkScheduleAsFinished } from "@/hooks/schedule/use-mark-schedule-as-finished"
import { useMarkScheduleAsReady } from "@/hooks/schedule/use-mark-schedule-as-ready"
import { useSchedulesMeta } from "@/hooks/schedule/use-schedule-meta"
import { useSchedules } from "@/hooks/schedule/use-schedules"
import { dayjs } from "@/lib/dayjs"
import { queryClient } from "@/lib/query-client"
import { cn } from "@/lib/utils"
import { formatPhone } from "@/utils/format-phone"
import { Company, Schedule, ScheduleStatus, User as UserType } from "@prisma/client"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { Check, ChevronDown, ClipboardEdit, Clock, FileText, MoreVertical, Phone, SearchX, Trash, Users } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

const scheduleStatus = {
  PENDING: 'PENDENTE',
  READY: 'PRONTA',
  FINISHED: 'FINALIZADA',
}

function ScheduleListItem({ schedule }: { schedule: Schedule }) {
  const { toast } = useToast()

  const {
    mutate: markAsReady,
    isPending: isMarkAsReadyPending
  } = useMarkScheduleAsReady()

  const {
    mutate: markAsFinished,
    isPending: isMarkAsFinishedPending
  } = useMarkScheduleAsFinished()

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
            schedule.status === ScheduleStatus.FINISHED && 'bg-sky-700',
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
                      {dayjs(schedule?.updatedAt).format('DD/MM/YYYY [às] HH:mm')}
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
          <Button
            variant='link'
            size='sm'
            className="p-0 h-min hover:no-underline"
            onClick={() => markAsReady(schedule.id, {
              onSuccess() {
                queryClient.invalidateQueries({
                  queryKey: ['schedules']
                })

                queryClient.invalidateQueries({
                  queryKey: ['schedules-meta']
                })

                toast({
                  title: 'A reserva foi marcada como pronta.',
                  variant: 'default',
                })
              }
            })}
            isLoading={isMarkAsReadyPending}
          >
            <Check className="w-4 h-4 mr-2" />
            Marcar como pronta
          </Button>
        )}

        {schedule.status === ScheduleStatus.READY && (
          <Button
            variant='link'
            size='sm'
            className="p-0 h-min hover:no-underline"
            onClick={() => markAsFinished(schedule.id, {
              onSuccess() {
                queryClient.invalidateQueries({
                  queryKey: ['schedules']
                })

                queryClient.invalidateQueries({
                  queryKey: ['schedules-meta']
                })

                toast({
                  title: 'A reserva foi marcada como finalizada.',
                  description: 'O horário da reserva agora está disponível para um novo agendamento.',
                  variant: 'default',
                })
              }

            })}
            isLoading={isMarkAsFinishedPending}
          >
            <Check className="w-4 h-4 mr-2" />
            Marcar como finalizado
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

type SchedulesListProps = {
  schedules?: Schedule[],
  hasNextPage?: boolean,
  isFetchingNextPage?: boolean,
  fetchNextPage?: () => void
}

function SchedulesList({
  schedules,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage
}: SchedulesListProps) {
  if (schedules?.length) {
    return (
      <>
        <ul className="mt-2 flex flex-col gap-3 w-full">
          {schedules?.map((schedule) => (
            <li key={schedule.id}>
              <ScheduleListItem schedule={schedule} />
            </li>
          ))}
        </ul>

        {hasNextPage && (
          <div className="w-full flex items-center justify-center">
            <Button
              className="mt-4 w-fit text-primary"
              variant='ghost'
              onClick={fetchNextPage}
              isLoading={isFetchingNextPage}
            >
              Carregar mais
            </Button>
          </div>
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
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [count, setCount] = useState(0)

  const isInitialDataReady = count > 1

  const {
    data: schedulesResponse,
    isPending: isSchedulesPending,
    isSuccess: isSchedulesSuccess,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useSchedules({
    status,
    startDate: dayjs(date).format('YYYY-MM-DD'),
    companyId: user?.company.id,
    setCount
  })

  useEffect(() => {
    setCount(0)
  }, [status, date, user?.company.id])

  const {
    data: schedulesMeta,
    isPending: isSchedulesMetaPending,
    isSuccess: isSchedulesMetaSuccess,
  } = useSchedulesMeta({
    startDate: dayjs(date).format('YYYY-MM-DD'),
    companyId: user?.company.id,
  })

  const isPending = isSchedulesPending || isSchedulesMetaPending
  const isSuccess = isSchedulesSuccess || isSchedulesMetaSuccess

  const notificationSound = useMemo(
    () => new Audio('/sound/notification.wav'),
    []
  )

  useEffect(() => {
    if (isSchedulesSuccess) {
      setSchedules(schedulesResponse.pages.map((page) => page.result).flat())
    }

  }, [isSchedulesSuccess, schedulesResponse])

  useEffect(() => {
    if (isSchedulesSuccess) {
      const schedulesResults = schedulesResponse?.pages.map(
        (page) => page.result
      ).flat() ?? []

      schedulesResults.forEach(scheduleResultItem => {
        if (
          isInitialDataReady
          && scheduleAlreadyExists(scheduleResultItem, schedules)
        ) {
          notificationSound.play()
        }
      });
    }
  }, [schedules, schedulesResponse, isInitialDataReady, notificationSound, isSchedulesSuccess])

  function scheduleAlreadyExists(
    schedule: Schedule,
    schedules: Schedule[]
  ) {
    return !schedules.some(({ id }) => id === schedule.id);
  }

  return (
    <Tabs
      defaultValue="account"
      className="w-full flex flex-col flex-1"
      value={status}
      onValueChange={(value) => setStatus(value as ScheduleStatus)}
    >
      <TabsList className="w-full flex gap-1">
        <TabsTrigger value={ScheduleStatus.PENDING} className="text-xs px-1">
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

        <TabsTrigger value={ScheduleStatus.READY} className="text-xs px-1">
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

        <TabsTrigger value={ScheduleStatus.FINISHED} className="text-xs px-1">
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
        {isPending ? (
          <Loader label="Carregando reservas..." />
        ) : (
          <SchedulesList
            schedules={schedules}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
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