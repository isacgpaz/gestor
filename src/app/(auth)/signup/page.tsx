import { NavHeader } from "@/components/common/nav-header";
import Image from "next/image";
import { SignupForm } from "./form";

export default function SignupPage() {
  return (
    <main className='p-6 pb-12 min-h-screen relative flex flex-col'>
      <NavHeader backHref="/" />

      <div className="w-full flex flex-col  flex-1">
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

        <SignupForm />
      </div>

      <footer className='text-center text-slate-500 text-sm'>
        Desenvolvido por <span className='font-medium'>Isac Paz</span>
      </footer>
    </main>
  )
}