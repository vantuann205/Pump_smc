# 🔗 Hướng Dẫn Kết Nối Ví Thật

## ✅ Server Đã Chạy

**URL**: http://localhost:3000

Server đã chạy thành công với Mesh SDK để kết nối ví thật!

## 🎯 Ví Được Hỗ Trợ

### 1. **Nami Wallet** ⭐ (Khuyên dùng)
- Download: https://namiwallet.io/
- Chrome Extension
- Dễ sử dụng nhất

### 2. **Eternl Wallet**
- Download: https://eternl.io/
- Chrome/Firefox Extension
- Nhiều tính năng

### 3. **Flint Wallet**
- Download: https://flint-wallet.com/
- Chrome Extension
- Giao diện đẹp

### 4. **Typhon Wallet**
- Download: https://typhonwallet.io/
- Chrome Extension
- Advanced features

## 🚀 Cách Test

### Bước 1: Cài Đặt Ví
1. Cài extension ví (khuyên dùng Nami)
2. Tạo wallet mới hoặc import existing
3. **Chuyển sang Preprod network** (quan trọng!)

### Bước 2: Lấy Test ADA
1. Vào https://docs.cardano.org/cardano-testnet/tools/faucet/
2. Nhập địa chỉ ví Preprod
3. Nhận 1000 tADA miễn phí

### Bước 3: Kết Nối Ví
1. Mở http://localhost:3000
2. Click "Kết nối ví"
3. Chọn ví đã cài (Nami, Eternl, etc.)
4. Authorize connection
5. Xem địa chỉ và balance hiển thị

## 🎮 Tính Năng Test

### ✅ Đã Hoạt Động
- **Kết nối ví thật** - Nami, Eternl, Flint, Typhon
- **Hiển thị balance** - ADA balance từ blockchain
- **Copy địa chỉ** - Click để copy wallet address
- **Disconnect** - Ngắt kết nối ví

### 🔄 Mock (Chưa Tích Hợp Blockchain)
- **Tạo Pool** - UI hoàn chỉnh, chưa gọi smart contract
- **Mua/Bán Token** - Tính toán bonding curve chính xác, chưa submit tx
- **Biểu đồ** - Hiển thị bonding curve và mock data

## 🛠️ Tích Hợp Smart Contract

Để kết nối với smart contract thật, cần:

### 1. **Copy Smart Contract Logic**
```bash
# Copy logic từ offchain scripts
cp ../offchain/src/mint-tokens.ts lib/mint.ts
cp ../offchain/src/buy-tokens.ts lib/buy.ts  
cp ../offchain/src/sell-tokens.ts lib/sell.ts
```

### 2. **Update Components**
- Replace mock functions với real blockchain calls
- Add transaction building và signing
- Handle transaction confirmation

### 3. **Add Real Pool Data**
- Fetch pool UTXO từ blockchain
- Parse datum để get pool state
- Real-time updates

## 🎯 Current Status

**✅ WALLET CONNECTION WORKING**
- Kết nối ví thật thành công
- Hiển thị balance và address
- Support tất cả major wallets

**🔄 READY FOR SMART CONTRACT INTEGRATION**
- UI/UX hoàn chỉnh
- Bonding curve math chính xác
- Chỉ cần thay mock bằng real calls

## 🧪 Test Ngay

1. **Cài Nami Wallet**
2. **Switch to Preprod**
3. **Get test ADA**
4. **Mở http://localhost:3000**
5. **Click "Kết nối ví"**

Bạn sẽ thấy ví thật được kết nối với balance và address hiển thị!