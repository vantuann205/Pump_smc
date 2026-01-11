'use client'

import { useState } from 'react'
import { Coins, Loader, AlertCircle, CheckCircle } from 'lucide-react'
import { cardanoService } from '@/lib/cardano'
import { useWalletContext } from '@/contexts/WalletContext'

interface MintPoolProps {
  onPoolCreated: (poolConfig: any) => void
}

export default function MintPool({ onPoolCreated }: MintPoolProps) {
  const { wallet, connected } = useWalletContext()
  const [formData, setFormData] = useState({
    tokenName: 'PUMP',
    slope: '1000000',
    totalSupply: '1000000'
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const calculateInitialPrice = () => {
    const slope = parseInt(formData.slope)
    return (slope / 1_000_000).toFixed(6) // Convert to ADA
  }

  const calculateMaxPrice = () => {
    const slope = parseInt(formData.slope)
    const supply = parseInt(formData.totalSupply)
    return ((slope * supply) / 1_000_000).toFixed(2) // Convert to ADA
  }

  const handleMintPool = async () => {
    if (!connected || !wallet) {
      setError('Vui lòng kết nối ví trước')
      return
    }

    if (!formData.tokenName.trim()) {
      setError('Vui lòng nhập tên token')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      // Set wallet in service
      cardanoService.setWallet(wallet)
      
      // Call mint function
      const mintResult = await cardanoService.mintPool(
        formData.tokenName,
        parseInt(formData.slope),
        parseInt(formData.totalSupply)
      )

      setResult(mintResult)
      onPoolCreated(mintResult)

    } catch (err: any) {
      console.error('Mint error:', err)
      setError(err.message || 'Có lỗi xảy ra khi tạo pool')
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pool đã được tạo thành công!</h2>
          <p className="text-gray-600">Token {result.tokenName} đã sẵn sàng để giao dịch</p>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Policy ID</label>
            <div className="text-sm font-mono text-gray-900 break-all bg-white p-2 rounded border">
              {result.policyId}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Script Address</label>
            <div className="text-sm font-mono text-gray-900 break-all bg-white p-2 rounded border">
              {result.scriptAddress}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Hash</label>
            <div className="text-sm font-mono text-gray-900 break-all bg-white p-2 rounded border">
              <a 
                href={`https://preprod.cardanoscan.io/transaction/${result.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                {result.txHash}
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-blue-600 font-medium">Total Supply</div>
              <div className="text-lg font-bold text-blue-900">
                {result.totalSupply.toLocaleString()} {result.tokenName}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-green-600 font-medium">Slope</div>
              <div className="text-lg font-bold text-green-900">
                {(result.slope / 1_000_000).toFixed(2)} ADA
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setResult(null)
            setFormData({ tokenName: 'PUMP', slope: '1000000', totalSupply: '1000000' })
          }}
          className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Tạo Pool Mới
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Coins className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-bold text-gray-900">Tạo Pool Mới</h2>
      </div>

      <div className="space-y-6">
        {/* Token Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tên Token
          </label>
          <input
            type="text"
            name="tokenName"
            value={formData.tokenName}
            onChange={handleInputChange}
            placeholder="VD: PUMP, DOGE, MOON..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={10}
          />
          <p className="text-xs text-gray-500 mt-1">Tối đa 10 ký tự, chỉ chữ và số</p>
        </div>

        {/* Slope */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Slope (Độ dốc giá)
          </label>
          <input
            type="number"
            name="slope"
            value={formData.slope}
            onChange={handleInputChange}
            placeholder="1000000"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="100000"
            max="10000000"
          />
          <p className="text-xs text-gray-500 mt-1">
            Giá token đầu tiên: {calculateInitialPrice()} ADA
          </p>
        </div>

        {/* Total Supply */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tổng Supply
          </label>
          <input
            type="number"
            name="totalSupply"
            value={formData.totalSupply}
            onChange={handleInputChange}
            placeholder="1000000"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="1000"
            max="1000000000"
          />
          <p className="text-xs text-gray-500 mt-1">
            Giá token cuối cùng: {calculateMaxPrice()} ADA
          </p>
        </div>

        {/* Preview */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-3">Xem trước Pool</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-600">Token:</span>
              <span className="ml-2 font-medium">{formData.tokenName}</span>
            </div>
            <div>
              <span className="text-blue-600">Supply:</span>
              <span className="ml-2 font-medium">{parseInt(formData.totalSupply).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-blue-600">Giá đầu:</span>
              <span className="ml-2 font-medium">{calculateInitialPrice()} ADA</span>
            </div>
            <div>
              <span className="text-blue-600">Giá cuối:</span>
              <span className="ml-2 font-medium">{calculateMaxPrice()} ADA</span>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleMintPool}
          disabled={loading || !connected}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span>Đang tạo pool...</span>
            </>
          ) : (
            <>
              <Coins className="w-5 h-5" />
              <span>Tạo Pool</span>
            </>
          )}
        </button>

        {!connected && (
          <p className="text-center text-sm text-gray-500">
            Vui lòng kết nối ví để tạo pool
          </p>
        )}
      </div>
    </div>
  )
}