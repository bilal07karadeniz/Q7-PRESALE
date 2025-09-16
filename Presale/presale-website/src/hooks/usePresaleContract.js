// ══════════════════════════════════════════════════════════════════════════════════════
// PRESALE SMART CONTRACT HOOK
// ══════════════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAppKitProvider, useAppKitAccount } from '@reown/appkit/react';
import {
  PRESALE_CONTRACT_ADDRESS,
  USDC_CONTRACT_ADDRESS,
  PRESALE_ABI,
  ERC20_ABI,
  SEPOLIA_CHAIN_ID
} from '../config/contracts';

/**
 * Custom Hook for Presale Smart Contract Interactions
 *
 * This hook provides a complete interface for interacting with the QC7 presale
 * smart contract. It handles:
 * - Contract initialization with wallet connection
 * - Read-only contract access for quotes when wallet is disconnected
 * - Purchase functions for ETH and USDC payments
 * - Data fetching functions for UI updates
 * - Loading states and error handling
 * - Automatic contract switching based on connection status
 *
 * @returns {Object} Hook interface with contract methods and state
 */
export function usePresaleContract() {
  // ────────────────────────────────────────────────────────────────────────────────────
  // WALLET CONNECTION STATE
  // ────────────────────────────────────────────────────────────────────────────────────

  /** Wallet provider from AppKit for contract interactions */
  const { walletProvider } = useAppKitProvider('eip155');

  /** User connection status and wallet address */
  const { isConnected, address } = useAppKitAccount();

  // ────────────────────────────────────────────────────────────────────────────────────
  // CONTRACT STATE
  // ────────────────────────────────────────────────────────────────────────────────────

  /** Main presale contract instance (writable when connected, read-only when not) */
  const [contract, setContract] = useState(null);

  /** USDC token contract for approvals and balance checks */
  const [usdcContract, setUsdcContract] = useState(null);

  /** Loading state for contract operations */
  const [loading, setLoading] = useState(false);

  /** Error state for failed operations */
  const [error, setError] = useState(null);

  // ────────────────────────────────────────────────────────────────────────────────────
  // CONTRACT INITIALIZATION EFFECT
  // ────────────────────────────────────────────────────────────────────────────────────

  /**
   * Initialize smart contracts based on wallet connection status
   * - When connected: Creates writable contracts with signer for transactions
   * - When disconnected: Creates read-only contracts for quotes and data fetching
   */
  useEffect(() => {
    const initContracts = async () => {
      if (walletProvider && isConnected) {
        try {
          const ethersProvider = new ethers.BrowserProvider(walletProvider);
          const signer = await ethersProvider.getSigner();
          
          const presaleContract = new ethers.Contract(
            PRESALE_CONTRACT_ADDRESS,
            PRESALE_ABI,
            signer
          );
          
          const usdcContract = new ethers.Contract(
            USDC_CONTRACT_ADDRESS,
            ERC20_ABI,
            signer
          );
          
          setContract(presaleContract);
          setUsdcContract(usdcContract);
        } catch (err) {
          console.error('Contract initialization error:', err);
          setError(err.message);
        }
      } else {
        // Create read-only contracts for quote functions even when wallet is not connected
        try {
          const provider = new ethers.JsonRpcProvider('https://rpc.sepolia.org');
          const readOnlyContract = new ethers.Contract(
            PRESALE_CONTRACT_ADDRESS,
            PRESALE_ABI,
            provider
          );
          setContract(readOnlyContract);
          setUsdcContract(null);
        } catch (err) {
          console.error('Read-only contract initialization error:', err);
          setContract(null);
          setUsdcContract(null);
        }
      }
    };

    initContracts();
  }, [walletProvider, isConnected]);

  const buyWithETH = async (ethAmount) => {
    if (!contract) throw new Error('Contract not initialized');
    if (!isConnected) throw new Error('Wallet not connected');
    
    setLoading(true);
    setError(null);
    
    try {
      // Ensure we have a signer for transactions
      const ethersProvider = new ethers.BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      const contractWithSigner = new ethers.Contract(
        PRESALE_CONTRACT_ADDRESS,
        PRESALE_ABI,
        signer
      );
      
      const tx = await contractWithSigner.buyWithNative({
        value: ethers.parseEther(ethAmount.toString())
      });
      
      await tx.wait();
      return tx;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const buyWithUSDC = async (usdcAmount) => {
    if (!contract) throw new Error('Contract not initialized');
    if (!isConnected) throw new Error('Wallet not connected');
    
    setLoading(true);
    setError(null);
    
    try {
      // Ensure we have a signer for transactions
      const ethersProvider = new ethers.BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      
      const usdcContractWithSigner = new ethers.Contract(
        USDC_CONTRACT_ADDRESS,
        ERC20_ABI,
        signer
      );
      
      const presaleContractWithSigner = new ethers.Contract(
        PRESALE_CONTRACT_ADDRESS,
        PRESALE_ABI,
        signer
      );
      
      // First check allowance
      const allowance = await usdcContractWithSigner.allowance(address, PRESALE_CONTRACT_ADDRESS);
      const amountWei = ethers.parseUnits(usdcAmount.toString(), 6); // USDC has 6 decimals
      
      // If allowance is insufficient, approve first
      if (allowance < amountWei) {
        const approveTx = await usdcContractWithSigner.approve(PRESALE_CONTRACT_ADDRESS, amountWei);
        await approveTx.wait();
      }
      
      // Then buy tokens
      const tx = await presaleContractWithSigner.buyWithToken(USDC_CONTRACT_ADDRESS, amountWei);
      await tx.wait();
      return tx;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTotalRaised = async () => {
    if (!contract) return '0';
    
    try {
      const totalRaised = await contract.totalRaisedUsd18();
      return ethers.formatEther(totalRaised);
    } catch (err) {
      console.error('Error getting total raised:', err);
      return '0';
    }
  };

  const getUserSpent = async () => {
    if (!contract || !address) return '0';
    
    try {
      const spent = await contract.spentUsd18(address);
      return ethers.formatEther(spent);
    } catch (err) {
      console.error('Error getting user spent:', err);
      return '0';
    }
  };

  const addTokenToWallet = async () => {
    if (!walletProvider || !isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      const tokenSymbol = 'QC7';
      const tokenDecimals = 18;
      const tokenImage = 'https://via.placeholder.com/64x64/627EEA/FFFFFF?text=QC7'; // You can replace with actual QC7 logo

      // Get QC7 token address from contract
      const qc7Address = await contract.QC7();

      await walletProvider.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: qc7Address,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
            image: tokenImage,
          },
        },
      });
    } catch (err) {
      console.error('Error adding token to wallet:', err);
      throw err;
    }
  };

  const getHardCap = async () => {
    if (!contract) return '0';
    
    try {
      const hardCap = await contract.hardCapUsd18();
      return ethers.formatEther(hardCap);
    } catch (err) {
      console.error('Error getting hard cap:', err);
      return '1000000'; // fallback to 1M
    }
  };

  const getTokenPrice = async () => {
    if (!contract) return '0';
    
    try {
      const price = await contract.tokenPriceUsd18();
      return ethers.formatEther(price);
    } catch (err) {
      console.error('Error getting token price:', err);
      return '0.001'; // fallback
    }
  };

  const getQuote = async (isETH, amount) => {
    if (!contract) return { tokensOut: '0', usdPaid: '0' };
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return { tokensOut: '0', usdPaid: '0' };
    }
    
    try {
      let quote;
      if (isETH) {
        const valueWei = ethers.parseEther(amount.toString());
        quote = await contract.quoteNative(valueWei);
      } else {
        const amountWei = ethers.parseUnits(amount.toString(), 6);
        quote = await contract.quoteToken(USDC_CONTRACT_ADDRESS, amountWei);
      }
      
      return {
        tokensOut: ethers.formatEther(quote.tokensOut),
        usdPaid: ethers.formatEther(quote.usdPaid)
      };
    } catch (err) {
      console.error('Error getting quote:', err);
      return { tokensOut: '0', usdPaid: '0' };
    }
  };

  return {
    contract,
    usdcContract,
    loading,
    error,
    isConnected,
    address,
    buyWithETH,
    buyWithUSDC,
    getTotalRaised,
    getUserSpent,
    getHardCap,
    getTokenPrice,
    getQuote,
    addTokenToWallet
  };
}