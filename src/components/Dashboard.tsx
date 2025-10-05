"use client";

import React, { useState } from 'react';
import { ethers } from 'ethers';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  ExternalLink, 
  XCircle, 
  Clock,
  CheckCircle,
  AlertTriangle 
} from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { useUserCampaigns, useCloseCampaign } from '~/hooks/useBlockchain';
import { Campaign, User } from '~/lib/types';

interface DashboardProps {
  user: User | null;
}

export default function Dashboard({ user }: DashboardProps) {
  const { userCampaigns, loading, error, refetch } = useUserCampaigns(user?.address);
  const { closeCampaign, transaction, resetTransaction } = useCloseCampaign();
  const [closingCampaignId, setClosingCampaignId] = useState<number | null>(null);

  const handleCloseCampaign = async (campaignId: number) => {
    setClosingCampaignId(campaignId);
    try {
      await closeCampaign(campaignId);
      refetch();
    } catch (error) {
      console.error('Failed to close campaign:', error);
    } finally {
      setClosingCampaignId(null);
      resetTransaction();
    }
  };

  const formatEth = (wei: string) => {
    try {
      return parseFloat(ethers.formatEther(wei)).toFixed(4);
    } catch {
      return '0.0000';
    }
  };

  const calculateStats = () => {
    const { created, claimed } = userCampaigns;
    
    const totalSpent = created.reduce((sum, campaign) => {
      const spent = BigInt(campaign.rewardAmount) * BigInt(campaign.claimedReviews);
      return sum + spent;
    }, 0n);

    const totalEarned = claimed.reduce((sum, campaign) => {
      return sum + BigInt(campaign.rewardAmount);
    }, 0n);

    const activeCampaigns = created.filter(c => c.isActive).length;
    const totalReviews = claimed.length;

    return {
      totalSpent: ethers.formatEther(totalSpent),
      totalEarned: ethers.formatEther(totalEarned),
      activeCampaigns,
      totalReviews,
    };
  };

  if (!user?.isConnected) {
    return (
      <div className="text-center p-8">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Connect Your Wallet</h3>
          <p className="text-gray-600">
            Connect your wallet to view your dashboard with campaign analytics and review history.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
        <div className="h-64 bg-white rounded-lg shadow animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-800 mb-4">Error loading dashboard: {error}</p>
          <Button onClick={refetch} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600">Manage your campaigns and track your earnings</p>
        </div>
        <Button onClick={refetch} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Spent"
          value={`${parseFloat(stats.totalSpent).toFixed(4)} ETH`}
          icon={<DollarSign className="w-6 h-6 text-red-600" />}
          color="red"
        />
        <StatCard
          title="Total Earned"
          value={`${parseFloat(stats.totalEarned).toFixed(4)} ETH`}
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
          color="green"
        />
        <StatCard
          title="Active Campaigns"
          value={stats.activeCampaigns.toString()}
          icon={<BarChart3 className="w-6 h-6 text-blue-600" />}
          color="blue"
        />
        <StatCard
          title="Reviews Written"
          value={stats.totalReviews.toString()}
          icon={<Users className="w-6 h-6 text-purple-600" />}
          color="purple"
        />
      </div>

      {/* Campaigns Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Created Campaigns */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Campaigns</h2>
          {userCampaigns.created.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No campaigns created yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userCampaigns.created.map((campaign) => (
                <CreatedCampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onClose={handleCloseCampaign}
                  isClosing={closingCampaignId === campaign.id}
                  transaction={transaction}
                />
              ))}
            </div>
          )}
        </div>

        {/* Claimed Reviews */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Reviews</h2>
          {userCampaigns.claimed.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No reviews submitted yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userCampaigns.claimed.map((campaign) => (
                <ClaimedReviewCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'red' | 'green' | 'blue' | 'purple';
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    red: 'bg-red-50 border-red-200',
    green: 'bg-green-50 border-green-200',
    blue: 'bg-blue-50 border-blue-200',
    purple: 'bg-purple-50 border-purple-200',
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg border p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className="p-2 rounded-lg bg-white">
          {icon}
        </div>
      </div>
    </div>
  );
}

interface CreatedCampaignCardProps {
  campaign: Campaign;
  onClose: (id: number) => void;
  isClosing: boolean;
  transaction: any;
}

function CreatedCampaignCard({ campaign, onClose, isClosing, transaction }: CreatedCampaignCardProps) {
  const formatEth = (wei: string) => {
    try {
      return parseFloat(ethers.formatEther(wei)).toFixed(4);
    } catch {
      return '0.0000';
    }
  };

  const remainingPool = BigInt(campaign.totalPool) - (BigInt(campaign.rewardAmount) * BigInt(campaign.claimedReviews));

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-800">Campaign #{campaign.id}</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              campaign.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {campaign.isActive ? 'Active' : 'Closed'}
            </span>
          </div>
          <p className="text-xs text-gray-600 truncate">{campaign.reviewLink}</p>
        </div>
        
        {campaign.isActive && (
          <Button
            onClick={() => onClose(campaign.id)}
            disabled={isClosing}
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700"
          >
            {isClosing ? (
              <Clock className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Reward per Review</p>
          <p className="font-semibold">{formatEth(campaign.rewardAmount)} ETH</p>
        </div>
        <div>
          <p className="text-gray-500">Reviews Claimed</p>
          <p className="font-semibold">{campaign.claimedReviews}</p>
        </div>
        <div>
          <p className="text-gray-500">Available Slots</p>
          <p className="font-semibold">{campaign.availableSlots}</p>
        </div>
        <div>
          <p className="text-gray-500">Remaining Pool</p>
          <p className="font-semibold">{formatEth(remainingPool.toString())} ETH</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={() => window.open(campaign.reviewLink, '_blank')}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
        >
          <ExternalLink className="w-3 h-3" />
          View Business
        </button>
        
        {transaction.status === 'pending' && isClosing && (
          <span className="text-xs text-yellow-600">Closing...</span>
        )}
      </div>
    </div>
  );
}

interface ClaimedReviewCardProps {
  campaign: Campaign;
}

function ClaimedReviewCard({ campaign }: ClaimedReviewCardProps) {
  const formatEth = (wei: string) => {
    try {
      return parseFloat(ethers.formatEther(wei)).toFixed(4);
    } catch {
      return '0.0000';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-800">Campaign #{campaign.id}</span>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-xs text-gray-600 truncate">{campaign.reviewLink}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-green-600">
            +{formatEth(campaign.rewardAmount)} ETH
          </p>
          <p className="text-xs text-gray-500">Earned</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-600">
          Business: {campaign.businessOwner.slice(0, 6)}...{campaign.businessOwner.slice(-4)}
        </div>
        <button
          onClick={() => window.open(campaign.reviewLink, '_blank')}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
        >
          <ExternalLink className="w-3 h-3" />
          View
        </button>
      </div>
    </div>
  );
}