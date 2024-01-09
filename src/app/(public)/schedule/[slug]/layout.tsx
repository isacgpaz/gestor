import Image from "next/image";

export default function ScheduleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="p-6 min-h-screen flex flex-col gap-6">
      {children}

      <footer className='flex items-center justify-center gap-2 text-slate-500'>
        <span className="text-xs">Oferecido por</span>

        <Image
          src='/logo.svg'
          alt=''
          className="dark:invert w-20"
          width={150}
          height={36}
          priority />
      </footer>
    </div>
  )
}