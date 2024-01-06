'use client'

import { Card } from "@/components/ui/card";
import { CreateScheduleProvider, useCreateScheduleContext } from "@/contexts/create-schedule-context";
import { Agenda, Company, Schedule } from "@prisma/client";
import { AdditionalInfoStep } from "../additional-info-step";
import { DateStep } from "../date-step";
import { PeopleAmmountStep } from "../people-ammount-step";
import { ResumeStep } from "../resume-step";
import { StatusAlert } from "../status-alert";

const scheduleSteps = [
  <DateStep key='date' />,
  <PeopleAmmountStep key='people-ammount' />,
  <AdditionalInfoStep key='additional-info' />,
  <ResumeStep key='resume' />,
]

function ScheduleSteps() {
  const { step } = useCreateScheduleContext()

  return scheduleSteps[step]
}

export function ScheduleCard({
  company,
  schedule
}: {
  company: Company & { agenda: Agenda },
  schedule?: Schedule
}) {
  return (
    <CreateScheduleProvider
      company={company}
      schedule={schedule ? {
        adultsAmmount: schedule?.adultsAmmount,
        contact: schedule?.contact,
        additionalInfo: schedule?.additionalInfo ?? undefined,
        kidsAmmount: schedule?.kidsAmmount,
        date: schedule?.startDate,
        time: schedule?.endDate,
        id: schedule?.id,
      } : undefined}
    >
      <StatusAlert schedule={schedule} />

      <Card className="p-0 w-full max-w-xs mx-auto mt-6">
        <ScheduleSteps />
      </Card>
    </CreateScheduleProvider>
  )
}