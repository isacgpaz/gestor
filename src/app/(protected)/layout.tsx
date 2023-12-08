import { BottomBar } from "@/components/common/bottom-bar";
import { serverSession } from "@/lib/auth/server";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await serverSession()

  const user = session?.user



  return (
    <div className="flex flex-col relative min-h-screen">
      <main className="flex-1">
        {children}
      </main>

      {user && <BottomBar user={user} />}
    </div>
  )
}