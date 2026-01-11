# 🚀 Pump.cardano Frontend

Giao diện web cho Pump.cardano, được xây dựng với Next.js và Mesh SDK.

## ✨ Tính Năng

- 🔗 **Kết nối ví** - Hỗ trợ tất cả ví Cardano thông qua Mesh SDK
- 🪙 **Tạo Pool** - Mint token mới với bonding curve
- 📈 **Mua/Bán Token** - Giao dịch với slippage protection
- 📊 **Biểu đồ** - Hiển thị bonding curve và lịch sử giá
- 💰 **Thông tin Pool** - Theo dõi supply, giá, market cap
- 🛡️ **Bảo mật** - Tích hợp với smart contract đã audit

## 🛠️ Cài Đặt

```bash
# Clone repository
cd Pump-cardano-smc/frontend

# Cài đặt dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Chạy development server
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

## ⚙️ Cấu Hình

### Environment Variables

Cập nhật `.env.local`:

```env
# Blockfrost API Key (lấy từ https://blockfrost.io)
NEXT_PUBLIC_BLOCKFROST_API_KEY=your_api_key_here

# Network (0 = Preprod, 1 = Mainnet)
NEXT_PUBLIC_NETWORK_ID=0

# Pool mặc định (cập nhật sau khi mint)
NEXT_PUBLIC_DEFAULT_POLICY_ID=your_policy_id
NEXT_PUBLIC_DEFAULT_TOKEN_NAME=PUMP
NEXT_PUBLIC_DEFAULT_SCRIPT_ADDRESS=your_script_address
```

### Kết Nối với Smart Contract

1. **Mint Pool**: Sử dụng `offchain/src/mint-tokens.ts`
2. **Cập nhật Config**: Copy Policy ID và Script Address vào frontend
3. **Test Giao Dịch**: Mua/bán token qua giao diện

## 🎯 Cách Sử Dụng

### 1. Kết Nối Ví
- Click "Kết nối ví" ở góc phải
- Chọn ví Cardano của bạn
- Xác nhận kết nối

### 2. Tạo Pool Mới
- Chuyển sang tab "Tạo Pool"
- Nhập tên token (VD: PUMP, DOGE)
- Đặt slope (độ dốc giá)
- Đặt total supply
- Click "Tạo Pool"

### 3. Giao Dịch
- Chuyển sang tab "Giao Dịch"
- Chọn "Mua" hoặc "Bán"
- Nhập số lượng token
- Xem preview giá và chi phí
- Click "Mua Token" hoặc "Bán Token"

### 4. Xem Biểu Đồ
- Chuyển sang tab "Biểu Đồ"
- Xem bonding curve hoặc lịch sử giá
- Theo dõi thống kê pool

## 🏗️ Kiến Trúc

```
frontend/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── WalletConnect.tsx  # Wallet connection
│   ├── PoolInfo.tsx       # Pool information
│   ├── MintPool.tsx       # Pool creation
│   ├── TradingInterface.tsx # Buy/sell interface
│   └── PriceChart.tsx     # Charts and graphs
├── package.json           # Dependencies
└── README.md             # This file
```

## 🔧 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Blockchain**: Mesh SDK v1.6.9
- **Charts**: Recharts
- **Icons**: Lucide React
- **Language**: TypeScript

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Build project
npm run build

# Deploy to Vercel
npx vercel --prod
```

### Manual Deployment

```bash
# Build static files
npm run build
npm run export

# Upload dist/ folder to your hosting
```

## 📞 Hỗ Trợ

- **Documentation**: [Mesh SDK Docs](https://meshjs.dev/)
- **Cardano**: [Developer Portal](https://developers.cardano.org/)
- **Aiken**: [Language Guide](https://aiken-lang.org/)

## 📄 License

MIT License - xem file LICENSE để biết thêm chi tiết.
