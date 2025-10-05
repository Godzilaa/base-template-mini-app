"use client";

import { useState } from 'react';
import { ethers } from 'ethers';
import { BASE_REVIEWS_ABI, CONTRACT_ADDRESS } from '~/lib/contract';
import { Button } from '~/components/ui/Button';

export default function QuickContractTest() {
  const [status, setStatus] = useState<string>('Ready to test');
  const [testing, setTesting] = useState(false);

  const quickTest = async () => {
    setTesting(true);
    setStatus('Testing contract...');

    try {
      // Test using public RPC (no MetaMask required)
      const provider = new ethers.JsonRpcProvider('https://base-sepolia.g.alchemy.com/v2/demo');
      const contract = new ethers.Contract(CONTRACT_ADDRESS, BASE_REVIEWS_ABI, provider);

      setStatus('Calling campaignCount...');
      const count = await contract.campaignCount();
      
      setStatus(`✅ Contract is working! Campaign count: ${count.toString()}`);
      
      // If there are campaigns, try to get one
      if (count > 0) {
        setStatus('Getting campaign details...');
        const campaign = await contract.campaigns(0);
        setStatus(`✅ Contract fully functional! First campaign owner: ${campaign.businessOwner}`);
      }

    } catch (error: any) {
      console.error('Contract test error:', error);
      setStatus(`❌ Contract error: ${error.message || 'Unknown error'}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4">Quick Contract Test</h3>
      
      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          <p><strong>Contract:</strong> {CONTRACT_ADDRESS}</p>
          <p><strong>Network:</strong> Base Sepolia</p>
        </div>
        
        <Button 
          onClick={quickTest}
          disabled={testing}
          className="w-full"
        >
          {testing ? 'Testing...' : 'Test Contract Now'}
        </Button>
        
        <div className="bg-gray-100 p-3 rounded min-h-[60px] flex items-center">
          <p className="text-sm">{status}</p>
        </div>
      </div>
    </div>
  );
}