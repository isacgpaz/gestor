'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { links } from "@/constants/links"
import { findWallets } from "@/services/wallet/find"
import { User } from "@prisma/client"
import { Loader2, Send, Star, Trophy, Wallet2 } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"

type CustomerWalletsItem = {
  slug: string,
  name: string,
  phone: string,
  isFavorite: boolean
}

function CustomerWalletsItem({ name, slug, phone, isFavorite }: CustomerWalletsItem) {
  return (
    <Card className="p-0">
      <CardContent className="py-3 px-4 flex justify-between items-center gap-4">
        <div>
          <div className="flex items-center">
            <span className="block">{name}</span>

            {isFavorite && <Star className="ml-1 h-4 2-4 text-yellow-500" />}
          </div>
          <span className="text-slate-500 text-sm">O melhor rodízio do Cariri</span>
        </div>

        <Avatar className="w-14 h-14">
          <AvatarImage src='' alt={name} />
          <AvatarFallback>{name}</AvatarFallback>
        </Avatar>
      </CardContent>

      <CardFooter className="p-0 flex items-center gap-3 border-t">
        <Button variant="ghost" className="w-full rounded-none hover:text-primary" asChild>
          <a href={`${links.WHATSAPP}${phone}&text=Olá, vim pelo Gestor`} target="_blank">
            <Send className="mr-2 h-4 w-4" />
            <span>WhatsApp</span>
          </a>
        </Button>
        <Button variant="ghost" className="w-full rounded-none hover:text-primary" asChild>

          <Link href={`/company/${slug}`}>
            <Trophy className="mr-2 h-4 w-4" />
            <span>Abrir carteira</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

type CustomerWalletsProps = {
  user: User | undefined
}

function CustomerWalletsList({ user }: CustomerWalletsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [customerWallets, setCustomerWallets] = useState<any[]>([])

  const getCustomerWallets = useCallback(async () => {
    if (user) {
      setIsLoading(true)

      await findWallets({
        page: 1,
        customerId: user?.id
      }).then(async (response) => {
        if (response.ok) {
          const data = await response.json()

          setCustomerWallets(data.result)
        }
      }).catch((e) => {
        console.error(e)
      }).finally(() => {
        setIsLoading(false)
      })
    }
  }, [user])

  useEffect(() => {
    getCustomerWallets()
  }, [getCustomerWallets])

  if (isLoading) {
    return (
      <div className="mt-6 flex items-center justify-center">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        <span>Buscando carteiras...</span>
      </div>
    )
  }

  if (customerWallets.length === 0) {
    return (
      <div className="mt-6 flex flex-col items-center justify-center gap-2 text-slate-500">
        <Wallet2 />
        <span className="text-sm">Parece que você ainda não possui nenhuma carteira.</span>

        <Button className="mt-4">Explorar lugares</Button>
      </div>
    )
  }

  return (
    <ul className="mt-4 grid grid-cols-1 gap-4">
      {customerWallets.map((wallet) => (
        <li key={wallet.id}>
          <CustomerWalletsItem
            name={wallet.company.name}
            slug={wallet.company.slug}
            phone={wallet.company.phone}
            isFavorite
          />
        </li>
      ))}

    </ul>
  )
}

export function CustomerWallets({ user }: CustomerWalletsProps) {
  return (
    <div className="flex flex-col">
      <h1 className="mt-6 font-medium text-xl">Minhas carteiras</h1>

      <CustomerWalletsList user={user} />
    </div>
  )
}