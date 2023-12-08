import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCompany } from "@/contexts/company-context";

export function CompanyHeader() {
  const { company } = useCompany()

  return (
    <div className="flex flex-col gap-3 items-center mt-4">
      <Avatar className="w-24 h-24">
        <AvatarImage src='' alt={company?.name} />
        <AvatarFallback>{company?.name}</AvatarFallback>
      </Avatar>

      <div className="text-center">
        <span className="font-medium block text-xl">{company?.name}</span>

        {company?.slogan && (
          <span className="text-slate-500 text-lg">{company.slogan}</span>
        )}
      </div>
    </div>
  )
}