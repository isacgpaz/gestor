import { Schedules } from "@/components/admin/schedules";
import { NavHeader } from "@/components/common/nav-header";
import { serverSession } from "@/lib/auth/server";

export default async function Agenda() {
  const session = await serverSession()

  const user = session?.user

  return (
    <div className="p-6 flex flex-col min-h-screen">
      <NavHeader backHref="/admin/dashboard" title="Agenda" />

      <div className="flex flex-col flex-1 mt-6 w-full">
        <span className="block mb-2 text-sm text-slate-500">
          Para visualizar os agendamentos selecione uma data abaixo.
        </span>

        <Schedules user={user} />
      </div>
    </div>
  )
}