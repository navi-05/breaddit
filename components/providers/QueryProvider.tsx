'use client'

import { QueryClientProvider, QueryClient } from '@tanstack/react-query'

const QueryProvider = ({children}: { children: React.ReactNode}) => {
  const queryClient = new QueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

export default QueryProvider