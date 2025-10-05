"use client";

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { BASE_REVIEWS_ABI, CONTRACT_ADDRESS } from '~/lib/contract';
import { Campaign, User, TransactionState, CreateCampaignForm, SubmitReviewForm } from '~/lib/types';

export function useWallet() {
  const [user, setUser] = useState<User | null>(null);

  const updateUser = useCallback((newUser: User | null) => {
    setUser(newUser);
  }, []);

  return { user, updateUser };
}

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // For testing purposes, return mock data
      // In production, this would interact with the smart contract
      const mockCampaigns: Campaign[] = [
        {
          id: 0,
          businessOwner: "0x742d35Cc6634C0532925a3b8D7389C12e7cB48AE",
          reviewLink: "https://maps.google.com/place/test-restaurant",
          totalPool: "100000000000000000", // 0.1 ETH in Wei
          rewardAmount: "10000000000000000", // 0.01 ETH in Wei
          claimedReviews: 3,
          isActive: true,
          availableSlots: 7,
        },
        {
          id: 1,
          businessOwner: "0x8ba1f109551bD432803012645Hac136c23bb48bd",
          reviewLink: "https://maps.google.com/place/test-cafe",
          totalPool: "200000000000000000", // 0.2 ETH in Wei
          rewardAmount: "20000000000000000", // 0.02 ETH in Wei
          claimedReviews: 5,
          isActive: true,
          availableSlots: 5,
        },
      ];
      
      setCampaigns(mockCampaigns);
    } catch (err: any) {
      console.error('Error fetching campaigns:', err);
      setError(err.message || 'Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return { campaigns, loading, error, refetch: fetchCampaigns };
}

export function useCreateCampaign() {
  const [transaction, setTransaction] = useState<TransactionState>({ status: 'idle' });

  const createCampaign = useCallback(async (formData: CreateCampaignForm) => {
    setTransaction({ status: 'pending' });
    
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('Ethereum provider not found');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, BASE_REVIEWS_ABI, signer);
      
      // Convert ETH amounts to Wei
      const totalPoolWei = ethers.parseEther(formData.totalPool);
      const rewardAmountWei = ethers.parseEther(formData.rewardAmount);
      
      // Validate that total pool is divisible by reward amount
      if (totalPoolWei % rewardAmountWei !== 0n) {
        throw new Error('Total pool must be divisible by reward amount');
      }
      
      const tx = await contract.createCampaign(
        formData.reviewLink,
        rewardAmountWei,
        { value: totalPoolWei }
      );
      
      setTransaction({ status: 'pending', hash: tx.hash });
      
      const receipt = await tx.wait();
      setTransaction({ status: 'success', hash: receipt.hash });
      
      return receipt;
    } catch (err: any) {
      console.error('Error creating campaign:', err);
      const errorMessage = err.reason || err.message || 'Failed to create campaign';
      setTransaction({ status: 'error', error: errorMessage });
      throw err;
    }
  }, []);

  const resetTransaction = useCallback(() => {
    setTransaction({ status: 'idle' });
  }, []);

  return { createCampaign, transaction, resetTransaction };
}

export function useSubmitReview() {
  const [transaction, setTransaction] = useState<TransactionState>({ status: 'idle' });

  const submitReview = useCallback(async (formData: SubmitReviewForm) => {
    setTransaction({ status: 'pending' });
    
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('Ethereum provider not found');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, BASE_REVIEWS_ABI, signer);
      
      // Check if user has already claimed this campaign
      const userAddress = await signer.getAddress();
      const hasClaimed = await contract.hasClaimed(formData.campaignId, userAddress);
      
      if (hasClaimed) {
        throw new Error('You have already claimed this campaign');
      }
      
      const tx = await contract.submitReview(formData.campaignId, formData.proofLink);
      setTransaction({ status: 'pending', hash: tx.hash });
      
      const receipt = await tx.wait();
      setTransaction({ status: 'success', hash: receipt.hash });
      
      return receipt;
    } catch (err: any) {
      console.error('Error submitting review:', err);
      const errorMessage = err.reason || err.message || 'Failed to submit review';
      setTransaction({ status: 'error', error: errorMessage });
      throw err;
    }
  }, []);

  const resetTransaction = useCallback(() => {
    setTransaction({ status: 'idle' });
  }, []);

  return { submitReview, transaction, resetTransaction };
}

export function useCloseCampaign() {
  const [transaction, setTransaction] = useState<TransactionState>({ status: 'idle' });

  const closeCampaign = useCallback(async (campaignId: number) => {
    setTransaction({ status: 'pending' });
    
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('Ethereum provider not found');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, BASE_REVIEWS_ABI, signer);
      
      const tx = await contract.closeCampaign(campaignId);
      setTransaction({ status: 'pending', hash: tx.hash });
      
      const receipt = await tx.wait();
      setTransaction({ status: 'success', hash: receipt.hash });
      
      return receipt;
    } catch (err: any) {
      console.error('Error closing campaign:', err);
      const errorMessage = err.reason || err.message || 'Failed to close campaign';
      setTransaction({ status: 'error', error: errorMessage });
      throw err;
    }
  }, []);

  const resetTransaction = useCallback(() => {
    setTransaction({ status: 'idle' });
  }, []);

  return { closeCampaign, transaction, resetTransaction };
}

export function useUserCampaigns(userAddress?: string) {
  const [userCampaigns, setUserCampaigns] = useState<{ created: Campaign[], claimed: Campaign[] }>({
    created: [],
    claimed: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserCampaigns = useCallback(async () => {
    if (!userAddress) {
      setUserCampaigns({ created: [], claimed: [] });
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // For testing purposes, return mock data
      // In production, this would interact with the smart contract
      const mockCreated: Campaign[] = [
        {
          id: 0,
          businessOwner: userAddress.toLowerCase(),
          reviewLink: "https://maps.google.com/place/my-restaurant",
          totalPool: "100000000000000000", // 0.1 ETH in Wei
          rewardAmount: "10000000000000000", // 0.01 ETH in Wei
          claimedReviews: 3,
          isActive: true,
          availableSlots: 7,
        },
      ];

      const mockClaimed: Campaign[] = [
        {
          id: 1,
          businessOwner: "0x8ba1f109551bD432803012645Hac136c23bb48bd",
          reviewLink: "https://maps.google.com/place/reviewed-cafe",
          totalPool: "200000000000000000", // 0.2 ETH in Wei
          rewardAmount: "20000000000000000", // 0.02 ETH in Wei
          claimedReviews: 5,
          isActive: true,
          availableSlots: 5,
        },
      ];
      
      setUserCampaigns({ 
        created: mockCreated, 
        claimed: mockClaimed 
      });
    } catch (err: any) {
      console.error('Error fetching user campaigns:', err);
      setError(err.message || 'Failed to fetch user campaigns');
    } finally {
      setLoading(false);
    }
  }, [userAddress]);

  useEffect(() => {
    fetchUserCampaigns();
  }, [fetchUserCampaigns]);

  return { userCampaigns, loading, error, refetch: fetchUserCampaigns };
}