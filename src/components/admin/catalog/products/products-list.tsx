'use client'

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { zodResolver } from "@hookform/resolvers/zod"
import { useDebounce } from "@uidotdev/usehooks"
import { Filter } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const items = [
  {
    id: "recents",
    label: "Recents",
  },
  {
    id: "home",
    label: "Home",
  },
  {
    id: "applications",
    label: "Applications",
  },
  {
    id: "desktop",
    label: "Desktop",
  },
  {
    id: "downloads",
    label: "Downloads",
  },
  {
    id: "documents",
    label: "Documents",
  },
] as const

const formSchema = z.object({
  search: z.string().optional(),
  groups: z.array(z.string())
})

type FormSchema = z.infer<typeof formSchema>

export function ProductsList() {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: '',
      groups: [],
    },
  })

  const search = form.watch('search')
  const groups = form.watch('groups')

  const debouncedSearch = useDebounce(search, 300)

  return (
    <section className="mt-4 px-6">
      <header className="flex">
        <h2 className="font-medium text-lg">
          Produtos
        </h2>
      </header>

      <div className="flex gap-2">
        <Form {...form}>
          <form className="space-y-3 mt-2 w-full">
            <div className="flex max-w-md mx-auto w-full items-end space-x-2">
              <FormField
                control={form.control}
                name="search"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Procurar produtos..."
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Popover>
                <PopoverTrigger asChild>
                  <Button size="icon" className="w-12">
                    <Filter className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-48 mt-2" align='end'>
                  <FormField
                    control={form.control}
                    name="groups"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-sm">Filtrar por grupo:</FormLabel>

                        {items.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="groups"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, item.id])
                                          : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== item.id
                                            )
                                          )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {item.label}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </FormItem>
                    )}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </form>
        </Form>
      </div>
    </section>
  )
}