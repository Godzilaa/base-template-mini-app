"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { sepoliaRpcProvider } from '~/lib/rpcProvider';

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
  const [refreshingBalance, setRefreshingBalance] = useState(false);

  const fetchBalance = async (provider: ethers.BrowserProvider, address: string): Promise<string> => {
    try {
      // First try with the user's MetaMask provider
      const balancePromise = provider.getBalance(address);
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Balance fetch timeout')), 5000)
      );
      
      const balance = await Promise.race([balancePromise, timeoutPromise]);
      return ethers.formatEther(balance);
    } catch (err: any) {
      console.error('MetaMask provider failed, trying fallback RPC:', err);
      
      // If MetaMask provider fails, try our robust RPC provider
      try {
        const fallbackBalance = await sepoliaRpcProvider.getBalance(address);
        console.log('Successfully fetched balance from fallback RPC');
        return fallbackBalance;
      } catch (fallbackErr: any) {
        console.error('All RPC providers failed:', fallbackErr);
        
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
    }
  };

  const switchToBaseNetwork = async () => {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      const chainId = '0x14a34'; // Base Sepolia chain ID (84532 in hex)
      
      try {
        // Try to switch to Base Sepolia
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId }],
        });
        console.log('Successfully switched to Base Sepolia network');
      } catch (switchError: any) {
        // If the network doesn't exist, add it
        if (switchError.code === 4902) {
          console.log('Base Sepolia not found, adding network...');
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: chainId,
                chainName: 'Base Sepolia',
                nativeCurrency: {
                  name: 'Ethereum',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://base-sepolia.g.alchemy.com/v2/demo'],
                blockExplorerUrls: ['https://sepolia.basescan.org/'],
                iconUrls: ['https://base.org/favicon.ico'],
              },
            ],
          });
          console.log('Base Sepolia network added successfully');
        } else {
          throw switchError;
        }
      }
    } catch (error) {
      console.error('Failed to switch network:', error);
      throw error;
    }
  };

  const connectWallet = async () => {
    setConnecting(true);
    setError(null);

    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Request account access
      await provider.send('eth_requestAccounts', []);
      
      // Check current network and switch to Base Sepolia if needed
      const network = await provider.getNetwork();
      console.log('Current network:', network.name, 'Chain ID:', network.chainId);
      
      const baseSepoliaChainId = 84532;
      if (Number(network.chainId) !== baseSepoliaChainId) {
        console.log('Wrong network detected, switching to Base Sepolia...');
        await switchToBaseNetwork();
        
        // Refresh provider after network switch
        const newProvider = new ethers.BrowserProvider(window.ethereum);
        const newNetwork = await newProvider.getNetwork();
        console.log('Switched to network:', newNetwork.name, 'Chain ID:', newNetwork.chainId);
      }
      
      // Get signer and address
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      // Set wallet state first, then optionally fetch balance
      setWalletState({
        isConnected: true,
        address,
        provider,
        signer,
        balance: 'N/A', // Start with N/A
      });
      
      console.log('Wallet connected successfully:', { address, chainId: network.chainId });
      
      // Try to fetch balance in background, but don't block the connection
      fetchBalance(provider, address)
        .then(balance => {
          setWalletState(prev => ({ ...prev, balance }));
        })
        .catch(err => {
          console.log('Balance fetch failed, keeping N/A');
        });
      
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      let errorMessage = 'Failed to connect wallet';
      
      if (err.message?.includes('MetaMask is not installed')) {
        errorMessage = 'MetaMask is not installed. Please install MetaMask extension.';
      } else if (err.code === 4001) {
        errorMessage = 'Connection rejected. Please approve the connection request.';
      } else if (err.code === -32002) {
        errorMessage = 'Connection request pending. Please check MetaMask.';
      } else {
        errorMessage = err.message || 'Failed to connect wallet';
      }
      
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
          
          // Set wallet as connected without fetching balance on mount
          // Balance will be fetched only when user explicitly connects
          setWalletState({
            isConnected: true,
            address,
            provider,
            signer,
            balance: 'N/A', // Start with N/A to avoid RPC calls
          });
          
          console.log('Wallet auto-connected:', address);
        }
      } catch (err) {
        console.log('No wallet auto-connection available');
      }
    };

    checkConnection();
  }, []);

  const refreshBalance = async () => {
    if (walletState.address) {
      setRefreshingBalance(true);
      try {
        // Try to get balance using our robust RPC provider directly
        console.log('Refreshing balance using robust RPC provider...');
        const balance = await sepoliaRpcProvider.getBalance(walletState.address);
        setWalletState(prev => ({ ...prev, balance }));
        console.log('Balance refreshed successfully:', balance);
      } catch (err) {
        console.error('Failed to refresh balance:', err);
        setWalletState(prev => ({ ...prev, balance: 'N/A' }));
      } finally {
        setRefreshingBalance(false);
      }
    }
  };

  return {
    ...walletState,
    connecting,
    error,
    refreshingBalance,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    switchToBaseNetwork,
  };
}