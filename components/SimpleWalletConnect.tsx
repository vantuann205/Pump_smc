'use client'

import { useWallet } from '@meshsdk/react'
import { Wallet } from 'lucide-react'

export default function SimpleWalletConnect() {
  const { connected, connecting, connect, disconnect, wallet } = useWallet()

  const handleConnect = async () => {
    console.log('🔥 BUTTON CLICKED!')
    
    // Check available wallets
    if (typeof window !== 'undefined') {
      const wallets = []
      if (window.cardano?.nami) wallets.push('Nami')
      if (window.cardano?.eternl) wallets.push('Eternl')
      if (window.cardano?.flint) wallets.push('Flint')
      if (window.cardano?.typhon) wallets.push('Typhon')
      console.log('🔥 Available wallets:', wallets)
      console.log('🔥 Window.cardano keys:', Object.keys(window.cardano || {}))
    }
    
    try {
      console.log('🔥 Calling Mesh connect()...')
      await connect()
      console.log('🔥 Mesh connect successful!')
    } catch (error) {
      console.error('🔥 Mesh connect error:', error)
    }
  }

  const handleDirectNami = async () => {
    console.log('🔥 TESTING DIRECT NAMI CONNECTION!')
    try {
      if (typeof window !== 'undefined' && window.cardano?.nami) {
        console.log('🔥 Nami detected, calling enable()...')
        const namiApi = await window.cardano.nami.enable()
        console.log('🔥 Nami API enabled:', namiApi)
        
        const address = await namiApi.getChangeAddress()
        console.log('🔥 Nami address:', address)
        
        const utxos = await namiApi.getUtxos()
        console.log('🔥 Nami UTXOs count:', utxos?.length || 0)
        
        alert(`Nami connected! Address: ${address.slice(0, 20)}...`)
      } else {
        console.log('🔥 Nami NOT FOUND in window.cardano')
        alert('Nami wallet not found! Please install Nami extension.')
      }
    } catch (error) {
      console.error('🔥 Direct Nami error:', error)
      alert('Error connecting to Nami: ' + error.message)
    }
  }

  console.log('🔥 Render - Wallet state:', { connected, connecting, hasWallet: !!wallet })

  if (connected && wallet) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-green-600 font-medium">✅ Ví đã kết nối!</span>
        <button
          onClick={disconnect}
          className="ml-2 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
        >
          Ngắt kết nối
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleConnect}
        disabled={connecting}
        className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
      >
        <Wallet className="w-4 h-4" />
        <span>
          {connecting ? 'Đang kết nối...' : 'Kết nối ví (Mesh)'}
        </span>
      </button>
      
      <button
        onClick={handleDirectNami}
        className="px-4 py-2 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 font-medium"
      >
        Test Nami Direct
      </button>
    </div>
  )
}

// Extend window type for Cardano wallets
declare global {
  interface Window {
    cardano?: {
      nami?: any
      eternl?: any
      flint?: any
      typhon?: any
      gerowallet?: any
    }
  }
}