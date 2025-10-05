"use client";

import { useState } from 'react';
import { ethers } from 'ethers';
import { BASE_REVIEWS_ABI, CONTRACT_ADDRESS } from '~/lib/contract';
import { Button } from '~/components/ui/Button';

export default function ContractTest() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testContractConnection = async () => {
    setLoading(true);
    setResult('Testing contract connection...');

    try {
      // Check if MetaMask is available
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask not found');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, BASE_REVIEWS_ABI, provider);

      // Test contract read function
      const campaignCount = await contract.campaignCount();
      setResult(`✅ Contract connected! Campaign count: ${campaignCount.toString()}`);

    } catch (error: any) {
      console.error('Contract test error:', error);
      setResult(`❌ Contract test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testSigning = async () => {
    setLoading(true);
    setResult('Testing signing functionality...');

    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask not found');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // Test signing a simple message
      const message = 'BaseReviews signing test';
      const signature = await signer.signMessage(message);

      setResult(`✅ Signing works! Address: ${address.slice(0, 6)}...${address.slice(-4)} Signature: ${signature.slice(0, 20)}...`);

    } catch (error: any) {
      console.error('Signing test error:', error);
      setResult(`❌ Signing test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Contract & Signing Test</h2>
      
      <div className="space-y-4 mb-6">
        <Button 
          onClick={testContractConnection}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Testing...' : 'Test Contract Connection'}
        </Button>
        
        <Button 
          onClick={testSigning}
          disabled={loading}
          className="w-full"
          variant="outline"
        >
          {loading ? 'Testing...' : 'Test Signing Functionality'}
        </Button>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg min-h-[100px]">
        <h3 className="font-semibold mb-2">Test Results:</h3>
        <p className="text-sm font-mono whitespace-pre-wrap">{result || 'Click a button to run tests'}</p>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Contract Address:</strong> {CONTRACT_ADDRESS}</p>
        <p><strong>Network:</strong> Base Sepolia (Chain ID: 84532)</p>
      </div>
    </div>
  );
}