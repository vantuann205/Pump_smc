'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Loader, AlertCircle, DollarSign } from 'lucide-react'
import { cardanoService } from '@/lib/cardano'
import { useWalletContext } from '@/contexts/WalletContext'

interface TradingInterfaceProps {
  poolConfig: any
  onPoolUpdate: (config: any) => void
}

export default function TradingInterface({ poolConfig, onPoolUpdate }: TradingInterfaceProps) {
  const { wallet, connected } = useWalletContext()
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<any>(null)
  const [poolData, setPoolData] = useState<any>(null)
  const [loadingPoolData, setLoadingPoolData] = useState(false)

  useEffect(() => {
    if (poolConfig && connected && wallet) {
      loadPoolData()
    }
  }, [poolConfig, connected, wallet])

  const loadPoolData = async () => {
    if (!poolConfig) return
    
    setLoadingPoolData(true)
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
        currentSupply: Number(data.poolDatum.current_supply),
        slope: Number(data.poolDatum.slope),
        currentPrice: Number(data.currentPrice),
        poolAda: Number(data.currentAda),
        poolTokens: Number(data.currentTokens),
        marketCap: Number(data.marketCap)
      })
    } catch (err: any) {
      console.error('Error loading pool data:', err)
      if (err.message.includes('No pool UTXO found')) {
        setError('Pool chưa được tạo. Vui lòng tạo pool mới trước.')
      } else {
        setError('Không thể tải dữ liệu pool: ' + err.message)
      }
    } finally {
      setLoadingPoolData(false)
    }
  }

  const calculateCost = (slope: number, supplyStart: number, supplyEnd: number) => {
    const endSquared = supplyEnd * supplyEnd
    const startSquared = supplyStart * supplyStart
    return Math.floor((slope * (endSquared - startSquared)) / 2)
  }

  const calculateBuyCost = () => {
    if (!amount || !poolData) return 0
    const amountNum = parseInt(amount)
    if (isNaN(amountNum) || amountNum <= 0) return 0
    
    const cost = calculateCost(
      poolData.slope,
      poolData.currentSupply,
      poolData.currentSupply + amountNum
    )
    return cost / 1_000_000 // Convert to ADA
  }

  const calculateSellRefund = () => {
    if (!amount || !poolData) return 0
    const amountNum = parseInt(amount)
    if (isNaN(amountNum) || amountNum <= 0) return 0
    
    const refund = calculateCost(
      poolData.slope,
      poolData.currentSupply - amountNum,
      poolData.currentSupply
    )
    return refund / 1_000_000 // Convert to ADA
  }

  const calculateNewPrice = () => {
    if (!amount || !poolData) return poolData?.currentPrice || 0
    const amountNum = parseInt(amount)
    if (isNaN(amountNum)) return poolData.currentPrice
    
    const newSupply = activeTab === 'buy' 
      ? poolData.currentSupply + amountNum
      : poolData.currentSupply - amountNum
    
    return (poolData.slope * newSupply) / 1_000_000
  }

  const handleTrade = async () => {
    if (!connected || !wallet) {
      setError('Vui lòng kết nối ví trước')
      return
    }

    if (!poolConfig) {
      setError('Không tìm thấy thông tin pool')
      return
    }

    if (!amount || parseInt(amount) <= 0) {
      setError('Vui lòng nhập số lượng hợp lệ')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      cardanoService.setWallet(wallet)
      
      const amountNum = parseInt(amount)
      let tradeResult

      if (activeTab === 'buy') {
        const cost = calculateBuyCost()
        const slippageTolerance = 0.05 // 5%
        const maxCost = Math.floor(cost * 1_000_000 * (1 + slippageTolerance))
        
        tradeResult = await cardanoService.buyTokens(poolConfig, amountNum, maxCost)
      } else {
        const refund = calculateSellRefund()
        const slippageTolerance = 0.05 // 5%
        const minRefund = Math.floor(refund * 1_000_000 * (1 - slippageTolerance))
        
        tradeResult = await cardanoService.sellTokens(poolConfig, amountNum, minRefund)
      }

      setResult({
        ...tradeResult,
        type: activeTab
      })
      
      // Reload pool data after successful trade
      await loadPoolData()

    } catch (err: any) {
      console.error('Trade error:', err)
      setError(err.message || 'Có lỗi xảy ra khi giao dịch')
    } finally {
      setLoading(false)
    }
  }

  if (!poolConfig) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center py-8">
          <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có Pool để giao dịch</h3>
          <p className="text-gray-500 mb-4">Vui lòng tạo pool mới hoặc cấu hình pool hiện có</p>
          <div className="text-sm text-blue-600 bg-blue-50 rounded-lg p-3">
            💡 <strong>Hướng dẫn:</strong> Chuyển sang tab "Tạo Pool" để tạo pool mới
          </div>
        </div>
      </div>
    )
  }

  if (loadingPoolData) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center py-8">
          <Loader className="w-8 h-8 text-blue-500 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Đang tải dữ liệu pool...</h3>
          <p className="text-gray-500">Vui lòng đợi</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
        <button
          onClick={() => setActiveTab('buy')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'buy'
              ? 'bg-green-500 text-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Mua</span>
        </button>
        <button
          onClick={() => setActiveTab('sell')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'sell'
              ? 'bg-red-500 text-white'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          <span>Bán</span>
        </button>
      </div>

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <span className="font-medium text-green-800">
              Giao dịch thành công!
            </span>
          </div>
          <div className="text-sm text-green-700">
            {result.type === 'buy' ? 'Đã mua' : 'Đã bán'} {result.amount.toLocaleString()} token 
            {result.type === 'buy' ? ' với' : ' nhận'} {(result.cost || result.refund).toFixed(4)} ADA
          </div>
          <div className="text-xs text-green-600 mt-1 font-mono">
            <a 
              href={`https://preprod.cardanoscan.io/transaction/${result.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              TX: {result.txHash}
            </a>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số lượng token
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Nhập số lượng..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="1"
          />
        </div>

        {/* Price Calculation */}
        {amount && poolData && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">
                {activeTab === 'buy' ? 'Chi phí:' : 'Nhận được:'}
              </span>
              <span className="font-bold text-lg">
                {activeTab === 'buy' 
                  ? calculateBuyCost().toFixed(4)
                  : calculateSellRefund().toFixed(4)
                } ADA
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Giá trung bình:</span>
              <span className="font-medium">
                {((activeTab === 'buy' ? calculateBuyCost() : calculateSellRefund()) / parseInt(amount)).toFixed(6)} ADA/token
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Giá sau giao dịch:</span>
              <span className="font-medium">
                {calculateNewPrice().toFixed(6)} ADA/token
              </span>
            </div>

            <div className="border-t pt-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Slippage bảo vệ:</span>
                <span className="text-green-600">5%</span>
              </div>
            </div>
          </div>
        )}

        {/* Current Pool Stats */}
        {poolData && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-sm text-blue-600">Giá hiện tại</div>
              <div className="font-bold text-blue-900">
                {poolData.currentPrice.toFixed(6)} ADA
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="text-sm text-purple-600">Supply đã bán</div>
              <div className="font-bold text-purple-900">
                {poolData.currentSupply.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleTrade}
          disabled={loading || !connected || !amount || !poolData}
          className={`w-full font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
            activeTab === 'buy'
              ? 'bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white'
              : 'bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white'
          }`}
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span>Đang xử lý...</span>
            </>
          ) : (
            <>
              {activeTab === 'buy' ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <TrendingDown className="w-5 h-5" />
              )}
              <span>{activeTab === 'buy' ? 'Mua Token' : 'Bán Token'}</span>
            </>
          )}
        </button>

        {!connected && (
          <p className="text-center text-sm text-gray-500">
            Vui lòng kết nối ví để giao dịch
          </p>
        )}
      </div>
    </div>
  )
}