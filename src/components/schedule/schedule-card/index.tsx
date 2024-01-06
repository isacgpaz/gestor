'use client'

import { Card } from "@/components/ui/card";
import { ScheduleProvider, useSchedule } from "@/contexts/schedule-context";
import { Company } from "@prisma/client";
import { AdditionalInfoStep } from "../additional-info-step";
import { DateStep } from "../date-step";
import { PeopleAmmountStep } from "../people-ammount-step";
import { ResumeStep } from "../resume-step";

const scheduleSteps = [
  <DateStep key='date' />,
  <PeopleAmmountStep key='people-ammount' />,
  <AdditionalInfoStep key='additional-info' />,
  <ResumeStep key='resume' />,
]

function ScheduleSteps() {
  const { step } = useSchedule()

  return scheduleSteps[step]
}

export function ScheduleCard({ company }: { company: Company }) {
  return (
    <ScheduleProvider company={company}>
      <Card className="p-0 w-full max-w-xs mx-auto mt-6">
        <ScheduleSteps />
      </Card>
    </ScheduleProvider>
  )
}