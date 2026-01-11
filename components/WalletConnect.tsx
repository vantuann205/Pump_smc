'use client'

import { useWallet } from '@meshsdk/react'
import { useState, useEffect } from 'react'
import { Wallet, LogOut, Copy, Check } from 'lucide-react'

export default function WalletConnect() {
  const { wallet, connected, connecting, connect, disconnect } = useWallet()
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [balance, setBalance] = useState<string>('0')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  // Debug logs
  console.log('🔥 WalletConnect render:', { connected, connecting, wallet: !!wallet })

  useEffect(() => {
    if (connected && wallet) {
      loadWalletInfo()
    }
  }, [connected, wallet])

  const loadWalletInfo = async () => {
    if (!wallet) return
    
    setLoading(true)
    try {
      const address = await wallet.getChangeAddress()
      setWalletAddress(address)
      
      const utxos = await wallet.getUtxos()
      const totalLovelace = utxos.reduce((sum, utxo) => {
        const lovelaceAmount = utxo.output.amount.find(a => a.unit === 'lovelace')
        return sum + parseInt(lovelaceAmount?.quantity || '0')
      }, 0)
      
      setBalance((totalLovelace / 1_000_000).toFixed(2))
    } catch (error) {
      console.error('Error loading wallet info:', error)
      setBalance('0')
    } finally {
      setLoading(false)
    }
  }

  const copyAddress = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatAddress = (address: string) => {
    if (!address) return ''
    return `${address.slice(0, 8)}...${address.slice(-8)}`
  }

  const handleConnect = async () => {
    console.log('🔥 Button clicked! Attempting to connect wallet...')
    try {
      console.log('🔥 Calling connect() function...')
      await connect()
      console.log('🔥 Connect function completed!')
    } catch (error) {
      console.error('🔥 Error connecting wallet:', error)
    }
  }

  if (connected && wallet) {
    return (
      <div className="flex items-center space-x-4">
        {/* Wallet Info */}
        <div className="bg-gray-50 rounded-lg px-4 py-2">
          <div className="flex items-center space-x-2">
            <Wallet className="w-4 h-4 text-gray-600" />
            <div className="text-sm">
              <div className="font-medium text-gray-900">
                {loading ? 'Loading...' : `${balance} ADA`}
              </div>
              <div className="text-gray-500 flex items-center space-x-1">
                <span>{formatAddress(walletAddress)}</span>
                <button
                  onClick={copyAddress}
                  className="hover:text-gray-700 transition-colors"
                  disabled={!walletAddress}
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Disconnect Button */}
        <button
          onClick={disconnect}
          className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Ngắt kết nối</span>
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleConnect}
      disabled={connecting}
      className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
    >
      <Wallet className="w-4 h-4" />
      <span>
        {connecting ? 'Đang kết nối...' : 'Kết nối ví'}
      </span>
    </button>
  )
}