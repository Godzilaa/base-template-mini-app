"use client";

import React, { useState } from 'react';
import { ethers } from 'ethers';
import { ExternalLink, Copy, Star, Users, DollarSign, Clock } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { useCampaigns } from '~/hooks/useBlockchain';
import { Campaign, User } from '~/lib/types';

interface CampaignListProps {
  user: User | null;
  onWriteReview: (campaign: Campaign) => void;
}

export default function CampaignList({ user, onWriteReview }: CampaignListProps) {
  const { campaigns, loading, error, refetch } = useCampaigns();
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const copyToClipboard = async (text: string, campaignId: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(campaignId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatEth = (wei: string) => {
    try {
      return parseFloat(ethers.formatEther(wei)).toFixed(4);
    } catch {
      return '0.0000';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-3 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-800 mb-4">Error loading campaigns: {error}</p>
          <Button onClick={refetch} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
          <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Active Campaigns</h3>
          <p className="text-gray-600 mb-4">
            There are no active review campaigns at the moment. 
          </p>
          <p className="text-gray-500 text-sm">
            Check back later or create your own campaign to get started!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Active Campaigns</h2>
          <p className="text-gray-600">Write reviews and earn ETH rewards</p>
        </div>
        <Button onClick={refetch} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {/* Campaign Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            user={user}
            onWriteReview={onWriteReview}
            onCopyLink={copyToClipboard}
            isCopied={copiedId === campaign.id}
          />
        ))}
      </div>
    </div>
  );
}

interface CampaignCardProps {
  campaign: Campaign;
  user: User | null;
  onWriteReview: (campaign: Campaign) => void;
  onCopyLink: (link: string, campaignId: number) => void;
  isCopied: boolean;
}

function CampaignCard({ campaign, user, onWriteReview, onCopyLink, isCopied }: CampaignCardProps) {
  const isUserOwner = user?.address?.toLowerCase() === campaign.businessOwner.toLowerCase();
  const canWriteReview = user?.isConnected && !isUserOwner && campaign.availableSlots > 0;

  return (
    <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
      <div className="p-6">
        {/* Campaign Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-700">Active</span>
              <span className="text-xs text-gray-500">#{campaign.id}</span>
            </div>
            <p className="text-sm text-gray-600">
              Business: {campaign.businessOwner.slice(0, 6)}...{campaign.businessOwner.slice(-4)}
            </p>
          </div>
        </div>

        {/* Reward Information */}
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Reward per Review</span>
            </div>
            <span className="text-lg font-bold text-blue-800">
              {formatEth(campaign.rewardAmount)} ETH
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-blue-700">
              <Users className="w-4 h-4" />
              <span>Available Slots</span>
            </div>
            <span className="font-semibold text-blue-800">
              {campaign.availableSlots}
            </span>
          </div>
        </div>

        {/* Campaign Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <p className="text-gray-500">Total Pool</p>
            <p className="font-semibold">{formatEth(campaign.totalPool)} ETH</p>
          </div>
          <div>
            <p className="text-gray-500">Reviews Claimed</p>
            <p className="font-semibold">{campaign.claimedReviews}</p>
          </div>
        </div>

        {/* Review Link */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Review Link</span>
            <div className="flex gap-1">
              <button
                onClick={() => onCopyLink(campaign.reviewLink, campaign.id)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Copy link"
              >
                <Copy className="w-4 h-4 text-gray-500" />
              </button>
              <button
                onClick={() => window.open(campaign.reviewLink, '_blank')}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Open link"
              >
                <ExternalLink className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
          <div className="bg-gray-50 rounded p-2 text-xs text-gray-600 truncate">
            {campaign.reviewLink}
          </div>
          {isCopied && (
            <p className="text-xs text-green-600 mt-1">Link copied to clipboard!</p>
          )}
        </div>

        {/* Action Button */}
        <div className="space-y-2">
          {!user?.isConnected ? (
            <Button variant="outline" className="w-full" disabled>
              Connect wallet to participate
            </Button>
          ) : isUserOwner ? (
            <Button variant="outline" className="w-full" disabled>
              You own this campaign
            </Button>
          ) : campaign.availableSlots === 0 ? (
            <Button variant="outline" className="w-full" disabled>
              No slots available
            </Button>
          ) : (
            <Button
              onClick={() => onWriteReview(campaign)}
              className="w-full flex items-center justify-center gap-2"
            >
              <Star className="w-4 h-4" />
              Write Review & Earn
            </Button>
          )}
        </div>

        {/* Instructions */}
        {canWriteReview && (
          <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
            <p className="text-xs text-yellow-800">
              <Clock className="w-3 h-3 inline mr-1" />
              Click the link above, write your review on Google Maps, then submit proof to claim your reward.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}