import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@prisma/client";

type GreetingsProps = {
  user: User | undefined
}

export async function Greetings({ user }: GreetingsProps) {
  return (
    <div>
      <div className="flex gap-3 items-center">
        <Avatar className="w-14 h-14">
          <AvatarImage src='' alt={user?.name} />
          <AvatarFallback>{user?.name}</AvatarFallback>
        </Avatar>

        <div>
          <span className="text-slate-500 text-xs">Olá,</span>
          <span className="font-medium block">{user?.name}</span>
        </div>
      </div>
    </div>
  )
}