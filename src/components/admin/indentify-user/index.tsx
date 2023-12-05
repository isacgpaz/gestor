import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";

type IdentifyUserProps = {
  isOpen: boolean,
  onOpenChange(isOpen: boolean): void,
  user: any
}

export function IdentifyUser({ isOpen, onOpenChange, user }: IdentifyUserProps) {
  const [count, setCount] = useState(1)

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-xs">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar pontuação</AlertDialogTitle>
        </AlertDialogHeader>

        <div>
          <div className="flex gap-3 items-center">
            <Avatar className="w-14 h-14">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>

            <div>
              <span className="font-medium text-lg block">Shad Cn</span>

              <span>Pontuação atual: {15} pts</span>
            </div>
          </div>

          <div className="flex gap-4 items-center justify-center mt-4">
            <Button
              variant='outline'
              className="rounded-full p-0 w-8 h-8"
              disabled={count === 1}
              onClick={() => setCount(count - 1)}
            >
              <Minus />
            </Button>

            <span className="font-medium">
              {count}
            </span>

            <Button
              className="rounded-full p-0 w-8 h-8"
              onClick={() => setCount(count + 1)}
            >
              <Plus />
            </Button>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Voltar</AlertDialogCancel>
          <AlertDialogAction>Confirmar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
