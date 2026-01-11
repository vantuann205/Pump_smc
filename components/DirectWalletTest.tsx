'use client'

import { Wallet } from 'lucide-react'
import { useState } from 'react'

export default function DirectWalletTest() {
  const [connected, setConnected] = useState(false)
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)

  const testNami = async () => {
    console.log('🔥 TESTING NAMI WALLET DIRECT!')
    setLoading(true)
    
    try {
      if (typeof window === 'undefined') {
        throw new Error('Window not available')
      }

      console.log('🔥 Checking window.cardano...')
      console.log('🔥 window.cardano:', window.cardano)
      
      if (!window.cardano) {
        throw new Error('window.cardano not found - No Cardano wallets installed')
      }

      console.log('🔥 Available cardano wallets:', Object.keys(window.cardano))

      if (!window.cardano.nami) {
        throw new Error('Nami wallet not found - Please install Nami extension')
      }

      console.log('🔥 Nami found! Calling enable()...')
      const namiApi = await window.cardano.nami.enable()
      console.log('🔥 Nami API:', namiApi)

      console.log('🔥 Getting address...')
      const walletAddress = await namiApi.getChangeAddress()
      console.log('🔥 Address:', walletAddress)

      console.log('🔥 Getting UTXOs...')
      const utxos = await namiApi.getUtxos()
      console.log('🔥 UTXOs count:', utxos?.length || 0)

      setAddress(walletAddress)
      setConnected(true)
      
      alert(`🎉 NAMI CONNECTED SUCCESSFULLY!\nAddress: ${walletAddress.slice(0, 30)}...\nUTXOs: ${utxos?.length || 0}`)

    } catch (error) {
      console.error('🔥 Error:', error)
      alert(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testEternl = async () => {
    console.log('🔥 TESTING ETERNL WALLET!')
    setLoading(true)
    
    try {
      if (!window.cardano?.eternl) {
        throw new Error('Eternl wallet not found - Please install Eternl extension')
      }

      const eternlApi = await window.cardano.eternl.enable()
      const walletAddress = await eternlApi.getChangeAddress()
      
      setAddress(walletAddress)
      setConnected(true)
      
      alert(`🎉 ETERNL CONNECTED!\nAddress: ${walletAddress.slice(0, 30)}...`)

    } catch (error) {
      console.error('🔥 Eternl Error:', error)
      alert(`❌ Eternl Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const disconnect = () => {
    setConnected(false)
    setAddress('')
    console.log('🔥 Disconnected')
  }

  if (connected) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-green-600 font-medium">✅ Wallet Connected!</span>
        <span className="text-xs text-gray-500">{address.slice(0, 20)}...</span>
        <button
          onClick={disconnect}
          className="ml-2 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={testNami}
        disabled={loading}
        className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
      >
        <Wallet className="w-4 h-4" />
        <span>
          {loading ? 'Testing...' : 'Test Nami'}
        </span>
      </button>
      
      <button
        onClick={testEternl}
        disabled={loading}
        className="px-4 py-2 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 font-medium"
      >
        Test Eternl
      </button>
    </div>
  )
}

// Extend window type
declare global {
  interface Window {
    cardano?: {
      nami?: any
      eternl?: any
      flint?: any
      typhon?: any
    }
  }
}