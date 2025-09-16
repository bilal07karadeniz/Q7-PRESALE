// ══════════════════════════════════════════════════════════════════════════════════════
// USER STATISTICS COMPONENT
// ══════════════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './UserStats.css';

/**
 * User Statistics Component
 *
 * Displays personalized statistics for connected users including their spending
 * history and purchased tokens. Also provides functionality to add the QC7
 * token to their wallet for easy access.
 *
 * Features:
 * - Real-time spending tracking
 * - Token purchase calculations with bonus display
 * - One-click token addition to wallet
 * - Auto-updating data every 10 seconds
 * - Smooth entrance animations
 * - Loading states for better UX
 *
 * @param {Object} props
 * @param {Function} props.getUserSpent - Function to fetch user's total spending
 * @param {Function} props.addTokenToWallet - Function to add QC7 token to wallet
 * @param {boolean} props.isConnected - Whether user has connected their wallet
 * @param {Function} props.addNotification - Function to show notifications
 * @returns {JSX.Element|null} User stats component or null if not connected
 */
const UserStats = ({ getUserSpent, addTokenToWallet, isConnected, addNotification }) => {
  // ────────────────────────────────────────────────────────────────────────────────────
  // COMPONENT STATE
  // ────────────────────────────────────────────────────────────────────────────────────

  /** Total amount user has spent in USD */
  const [userSpent, setUserSpent] = useState(0);

  /** Loading state for add token button */
  const [loading, setLoading] = useState(false);

  // ────────────────────────────────────────────────────────────────────────────────────
  // DATA FETCHING EFFECT
  // ────────────────────────────────────────────────────────────────────────────────────

  /**
   * Update User Statistics Effect
   *
   * Fetches and updates user spending data when wallet is connected.
   * Sets up automatic refresh every 10 seconds to keep data current.
   */
  useEffect(() => {
    /**
     * Fetch latest user spending data from smart contract
     */
    const updateUserStats = async () => {
      if (isConnected) {
        try {
          // Get user's total spending from contract
          const spent = await getUserSpent();
          setUserSpent(parseFloat(spent));
        } catch (err) {
          console.error('Error updating user stats:', err);
        }
      } else {
        // Reset stats when wallet disconnected
        setUserSpent(0);
      }
    };

    // Initial data fetch
    updateUserStats();

    // Set up periodic updates when connected
    if (isConnected) {
      const interval = setInterval(updateUserStats, 10000); // Update every 10 seconds
      return () => clearInterval(interval);
    }
  }, [isConnected, getUserSpent]);

  // ────────────────────────────────────────────────────────────────────────────────────
  // TOKEN WALLET ADDITION HANDLER
  // ────────────────────────────────────────────────────────────────────────────────────

  /**
   * Handle Adding QC7 Token to User's Wallet
   *
   * Triggers the wallet's token addition flow, which adds QC7 token info
   * to the user's wallet for easy access and balance viewing.
   */
  const handleAddToken = async () => {
    setLoading(true);
    try {
      // Request wallet to add QC7 token
      await addTokenToWallet();

      // Show success notification
      addNotification({
        type: 'success',
        title: 'Token Added!',
        message: 'QC7 token has been added to your wallet successfully.',
        duration: 4000
      });
    } catch (err) {
      console.error('Add token error:', err);

      // Handle different error scenarios
      if (err.message.includes('User rejected')) {
        // User cancelled the addition
        addNotification({
          type: 'info',
          title: 'Token Addition Cancelled',
          message: 'You cancelled adding QC7 token to your wallet.',
          duration: 3000
        });
      } else {
        // Other errors (network, wallet issues, etc.)
        addNotification({
          type: 'error',
          title: 'Failed to Add Token',
          message: err.message || 'Failed to add QC7 token to your wallet.',
          duration: 5000
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────────────────
  // UTILITY FUNCTIONS
  // ────────────────────────────────────────────────────────────────────────────────────

  /**
   * Format numbers for consistent display
   * @param {number} num - Number to format
   * @returns {string} Formatted number with 2 decimal places
   */
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  // ────────────────────────────────────────────────────────────────────────────────────
  // CONDITIONAL RENDERING
  // ────────────────────────────────────────────────────────────────────────────────────

  // Only show stats when wallet is connected
  if (!isConnected) {
    return null;
  }

  // ────────────────────────────────────────────────────────────────────────────────────
  // COMPONENT RENDER
  // ────────────────────────────────────────────────────────────────────────────────────

  return (
    <motion.div
      className="user-stats"
      initial={{ opacity: 0, y: 20 }}    // Start invisible and below
      animate={{ opacity: 1, y: 0 }}     // Fade in and slide up
      transition={{ duration: 0.6 }}     // Smooth animation
    >
      {/* Stats header */}
      <div className="stats-header">
        <h3>Your Stats</h3>
      </div>

      {/* Stats content */}
      <div className="stats-content">
        {/* Total spending display */}
        <div className="stat-item">
          <span className="stat-label">Total Spent:</span>
          <span className="stat-value">${formatNumber(userSpent)}</span>
        </div>

        {/* Token purchase calculation with bonus */}
        <div className="stat-item">
          <span className="stat-label">Tokens Purchased:</span>
          <span className="stat-value">
            {/* Calculate tokens: $1 = 1000 QC7, plus 10% bonus = 1100 QC7 per USD */}
            {formatNumber(userSpent * 1100)} QC7
            <span className="bonus-indicator">includes 10% bonus</span>
          </span>
        </div>

        {/* Add token to wallet button */}
        <motion.button
          className="add-token-btn"
          onClick={handleAddToken}
          disabled={loading}
          whileHover={{ scale: 1.02 }}     // Slight grow on hover
          whileTap={{ scale: 0.98 }}       // Slight shrink on click
        >
          {loading ? (
            // Loading state
            <div className="loading-spinner">
              <div className="spinner"></div>
              Adding...
            </div>
          ) : (
            // Normal state
            <>
              <span className="btn-icon">+</span>
              Add QC7 to Wallet
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default UserStats;