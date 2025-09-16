// ══════════════════════════════════════════════════════════════════════════════════════
// WALLET CONNECTION BUTTON COMPONENT
// ══════════════════════════════════════════════════════════════════════════════════════

import { motion } from 'framer-motion';
import { useAppKitAccount } from '@reown/appkit/react';
import './ConnectButton.css';

/**
 * Wallet Connection Button Component
 *
 * This component provides a user-friendly interface for connecting crypto wallets.
 * It utilizes Reown AppKit's built-in button component which handles:
 * - Wallet discovery and selection
 * - Connection flow management
 * - Network switching
 * - Account management
 *
 * Features:
 * - Shows connected wallet address when connected
 * - Smooth animations for state transitions
 * - Truncated address display for better UX
 * - Responsive design for mobile and desktop
 *
 * @returns {JSX.Element} The wallet connection interface
 */
const ConnectButton = () => {
  // ────────────────────────────────────────────────────────────────────────────────────
  // WALLET CONNECTION STATE
  // ────────────────────────────────────────────────────────────────────────────────────

  /** Get wallet connection status and user address from AppKit */
  const { isConnected, address } = useAppKitAccount();

  // ────────────────────────────────────────────────────────────────────────────────────
  // UTILITY FUNCTIONS
  // ────────────────────────────────────────────────────────────────────────────────────

  /**
   * Format wallet address for display
   *
   * Truncates long wallet addresses to show first 6 and last 4 characters
   * for better readability while maintaining recognizability.
   *
   * @param {string} addr - Full wallet address
   * @returns {string} Formatted address (e.g., "0x1234...5678")
   */
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // ────────────────────────────────────────────────────────────────────────────────────
  // COMPONENT RENDER
  // ────────────────────────────────────────────────────────────────────────────────────

  return (
    <motion.div className="connect-button-container">
      {/* AppKit's built-in wallet connection button */}
      {/* This handles the entire wallet connection flow automatically */}
      <appkit-button />

      {/* Connected wallet information display */}
      {isConnected && address && (
        <motion.div
          className="wallet-info"
          initial={{ opacity: 0, y: 10 }}    // Start invisible, slightly below
          animate={{ opacity: 1, y: 0 }}     // Fade in and slide up
          transition={{ duration: 0.3 }}     // Smooth 300ms animation
        >
          <div className="wallet-address">
            Connected: {formatAddress(address)}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ConnectButton;