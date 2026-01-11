'use client'

import { useState } from 'react'
import { Settings, Save, Trash2 } from 'lucide-react'

interface PoolConfigInputProps {
  onPoolConfigSet: (config: any) => void
  currentConfig: any
}

export default function PoolConfigInput({ onPoolConfigSet, currentConfig }: PoolConfigInputProps) {
  const [showInput, setShowInput] = useState(false)
  const [formData, setFormData] = useState({
    policyId: currentConfig?.policyId || '',
    tokenName: currentConfig?.tokenName || '',
    scriptAddress: currentConfig?.scriptAddress || '',
    utxoTxHash: currentConfig?.utxoTxHash || '',
    utxoOutputIndex: currentConfig?.utxoOutputIndex || 0,
    slope: currentConfig?.slope || 1000000
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'utxoOutputIndex' || name === 'slope' ? parseInt(value) || 0 : value
    }))
  }

  const handleSave = () => {
    onPoolConfigSet(formData)
    setShowInput(false)
  }

  const handleClear = () => {
    onPoolConfigSet(null)
    setShowInput(false)
  }

  const sampleConfigs = [
    // Không có pool mẫu vì chưa có pool nào được tạo
    // Người dùng cần tạo pool mới trước
  ]

  if (!showInput) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-blue-500" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Pool Configuration</h2>
              <p className="text-sm text-gray-500">
                {currentConfig ? `Đang sử dụng: ${currentConfig.tokenName}` : 'Chưa có pool config'}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowInput(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Cấu hình Pool</span>
            </button>
            {currentConfig && (
              <button
                onClick={handleClear}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xóa</span>
              </button>
            )}
          </div>
        </div>

        {/* Instructions */}
        {!currentConfig && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">📝 Hướng Dẫn:</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <div>1. <strong>Tạo Pool Mới:</strong> Chuyển sang tab "Tạo Pool" để mint pool mới</div>
              <div>2. <strong>Sau khi tạo xong:</strong> Pool config sẽ tự động được set</div>
              <div>3. <strong>Hoặc nhập thủ công:</strong> Click "Cấu hình Pool" để nhập thông tin pool có sẵn</div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="flex items-center space-x-3 mb-6">
        <Settings className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-bold text-gray-900">Cấu Hình Pool</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Policy ID
          </label>
          <input
            type="text"
            name="policyId"
            value={formData.policyId}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            placeholder="Policy ID của token..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Token Name
          </label>
          <input
            type="text"
            name="tokenName"
            value={formData.tokenName}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Tên token..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Script Address
          </label>
          <input
            type="text"
            name="scriptAddress"
            value={formData.scriptAddress}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            placeholder="Địa chỉ script của pool..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              UTXO Tx Hash
            </label>
            <input
              type="text"
              name="utxoTxHash"
              value={formData.utxoTxHash}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="Transaction hash..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Output Index
            </label>
            <input
              type="number"
              name="utxoOutputIndex"
              value={formData.utxoOutputIndex}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0, 1, 2..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Slope (lovelace)
          </label>
          <input
            type="number"
            name="slope"
            value={formData.slope}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="1000000"
          />
          <p className="text-xs text-gray-500 mt-1">
            Giá token đầu tiên: {(formData.slope / 1_000_000).toFixed(6)} ADA
          </p>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Lưu Config</span>
          </button>
          <button
            onClick={() => setShowInput(false)}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  )
}