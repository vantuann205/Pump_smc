'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Calculator } from 'lucide-react'

interface PriceChartProps {
  poolConfig: any
}

export default function PriceChart({ poolConfig }: PriceChartProps) {
  const [chartData, setChartData] = useState<Array<{supply: number, price: number, cost: number}>>([])
  const [selectedSupply, setSelectedSupply] = useState(1000)

  useEffect(() => {
    if (poolConfig?.slope) {
      generateChartData()
    }
  }, [poolConfig])

  const generateChartData = () => {
    if (!poolConfig?.slope) return

    const slope = poolConfig.slope || 1000000 // Default slope
    const data = []
    
    // Generate data points for chart
    for (let supply = 0; supply <= 10000; supply += 500) {
      const price = (slope * supply) / 1_000_000 // Price in ADA
      const cost = supply > 0 ? (slope * supply * supply) / (2 * 1_000_000) : 0 // Total cost to reach this supply
      data.push({ supply, price, cost })
    }
    
    setChartData(data)
  }

  const calculateCostToBuy = (fromSupply: number, toSupply: number, slope: number) => {
    const endSquared = toSupply * toSupply
    const startSquared = fromSupply * fromSupply
    return (slope * (endSquared - startSquared)) / (2 * 1_000_000)
  }

  const currentSupply = poolConfig?.currentSupply || 0
  const slope = poolConfig?.slope || 1000000

  if (!poolConfig) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có dữ liệu biểu đồ</h3>
          <p className="text-gray-500">Tạo hoặc chọn pool để xem biểu đồ giá</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center space-x-3 mb-6">
        <BarChart3 className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-bold text-gray-900">Biểu Đồ Bonding Curve</h2>
      </div>

      {/* Chart Visualization */}
      <div className="mb-6">
        <div className="bg-gray-50 rounded-lg p-4 h-64 flex items-end justify-between space-x-1">
          {chartData.slice(0, 20).map((point, index) => {
            const height = Math.max((point.price / Math.max(...chartData.map(d => d.price))) * 200, 2)
            const isCurrentSupply = point.supply <= currentSupply && chartData[index + 1]?.supply > currentSupply
            
            return (
              <div key={point.supply} className="flex flex-col items-center">
                <div
                  className={`w-3 rounded-t transition-all duration-300 ${
                    isCurrentSupply 
                      ? 'bg-green-500' 
                      : point.supply <= currentSupply 
                        ? 'bg-blue-400' 
                        : 'bg-gray-300'
                  }`}
                  style={{ height: `${height}px` }}
                  title={`Supply: ${point.supply}, Price: ${point.price.toFixed(4)} ADA`}
                />
                {index % 4 === 0 && (
                  <div className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-left">
                    {point.supply}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Supply: 0</span>
          <span>Supply: 10,000</span>
        </div>
        <div className="text-center text-xs text-gray-400 mt-1">
          <span className="inline-block w-3 h-3 bg-blue-400 rounded mr-1"></span>
          Đã bán
          <span className="inline-block w-3 h-3 bg-green-500 rounded mr-1 ml-3"></span>
          Hiện tại
          <span className="inline-block w-3 h-3 bg-gray-300 rounded mr-1 ml-3"></span>
          Chưa bán
        </div>
      </div>

      {/* Price Calculator */}
      <div className="border-t pt-6">
        <div className="flex items-center space-x-2 mb-4">
          <Calculator className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900">Máy Tính Giá</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Supply Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tính giá tại Supply:
            </label>
            <input
              type="number"
              value={selectedSupply}
              onChange={(e) => setSelectedSupply(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              max="1000000"
            />
            <div className="mt-2 text-sm text-gray-500">
              Supply hiện tại: {currentSupply.toLocaleString()}
            </div>
          </div>

          {/* Results */}
          <div className="space-y-3">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-sm text-blue-600 font-medium">Giá tại Supply {selectedSupply.toLocaleString()}</div>
              <div className="text-xl font-bold text-blue-900">
                {((slope * selectedSupply) / 1_000_000).toFixed(6)} ADA
              </div>
            </div>

            {selectedSupply > currentSupply && (
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-sm text-green-600 font-medium">
                  Chi phí mua từ {currentSupply.toLocaleString()} → {selectedSupply.toLocaleString()}
                </div>
                <div className="text-xl font-bold text-green-900">
                  {calculateCostToBuy(currentSupply, selectedSupply, slope).toFixed(4)} ADA
                </div>
                <div className="text-xs text-green-700">
                  Trung bình: {(calculateCostToBuy(currentSupply, selectedSupply, slope) / (selectedSupply - currentSupply)).toFixed(6)} ADA/token
                </div>
              </div>
            )}

            {selectedSupply < currentSupply && selectedSupply >= 0 && (
              <div className="bg-red-50 rounded-lg p-3">
                <div className="text-sm text-red-600 font-medium">
                  Nhận được khi bán từ {currentSupply.toLocaleString()} → {selectedSupply.toLocaleString()}
                </div>
                <div className="text-xl font-bold text-red-900">
                  {calculateCostToBuy(selectedSupply, currentSupply, slope).toFixed(4)} ADA
                </div>
                <div className="text-xs text-red-700">
                  Trung bình: {(calculateCostToBuy(selectedSupply, currentSupply, slope) / (currentSupply - selectedSupply)).toFixed(6)} ADA/token
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Formula Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">📊 Công Thức Bonding Curve</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <div><strong>Giá tại Supply S:</strong> Price = {(slope / 1_000_000)} × S (ADA)</div>
          <div><strong>Chi phí mua từ S1 → S2:</strong> Cost = {(slope / 1_000_000)} × (S2² - S1²) / 2 (ADA)</div>
          <div><strong>Slope hiện tại:</strong> {(slope / 1_000_000)} ADA</div>
        </div>
      </div>

      {/* Price Milestones */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">🎯 Mốc Giá Quan Trọng</h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[100, 500, 1000, 5000].map(supply => (
            <div key={supply} className="bg-white border rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500">Supply {supply.toLocaleString()}</div>
              <div className="font-bold text-gray-900">
                {((slope * supply) / 1_000_000).toFixed(4)} ADA
              </div>
              <div className="text-xs text-gray-400">
                {supply <= currentSupply ? '✅ Đã đạt' : '⏳ Chưa đạt'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}