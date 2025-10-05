/**
 * BaseReviews Smart Contract ABI and Configuration
 */

export const BASE_REVIEWS_ABI = [
  {
    "type": "function",
    "name": "campaignCount",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "campaigns",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "businessOwner",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "reviewLink",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "totalPool",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "rewardAmount",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "claimedReviews",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "isActive",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "hasClaimed",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "createCampaign",
    "inputs": [
      {
        "name": "_reviewLink",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "_rewardAmount",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "submitReview",
    "inputs": [
      {
        "name": "_campaignId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_proofLink",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "closeCampaign",
    "inputs": [
      {
        "name": "_campaignId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "CampaignCreated",
    "inputs": [
      {
        "name": "campaignId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "businessOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "reviewLink",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "totalPool",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "rewardAmount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ReviewSubmitted",
    "inputs": [
      {
        "name": "campaignId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "reviewer",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "proofLink",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "rewardAmount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "CampaignClosed",
    "inputs": [
      {
        "name": "campaignId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "businessOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "refundAmount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  }
] as const;

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;

export const BASE_SEPOLIA_CONFIG = {
  chainId: 84532,
  name: 'Base Sepolia',
  rpcUrl: 'https://base-sepolia-rpc.publicnode.com',
  blockExplorerUrl: 'https://sepolia.basescan.org',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
};

export const BASE_MAINNET_CONFIG = {
  chainId: 8453,
  name: 'Base',
  rpcUrl: 'https://mainnet.base.org',
  blockExplorerUrl: 'https://basescan.org',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
};