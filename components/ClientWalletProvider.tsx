'use client'

import { useEffect, useState } from 'react'
import { MeshProvider } from '@meshsdk/react'

export default function ClientWalletProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải Mesh SDK...</p>
        </div>
      </div>
    )
  }

  return (
    <MeshProvider>
      {children}
    </MeshProvider>
  )
}