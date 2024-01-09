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
import { useToast } from "@/components/ui/use-toast"
import { signup } from "@/services/auth/signup"
import { User } from "@prisma/client"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { FcGoogle } from "react-icons/fc"

const formSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  email: z.string().email("Por favor, digite um e-mail válido."),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
})

type FormSchema = z.infer<typeof formSchema>

function useSignupForm() {
  const router = useRouter()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: ""
    },
  })

  async function onSubmit(values: FormSchema) {
    setIsLoading(true)

    await signup(values).then(async (response) => {
      if (response.ok) {
        const user = await response.json() as User;

        signIn('credentials', {
          email: user.email,
          password: values.password
        })
      } else {
        toast({
          title: 'Ops, algo não saiu como o esperado.',
          description: 'Ocorreu um erro ao criar conta. Tente novamente mais tarde.',
          variant: 'destructive',
        })
      }
    }).catch((e) => {
      console.error(e)
    }).finally(() => {
      setIsLoading(false)
    })
  }

  return {
    form,
    onSubmit,
    isLoading
  }
}

export function SignupForm() {
  const { form, onSubmit, isLoading } = useSignupForm();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
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

        <Button type="submit" className="w-full" size='lg' isLoading={isLoading}>
          Criar conta
        </Button>


        <div className="flex items-center justify-center gap-3 text-slate-500">
          <hr className="w-full bg-slate-500" />
          <span>ou</span>
          <hr className="w-full bg-slate-500" />
        </div>

        <Button
          type="button"
          variant='secondary'
          className="w-full"
          size='lg'
          isLoading={isLoading}
          onClick={() => signIn('google')}
        >
          <FcGoogle className="mr-2 h-4 w-4" />
          Entrar com o Google
        </Button>
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