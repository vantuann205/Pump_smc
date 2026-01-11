'use client'

import { Wallet, LogOut, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { useWalletContext } from '@/contexts/WalletContext'

export default function BrowserWalletConnect() {
  const { 
    wallet, 
    connected, 
    connecting, 
    walletAddress, 
    balance, 
    connectWallet, 
    disconnect, 
    availableWallets 
  } = useWalletContext()
  
  const [copied, setCopied] = useState(false)

  const handleConnectWallet = async (walletName: string) => {
    try {
      await connectWallet(walletName)
    } catch (error: any) {
      alert(`Error connecting to ${walletName}: ${error.message}`)
    }
  }

  const loadAvailableWallets = async () => {
    // This will be handled by the context, just trigger a re-render
    window.location.reload()
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

  // If wallet is connected
  if (connected && walletAddress) {
    return (
      <div className="flex items-center space-x-4">
        {/* Wallet Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <Wallet className="w-4 h-4 text-green-600" />
            <div className="text-sm">
              <div className="font-medium text-green-900">
                {balance} ADA
              </div>
              <div className="text-green-700 flex items-center space-x-1">
                <span>{formatAddress(walletAddress)}</span>
                <button
                  onClick={copyAddress}
                  className="hover:text-green-800 transition-colors"
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-green-600" />
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

  // If no wallets available
  if (availableWallets.length === 0) {
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={loadAvailableWallets}
          className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          <Wallet className="w-4 h-4" />
          <span>Không tìm thấy ví</span>
        </button>
        <div className="text-xs text-gray-500">
          Vui lòng cài Nami, Eternl, Flint...
        </div>
      </div>
    )
  }

  // Show available wallets
  return (
    <div className="flex items-center space-x-2">
      {availableWallets.slice(0, 3).map((walletInfo) => (
        <button
          key={walletInfo.name}
          onClick={() => handleConnectWallet(walletInfo.name)}
          disabled={connecting}
          className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {walletInfo.icon && (
            <img 
              src={walletInfo.icon} 
              alt={walletInfo.name} 
              className="w-4 h-4"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          )}
          <Wallet className="w-4 h-4" />
          <span>
            {connecting ? 'Đang kết nối...' : `Kết nối ${walletInfo.name}`}
          </span>
        </button>
      ))}
      
      <div className="text-xs text-gray-500">
        {availableWallets.length} ví có sẵn
      </div>
    </div>
  )
}