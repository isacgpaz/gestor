import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <main className='p-6 pb-12 min-h-screen relative flex flex-col'>
      <div className="w-full flex flex-col items-center justify-center flex-1">
        <div className="mx-auto w-fit mt-6">
          <Image
            src="/logo.svg"
            alt="Gestor Logo"
            className="dark:invert"
            width={150}
            height={36}
            priority
          />
        </div>

        <span className='text text-lg text-center text-slate-500 mt-4'>
          A experiência que você merece.
        </span>

        <div className='flex flex-col gap-4 w-full mt-10 max-w-sm mb-28'>
          <Button size='lg' className='w-full' asChild>
            <Link href='/signin'>
              Entrar
            </Link>
          </Button>

          <div className='flex items-center justify-center gap-2'>
            <hr className='w-full bg-slate-500' />
            <span className='text-slate-500'>ou</span>
            <hr className='w-full bg-slate-500' />
          </div>

          <Button size='lg' variant='secondary' className='w-full' asChild>
            <Link href='/signup'>
              Criar conta
            </Link>
          </Button>
        </div>
      </div>

      <footer className='text-center text-slate-500 text-sm'>
        Desenvolvido por <span className='font-medium'>Isac Paz</span>
      </footer>
    </main>
  )
}
