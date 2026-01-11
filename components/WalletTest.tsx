'use client'

import { useState } from 'react'
import { useWalletContext } from '@/contexts/WalletContext'
import { Wallet, CheckCircle, AlertCircle } from 'lucide-react'

export default function WalletTest() {
  const { wallet, connected, walletAddress, balance } = useWalletContext()
  const [testResult, setTestResult] = useState<string>('')
  const [testing, setTesting] = useState(false)

  const testWalletConnection = async () => {
    if (!wallet || !connected) {
      setTestResult('❌ Ví chưa được kết nối')
      return
    }

    setTesting(true)
    setTestResult('🔄 Đang test kết nối ví...')

    try {
      // Test basic wallet functions
      const address = await wallet.getChangeAddress()
      const balance = await wallet.getBalance()
      const utxos = await wallet.getUtxos()
      const networkId = await wallet.getNetworkId()

      setTestResult(`✅ Kết nối ví thành công!
📍 Address: ${address}
💰 Balance: ${balance.find(b => b.unit === 'lovelace')?.quantity || '0'} lovelace
🔗 UTXOs: ${utxos.length}
🌐 Network: ${networkId === 0 ? 'Testnet' : 'Mainnet'}`)

    } catch (error: any) {
      setTestResult(`❌ Lỗi test ví: ${error.message}`)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="flex items-center space-x-3 mb-4">
        <Wallet className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-bold text-gray-900">Test Kết Nối Ví</h2>
      </div>

      <div className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center space-x-2">
          {connected ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-green-700 font-medium">Ví đã kết nối</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700 font-medium">Ví chưa kết nối</span>
            </>
          )}
        </div>

        {connected && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="text-sm">
              <span className="font-medium text-gray-700">Address:</span>
              <span className="ml-2 font-mono text-xs text-gray-900">{walletAddress}</span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-gray-700">Balance:</span>
              <span className="ml-2 text-gray-900">{balance} ADA</span>
            </div>
          </div>
        )}

        {/* Test Button */}
        <button
          onClick={testWalletConnection}
          disabled={!connected || testing}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {testing ? '🔄 Đang test...' : '🧪 Test Kết Nối Ví'}
        </button>

        {/* Test Result */}
        {testResult && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-700 mb-2">Kết Quả Test:</h4>
            <pre className="text-sm text-gray-900 whitespace-pre-wrap">{testResult}</pre>
          </div>
        )}
      </div>
    </div>
  )
}