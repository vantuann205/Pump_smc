'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, Coins, DollarSign, Users, Loader, RefreshCw } from 'lucide-react'
import { cardanoService } from '@/lib/cardano'
import { useWalletContext } from '@/contexts/WalletContext'

interface PoolInfoProps {
  poolConfig: any
}

export default function PoolInfo({ poolConfig }: PoolInfoProps) {
  const { wallet, connected } = useWalletContext()
  const [poolData, setPoolData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (poolConfig && connected && wallet) {
      loadPoolData()
    }
  }, [poolConfig, connected, wallet])

  const loadPoolData = async () => {
    if (!poolConfig || !wallet) return
    
    setLoading(true)
    setError('')
    try {
      cardanoService.setWallet(wallet)
      
      // Check if pool exists first
      const poolExists = await cardanoService.checkPoolExists(poolConfig.scriptAddress)
      if (!poolExists) {
        setError('Pool chưa được tạo. Vui lòng tạo pool mới trước.')
        return
      }
      
      const data = await cardanoService.getPoolData(poolConfig)
      setPoolData({
        tokenName: data.poolDatum.token_name,
        currentSupply: Number(data.poolDatum.current_supply),
        slope: Number(data.poolDatum.slope),
        currentPrice: Number(data.currentPrice),
        poolAda: Number(data.currentAda),
        poolTokens: Number(data.currentTokens),
        marketCap: Number(data.marketCap),
        policyId: data.poolDatum.token_policy,
        creator: data.poolDatum.creator
      })
    } catch (err: any) {
      console.error('Error loading pool data:', err)
      if (err.message.includes('No pool UTXO found')) {
        setError('Pool chưa được tạo. Vui lòng tạo pool mới trước.')
      } else {
        setError('Không thể tải dữ liệu pool: ' + err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!poolConfig) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center py-8">
          <Coins className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có Pool nào</h3>
          <p className="text-gray-500">Tạo pool mới hoặc nhập thông tin pool hiện có để bắt đầu giao dịch</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-center py-8">
          <Loader className="w-8 h-8 text-blue-500 animate-spin mr-3" />
          <span className="text-gray-600">Đang tải thông tin pool...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">❌ {error}</div>
          <button
            onClick={loadPoolData}
            className="flex items-center space-x-2 mx-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Thử lại</span>
          </button>
        </div>
      </div>
    )
  }

  if (!poolData) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center py-8">
          <div className="text-gray-500">Không có dữ liệu pool</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{poolData.tokenName} Pool</h2>
            <p className="text-sm text-gray-500">Bonding Curve DEX</p>
          </div>
        </div>
        <button
          onClick={loadPoolData}
          className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="text-sm">Làm mới</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Current Price */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">Giá Hiện Tại</span>
          </div>
          <div className="text-2xl font-bold text-green-900">
            {poolData.currentPrice.toFixed(6)} ADA
          </div>
          <div className="text-xs text-green-700">
            per {poolData.tokenName}
          </div>
        </div>

        {/* Market Cap */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Market Cap</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {poolData.marketCap.toFixed(2)} ADA
          </div>
          <div className="text-xs text-blue-700">
            Tổng giá trị
          </div>
        </div>

        {/* Supply Sold */}
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Supply Đã Bán</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">
            {poolData.currentSupply.toLocaleString()}
          </div>
          <div className="text-xs text-purple-700">
            {poolData.tokenName} tokens
          </div>
        </div>

        {/* Pool ADA */}
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Coins className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Pool ADA</span>
          </div>
          <div className="text-2xl font-bold text-orange-900">
            {(poolData.poolAda / 1_000_000).toFixed(2)}
          </div>
          <div className="text-xs text-orange-700">
            ADA trong pool
          </div>
        </div>
      </div>

      {/* Pool Details */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Chi Tiết Pool</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Policy ID:</span>
              <span className="font-mono text-xs text-gray-900 break-all">
                {poolData.policyId.substring(0, 16)}...
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Slope:</span>
              <span className="font-medium">{(poolData.slope / 1_000_000).toFixed(2)} ADA</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tokens trong Pool:</span>
              <span className="font-medium">{poolData.poolTokens.toLocaleString()}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Script Address:</span>
              <span className="font-mono text-xs text-gray-900 break-all">
                {poolConfig.scriptAddress.substring(0, 16)}...
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Creator:</span>
              <span className="font-mono text-xs text-gray-900 break-all">
                {poolData.creator.substring(0, 16)}...
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Network:</span>
              <span className="font-medium text-blue-600">Preprod</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bonding Curve Info */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">📈 Bonding Curve Formula</h4>
        <div className="text-sm text-gray-600">
          <div className="mb-1">
            <strong>Price = {(poolData.slope / 1_000_000)} ADA × Supply</strong>
          </div>
          <div className="text-xs space-y-1">
            <div>• Token #{(poolData.currentSupply + 100).toLocaleString()} sẽ có giá: {((poolData.slope * (poolData.currentSupply + 100)) / 1_000_000).toFixed(6)} ADA</div>
            <div>• Token #{(poolData.currentSupply + 1000).toLocaleString()} sẽ có giá: {((poolData.slope * (poolData.currentSupply + 1000)) / 1_000_000).toFixed(6)} ADA</div>
          </div>
        </div>
      </div>
    </div>
  )
}