import { Card } from "@/components/ui/card";
import { useSchedule } from "@/contexts/schedule-context";
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

export function ScheduleCard() {
  const { step } = useSchedule()

  return (
    <Card className="p-0 w-full max-w-xs mx-auto">
      {scheduleSteps[step]}
    </Card>
  )
}