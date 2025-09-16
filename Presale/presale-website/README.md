# QC7 Presale Website

A modern, responsive presale website for QC7 tokens built with React, featuring wallet integration and dynamic animations.

## Features

- 🎯 **Presale Widget**: Clean, widget-style design with dynamic colors and GSAP animations
- 💰 **Multi-Payment Support**: Support for native coins (ETH/BNB) and stablecoins (USDT/USDC)
- 🔗 **Wallet Integration**: Reown AppKit (formerly WalletConnect) for seamless wallet connection
- 📊 **Progress Tracking**: Real-time progress bar showing funds raised vs hardcap
- ⏰ **Countdown Timer**: Live countdown to presale end date
- 🎁 **Bonus Display**: Shows 10% bonus tokens for all purchases
- 📱 **Responsive Design**: Mobile-first approach with beautiful animations
- ✨ **Animated Background**: Dynamic particle effects and gradient backgrounds
- 🔒 **Security**: Safe contract interactions with proper error handling

## Configuration

Before using, update the contract addresses in `src/config/contracts.js`:

- **Presale Contract**: Update with your deployed contract address
- **Token Addresses**: Configure supported payment tokens
- **Network**: Set target blockchain network
- **Hardcap**: Configure maximum fundraising goal
- **End Date**: Set presale end timestamp

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure your Reown Project ID:
   - Go to [cloud.reown.com](https://cloud.reown.com)
   - Create a new project
   - Copy your Project ID
   - Update `src/config/wagmi.js` with your Project ID:
   ```javascript
   const projectId = 'YOUR_PROJECT_ID' // Replace with your actual project ID
   ```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

## Project Structure

```
src/
├── components/
│   ├── PresaleWidget.jsx      # Main presale component
│   ├── PresaleWidget.css      # Styles for presale widget
│   ├── ConnectButton.jsx      # Wallet connection button
│   └── ConnectButton.css      # Styles for connect button
├── config/
│   ├── contracts.js           # Contract addresses and ABIs
│   └── wagmi.js              # Wallet configuration
├── hooks/
│   └── usePresaleContract.js  # Contract interaction hook
├── App.jsx                    # Main app component
├── App.css                   # Global styles
└── main.jsx                  # Entry point
```

## Technologies Used

- **React 19**: Latest React with modern hooks
- **Vite**: Fast build tool and dev server
- **Ethers.js v6**: Ethereum library for smart contract interaction
- **Reown AppKit**: Wallet connection and management
- **GSAP**: Professional-grade animations
- **Framer Motion**: Smooth React animations
- **CSS3**: Modern styling with gradients and animations

## Smart Contract Functions Used

- `buyWithNative()`: Purchase tokens with ETH
- `buyWithToken()`: Purchase tokens with USDC
- `totalRaisedUsd18()`: Get total amount raised in USD
- `hardCapUsd18()`: Get the hardcap amount
- `quoteNative()`: Get quote for ETH purchase
- `quoteToken()`: Get quote for USDC purchase

## Network Configuration

The website is configured for Sepolia testnet. To get test tokens:

1. **Sepolia ETH**: Use the [Sepolia Faucet](https://sepoliafaucet.com/)
2. **Test USDC**: Get from the USDC contract on Sepolia or use a testnet faucet

## License

This project is for demonstration purposes. All rights reserved.
