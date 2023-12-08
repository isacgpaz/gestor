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
import { ChevronRight, Loader2, MenuSquare, Pencil, SearchX, Trash } from "lucide-react"

export function WalletsTable() {
  const { walletsList, isLoading } = usePoints()

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
            <TableHead className="w-[200px]">Cliente</TableHead>
            <TableHead className="text-right">Pts</TableHead>
            <TableHead className="w-5"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {wallets.map((wallet) => (
            <TableRow key={wallet.id}>
              <TableCell className="font-medium">{wallet.customer.name}</TableCell>
              <TableCell className="text-right">{wallet.points}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <ChevronRight />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <MenuSquare className="mr-2 h-4 w-4" />
                      <span>Detalhes</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Pencil className="mr-2 h-4 w-4" />
                      <span>Editar</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-red-500">
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
      <form className="space-y-4 mt-6">
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