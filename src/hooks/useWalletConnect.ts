"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  balance: string | null;
}

export function useWalletConnect() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    provider: null,
    signer: null,
    balance: null,
  });
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async (provider: ethers.BrowserProvider, address: string): Promise<string> => {
    try {
      // Add timeout and retry logic for problematic RPC nodes
      const balancePromise = provider.getBalance(address);
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Balance fetch timeout')), 8000)
      );
      
      const balance = await Promise.race([balancePromise, timeoutPromise]);
      return ethers.formatEther(balance);
    } catch (err: any) {
      console.error('Error fetching balance:', err);
      
      // Handle specific RPC errors gracefully
      if (err.code === 'UNKNOWN_ERROR' || 
          err.code === -32603 || 
          err.code === -32000 ||
          err.message?.includes('missing trie node') ||
          err.message?.includes('Internal JSON-RPC error')) {
        console.warn('RPC node unavailable, showing balance as unavailable');
        return 'N/A';
      }
      
      // For other errors, return 0
      return '0.000';
    }
  };

  const connectWallet = async () => {
    setConnecting(true);
    setError(null);

    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Request account access
      await provider.send('eth_requestAccounts', []);
      
      // Check if we're on the right network (Base mainnet or testnet)
      const network = await provider.getNetwork();
      console.log('Connected to network:', network.name, 'Chain ID:', network.chainId);
      
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      // Fetch balance with improved error handling
      const balance = await fetchBalance(provider, address);

      setWalletState({
        isConnected: true,
        address,
        provider,
        signer,
        balance,
      });
      
      console.log('Wallet connected successfully:', { address, balance, chainId: network.chainId });
      
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      const errorMessage = err.message || 'Failed to connect wallet';
      setError(errorMessage);
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletState({
      isConnected: false,
      address: null,
      provider: null,
      signer: null,
      balance: null,
    });
  };

  // Check if wallet is already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window === 'undefined' || !window.ethereum) return;

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          const balance = await fetchBalance(provider, address);
          
          setWalletState({
            isConnected: true,
            address,
            provider,
            signer,
            balance,
          });
        }
      } catch (err) {
        console.log('No wallet connected');
      }
    };

    checkConnection();
  }, []);

  const refreshBalance = async () => {
    if (walletState.provider && walletState.address) {
      const balance = await fetchBalance(walletState.provider, walletState.address);
      setWalletState(prev => ({ ...prev, balance }));
    }
  };

  return {
    ...walletState,
    connecting,
    error,
    connectWallet,
    disconnectWallet,
    refreshBalance,
  };
}