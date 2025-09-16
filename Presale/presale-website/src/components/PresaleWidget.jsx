// ══════════════════════════════════════════════════════════════════════════════════════
// PRESALE WIDGET COMPONENT
// ══════════════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { usePresaleContract } from '../hooks/usePresaleContract';
import { HARDCAP_USD, PRESALE_END_DATE } from '../config/contracts';
import ConnectButton from './ConnectButton';
import { TokenSelector, EthLogo, UsdcLogo } from './TokenLogos';
import UserStats from './UserStats';
import './PresaleWidget.css';

/**
 * Main Presale Widget Component
 *
 * This is the core component that handles the entire presale interaction flow.
 * It provides users with:
 * - Real-time countdown timer to presale end
 * - Progress tracking showing funds raised vs hardcap
 * - Payment method selection (ETH/USDC)
 * - Live quote calculations with 10% bonus display
 * - Purchase execution with comprehensive error handling
 * - Smooth animations and transitions throughout
 *
 * @param {Object} props
 * @param {Function} props.addNotification - Function to display notifications to user
 * @returns {JSX.Element} The complete presale interface widget
 */
const PresaleWidget = ({ addNotification }) => {
  // ────────────────────────────────────────────────────────────────────────────────────
  // REFS FOR ANIMATIONS
  // ────────────────────────────────────────────────────────────────────────────────────

  /** Reference to main widget container for GSAP animations */
  const widgetRef = useRef(null);

  /** Reference to progress bar for animated updates */
  const progressRef = useRef(null);

  // ────────────────────────────────────────────────────────────────────────────────────
  // COMPONENT STATE
  // ────────────────────────────────────────────────────────────────────────────────────

  /** Currently selected payment method (ETH or USDC) */
  const [paymentType, setPaymentType] = useState('ETH');

  /** User input amount for purchase */
  const [amount, setAmount] = useState('');

  /** Live quote showing expected tokens and USD value */
  const [quote, setQuote] = useState({ tokensOut: '0', usdPaid: '0' });

  /** Total amount raised in the presale so far */
  const [totalRaised, setTotalRaised] = useState(0);

  /** Progress percentage (0-100) toward hardcap */
  const [progress, setProgress] = useState(0);

  /** Countdown timer object with days, hours, minutes, seconds */
  const [timeLeft, setTimeLeft] = useState({});
  
  // ────────────────────────────────────────────────────────────────────────────────────
  // SMART CONTRACT INTEGRATION
  // ────────────────────────────────────────────────────────────────────────────────────

  /**
   * Smart contract interaction hook that provides:
   * - loading: Boolean indicating if any contract operation is in progress
   * - error: Any error message from contract interactions
   * - isConnected: Whether user has connected their wallet
   * - buyWithETH/buyWithUSDC: Functions to execute purchases
   * - getTotalRaised: Function to fetch current fundraising progress
   * - getUserSpent: Function to get user's total spending
   * - getHardCap: Function to get maximum fundraising goal
   * - getQuote: Function to calculate expected tokens for given amount
   * - addTokenToWallet: Function to add QC7 token to user's wallet
   */
  const {
    loading,
    error,
    isConnected,
    buyWithETH,
    buyWithUSDC,
    getTotalRaised,
    getUserSpent,
    getHardCap,
    getQuote,
    addTokenToWallet
  } = usePresaleContract();

  // ────────────────────────────────────────────────────────────────────────────────────
  // ANIMATION EFFECTS
  // ────────────────────────────────────────────────────────────────────────────────────

  /**
   * Initial Animation Effect
   *
   * Handles the entrance animation when the widget first loads.
   * Uses GSAP for smooth, professional animations that enhance user experience.
   * The widget slides up and fades in with a slight scale effect.
   */
  useEffect(() => {
    if (widgetRef.current) {
      // Animate widget entrance from below screen
      gsap.fromTo(widgetRef.current,
        {
          // Starting state: invisible, below viewport, slightly smaller
          opacity: 0,
          y: 50,
          scale: 0.95
        },
        {
          // Ending state: fully visible, in position, normal size
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.2,
          ease: "power3.out"  // Smooth easing for professional feel
        }
      );
    }

    // Development debug notification (commented out for production)
    // Useful for testing notification system during development
    // setTimeout(() => {
    //   addNotification({
    //     type: 'info',
    //     title: 'Debug Test',
    //     message: 'Notification system is working!',
    //     duration: 4000
    //   });
    // }, 2000);
  }, [addNotification]);

  /**
   * Countdown Timer Effect
   *
   * Calculates and updates the time remaining until presale ends.
   * Updates every second to provide real-time countdown display.
   * Shows days, hours, minutes, and seconds remaining.
   */
  useEffect(() => {
    const timer = setInterval(() => {
      // Get current time and convert end date to milliseconds
      const now = new Date().getTime();
      const endTime = PRESALE_END_DATE * 1000;
      const distance = endTime - now;

      if (distance > 0) {
        // Calculate time units from milliseconds
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        // Presale has ended - show zeros
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    // Cleanup timer on component unmount
    return () => clearInterval(timer);
  }, []);

  /**
   * Fundraising Progress Effect
   *
   * Fetches and updates the total amount raised and calculates progress.
   * Only runs when wallet is connected to avoid unnecessary calls.
   * Updates every 10 seconds to keep data fresh.
   * Includes smooth progress bar animation using GSAP.
   */
  useEffect(() => {
    /**
     * Fetch latest fundraising data from smart contract
     */
    const updateData = async () => {
      try {
        // Get total raised amount from contract
        const raised = await getTotalRaised();
        const raisedUSD = parseFloat(raised);

        // Update state with new values
        setTotalRaised(raisedUSD);
        setProgress((raisedUSD / HARDCAP_USD) * 100);

        // Animate progress bar to new width
        if (progressRef.current) {
          gsap.to(progressRef.current, {
            width: `${(raisedUSD / HARDCAP_USD) * 100}%`,
            duration: 1.5,
            ease: "power2.out"  // Smooth progress animation
          });
        }
      } catch (err) {
        console.error('Error updating fundraising data:', err);
      }
    };

    // Only fetch data if wallet is connected
    if (isConnected) {
      // Initial data fetch
      updateData();

      // Set up periodic updates every 10 seconds
      const interval = setInterval(updateData, 10000);

      // Cleanup interval on unmount or disconnection
      return () => clearInterval(interval);
    }
  }, [isConnected, getTotalRaised]);

  /**
   * Live Quote Update Effect
   *
   * Automatically calculates and updates the quote whenever user changes
   * the purchase amount or payment method. Uses debouncing to avoid
   * excessive API calls while user is typing.
   */
  useEffect(() => {
    /**
     * Fetch updated quote from smart contract
     * Only calculates if amount is valid and greater than 0
     */
    const updateQuote = async () => {
      if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
        try {
          // Get quote from contract (includes 10% bonus calculation)
          const newQuote = await getQuote(paymentType === 'ETH', amount);
          setQuote(newQuote);
        } catch (err) {
          console.error('Error fetching quote:', err);
        }
      } else {
        // Clear quote if amount is invalid
        setQuote({ tokensOut: '0', usdPaid: '0' });
      }
    };

    // Debounce quote updates to avoid spamming the contract
    // Wait 300ms after user stops typing before fetching new quote
    const debounceTimer = setTimeout(updateQuote, 300);

    // Cleanup previous timer on each change
    return () => clearTimeout(debounceTimer);
  }, [amount, paymentType, getQuote]);

  // ────────────────────────────────────────────────────────────────────────────────────
  // PURCHASE HANDLER
  // ────────────────────────────────────────────────────────────────────────────────────

  /**
   * Handle Token Purchase
   *
   * Executes the complete purchase flow including:
   * - Input validation
   * - User notifications for feedback
   * - Contract interaction (ETH or USDC)
   * - Success/error handling
   * - Form reset on success
   */
  const handlePurchase = async () => {
    // Validate purchase amount
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      addNotification({
        type: 'warning',
        title: 'Invalid Amount',
        message: 'Please enter a valid amount greater than 0.',
        duration: 3000
      });
      return;
    }

    try {
      // Notify user that transaction has started
      addNotification({
        type: 'info',
        title: 'Transaction Started',
        message: `Purchasing tokens with ${amount} ${paymentType}...`,
        duration: 4000
      });

      // Execute purchase based on selected payment method
      let tx;
      if (paymentType === 'ETH') {
        tx = await buyWithETH(amount);
      } else {
        tx = await buyWithUSDC(amount);
      }

      // Calculate tokens received (quote already includes 10% bonus)
      const tokensReceived = parseFloat(quote.tokensOut) || 0;

      // Reset form to prepare for next purchase
      setAmount('');

      // Show success notification with transaction details
      addNotification({
        type: 'success',
        title: 'Purchase Successful! 🎉',
        message: `Successfully bought ${Math.round(tokensReceived).toLocaleString()} QC7 tokens with ${amount} ${paymentType}!`,
        txHash: tx.hash,
        duration: 6000
      });

    } catch (err) {
      console.error('Purchase error:', err);

      // Parse error message and provide user-friendly feedback
      let errorMessage = 'An unexpected error occurred. Please try again.';

      // Handle common error scenarios with specific messages
      if (err.message.includes('User denied')) {
        errorMessage = 'Transaction was cancelled by user.';
      } else if (err.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds in your wallet.';
      } else if (err.message.includes('CapExceeded')) {
        errorMessage = 'Purchase would exceed the hard cap limit.';
      } else if (err.message.includes('WalletCapExceeded')) {
        errorMessage = 'Purchase would exceed your personal wallet limit.';
      } else if (err.message.includes('SaleClosed')) {
        errorMessage = 'The presale is currently closed.';
      }

      // Show error notification to user
      addNotification({
        type: 'error',
        title: 'Purchase Failed',
        message: errorMessage,
        duration: 6000
      });
    }
  };

  // ────────────────────────────────────────────────────────────────────────────────────
  // UTILITY FUNCTIONS
  // ────────────────────────────────────────────────────────────────────────────────────

  /**
   * Format numbers for display with consistent decimal places
   * @param {number} num - Number to format
   * @returns {string} Formatted number string
   */
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  // ────────────────────────────────────────────────────────────────────────────────────
  // COMPONENT RENDER
  // ────────────────────────────────────────────────────────────────────────────────────

  return (
    <motion.div
      ref={widgetRef}
      className="presale-widget"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* ═══════════════════════════════════════════════════════════════════════════════ */}
      {/* WIDGET HEADER - Title and Subtitle */}
      {/* ═══════════════════════════════════════════════════════════════════════════════ */}
      <div className="widget-header">
        <motion.h1
          className="title"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          QC7 Coin
        </motion.h1>
        <motion.p
          className="subtitle"
          initial={{ y: -15 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Early Access • Get +10% Bonus
        </motion.p>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════════ */}
      {/* COUNTDOWN TIMER - Shows time remaining until presale ends */}
      {/* ═══════════════════════════════════════════════════════════════════════════════ */}
      <motion.div
        className="countdown"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <h3>Presale Ends In:</h3>
        <div className="time-blocks">
          {/* Dynamically render countdown blocks for days, hours, minutes, seconds */}
          {Object.entries(timeLeft).map(([unit, value]) => (
            <div key={unit} className="time-block">
              <span className="time-value">{value || 0}</span>
              <span className="time-label">{unit}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════════════ */}
      {/* PROGRESS BAR - Shows fundraising progress toward hardcap */}
      {/* ═══════════════════════════════════════════════════════════════════════════════ */}
      <motion.div 
        className="progress-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <div className="progress-info">
          <span>${formatNumber(totalRaised)} raised</span>
          <span>${formatNumber(HARDCAP_USD)} goal</span>
        </div>
        <div className="progress-bar">
          <div 
            ref={progressRef}
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="progress-percentage">{progress.toFixed(1)}% Complete</div>
      </motion.div>

      {/* Purchase Form */}
      <motion.div 
        className="purchase-form"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.6 }}
      >
        {/* Payment Type Toggle */}
        <TokenSelector paymentType={paymentType} setPaymentType={setPaymentType} />

        {/* Amount Input */}
        <div className="amount-input">
          <input
            type="number"
            placeholder={`Enter ${paymentType} amount`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading}
          />
          <div className="currency">
            {paymentType === 'ETH' ? <EthLogo size={16} /> : <UsdcLogo size={16} />}
            <span>{paymentType}</span>
          </div>
        </div>

        {/* Quote Display */}
        <AnimatePresence>
          {quote.tokensOut !== '0' && (
            <motion.div 
              className="quote-display"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="quote-row">
                <span>You'll receive:</span>
                <span className="highlight">{formatNumber(parseFloat(quote.tokensOut))} QC7</span>
              </div>
              <div className="quote-row">
                <span>USD Value:</span>
                <span>${formatNumber(parseFloat(quote.usdPaid))}</span>
              </div>
              <div className="bonus-info">
                <span className="bonus-label">🎁 Includes 10% bonus!</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Connect/Buy Button */}
        {!isConnected ? (
          <ConnectButton />
        ) : (
          <motion.button
            className={`buy-button ${loading ? 'loading' : ''}`}
            onClick={handlePurchase}
            disabled={loading || !amount}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                Processing...
              </div>
            ) : (
              `Buy with ${paymentType}`
            )}
          </motion.button>
        )}

        {error && (
          <motion.div 
            className="error-message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        )}
      </motion.div>

      {/* User Stats */}
      <UserStats 
        getUserSpent={getUserSpent}
        addTokenToWallet={addTokenToWallet}
        isConnected={isConnected}
        addNotification={addNotification}
      />
    </motion.div>
  );
};

export default PresaleWidget;