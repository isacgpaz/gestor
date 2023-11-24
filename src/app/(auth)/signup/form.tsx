"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Link from "next/link"

const formSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  email: z.string().email("Por favor, digite um e-mail válido."),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
})

type FormSchema = z.infer<typeof formSchema>

export function SignupForm() {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: ""
    },
  })

  function onSubmit(values: FormSchema) {
    console.log(values)
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6 max-w-sm mx-auto w-full">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input type='password' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" size='lg'>Criar conta</Button>
      </form>

      <div className="flex justify-between items-center gap-4 mt-4">
        <Button className="text-primary p-0" variant='link' asChild>
          <Link href='/signin'>
            Ir para o login
          </Link>
        </Button>
      </div>
    </Form>
  )
}