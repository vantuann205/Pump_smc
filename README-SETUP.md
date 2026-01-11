# 🔧 Setup Instructions - Fix libsodium Error

## ✅ Đã Fix Các Lỗi

### 1. **libsodium-wrappers Error**
- ✅ Cập nhật `next.config.js` với webpack config
- ✅ Thêm `libsodium-wrappers` vào dependencies
- ✅ Alias `libsodium-wrappers-sumo` → `libsodium-wrappers`
- ✅ Disable static optimization cho Mesh SDK

### 2. **API Key Updated**
- ✅ Cập nhật Blockfrost API key: `preprodNCrPaDqdsCHvUf2uYbqb67R3Z5GP5ycR`
- ✅ Tạo `.env.local` với config mới

### 3. **Client-Side Rendering**
- ✅ Thêm `ClientOnly` component để tránh hydration errors
- ✅ Wrap MeshProvider trong ClientOnly

## 🚀 Cách Chạy

```bash
cd Pump-cardano-smc/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔍 Kiểm Tra

Mở http://localhost:3000 - không còn lỗi libsodium!

## 📝 Các Thay Đổi

### `next.config.js`
```js
webpack: (config, { isServer }) => {
  config.resolve.fallback = {
    fs: false,
    net: false,
    tls: false,
    crypto: false,
  };
  
  config.resolve.alias = {
    'libsodium-wrappers-sumo': 'libsodium-wrappers',
  };
  
  return config;
}
```

### `package.json`
```json
{
  "dependencies": {
    "libsodium-wrappers": "^0.7.11"
  }
}
```

### `.env.local`
```env
NEXT_PUBLIC_BLOCKFROST_API_KEY=preprodNCrPaDqdsCHvUf2uYbqb67R3Z5GP5ycR
```

## ✅ Status

**READY TO USE** - Tất cả lỗi đã được fix!