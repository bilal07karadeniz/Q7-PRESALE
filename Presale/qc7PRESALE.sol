// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/**
 * @title QC7 Presale (immutable treasury, multi-chain)
 * @notice Presale that accepts the chain's native coin and selected ERC20 stablecoins,
 *         prices QC7 in USD(18), and instantly delivers QC7 +10% bonus from the
 *         contract’s inventory. Withdrawals always go to an immutable TREASURY.
 *
 * @dev
 * DESIGN
 * - Treasury: Set once at deploy (immutable). All withdraws go to TREASURY; cannot change.
 * - Ownership: Minimal Ownable2Step (transferOwnership -> acceptOwnership), no other roles.
 * - Pricing:
 *    • tokenPriceUsd18 = USD(18) per 1 QC7 (e.g., $0.01 => 1e16). Owner can update.
 *    • Native coin: either static usdPrice OR Chainlink feed (but not both at once).
 *    • Stablecoins: static 1e18 USD per 1 token; no oracle needed (set decimals & accept=true).
 * - Sale window (optional): startTime / endTime gates buys; 0 disables each check.
 * - Caps (optional): walletCapUsd18 and hardCapUsd18 in USD(18).
 * - Delivery: Contract must be pre-funded with QC7. Buys transfer QC7 instantly with +10% bonus.
 * - Accounting: totalRaisedUsd18 and spentUsd18[buyer] track USD(18) paid.
 *
 * SECURITY
 * - ReentrancyGuard on buy and withdraw paths.
 * - Oracle path: staleness guard + min/max bounds; exponent checks prevent 10** overflow.
 * - No privileged mint/burn; this contract never mints QC7. Inventory only.
 * - Pausing: setAccepted(token,false) or setWindow() can effectively pause new buys.
 * - Receive(): native transfers auto-route to buyWithNative(); frontends should warn users accordingly.
 *
 * INTEGRATION
 * - Native buy: call buyWithNative() with value.
 * - ERC20 buy: buyer approves this contract, then calls buyWithToken(token, amount).
 * - Quotes: quoteNative(valueWei) / quoteToken(token, amount) return (tokensOut, usdPaid).
 * - Withdrawals (owner only): withdrawNative() and withdrawToken(token) to TREASURY.
 *
 * DEPLOYMENT (per network)
 * - constructor(
 *     initialOwner, QC7Token, QC7Decimals,
 *     tokenPriceUsd18, startTime, endTime,
 *     walletCapUsd18, hardCapUsd18, treasury_
 *   )
 * - Post-deploy:
 *    • setPriceFeed(address(0), <NATIVE/USD feed>, true, <maxStale>, <minPrice>, <maxPrice>)
 *    • configureToken(<STABLE>, 1e18, <decimals>, true)
 *    • setWindow(0, block.timestamp + 180 days)  // optional visible expiry
 *    • setTokenPriceUsd(1e16)                    // $0.01 (optional reassert)
 */

/// Minimal IERC20 (no assembly)
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address) external view returns (uint256);
    function transfer(address, uint256) external returns (bool);
    function allowance(address, address) external view returns (uint256);
    function approve(address, uint256) external returns (bool);
    function transferFrom(address, address, uint256) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

/// Ownable2Step (minimal)
abstract contract Ownable2Step {
    address private _owner;
    address private _pendingOwner;

    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor(address initialOwner) {
        require(initialOwner != address(0), "Owner=0");
        _owner = initialOwner;
        emit OwnershipTransferred(address(0), initialOwner);
    }

    modifier onlyOwner() {
        require(msg.sender == _owner, "Not owner");
        _;
    }

    function owner() public view returns (address) { return _owner; }
    function pendingOwner() public view returns (address) { return _pendingOwner; }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Owner=0");
        _pendingOwner = newOwner;
        emit OwnershipTransferStarted(_owner, newOwner);
    }

    function acceptOwnership() external {
        require(msg.sender == _pendingOwner, "Not pending");
        address prev = _owner;
        _owner = _pendingOwner;
        _pendingOwner = address(0);
        emit OwnershipTransferred(prev, _owner);
    }
}

/// ReentrancyGuard (minimal)
abstract contract ReentrancyGuard {
    uint256 private constant _NOT = 1;
    uint256 private constant _ENTERED = 2;
    uint256 private _status;
    constructor() { _status = _NOT; }
    modifier nonReentrant() {
        require(_status != _ENTERED, "Reentrancy");
        _status = _ENTERED;
        _;
        _status = _NOT;
    }
}

/// Optional Chainlink interface (named with I* for scanners)
interface IAggregatorV3 {
    function decimals() external view returns (uint8);
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
}

/// Custom errors (gas-efficient)
error AmountZero();
error NotAccepted();
error OracleStale();
error OracleOutOfBounds();
error SaleClosed();
error CapExceeded();
error WalletCapExceeded();

contract QC7Presale is Ownable2Step, ReentrancyGuard {
    // ══════════════════════════════════════════════════════════════════════════════════════
    // BRANDING & DISPLAY INFORMATION
    // ══════════════════════════════════════════════════════════════════════════════════════

    /// @notice Display name shown in UI and contracts
    string public constant DISPLAY_NAME = "QC7 - Early Access Presale";

    /// @notice Token symbol for reference
    string public constant TOKEN_SYMBOL = "QC7";

    /// @notice Subtitle text that can be updated by owner (e.g., "Get +10% bonus tokens!")
    string public subtitle;

    /// @notice Emitted when the subtitle is updated
    event SubtitleUpdated(string newSubtitle);



    // ══════════════════════════════════════════════════════════════════════════════════════
    // CORE CONTRACT STATE
    // ══════════════════════════════════════════════════════════════════════════════════════

    /// @notice Sentinel address representing native coin (ETH, BNB, etc.)
    address public constant NATIVE = address(0);

    /// @notice Immutable treasury address where all funds are withdrawn to
    /// @dev This address is set once in constructor and cannot be changed
    address public immutable TREASURY;

    /// @notice The QC7 token contract that will be distributed to buyers
    IERC20 public immutable QC7;

    /// @notice Number of decimals for QC7 token (usually 18)
    uint8 public immutable QC7_DECIMALS;

    /// @notice Price per QC7 token in USD with 18 decimals (e.g., $0.01 = 1e16)
    /// @dev Can be updated by owner to adjust token price
    uint256 public tokenPriceUsd18;

    /// @notice Start time for presale (unix timestamp). Set to 0 to disable start restriction
    uint48 public startTime;

    /// @notice End time for presale (unix timestamp). Set to 0 to disable end restriction
    uint48 public endTime;

    /// @notice Maximum total amount that can be raised in USD (18 decimals). Set to 0 for no limit
    uint256 public hardCapUsd18;

    /// @notice Maximum amount each wallet can spend in USD (18 decimals). Set to 0 for no limit
    uint256 public walletCapUsd18;

    /// @notice Total amount raised so far in USD (18 decimals)
    uint256 public totalRaisedUsd18;

    /// @notice Amount spent by each user in USD (18 decimals)
    mapping(address => uint256) public spentUsd18;

    /// @notice Configuration for each accepted payment token
    /// @dev Stores pricing and oracle information for payment methods
    struct TokenInfo {
        bool accepted;            // Whether this token is accepted for payment
        uint8 decimals;           // Token decimals (18 for most tokens, 6 for USDC/USDT)
        uint256 usdPrice;         // Static USD price per token (18 decimals). Set 1e18 for stablecoins
        bool useOracle;           // True to use Chainlink oracle, false for static price
        IAggregatorV3 feed;       // Chainlink price feed contract
        uint256 maxStale;         // Maximum seconds before oracle data is considered stale
        int256 minPrice;          // Minimum acceptable price from oracle (safety check)
        int256 maxPrice;          // Maximum acceptable price from oracle (safety check)
    }

    /// @notice Mapping of token address to its configuration
    /// @dev Use address(0) for native coin configuration
    mapping(address => TokenInfo) public tokenInfo;

    // ══════════════════════════════════════════════════════════════════════════════════════
    // EVENTS
    // ══════════════════════════════════════════════════════════════════════════════════════

    /// @notice Emitted when the contract is initialized
    event Initialized(address indexed owner, address indexed QC7, uint8 QC7Decimals, uint256 tokenPriceUsd18, uint48 start, uint48 end);

    /// @notice Emitted when the treasury address is set
    event TreasuryInitialized(address indexed treasury);

    /// @notice Emitted when tokens are purchased by a user
    event TokensPurchased(address indexed buyer, address indexed payToken, uint256 payAmount, uint256 tokensOut, uint256 usdPaid);

    /// @notice Emitted when funds are withdrawn to treasury
    event Withdraw(address indexed to, address indexed asset, uint256 amount);

    /// @notice Emitted when token price is updated
    event TokenPriceUpdated(uint256 newPriceUsd18);

    /// @notice Emitted when sale window is updated
    event WindowUpdated(uint48 start, uint48 end);

    /// @notice Emitted when caps are updated
    event CapsUpdated(uint256 walletCapUsd18, uint256 hardCapUsd18);

    /// @notice Emitted when a payment token is configured
    event TokenConfigured(address indexed token, bool accepted, uint8 decimals, uint256 usdPrice);

    /// @notice Emitted when a price feed is set for a token
    event PriceFeedSet(address indexed token, address indexed feed, bool useOracle, uint256 maxStale, int256 minPrice, int256 maxPrice);

    /// @notice Emitted when USD rate is set for a token
    event UsdRateSet(address indexed token, uint256 usdPrice);

    // ══════════════════════════════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ══════════════════════════════════════════════════════════════════════════════════════
    /**
     * @param initialOwner Owner (EOA or Safe)
     * @param QC7Token   QC7 token address that will be delivered immediately
     * @param QC7Decimals Decimals for QC7 (usually 18)
     * @param _tokenPriceUsd18 USD(18) per 1 QC7 (e.g. $0.01 => 1e16)
     * @param _start start time (0 = no start gate)
     * @param _end end time (0 = no end gate)
     * @param _walletCap per-wallet cap USD(18) (0 = none)
     * @param _hardCap global cap USD(18) (0 = none)
     * @param treasury_ The immutable treasury address to receive all withdrawals
     */
    constructor(
        address initialOwner,
        address QC7Token,
        uint8   QC7Decimals,
        uint256 _tokenPriceUsd18,
        uint48  _start,
        uint48  _end,
        uint256 _walletCap,
        uint256 _hardCap,
        address treasury_
    ) Ownable2Step(initialOwner) {
        require(QC7Token != address(0), "QC7=0");
        require(QC7Decimals > 0, "DEC=0");
        require(_tokenPriceUsd18 > 0, "PRICE=0");
        require(treasury_ != address(0), "Treasury=0");

        QC7 = IERC20(QC7Token);
        QC7_DECIMALS = QC7Decimals;

        tokenPriceUsd18 = _tokenPriceUsd18;
        startTime = _start;
        endTime   = _end;
        walletCapUsd18 = _walletCap;
        hardCapUsd18   = _hardCap;

        // Default config for native coin (accepted; static or oracle set later)
        tokenInfo[NATIVE] = TokenInfo({
            accepted: true,
            decimals: 18,
            usdPrice: 0,
            useOracle: false,
            feed: IAggregatorV3(address(0)),
            maxStale: 0,
            minPrice: 0,
            maxPrice: type(int256).max
        });

        TREASURY = treasury_;
        subtitle = "Instant delivery (+10% bonus)"; // default, owner can update
        emit SubtitleUpdated(subtitle);

        emit TreasuryInitialized(treasury_);
        emit Initialized(initialOwner, QC7Token, QC7Decimals, _tokenPriceUsd18, _start, _end);
    }

    // ══════════════════════════════════════════════════════════════════════════════════════
    // PUBLIC BUY FUNCTIONS
    // ══════════════════════════════════════════════════════════════════════════════════════

    /// @notice Purchase QC7 tokens using native coin (ETH, BNB, MATIC, etc.)
    /// @dev Automatically calculates USD value and applies 10% bonus
    /// @dev Protected by reentrancy guard and sale window checks
    function buyWithNative() public payable nonReentrant onlyWhileOpen {
        if (msg.value == 0) revert AmountZero();

        // Convert native coin amount to USD using configured price/oracle
        uint256 usdPaid = _usdValue(NATIVE, msg.value);

        // Check caps and update accounting
        _precheckAndAccount(msg.sender, usdPaid);

        // Calculate base tokens and add 10% bonus
        uint256 base = _QC7ForUsd(usdPaid);
        uint256 bonus = base / 10;  // 10% bonus
        uint256 total = base + bonus;
        require(total > 0, "ZERO_OUT");

        // Transfer tokens to buyer
        require(QC7.transfer(msg.sender, total), "QC7 xfer");
        emit TokensPurchased(msg.sender, NATIVE, msg.value, total, usdPaid);
    }

    /// @notice Purchase QC7 tokens using ERC20 tokens (USDT, USDC, etc.)
    /// @param payToken Address of the ERC20 token to pay with
    /// @param amount Amount of payment tokens to spend
    /// @dev Buyer must approve this contract to spend payToken first
    /// @dev Automatically calculates USD value and applies 10% bonus
    function buyWithToken(address payToken, uint256 amount) external nonReentrant onlyWhileOpen {
        if (amount == 0) revert AmountZero();

        // Check if this payment token is accepted
        TokenInfo memory ti = tokenInfo[payToken];
        if (!ti.accepted) revert NotAccepted();

        // Transfer payment tokens from buyer to this contract
        require(IERC20(payToken).transferFrom(msg.sender, address(this), amount), "pay xferFrom");

        // Convert payment token amount to USD using configured price/oracle
        uint256 usdPaid = _usdValue(payToken, amount);

        // Check caps and update accounting
        _precheckAndAccount(msg.sender, usdPaid);

        // Calculate base tokens and add 10% bonus
        uint256 base = _QC7ForUsd(usdPaid);
        uint256 bonus = base / 10;  // 10% bonus
        uint256 total = base + bonus;
        require(total > 0, "ZERO_OUT");

        // Transfer tokens to buyer
        require(QC7.transfer(msg.sender, total), "QC7 xfer");
        emit TokensPurchased(msg.sender, payToken, amount, total, usdPaid);
    }

    // ══════════════════════════════════════════════════════════════════════════════════════
    // OWNER WITHDRAWAL FUNCTIONS
    // ══════════════════════════════════════════════════════════════════════════════════════

    /// @notice Withdraw all native coins (ETH, BNB, etc.) to treasury
    /// @dev Only owner can call this function. Funds go to immutable TREASURY address
    function withdrawNative() external onlyOwner nonReentrant {
        uint256 bal = address(this).balance;
        require(bal > 0, "No native");

        // Send all native coins to treasury
        (bool ok, ) = payable(TREASURY).call{value: bal}("");
        require(ok, "Native xfer fail");

        emit Withdraw(TREASURY, NATIVE, bal);
    }

    /// @notice Withdraw all of a specific ERC20 token to treasury
    /// @param token Address of the ERC20 token to withdraw
    /// @dev Only owner can call this function. Funds go to immutable TREASURY address
    function withdrawToken(address token) external onlyOwner nonReentrant {
        require(token != address(0), "TOKEN=0");

        uint256 bal = IERC20(token).balanceOf(address(this));
        require(bal > 0, "No tokens");

        // Transfer all tokens to treasury
        require(IERC20(token).transfer(TREASURY, bal), "transfer fail");

        emit Withdraw(TREASURY, token, bal);
    }

    // ══════════════════════════════════════════════════════════════════════════════════════
    // OWNER CONFIGURATION FUNCTIONS
    // ══════════════════════════════════════════════════════════════════════════════════════

    /// @notice Update the QC7 token price in USD
    /// @param newPriceUsd18 New price per QC7 token in USD (18 decimals)
    /// @dev Example: $0.01 = 1e16, $1.00 = 1e18
    function setTokenPriceUsd(uint256 newPriceUsd18) external onlyOwner {
        require(newPriceUsd18 > 0, "Price=0");
        tokenPriceUsd18 = newPriceUsd18;
        emit TokenPriceUpdated(newPriceUsd18);
    }

    /// @notice Update the presale time window
    /// @param _start Start time in unix seconds (0 = no start restriction)
    /// @param _end End time in unix seconds (0 = no end restriction)
    function setWindow(uint48 _start, uint48 _end) external onlyOwner {
        startTime = _start;
        endTime   = _end;
        emit WindowUpdated(_start, _end);
    }

    /// @notice Update the spending caps
    /// @param _walletCapUsd18 Maximum USD each wallet can spend (0 = no limit)
    /// @param _hardCapUsd18 Maximum total USD that can be raised (0 = no limit)
    function setCaps(uint256 _walletCapUsd18, uint256 _hardCapUsd18) external onlyOwner {
        walletCapUsd18 = _walletCapUsd18;
        hardCapUsd18   = _hardCapUsd18;
        emit CapsUpdated(_walletCapUsd18, _hardCapUsd18);
    }

    /// @notice Configure a payment token with static USD pricing
    /// @param token Token address (use address(0) for native coin)
    /// @param usdPrice USD price per token with 18 decimals (set 1e18 for stablecoins)
    /// @param decimals_ Token decimals (ignored for native coin, keep 18)
    /// @param accepted_ Whether this token is accepted for payment
    /// @dev This sets up static pricing. Use setPriceFeed() for Chainlink oracle pricing
    function configureToken(address token, uint256 usdPrice, uint8 decimals_, bool accepted_) external onlyOwner {
        if (token == address(0)) {
            // Configure native coin (ETH, BNB, etc.)
            TokenInfo storage t = tokenInfo[NATIVE];
            t.decimals = 18;  // Native coin always has 18 decimals
            t.usdPrice = usdPrice;
            t.accepted = accepted_;
        } else {
            // Configure ERC20 token
            require(decimals_ > 0, "DEC=0");
            require(usdPrice > 0, "USD_RATE=0");

            tokenInfo[token] = TokenInfo({
                accepted: accepted_,
                decimals: decimals_,
                usdPrice: usdPrice,
                useOracle: false,  // Static pricing by default
                feed: IAggregatorV3(address(0)),
                maxStale: 0,
                minPrice: 0,
                maxPrice: type(int256).max
            });
        }
        emit TokenConfigured(token, accepted_, decimals_, usdPrice);
    }

    /// @notice Configure Chainlink price oracle for a token
    /// @param token Token address (use address(0) for native coin)
    /// @param aggregator Chainlink price feed address
    /// @param useOracle_ True to enable oracle, false for static pricing
    /// @param maxStaleSeconds Maximum age of oracle data in seconds
    /// @param minPriceMinBound Minimum acceptable price from oracle
    /// @param maxPriceMaxBound Maximum acceptable price from oracle
    /// @dev Price bounds provide safety checks against oracle manipulation
    function setPriceFeed(
        address token,
        address aggregator,
        bool useOracle_,
        uint256 maxStaleSeconds,
        int256 minPriceMinBound,
        int256 maxPriceMaxBound
    ) external onlyOwner {
        if (useOracle_) require(aggregator != address(0), "FEED=0");
        require(minPriceMinBound <= maxPriceMaxBound, "BADS");

        TokenInfo storage t = tokenInfo[token];
        t.useOracle = useOracle_;
        t.feed = IAggregatorV3(aggregator);
        t.maxStale = maxStaleSeconds;
        t.minPrice = minPriceMinBound;
        t.maxPrice = maxPriceMaxBound;

        emit PriceFeedSet(token, aggregator, useOracle_, maxStaleSeconds, minPriceMinBound, maxPriceMaxBound);
    }

    /// @notice Set static USD price for a token (disables oracle if enabled)
    /// @param token Token address to update
    /// @param usdPrice New USD price with 18 decimals
    /// @dev Alternative to oracle pricing for stablecoins or manual price updates
    function setUsdRate(address token, uint256 usdPrice) external onlyOwner {
        require(usdPrice > 0, "USD_RATE=0");

        TokenInfo storage t = tokenInfo[token];
        t.usdPrice = usdPrice;

        emit UsdRateSet(token, usdPrice);
    }

    /// @notice Enable or disable a payment token without changing other settings
    /// @param token Token address to update
    /// @param accepted_ Whether this token should be accepted for payment
    /// @dev Useful for temporarily pausing specific payment methods
    function setAccepted(address token, bool accepted_) external onlyOwner {
        tokenInfo[token].accepted = accepted_;
        emit TokenConfigured(token, accepted_, tokenInfo[token].decimals, tokenInfo[token].usdPrice);
    }

    /// @notice Update the subtitle text displayed in the UI
    /// @param newSubtitle New subtitle text (e.g., "Get +10% bonus tokens!")
    /// @dev Keep price information out of this string - show live price from tokenPriceUsd18 in UI
    function setSubtitle(string calldata newSubtitle) external onlyOwner {
        subtitle = newSubtitle;
        emit SubtitleUpdated(newSubtitle);
    }

    // ══════════════════════════════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS & QUOTES
    // ══════════════════════════════════════════════════════════════════════════════════════

    /// @notice Get quote for purchasing with native coin (ETH, BNB, etc.)
    /// @param valueWei Amount of native coin in wei
    /// @return tokensOut Amount of QC7 tokens to receive (including 10% bonus)
    /// @return usdPaid USD value of the payment (18 decimals)
    function quoteNative(uint256 valueWei) external view returns (uint256 tokensOut, uint256 usdPaid) {
        usdPaid = _usdValue(NATIVE, valueWei);
        uint256 base = _QC7ForUsd(usdPaid);
        tokensOut = base + (base / 10);  // Add 10% bonus
    }

    /// @notice Get quote for purchasing with ERC20 token
    /// @param payToken Address of the payment token
    /// @param amount Amount of payment token to spend
    /// @return tokensOut Amount of QC7 tokens to receive (including 10% bonus)
    /// @return usdPaid USD value of the payment (18 decimals)
    function quoteToken(address payToken, uint256 amount) external view returns (uint256 tokensOut, uint256 usdPaid) {
        usdPaid = _usdValue(payToken, amount);
        uint256 base = _QC7ForUsd(usdPaid);
        tokensOut = base + (base / 10);  // Add 10% bonus
    }

    // ══════════════════════════════════════════════════════════════════════════════════════
    // INTERNAL FUNCTIONS & MODIFIERS
    // ══════════════════════════════════════════════════════════════════════════════════════

    /// @notice Modifier to ensure presale is open for purchases
    /// @dev Reverts if current time is before startTime or after endTime
    modifier onlyWhileOpen() {
        if (_isClosed()) revert SaleClosed();
        _;
    }

    /// @notice Check if the presale is currently closed
    /// @return closed True if presale is closed, false if open
    /// @dev Closed if before start time or after end time (0 values disable checks)
    function _isClosed() internal view returns (bool closed) {
        // Check if before start time (if set)
        if (startTime != 0 && block.timestamp < startTime) return true;

        // Check if after end time (if set)
        if (endTime != 0 && block.timestamp > endTime) return true;

        return false;
    }

    /// @notice Check caps and update accounting for a purchase
    /// @param buyer Address making the purchase
    /// @param usdPaid Amount being paid in USD (18 decimals)
    /// @dev Reverts if hard cap or wallet cap would be exceeded
    function _precheckAndAccount(address buyer, uint256 usdPaid) internal {
        // Check and update global hard cap
        if (hardCapUsd18 != 0) {
            uint256 newTotal = totalRaisedUsd18 + usdPaid;
            if (newTotal > hardCapUsd18) revert CapExceeded();
            totalRaisedUsd18 = newTotal;
        } else {
            // No hard cap set, just update total
            totalRaisedUsd18 += usdPaid;
        }

        // Check and update per-wallet cap
        if (walletCapUsd18 != 0) {
            uint256 newSpent = spentUsd18[buyer] + usdPaid;
            if (newSpent > walletCapUsd18) revert WalletCapExceeded();
            spentUsd18[buyer] = newSpent;
        } else {
            // No wallet cap set, just update user's spending
            spentUsd18[buyer] += usdPaid;
        }
    }

    /// @notice Calculate base QC7 tokens for USD amount (before bonus)
    /// @param usdPaid Amount paid in USD (18 decimals)
    /// @return tokensBase Base token amount in QC7 decimals (no bonus applied)
    /// @dev Truncation is expected and acceptable for token calculations
    function _QC7ForUsd(uint256 usdPaid) internal view returns (uint256 tokensBase) {
        uint256 p = tokenPriceUsd18;
        require(p > 0, "PRICE=0");

        // Scale to QC7 token decimals
        uint256 scale = 10 ** uint256(QC7_DECIMALS);
        tokensBase = (usdPaid * scale) / p;
    }

    /// @notice Convert token amount to USD value using price or oracle
    /// @param token Token address (use address(0) for native coin)
    /// @param amount Token amount in its native decimals
    /// @return usdValue USD value with 18 decimals
    /// @dev Uses either static pricing or Chainlink oracle based on configuration
    function _usdValue(address token, uint256 amount) internal view returns (uint256 usdValue) {
        TokenInfo memory t = tokenInfo[token];
        if (!t.accepted) revert NotAccepted();

        if (t.useOracle) {
            // Use Chainlink oracle for pricing
            address f = address(t.feed);
            require(f != address(0), "FEED=0");

            // Get latest price data
            (, int256 price, , uint256 updatedAt, ) = IAggregatorV3(f).latestRoundData();

            // Check data freshness
            if (t.maxStale != 0 && block.timestamp > updatedAt + t.maxStale) {
                revert OracleStale();
            }

            // Check price bounds for safety
            if (price < t.minPrice || price > t.maxPrice) {
                revert OracleOutOfBounds();
            }

            // Calculate USD value with proper decimal handling
            uint8 pDec = IAggregatorV3(f).decimals();
            uint8 d = t.decimals;
            require(d <= 77 && pDec <= 77 && uint256(d) + uint256(pDec) <= 77, "EXP");

            uint256 denom = 10 ** (uint256(d) + uint256(pDec));
            uint256 p = uint256(price);

            return (amount * p * 1e18) / denom;
        } else {
            // Use static pricing
            require(t.usdPrice > 0, "USD_RATE=0");

            uint8 d2 = t.decimals;
            require(d2 <= 77, "DEC_TOO_BIG");

            uint256 denom2 = 10 ** uint256(d2);
            return (amount * t.usdPrice) / denom2;
        }
    }

    /// @notice Automatically route native coin transfers to buyWithNative()
    /// @dev This allows users to send ETH/BNB directly to contract address
    receive() external payable {
        buyWithNative();
    }
}
