"use client";

import { ethers } from 'ethers';

// Multiple RPC endpoints for Base Sepolia (most reliable first)
const BASE_SEPOLIA_RPCS = [
  "https://base-sepolia.g.alchemy.com/v2/demo",
  "https://base-sepolia.g.alchemy.com/v2/public",
  "https://sepolia.base.org",
  "https://base-sepolia.blockpi.network/v1/rpc/public",
];

const BASE_MAINNET_RPCS = [
  "https://base-mainnet.g.alchemy.com/v2/demo",
  "https://base-mainnet.g.alchemy.com/v2/public", 
  "https://base.llamarpc.com",
  "https://mainnet.base.org",
];

export class RobustRpcProvider {
  private currentRpcIndex = 0;
  private isTestnet: boolean;
  private rpcs: string[];

  constructor(isTestnet = true) {
    this.isTestnet = isTestnet;
    this.rpcs = isTestnet ? BASE_SEPOLIA_RPCS : BASE_MAINNET_RPCS;
  }

  async getProvider(): Promise<ethers.JsonRpcProvider> {
    for (let attempt = 0; attempt < this.rpcs.length; attempt++) {
      try {
        const rpcUrl = this.rpcs[this.currentRpcIndex];
        console.log(`Trying RPC endpoint: ${rpcUrl}`);
        
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        
        // Test the connection
        await provider.getBlockNumber();
        
        console.log(`Successfully connected to: ${rpcUrl}`);
        return provider;
      } catch (error) {
        console.warn(`RPC endpoint failed: ${this.rpcs[this.currentRpcIndex]}`, error);
        this.currentRpcIndex = (this.currentRpcIndex + 1) % this.rpcs.length;
      }
    }
    
    throw new Error('All RPC endpoints failed');
  }

  async getBalance(address: string): Promise<string> {
    const maxRetries = this.rpcs.length;
    
    for (let retry = 0; retry < maxRetries; retry++) {
      try {
        const provider = await this.getProvider();
        const balance = await provider.getBalance(address);
        return ethers.formatEther(balance);
      } catch (error: any) {
        console.warn(`Balance fetch attempt ${retry + 1} failed:`, error.message);
        
        if (retry === maxRetries - 1) {
          // All attempts failed
          if (error.code === -32603 || error.code === -32000 || 
              error.message?.includes('missing trie node') ||
              error.message?.includes('Internal JSON-RPC error')) {
            return 'N/A';
          }
          throw error;
        }
        
        // Try next RPC
        this.currentRpcIndex = (this.currentRpcIndex + 1) % this.rpcs.length;
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
      }
    }
    
    return 'N/A';
  }
}

// Singleton instances
export const sepoliaRpcProvider = new RobustRpcProvider(true);
export const mainnetRpcProvider = new RobustRpcProvider(false);