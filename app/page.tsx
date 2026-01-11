'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Wallet, TrendingUp, Coins, BarChart3 } from 'lucide-react'

// Dynamic import components để tránh SSR issues
const WalletConnect = dynamic(
  () => import('@/components/BrowserWalletConnect'),
  { 
    ssr: false,
    loading: () => (
      <button className="flex items-center space-x-2 bg-gray-300 text-gray-500 px-6 py-2 rounded-lg font-medium">
        <Wallet className="w-4 h-4" />
        <span>Loading wallets...</span>
      </button>
    )
  }
)

const PoolInfo = dynamic(
  () => import('@/components/PoolInfo'),
  { 
    ssr: false,
    loading: () => <div className="bg-white rounded-xl shadow-sm p-6 h-32 animate-pulse"></div>
  }
)

const MintPool = dynamic(
  () => import('@/components/MintPool'),
  { 
    ssr: false,
    loading: () => <div className="bg-white rounded-xl shadow-sm p-6 h-96 animate-pulse"></div>
  }
)

const TradingInterface = dynamic(
  () => import('@/components/TradingInterface'),
  { 
    ssr: false,
    loading: () => <div className="bg-white rounded-xl shadow-sm p-6 h-96 animate-pulse"></div>
  }
)

const PriceChart = dynamic(
  () => import('@/components/PriceChart'),
  { 
    ssr: false,
    loading: () => <div className="bg-white rounded-xl shadow-sm p-6 h-96 animate-pulse"></div>
  }
)

const WalletTest = dynamic(
  () => import('@/components/WalletTest'),
  { 
    ssr: false,
    loading: () => <div className="bg-white rounded-xl shadow-sm p-6 h-32 animate-pulse"></div>
  }
)

const PoolConfigInput = dynamic(
  () => import('@/components/PoolConfigInput'),
  { 
    ssr: false,
    loading: () => <div className="bg-white rounded-xl shadow-sm p-6 h-32 animate-pulse"></div>
  }
)

export default function Home() {
  const [activeTab, setActiveTab] = useState<'trade' | 'mint' | 'chart'>('trade')
  const [poolConfig, setPoolConfig] = useState<any>(null)

  const tabs = [
    { id: 'trade', label: 'Giao Dịch', icon: TrendingUp },
    { id: 'mint', label: 'Tạo Pool', icon: Coins },
    { id: 'chart', label: 'Biểu Đồ', icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Pump.cardano</h1>
            </div>
            <WalletConnect />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Wallet Test */}
        <WalletTest />

        {/* Pool Config Input */}
        <PoolConfigInput 
          onPoolConfigSet={setPoolConfig} 
          currentConfig={poolConfig} 
        />

        {/* Pool Info */}
        <div className="mb-8">
          <PoolInfo poolConfig={poolConfig} />
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {activeTab === 'trade' && (
              <TradingInterface 
                poolConfig={poolConfig} 
                onPoolUpdate={setPoolConfig}
              />
            )}
            {activeTab === 'mint' && (
              <MintPool onPoolCreated={setPoolConfig} />
            )}
            {activeTab === 'chart' && (
              <PriceChart poolConfig={poolConfig} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống Kê Nhanh</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Network:</span>
                  <span className="font-medium text-blue-600">Preprod</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Protocol:</span>
                  <span className="font-medium">Bonding Curve</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Slippage:</span>
                  <span className="font-medium text-green-600">5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-green-600">Real Implementation</span>
                </div>
              </div>
            </div>

            {/* How it Works */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 Bắt Đầu</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-xs font-bold">1</span>
                  </div>
                  <p><strong>Kết nối ví:</strong> Click "Kết nối [tên ví]" ở header</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-xs font-bold">2</span>
                  </div>
                  <p><strong>Tạo Pool:</strong> Chuyển sang tab "Tạo Pool" để mint pool mới</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-xs font-bold">3</span>
                  </div>
                  <p><strong>Giao dịch:</strong> Mua/bán tokens với bonding curve</p>
                </div>
              </div>
            </div>

            {/* How it Works */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cách Hoạt Động</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-xs font-bold">•</span>
                  </div>
                  <p>Giá token tăng theo số lượng đã bán (bonding curve)</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-xs font-bold">•</span>
                  </div>
                  <p>Mua token bằng ADA, bán token nhận lại ADA</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 text-xs font-bold">•</span>
                  </div>
                  <p>Tất cả transactions thật trên Cardano blockchain</p>
                </div>
              </div>
            </div>

            {/* Wallet Extensions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ví Hỗ Trợ</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Nami Wallet</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Eternl Wallet</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Flint Wallet</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Typhon Wallet</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}