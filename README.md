# QC7 Presale

A secure and feature-rich presale contract for QC7 token with instant delivery and 10% bonus rewards.

## 🌟 Features

- **Multi-Payment Support**: Accept ETH/BNB and ERC20 tokens (USDT, USDC, etc.)
- **Instant Delivery**: Tokens are delivered immediately upon purchase
- **10% Bonus**: All purchases receive automatic 10% bonus tokens
- **Chainlink Oracle Integration**: Real-time price feeds for accurate conversions
- **Security First**: ReentrancyGuard, immutable treasury, comprehensive access controls
- **Flexible Configuration**: Time windows, caps, and payment methods easily configurable
- **Modern Web Interface**: React-based frontend with smooth animations

## 📋 Contract Overview

### Core Components

- **QC7Presale.sol**: Main presale contract with all core functionality
- **Web Interface**: React frontend for user interaction
- **Multi-chain Ready**: Deploy on Ethereum, BSC, Polygon, and other EVM chains

### Key Features

#### Payment Methods
- Native coins (ETH, BNB, MATIC, etc.)
- ERC20 stablecoins (USDT, USDC, DAI)
- Configurable acceptance per token

#### Pricing & Oracles
- Static USD pricing for stablecoins
- Chainlink oracle integration for volatile assets
- Price bounds and staleness protection
- Owner-configurable token prices

#### Security & Limits
- Immutable treasury address
- Global hard cap support
- Per-wallet spending limits
- Time-based sale windows
- Reentrancy protection

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Presale
   ```

2. **Install dependencies**
   ```bash
   cd presale-website
   npm install
   ```

3. **Configure the contract**
   - Deploy QC7 token contract first
   - Update contract addresses in `src/config/contracts.js`
   - Set up environment variables

4. **Run the development server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
Presale/
├── qc7PRESALE.sol           # Main presale smart contract
├── presale-website/         # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── config/         # Configuration files
│   │   └── assets/         # Static assets
│   ├── package.json
│   └── vite.config.js
└── README.md               # This file
```

## 🔧 Contract Configuration

### Deployment Parameters

```solidity
constructor(
    address initialOwner,      // Contract owner address
    address QC7Token,         // QC7 token contract address
    uint8   QC7Decimals,      // QC7 token decimals (usually 18)
    uint256 tokenPriceUsd18,  // Initial price ($0.01 = 1e16)
    uint48  startTime,        // Start timestamp (0 = immediate)
    uint48  endTime,          // End timestamp (0 = no end)
    uint256 walletCapUsd18,   // Per-wallet cap (0 = unlimited)
    uint256 hardCapUsd18,     // Total cap (0 = unlimited)
    address treasury          // Immutable treasury address
)
```

### Post-Deployment Setup

1. **Configure Native Coin Pricing**
   ```solidity
   // For Chainlink oracle (recommended)
   setPriceFeed(
       address(0),              // Native coin
       0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419, // ETH/USD feed
       true,                    // Use oracle
       3600,                    // 1 hour max staleness
       1000e8,                  // Min $1000 (8 decimals)
       10000e8                  // Max $10000 (8 decimals)
   );

   // OR for static pricing
   configureToken(address(0), 3000e18, 18, true); // $3000 ETH
   ```

2. **Configure Stablecoins**
   ```solidity
   // USDT (6 decimals)
   configureToken(USDT_ADDRESS, 1e18, 6, true);

   // USDC (6 decimals)
   configureToken(USDC_ADDRESS, 1e18, 6, true);
   ```

3. **Fund Contract with QC7 Tokens**
   ```solidity
   // Transfer QC7 tokens to presale contract
   QC7.transfer(PRESALE_ADDRESS, TOTAL_PRESALE_AMOUNT);
   ```

## 💻 Frontend Configuration

### Environment Setup

Create `.env` file in `presale-website/`:

```env
VITE_CONTRACT_ADDRESS=0x...     # Presale contract address
VITE_QC7_ADDRESS=0x...          # QC7 token address
VITE_CHAIN_ID=1                 # Target chain ID
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
```

### Contract Configuration

Update `src/config/contracts.js`:

```javascript
export const PRESALE_CONTRACT_ADDRESS = "0x...";
export const QC7_TOKEN_ADDRESS = "0x...";
export const HARDCAP_USD = 1000000; // $1M hard cap
export const PRESALE_END_DATE = 1735689600; // Unix timestamp
```

## 🔐 Security Features

### Access Control
- **Owner Only**: Configuration functions restricted to contract owner
- **Two-Step Ownership**: Secure ownership transfer process
- **Immutable Treasury**: Withdrawal destination cannot be changed

### Financial Safety
- **Reentrancy Protection**: All state-changing functions protected
- **Oracle Safety**: Price bounds and staleness checks
- **Overflow Protection**: Safe math operations throughout

### Operational Security
- **Pausable**: Individual payment methods can be disabled
- **Capped**: Global and per-wallet spending limits
- **Time-Gated**: Configurable sale windows

## 🔄 Common Operations

### For Contract Owner

1. **Update Token Price**
   ```solidity
   setTokenPriceUsd(15e15); // $0.015 per QC7
   ```

2. **Pause/Resume Sales**
   ```solidity
   setAccepted(address(0), false); // Pause ETH
   setAccepted(USDT_ADDRESS, false); // Pause USDT
   ```

3. **Update Sale Window**
   ```solidity
   setWindow(block.timestamp, block.timestamp + 30 days);
   ```

4. **Withdraw Funds**
   ```solidity
   withdrawNative(); // Withdraw ETH
   withdrawToken(USDT_ADDRESS); // Withdraw USDT
   ```

### For Users

1. **Buy with ETH**
   ```solidity
   // Send ETH directly to contract OR
   buyWithNative{value: 1 ether}();
   ```

2. **Buy with ERC20**
   ```solidity
   USDT.approve(PRESALE_ADDRESS, 1000e6); // Approve USDT
   buyWithToken(USDT_ADDRESS, 1000e6);    // Buy with USDT
   ```

3. **Get Purchase Quote**
   ```solidity
   (uint256 tokens, uint256 usd) = quoteNative(1 ether);
   ```

## 🧪 Testing

### Unit Tests
```bash
cd presale-website
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### Frontend Testing
```bash
npm run test:frontend
```

## 🚀 Deployment

### Smart Contract

1. **Compile Contract**
   ```bash
   solc --optimize --abi --bin qc7PRESALE.sol
   ```

2. **Deploy via Remix/Hardhat**
   - Use provided constructor parameters
   - Verify on Etherscan/BSCScan

### Frontend

1. **Build for Production**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify/Vercel**
   ```bash
   npm run deploy
   ```

## 📞 Support

For technical support or questions:

1. Check the contract documentation
2. Review example transactions on explorer
3. Contact the development team

## ⚠️ Important Notes

- **Fund Contract First**: Ensure presale contract has sufficient QC7 tokens
- **Test on Testnet**: Always test full flow on testnet before mainnet
- **Oracle Setup**: Configure price feeds carefully for production
- **Treasury Security**: Use multi-sig wallet for treasury address
- **Gas Optimization**: Contract optimized for minimal gas usage

## 📜 License

This project is licensed under the MIT License.

---

**Built with ❤️ for the QC7 community**
