// ══════════════════════════════════════════════════════════════════════════════════════
// TOKEN LOGO AND SELECTOR COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════════════

/**
 * Ethereum (ETH) Logo Component
 *
 * Displays the official Ethereum logo using CoinGecko's CDN for reliability.
 * Includes error handling to gracefully handle image loading failures.
 *
 * @param {Object} props
 * @param {number} props.size - Size of the logo in pixels (default: 20)
 * @returns {JSX.Element} ETH logo image with fallback handling
 */
export const EthLogo = ({ size = 20 }) => (
  <img
    src="https://assets.coingecko.com/coins/images/279/small/ethereum.png"
    alt="Ethereum (ETH)"
    width={size}
    height={size}
    style={{ borderRadius: '50%' }}    // Circular appearance
    onError={(e) => {
      // Graceful fallback if CoinGecko image fails to load
      // In production, you might want to show a local fallback image
      e.target.style.display = 'none';
      e.target.nextSibling.style.display = 'inline-block';
    }}
  />
);

/**
 * USD Coin (USDC) Logo Component
 *
 * Displays the official USDC logo using CoinGecko's CDN for consistency.
 * Includes the same error handling pattern as ETH logo.
 *
 * @param {Object} props
 * @param {number} props.size - Size of the logo in pixels (default: 20)
 * @returns {JSX.Element} USDC logo image with fallback handling
 */
export const UsdcLogo = ({ size = 20 }) => (
  <img
    src="https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png"
    alt="USD Coin (USDC)"
    width={size}
    height={size}
    style={{ borderRadius: '50%' }}    // Circular appearance
    onError={(e) => {
      // Graceful fallback if CoinGecko image fails to load
      // In production, you might want to show a local fallback image
      e.target.style.display = 'none';
      e.target.nextSibling.style.display = 'inline-block';
    }}
  />
);

/**
 * Payment Method Selector Component
 *
 * Provides a toggle interface for users to select their preferred payment method.
 * Currently supports ETH and USDC with their respective logos and active states.
 *
 * Features:
 * - Visual indicators for active selection
 * - Token logos for easy recognition
 * - Accessible button design
 * - Extensible for additional payment methods
 *
 * @param {Object} props
 * @param {string} props.paymentType - Currently selected payment type ('ETH' or 'USDC')
 * @param {Function} props.setPaymentType - Function to update selected payment type
 * @returns {JSX.Element} Payment method selector with logo buttons
 */
export const TokenSelector = ({ paymentType, setPaymentType }) => {
  // Configuration for supported payment methods
  const paymentMethods = [
    { type: 'ETH', logo: EthLogo },     // Ethereum native coin
    { type: 'USDC', logo: UsdcLogo }   // USD Coin stablecoin
  ];

  return (
    <div className="payment-toggle">
      {paymentMethods.map(({ type, logo: Logo }) => (
        <button
          key={type}
          className={`toggle-btn ${paymentType === type ? 'active' : ''}`}
          onClick={() => setPaymentType(type)}
          aria-label={`Select ${type} as payment method`}
        >
          {/* Token logo */}
          <Logo size={18} />

          {/* Token symbol */}
          <span>{type}</span>
        </button>
      ))}
    </div>
  );
};