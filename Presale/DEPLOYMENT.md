# QC7 Presale Deployment Guide

This guide walks you through deploying the QC7 presale contract and website.

## 📋 Prerequisites

### Required Tools
- **Remix IDE** or **Hardhat** for smart contract deployment
- **MetaMask** or other Web3 wallet
- **Node.js 18+** for frontend deployment
- **Git** for version control

### Required Information
- QC7 token contract address
- Treasury wallet address (preferably multi-sig)
- Target blockchain network
- Desired presale parameters

## 🔗 Smart Contract Deployment

### Step 1: Prepare QC7 Token

Ensure you have:
1. QC7 token contract deployed
2. Sufficient QC7 tokens minted
3. Token details (decimals, total supply)

### Step 2: Deploy Presale Contract

#### Using Remix IDE

1. **Open Remix**
   - Go to [remix.ethereum.org](https://remix.ethereum.org)
   - Create new file: `QC7Presale.sol`
   - Copy and paste the contract code

2. **Compile Contract**
   - Select Solidity compiler `0.8.28`
   - Enable optimization (200 runs)
   - Click "Compile QC7Presale.sol"

3. **Deploy Contract**
   - Switch to "Deploy & Run Transactions" tab
   - Select your wallet (MetaMask)
   - Choose target network
   - Fill constructor parameters:

```solidity
// Example parameters
initialOwner: "0x..." // Your owner address
QC7Token: "0x..." // QC7 token contract
QC7Decimals: 18
tokenPriceUsd18: "10000000000000000" // $0.01 = 1e16
startTime: 0 // 0 = immediate start
endTime: 1735689600 // Unix timestamp for end
walletCapUsd18: "10000000000000000000000" // $10,000 per wallet
hardCapUsd18: "1000000000000000000000000" // $1,000,000 total
treasury: "0x..." // Treasury address (immutable!)
```

4. **Deploy and Verify**
   - Click "Deploy"
   - Confirm transaction
   - Copy contract address
   - Verify on Etherscan/BSCScan

### Step 3: Configure Payment Methods

#### For ETH/BNB (Native Coin)

**Option A: Chainlink Oracle (Recommended)**
```solidity
setPriceFeed(
    address(0), // Native coin
    "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419", // ETH/USD Chainlink feed
    true, // Use oracle
    3600, // 1 hour staleness
    100000000000, // Min $1000 (8 decimals)
    1000000000000 // Max $10000 (8 decimals)
);
```

**Option B: Static Price**
```solidity
configureToken(
    address(0), // Native coin
    "3000000000000000000000", // $3000 per ETH (18 decimals)
    18, // Decimals
    true // Accepted
);
```

#### For Stablecoins (USDT/USDC)

```solidity
// USDT (6 decimals)
configureToken(
    "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT address
    "1000000000000000000", // $1.00 (18 decimals)
    6, // USDT decimals
    true // Accepted
);

// USDC (6 decimals)
configureToken(
    "0xA0b86a33E6411C4881eE180B1FF2D17a3c91d2aF", // USDC address
    "1000000000000000000", // $1.00 (18 decimals)
    6, // USDC decimals
    true // Accepted
);
```

### Step 4: Fund Presale Contract

```solidity
// Transfer QC7 tokens to presale contract
// Make sure to transfer enough for all possible purchases + bonuses
QC7.transfer(PRESALE_ADDRESS, TOTAL_AMOUNT);
```

**Calculate Required Amount:**
```
Required QC7 = (Hard Cap / Token Price) × 1.1
Example: ($1M / $0.01) × 1.1 = 110M QC7 tokens
```

## 🌐 Frontend Deployment

### Step 1: Configure Contract Details

Update `presale-website/src/config/contracts.js`:

```javascript
export const PRESALE_CONTRACT_ADDRESS = "0x..."; // Your deployed contract
export const QC7_TOKEN_ADDRESS = "0x..."; // QC7 token address
export const HARDCAP_USD = 1000000; // $1M in USD
export const PRESALE_END_DATE = 1735689600; // Unix timestamp

// Supported tokens (add/remove as needed)
export const SUPPORTED_TOKENS = {
  ETH: {
    address: "0x0000000000000000000000000000000000000000",
    symbol: "ETH",
    decimals: 18
  },
  USDT: {
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    symbol: "USDT",
    decimals: 6
  },
  USDC: {
    address: "0xA0b86a33E6411C4881eE180B1FF2D17a3c91d2aF",
    symbol: "USDC",
    decimals: 6
  }
};
```

### Step 2: Set Up WalletConnect

1. **Get Project ID**
   - Visit [cloud.reown.com](https://cloud.reown.com)
   - Create new project
   - Copy Project ID

2. **Update Configuration**
   ```javascript
   // In src/config/wagmi.js
   const projectId = 'YOUR_PROJECT_ID_HERE';
   ```

### Step 3: Build and Deploy

#### Local Testing
```bash
cd presale-website
npm install
npm run dev
```

#### Production Build
```bash
npm run build
```

#### Deploy to Netlify
1. **Connect Repository**
   - Link GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`

2. **Environment Variables**
   ```
   VITE_WALLETCONNECT_PROJECT_ID=your_project_id
   VITE_CONTRACT_ADDRESS=0x...
   VITE_CHAIN_ID=1
   ```

#### Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
```

## ✅ Post-Deployment Checklist

### Smart Contract
- [ ] Contract deployed and verified
- [ ] Constructor parameters correct
- [ ] Payment methods configured
- [ ] Oracle feeds set up (if using)
- [ ] Contract funded with QC7 tokens
- [ ] Test small purchase transaction
- [ ] Withdrawal functions tested

### Frontend
- [ ] Contract addresses updated
- [ ] Network configuration correct
- [ ] WalletConnect working
- [ ] Purchase flow tested
- [ ] Progress bar updating
- [ ] Error handling working
- [ ] Mobile responsiveness verified

### Security
- [ ] Treasury address is secure (multi-sig recommended)
- [ ] Owner address is secure
- [ ] Price feeds are correct
- [ ] Caps are set appropriately
- [ ] Time windows configured

## 🔧 Maintenance Tasks

### Monitoring
- Monitor contract balance
- Check oracle price updates
- Track total raised vs hardcap
- Monitor for any errors

### Updates
- Adjust token price as needed
- Update payment method acceptance
- Modify caps if required
- Extend/modify time windows

### Emergency Actions
- Pause specific payment methods
- Disable all purchases (set acceptance to false)
- Emergency fund withdrawal

## 📞 Troubleshooting

### Common Issues

1. **"Insufficient funds" Error**
   - Check contract has enough QC7 tokens
   - Verify calculation: (purchase amount / price) × 1.1

2. **Oracle Price Issues**
   - Check Chainlink feed is active
   - Verify price bounds are reasonable
   - Check staleness period

3. **Frontend Connection Issues**
   - Verify contract address is correct
   - Check network configuration
   - Ensure WalletConnect project ID is valid

4. **Transaction Failures**
   - Check gas limits
   - Verify approval for ERC20 tokens
   - Confirm sale is still open

### Support Contacts
- Technical issues: [Contact details]
- Smart contract questions: [Contact details]
- Frontend problems: [Contact details]

---

**Important:** Always test thoroughly on testnet before mainnet deployment!