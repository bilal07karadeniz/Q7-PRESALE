// ══════════════════════════════════════════════════════════════════════════════════════
// SMART CONTRACT CONFIGURATION
// ══════════════════════════════════════════════════════════════════════════════════════

/**
 * Contract Addresses Configuration
 *
 * IMPORTANT: Update these addresses when deploying to different networks
 * or when using different contract instances.
 */

/** Main QC7 Presale smart contract address */
export const PRESALE_CONTRACT_ADDRESS = "0x1EEe32E32AC4538EA29eCEFf439c458b84c516ca";

/** USDC token contract address for ERC20 payments */
export const USDC_CONTRACT_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

// ══════════════════════════════════════════════════════════════════════════════════════
// CONTRACT ABIS (Application Binary Interfaces)
// ══════════════════════════════════════════════════════════════════════════════════════

/**
 * QC7 Presale Contract ABI
 *
 * This ABI defines all the functions and events available in the presale contract.
 * It includes:
 * - Purchase functions (buyWithNative, buyWithToken)
 * - Quote functions (quoteNative, quoteToken)
 * - Admin functions (owner-only configuration methods)
 * - View functions (read contract state)
 * - Events (for transaction logs and monitoring)
 *
 * Generated from the compiled Solidity contract.
 */
export const PRESALE_ABI = [

	{
		"inputs": [],
		"name": "acceptOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "buyWithNative",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "initialOwner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "QC7Token",
				"type": "address"
			},
			{
				"internalType": "uint8",
				"name": "QC7Decimals",
				"type": "uint8"
			},
			{
				"internalType": "uint256",
				"name": "_tokenPriceUsd18",
				"type": "uint256"
			},
			{
				"internalType": "uint48",
				"name": "_start",
				"type": "uint48"
			},
			{
				"internalType": "uint48",
				"name": "_end",
				"type": "uint48"
			},
			{
				"internalType": "uint256",
				"name": "_walletCap",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_hardCap",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "treasury_",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "AmountZero",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "payToken",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "buyWithToken",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "CapExceeded",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "usdPrice",
				"type": "uint256"
			},
			{
				"internalType": "uint8",
				"name": "decimals_",
				"type": "uint8"
			},
			{
				"internalType": "bool",
				"name": "accepted_",
				"type": "bool"
			}
		],
		"name": "configureToken",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "NotAccepted",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "OracleOutOfBounds",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "OracleStale",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "SaleClosed",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "WalletCapExceeded",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "walletCapUsd18",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "hardCapUsd18",
				"type": "uint256"
			}
		],
		"name": "CapsUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "QC7",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint8",
				"name": "QC7Decimals",
				"type": "uint8"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "tokenPriceUsd18",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint48",
				"name": "start",
				"type": "uint48"
			},
			{
				"indexed": false,
				"internalType": "uint48",
				"name": "end",
				"type": "uint48"
			}
		],
		"name": "Initialized",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferStarted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "feed",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "useOracle",
				"type": "bool"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "maxStale",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "int256",
				"name": "minPrice",
				"type": "int256"
			},
			{
				"indexed": false,
				"internalType": "int256",
				"name": "maxPrice",
				"type": "int256"
			}
		],
		"name": "PriceFeedSet",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "accepted_",
				"type": "bool"
			}
		],
		"name": "setAccepted",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_walletCapUsd18",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_hardCapUsd18",
				"type": "uint256"
			}
		],
		"name": "setCaps",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "aggregator",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "useOracle_",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "maxStaleSeconds",
				"type": "uint256"
			},
			{
				"internalType": "int256",
				"name": "minPriceMinBound",
				"type": "int256"
			},
			{
				"internalType": "int256",
				"name": "maxPriceMaxBound",
				"type": "int256"
			}
		],
		"name": "setPriceFeed",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "newSubtitle",
				"type": "string"
			}
		],
		"name": "setSubtitle",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "newPriceUsd18",
				"type": "uint256"
			}
		],
		"name": "setTokenPriceUsd",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "usdPrice",
				"type": "uint256"
			}
		],
		"name": "setUsdRate",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint48",
				"name": "_start",
				"type": "uint48"
			},
			{
				"internalType": "uint48",
				"name": "_end",
				"type": "uint48"
			}
		],
		"name": "setWindow",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "newSubtitle",
				"type": "string"
			}
		],
		"name": "SubtitleUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "accepted",
				"type": "bool"
			},
			{
				"indexed": false,
				"internalType": "uint8",
				"name": "decimals",
				"type": "uint8"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "usdPrice",
				"type": "uint256"
			}
		],
		"name": "TokenConfigured",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newPriceUsd18",
				"type": "uint256"
			}
		],
		"name": "TokenPriceUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "buyer",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "payToken",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "payAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "tokensOut",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "usdPaid",
				"type": "uint256"
			}
		],
		"name": "TokensPurchased",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "treasury",
				"type": "address"
			}
		],
		"name": "TreasuryInitialized",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "usdPrice",
				"type": "uint256"
			}
		],
		"name": "UsdRateSet",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint48",
				"name": "start",
				"type": "uint48"
			},
			{
				"indexed": false,
				"internalType": "uint48",
				"name": "end",
				"type": "uint48"
			}
		],
		"name": "WindowUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "asset",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Withdraw",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "withdrawNative",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "token",
				"type": "address"
			}
		],
		"name": "withdrawToken",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	},
	{
		"inputs": [],
		"name": "DISPLAY_NAME",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "endTime",
		"outputs": [
			{
				"internalType": "uint48",
				"name": "",
				"type": "uint48"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "hardCapUsd18",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "NATIVE",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "pendingOwner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "QC7",
		"outputs": [
			{
				"internalType": "contract IERC20",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "QC7_DECIMALS",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "valueWei",
				"type": "uint256"
			}
		],
		"name": "quoteNative",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "tokensOut",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "usdPaid",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "payToken",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "quoteToken",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "tokensOut",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "usdPaid",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "spentUsd18",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "startTime",
		"outputs": [
			{
				"internalType": "uint48",
				"name": "",
				"type": "uint48"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "subtitle",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "TOKEN_SYMBOL",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "tokenInfo",
		"outputs": [
			{
				"internalType": "bool",
				"name": "accepted",
				"type": "bool"
			},
			{
				"internalType": "uint8",
				"name": "decimals",
				"type": "uint8"
			},
			{
				"internalType": "uint256",
				"name": "usdPrice",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "useOracle",
				"type": "bool"
			},
			{
				"internalType": "contract IAggregatorV3",
				"name": "feed",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "maxStale",
				"type": "uint256"
			},
			{
				"internalType": "int256",
				"name": "minPrice",
				"type": "int256"
			},
			{
				"internalType": "int256",
				"name": "maxPrice",
				"type": "int256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "tokenPriceUsd18",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalRaisedUsd18",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "TREASURY",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "walletCapUsd18",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}

];

/**
 * Standard ERC20 Token ABI
 *
 * Minimal ABI for interacting with ERC20 tokens like USDT, USDC.
 * Includes essential functions for:
 * - Approving token spending (approve)
 * - Checking approval amounts (allowance)
 * - Checking token balances (balanceOf)
 * - Getting token decimals (decimals)
 */
export const ERC20_ABI = [
  {
    "type": "function",
    "name": "approve",
    "inputs": [
      {"name": "spender", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "allowance",
    "inputs": [
      {"name": "owner", "type": "address"},
      {"name": "spender", "type": "address"}
    ],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [
      {"name": "account", "type": "address"}
    ],
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "decimals",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint8"}],
    "stateMutability": "view"
  }
];

// ══════════════════════════════════════════════════════════════════════════════════════
// PRESALE CONFIGURATION CONSTANTS
// ══════════════════════════════════════════════════════════════════════════════════════

/** Sepolia testnet chain ID for network validation */
export const SEPOLIA_CHAIN_ID = 11155111;

/** Maximum amount that can be raised in the presale (USD) */
export const HARDCAP_USD = 1000000; // $1,000,000 USD

/** Price per QC7 token in USD */
export const TOKEN_PRICE = 0.001; // $0.001 per token

/**
 * Calculate presale end date
 * Set to 2 months from deployment for demonstration
 * In production, this should be set to a specific date
 */
const now = new Date();
const endDate = new Date(now.getTime() + (2 * 30 * 24 * 60 * 60 * 1000)); // 2 months from now

/** Presale end date as Unix timestamp */
export const PRESALE_END_DATE = Math.floor(endDate.getTime() / 1000);