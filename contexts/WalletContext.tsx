'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { BrowserWallet } from '@meshsdk/core'

interface WalletContextType {
  wallet: BrowserWallet | null
  connected: boolean
  connecting: boolean
  walletAddress: string
  balance: string
  connectWallet: (walletName: string) => Promise<void>
  disconnect: () => void
  availableWallets: Array<{
    name: string
    icon: string
    version: string
  }>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<BrowserWallet | null>(null)
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [balance, setBalance] = useState('0')
  const [availableWallets, setAvailableWallets] = useState<Array<{
    name: string
    icon: string
    version: string
  }>>([])

  useEffect(() => {
    loadAvailableWallets()
  }, [])

  const loadAvailableWallets = async () => {
    try {
      console.log('🔥 Loading available wallets...')
      const wallets = await BrowserWallet.getAvailableWallets()
      console.log('🔥 Available wallets:', wallets)
      setAvailableWallets(wallets)
    } catch (error) {
      console.error('🔥 Error loading wallets:', error)
    }
  }

  const connectWallet = async (walletName: string) => {
    console.log(`🔥 Connecting to ${walletName}...`)
    setConnecting(true)
    
    try {
      console.log('🔥 Calling BrowserWallet.enable()...')
      const browserWallet = await BrowserWallet.enable(walletName)
      console.log('🔥 Wallet connected:', browserWallet)
      
      setWallet(browserWallet)
      setConnected(true)
      
      // Get wallet info
      console.log('🔥 Getting wallet address...')
      const address = await browserWallet.getChangeAddress()
      console.log('🔥 Address:', address)
      setWalletAddress(address)
      
      console.log('🔥 Getting wallet balance...')
      const balanceData = await browserWallet.getBalance()
      console.log('🔥 Balance data:', balanceData)
      
      // Calculate ADA balance
      const lovelaceAsset = balanceData.find(asset => asset.unit === 'lovelace')
      const adaBalance = lovelaceAsset ? (parseInt(lovelaceAsset.quantity) / 1_000_000).toFixed(2) : '0'
      setBalance(adaBalance)
      
      console.log('🔥 Wallet connection successful!')
      
    } catch (error) {
      console.error('🔥 Error connecting wallet:', error)
      throw error
    } finally {
      setConnecting(false)
    }
  }

  const disconnect = () => {
    console.log('🔥 Disconnecting wallet...')
    setWallet(null)
    setConnected(false)
    setWalletAddress('')
    setBalance('0')
  }

  return (
    <WalletContext.Provider value={{
      wallet,
      connected,
      connecting,
      walletAddress,
      balance,
      connectWallet,
      disconnect,
      availableWallets
    }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWalletContext() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWalletContext must be used within a WalletProvider')
  }
  return context
}