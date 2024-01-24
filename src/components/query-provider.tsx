'use client'

import { queryClient } from '@/lib/query-client'
import { QueryClientProvider } from '@tanstack/react-query'

export function QueryProvider(props: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {props.children}

      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  )
}
