/**
 * TypeScript interfaces for BaseReviews platform
 */

export interface Campaign {
  id: number;
  businessOwner: string;
  reviewLink: string;
  totalPool: string; // in Wei
  rewardAmount: string; // in Wei
  claimedReviews: number;
  isActive: boolean;
  availableSlots: number; // calculated field
}

export interface User {
  address: string;
  balance: string; // in ETH
  isConnected: boolean;
  chainId?: number;
}

export interface TransactionState {
  status: 'idle' | 'pending' | 'success' | 'error';
  hash?: string;
  error?: string;
}

export interface CreateCampaignForm {
  reviewLink: string;
  totalPool: string; // in ETH
  rewardAmount: string; // in ETH
}

export interface SubmitReviewForm {
  campaignId: number;
  proofLink: string;
}

export interface UserCampaign extends Campaign {
  type: 'created' | 'claimed';
  claimTxHash?: string;
}

export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export interface ContractError {
  code: string;
  message: string;
  reason?: string;
}