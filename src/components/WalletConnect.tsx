"use client";

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Copy, ExternalLink, Wallet, LogOut } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { BASE_SEPOLIA_CONFIG, BASE_MAINNET_CONFIG } from '~/lib/contract';
import { User, NetworkConfig } from '~/lib/types';

interface WalletConnectProps {
  user: User | null;
  onUserChange: (user: User | null) => void;
}

export default function WalletConnect({ user, onUserChange }: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [networkSwitching, setNetworkSwitching] = useState(false);
  const [copied, setCopied] = useState(false);

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          const network = await provider.getNetwork();
          
          // Skip balance check to avoid RPC issues
          onUserChange({
            address,
            balance: '0', // Default balance to avoid RPC calls
            isConnected: true,
            chainId: Number(network.chainId),
          });
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask or Coinbase Wallet to use this app');
      return;
    }

    setIsConnecting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Request account access
      await provider.send('eth_requestAccounts', []);
      
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      
      // Skip balance check to avoid RPC issues
      onUserChange({
        address,
        balance: '0', // Default balance to avoid RPC calls
        isConnected: true,
        chainId: Number(network.chainId),
      });

      // Check if we need to switch to Base network
      const currentChainId = Number(network.chainId);
      if (currentChainId !== BASE_SEPOLIA_CONFIG.chainId && currentChainId !== BASE_MAINNET_CONFIG.chainId) {
        await switchToBaseNetwork();
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      if (error.code === 4001) {
        alert('Please connect your wallet to continue');
      } else {
        alert('Failed to connect wallet. Please try again.');
      }
    }
    setIsConnecting(false);
  };

  const disconnectWallet = () => {
    onUserChange(null);
  };

  const switchToBaseNetwork = async () => {
    if (!window.ethereum) return;

    setNetworkSwitching(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Try Base Sepolia first (testnet)
      await switchNetwork(BASE_SEPOLIA_CONFIG);
    } catch (error: any) {
      console.error('Error switching network:', error);
      if (error.code === 4902) {
        // Network not added, try to add it
        await addNetwork(BASE_SEPOLIA_CONFIG);
      } else {
        alert('Failed to switch network. Please switch to Base network manually.');
      }
    }
    setNetworkSwitching(false);
  };

  const switchNetwork = async (networkConfig: NetworkConfig) => {
    if (!window.ethereum) return;

    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${networkConfig.chainId.toString(16)}` }],
    });
  };

  const addNetwork = async (networkConfig: NetworkConfig) => {
    if (!window.ethereum) return;

    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: `0x${networkConfig.chainId.toString(16)}`,
        chainName: networkConfig.name,
        rpcUrls: [networkConfig.rpcUrl],
        blockExplorerUrls: [networkConfig.blockExplorerUrl],
        nativeCurrency: networkConfig.nativeCurrency,
      }],
    });
  };

  const copyAddress = async () => {
    if (user?.address) {
      await navigator.clipboard.writeText(user.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkName = (chainId: number) => {
    switch (chainId) {
      case BASE_SEPOLIA_CONFIG.chainId:
        return 'Base Sepolia';
      case BASE_MAINNET_CONFIG.chainId:
        return 'Base';
      default:
        return 'Unknown Network';
    }
  };

  const isBaseNetwork = (chainId: number) => {
    return chainId === BASE_SEPOLIA_CONFIG.chainId || chainId === BASE_MAINNET_CONFIG.chainId;
  };

  if (!user?.isConnected) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center gap-2 text-blue-600">
          <Wallet className="w-8 h-8" />
          <h2 className="text-xl font-semibold">Connect Wallet</h2>
        </div>
        <p className="text-gray-600 text-center max-w-md">
          Connect your wallet to create campaigns or submit reviews on BaseReviews
        </p>
        <Button 
          onClick={connectWallet} 
          disabled={isConnecting}
          className="min-w-[200px]"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">Wallet Connected</span>
          </div>
          
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-sm">{truncateAddress(user.address)}</span>
            <button
              onClick={copyAddress}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Copy address"
            >
              <Copy className="w-4 h-4 text-gray-500" />
            </button>
            {copied && <span className="text-xs text-green-600">Copied!</span>}
          </div>
          
          <div className="text-sm text-gray-600 mb-2">
            Balance: {parseFloat(user.balance).toFixed(4)} ETH
          </div>
          
          {user.chainId && (
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                isBaseNetwork(user.chainId) 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {getNetworkName(user.chainId)}
              </span>
              {!isBaseNetwork(user.chainId) && (
                <Button
                  onClick={switchToBaseNetwork}
                  disabled={networkSwitching}
                  size="sm"
                  variant="outline"
                >
                  {networkSwitching ? 'Switching...' : 'Switch to Base'}
                </Button>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={() => window.open(`${BASE_SEPOLIA_CONFIG.blockExplorerUrl}/address/${user.address}`, '_blank')}
            variant="outline"
            size="sm"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
          <Button
            onClick={disconnectWallet}
            variant="outline"
            size="sm"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}