import { Schedules } from "@/components/admin/schedules";
import { NavHeader } from "@/components/common/nav-header";
import { serverSession } from "@/lib/auth/server";

export default async function Agenda() {
  const session = await serverSession()

  const user = session?.user

  return (
    <div className="p-6 flex flex-col min-h-screen">
      <NavHeader backHref="/admin/dashboard" title="Agenda" />

      <Schedules user={user} />
    </div>
  )
}