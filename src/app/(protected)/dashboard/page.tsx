import { CustomerWallets } from "@/components/customer/customer-wallets";
import { Greetings } from "@/components/customer/greetings";
import { serverSession } from "@/lib/auth/server";

export default async function Dashboard() {
  const session = await serverSession()

  const user = session?.user

  return (
    <div className="p-6 flex flex-col min-h-screen">
      <Greetings user={user} />

      <CustomerWallets user={user} />
    </div>
  )
}