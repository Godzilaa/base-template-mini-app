"use client";

import { useState } from 'react';
import { ethers } from 'ethers';
import { BASE_REVIEWS_ABI, CONTRACT_ADDRESS } from '~/lib/contract';
import { sepoliaRpcProvider } from '~/lib/rpcProvider';
import { Button } from '~/components/ui/Button';

interface ContractCheckResult {
  test: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  details?: any;
}

export default function ContractChecker() {
  const [results, setResults] = useState<ContractCheckResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (result: ContractCheckResult) => {
    setResults(prev => [...prev, result]);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);
    
    // Test 1: Contract Address Validation
    addResult({
      test: 'Contract Address Validation',
      status: 'pending',
      message: 'Checking contract address format...'
    });

    try {
      if (!CONTRACT_ADDRESS) {
        throw new Error('Contract address not found in environment variables');
      }
      
      if (!ethers.isAddress(CONTRACT_ADDRESS)) {
        throw new Error('Invalid contract address format');
      }

      setResults(prev => prev.map(r => 
        r.test === 'Contract Address Validation' 
          ? { ...r, status: 'success' as const, message: `✅ Valid address: ${CONTRACT_ADDRESS}` }
          : r
      ));
    } catch (error: any) {
      setResults(prev => prev.map(r => 
        r.test === 'Contract Address Validation' 
          ? { ...r, status: 'error' as const, message: `❌ ${error.message}` }
          : r
      ));
    }

    // Test 2: RPC Connection
    addResult({
      test: 'RPC Connection',
      status: 'pending',
      message: 'Testing RPC connection to Base Sepolia...'
    });

    try {
      const provider = await sepoliaRpcProvider.getProvider();
      const blockNumber = await provider.getBlockNumber();
      
      setResults(prev => prev.map(r => 
        r.test === 'RPC Connection' 
          ? { ...r, status: 'success' as const, message: `✅ Connected! Latest block: ${blockNumber}` }
          : r
      ));
    } catch (error: any) {
      setResults(prev => prev.map(r => 
        r.test === 'RPC Connection' 
          ? { ...r, status: 'error' as const, message: `❌ RPC Error: ${error.message}` }
          : r
      ));
    }

    // Test 3: Contract Deployment Check
    addResult({
      test: 'Contract Deployment',
      status: 'pending',
      message: 'Checking if contract is deployed...'
    });

    try {
      const provider = await sepoliaRpcProvider.getProvider();
      const code = await provider.getCode(CONTRACT_ADDRESS);
      
      if (code === '0x') {
        throw new Error('No contract found at this address');
      }

      setResults(prev => prev.map(r => 
        r.test === 'Contract Deployment' 
          ? { ...r, status: 'success' as const, message: `✅ Contract deployed! Code size: ${code.length} chars` }
          : r
      ));
    } catch (error: any) {
      setResults(prev => prev.map(r => 
        r.test === 'Contract Deployment' 
          ? { ...r, status: 'error' as const, message: `❌ ${error.message}` }
          : r
      ));
    }

    // Test 4: Contract Function Call
    addResult({
      test: 'Contract Function Call',
      status: 'pending',
      message: 'Testing contract function calls...'
    });

    try {
      const provider = await sepoliaRpcProvider.getProvider();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, BASE_REVIEWS_ABI, provider);
      
      // Try to call campaignCount function
      const campaignCount = await contract.campaignCount();
      
      setResults(prev => prev.map(r => 
        r.test === 'Contract Function Call' 
          ? { ...r, status: 'success' as const, message: `✅ Function call successful! Campaign count: ${campaignCount.toString()}`, details: { campaignCount: campaignCount.toString() } }
          : r
      ));
    } catch (error: any) {
      setResults(prev => prev.map(r => 
        r.test === 'Contract Function Call' 
          ? { ...r, status: 'error' as const, message: `❌ Function call failed: ${error.message}` }
          : r
      ));
    }

    // Test 5: MetaMask Integration
    addResult({
      test: 'MetaMask Integration',
      status: 'pending',
      message: 'Testing MetaMask integration...'
    });

    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('MetaMask not detected');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      
      setResults(prev => prev.map(r => 
        r.test === 'MetaMask Integration' 
          ? { ...r, status: 'success' as const, message: `✅ MetaMask available! Connected to Chain ID: ${network.chainId}`, details: { chainId: network.chainId.toString(), networkName: network.name } }
          : r
      ));
    } catch (error: any) {
      setResults(prev => prev.map(r => 
        r.test === 'MetaMask Integration' 
          ? { ...r, status: 'error' as const, message: `❌ ${error.message}` }
          : r
      ));
    }

    // Test 6: Contract ABI Validation
    addResult({
      test: 'Contract ABI Validation',
      status: 'pending',
      message: 'Validating contract ABI...'
    });

    try {
      const requiredFunctions = ['campaignCount', 'campaigns', 'createCampaign', 'submitReview'];
      const abiFunctions = BASE_REVIEWS_ABI.filter(item => item.type === 'function').map(item => item.name || '');
      
      const missingFunctions = requiredFunctions.filter(fn => !abiFunctions.includes(fn));
      
      if (missingFunctions.length > 0) {
        throw new Error(`Missing functions in ABI: ${missingFunctions.join(', ')}`);
      }

      setResults(prev => prev.map(r => 
        r.test === 'Contract ABI Validation' 
          ? { ...r, status: 'success' as const, message: `✅ ABI valid! Found ${abiFunctions.length} functions`, details: { functions: abiFunctions } }
          : r
      ));
    } catch (error: any) {
      setResults(prev => prev.map(r => 
        r.test === 'Contract ABI Validation' 
          ? { ...r, status: 'error' as const, message: `❌ ${error.message}` }
          : r
      ));
    }

    setIsRunning(false);
  };

  const checkContractOnBaseScan = () => {
    const url = `https://sepolia.basescan.org/address/${CONTRACT_ADDRESS}`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Smart Contract Verification</h2>
        <Button 
          onClick={checkContractOnBaseScan}
          variant="outline"
          className="flex items-center gap-2"
        >
          View on BaseScan
        </Button>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h3 className="font-semibold mb-2">Contract Information:</h3>
        <p className="text-sm"><strong>Address:</strong> {CONTRACT_ADDRESS}</p>
        <p className="text-sm"><strong>Network:</strong> Base Sepolia (Chain ID: 84532)</p>
        <p className="text-sm"><strong>Explorer:</strong> https://sepolia.basescan.org</p>
      </div>

      <Button 
        onClick={runAllTests}
        disabled={isRunning}
        className="w-full mb-6"
      >
        {isRunning ? 'Running Tests...' : 'Run All Contract Tests'}
      </Button>

      <div className="space-y-4">
        {results.map((result, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg border ${
              result.status === 'success' ? 'bg-green-50 border-green-200' :
              result.status === 'error' ? 'bg-red-50 border-red-200' :
              'bg-yellow-50 border-yellow-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">{result.test}</h4>
              <span className={`text-sm px-2 py-1 rounded ${
                result.status === 'success' ? 'bg-green-200 text-green-800' :
                result.status === 'error' ? 'bg-red-200 text-red-800' :
                'bg-yellow-200 text-yellow-800'
              }`}>
                {result.status}
              </span>
            </div>
            <p className="text-sm">{result.message}</p>
            {result.details && (
              <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-x-auto">
                {JSON.stringify(result.details, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>

      {results.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          Click "Run All Contract Tests" to begin verification
        </div>
      )}
    </div>
  );
}