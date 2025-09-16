// ══════════════════════════════════════════════════════════════════════════════════════
// WALLET CONNECTION CONFIGURATION (REOWN APPKIT)
// ══════════════════════════════════════════════════════════════════════════════════════

import { createAppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { sepolia } from '@reown/appkit/networks'

/**
 * Wallet Connection Setup using Reown AppKit (formerly WalletConnect)
 *
 * This configuration enables users to connect various crypto wallets including:
 * - MetaMask
 * - WalletConnect compatible wallets
 * - Coinbase Wallet
 * - Trust Wallet
 * - And many more...
 *
 * AppKit provides a beautiful, unified wallet connection modal and management system.
 */

// ──────────────────────────────────────────────────────────────────────────────────────
// PROJECT CONFIGURATION
// ──────────────────────────────────────────────────────────────────────────────────────

/**
 * Reown Cloud Project ID
 *
 * Get this from https://cloud.reown.com by creating a new project.
 * This ID is required for wallet connection services and analytics.
 *
 * IMPORTANT: Replace this with your own project ID in production!
 */
const projectId = '1015dcd54c9d06d7cccd1273d7cc8248' // Replace with your actual project ID

// ──────────────────────────────────────────────────────────────────────────────────────
// NETWORK CONFIGURATION
// ──────────────────────────────────────────────────────────────────────────────────────

/**
 * Supported blockchain networks
 *
 * Currently configured for Sepolia testnet.
 * For production, replace with mainnet networks like:
 * - ethereum (Ethereum mainnet)
 * - bsc (Binance Smart Chain)
 * - polygon (Polygon mainnet)
 */
const networks = [sepolia]

// ──────────────────────────────────────────────────────────────────────────────────────
// APPLICATION METADATA
// ──────────────────────────────────────────────────────────────────────────────────────

/**
 * App metadata shown in wallet connection prompts
 *
 * This information appears when users connect their wallets,
 * helping them identify and trust the application.
 */
const metadata = {
  name: 'QC7 Presale',                                    // App name shown in wallets
  description: 'QC7 Coin Early Access',                   // Brief description
  url: 'https://qc7.com',                                 // Must match your domain
  icons: ['https://avatars.githubusercontent.com/u/179229932'] // App icon/logo
}

// ──────────────────────────────────────────────────────────────────────────────────────
// ADAPTER AND APPKIT INITIALIZATION
// ──────────────────────────────────────────────────────────────────────────────────────

/**
 * Ethers.js Adapter
 *
 * Connects AppKit with Ethers.js library for blockchain interactions.
 * This adapter handles the conversion between wallet providers and
 * Ethers.js provider instances.
 */
const ethersAdapter = new EthersAdapter()

/**
 * Initialize AppKit Instance
 *
 * Creates the global wallet connection interface that can be used
 * throughout the application. This instance handles:
 * - Wallet discovery and connection
 * - Network switching
 * - Account management
 * - Transaction signing
 */
createAppKit({
  adapters: [ethersAdapter],                              // Blockchain library adapters
  networks,                                               // Supported networks
  metadata,                                               // App identification
  projectId,                                              // Reown Cloud project ID
  features: {
    analytics: true,                                      // Enable usage analytics
  }
})

// Export adapter for use in hooks and components
export { ethersAdapter }