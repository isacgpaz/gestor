'use client'

import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { usePoints } from "@/contexts/points-context"
import { zodResolver } from "@hookform/resolvers/zod"
import { useDebounce } from '@uidotdev/usehooks'
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { formatRelativeTime } from "@/utils/format-relative-date"
import { ChevronRight, Loader2, SearchX, Trash, Trophy } from "lucide-react"

export function WalletsTable() {
  const {
    isLoading,
    walletsList,
    setSelectedWallet,
    setIsIdentifyUserModalOpen,
    setIsDeleteWalletModalOpen
  } = usePoints()

  const wallets = walletsList.result

  if (isLoading) {
    return (
      <div className="mt-6 flex items-center justify-center">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        <span>Buscando clientes...</span>
      </div>
    )
  }

  if (wallets.length) {
    return (
      <Table className="mt-6">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Cliente</TableHead>
            <TableHead className="text-right">Pts</TableHead>
            <TableHead className="w-5"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {wallets.map((wallet) => (
            <TableRow key={wallet.id}>
              <TableCell className="flex flex-col">
                <span
                  className="font-medium cursor-pointer"
                  onClick={() => {
                    setSelectedWallet(wallet)
                    setIsIdentifyUserModalOpen(true)
                  }}
                >
                  {wallet.customer.name}
                </span>

                <span className="text-slate-500 text-xs">
                  Última atualização: {formatRelativeTime(wallet.updatedAt)}
                </span>
              </TableCell>
              <TableCell className="text-right">{wallet.points}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <ChevronRight />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                      setSelectedWallet(wallet)
                      setIsIdentifyUserModalOpen(true)
                    }}>
                      <Trophy className="mr-2 h-4 w-4" />
                      <span>Adicionar pontos</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-red-500"
                      onClick={() => {
                        setSelectedWallet(wallet)
                        setIsDeleteWalletModalOpen(true)
                      }}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      <span>Excluir</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  return (
    <div className="mt-6 flex flex-col items-center justify-center gap-2 text-slate-500">
      <SearchX />
      <span className="text-sm">Nenhuma carteira encontrada.</span>
    </div>
  )
}

const formSchema = z.object({ search: z.string() })

type FormSchema = z.infer<typeof formSchema>

function WalletsSearch() {
  const { updateFilters } = usePoints()

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: "",
    },
  })

  const { watch } = form

  const search = useDebounce(watch('search'), 300)

  useEffect(() => {
    updateFilters({
      search
    })
  }, [search, updateFilters])

  return (
    <Form {...form}>
      <form className="space-y-4 mt-4">
        <FormField
          control={form.control}
          name="search"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} placeholder="Procurar clientes..." type='search' />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}

export function Wallets() {
  const { updateFilters, filters, walletsList } = usePoints()

  const hasNextPage = walletsList.meta.hasNextPage

  function loadMore() {
    updateFilters({
      page: filters.page + 1,
    })
  }

  return (
    <div className="px-4 flex flex-col">
      <h1 className="mt-6 font-medium text-xl">Carteiras</h1>

      <WalletsSearch />
      <WalletsTable />

      {hasNextPage && (
        <Button
          className="mt-4 w-fit mx-auto text-primary"
          variant='ghost'
          onClick={loadMore}
        >
          Carregar mais
        </Button>
      )}
    </div>
  )
}