"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, BarChart3, Users, DollarSign, ArrowLeft, Star, TrendingUp, Eye, ExternalLink, Copy, X } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { useWalletConnect } from '~/hooks/useWalletConnect';
import { useUserCampaigns, useCreateCampaign } from '~/hooks/useBlockchain';
import CampaignCreator from '~/components/CampaignCreator';
import { ethers } from 'ethers';

export default function BusinessDashboard() {
  const router = useRouter();
  const { isConnected, address, connectWallet, balance } = useWalletConnect();
  const { userCampaigns, loading, refetch } = useUserCampaigns(address || undefined);
  const { createCampaign } = useCreateCampaign();
  
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Calculate stats from blockchain data
  const stats = useMemo(() => {
    const createdCampaigns = userCampaigns?.created || [];
    
    if (!createdCampaigns.length) {
      return [
        { label: 'Active Campaigns', value: '0', icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Total Reviews', value: '0', icon: Star, color: 'text-green-600', bg: 'bg-green-100' },
        { label: 'Reviews This Month', value: '0', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
        { label: 'ETH Spent', value: '0.00', icon: DollarSign, color: 'text-orange-600', bg: 'bg-orange-100' },
      ];
    }

    const activeCampaigns = createdCampaigns.filter(c => c.isActive).length;
    const totalReviews = createdCampaigns.reduce((sum, campaign) => sum + campaign.claimedReviews, 0);
    const totalSpent = createdCampaigns.reduce((sum, campaign) => {
      return sum + parseFloat(ethers.formatEther(campaign.totalPool));
    }, 0);

    return [
      { label: 'Active Campaigns', value: activeCampaigns.toString(), icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-100' },
      { label: 'Total Reviews', value: totalReviews.toString(), icon: Star, color: 'text-green-600', bg: 'bg-green-100' },
      { label: 'Reviews This Month', value: totalReviews.toString(), icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
      { label: 'ETH Spent', value: totalSpent.toFixed(2), icon: DollarSign, color: 'text-orange-600', bg: 'bg-orange-100' },
    ];
  }, [userCampaigns]);

  // Mock data - will be replaced by blockchain data
  const mockCampaigns = [
    {
      id: 1,
      name: "Coffee Shop Reviews",
      description: "Get authentic reviews for our new downtown location",
      reward: "0.01",
      reviews: 23,
      maxReviews: 50,
      status: "active",
      created: "2 days ago",
      link: "https://example.com/coffee-shop"
    },
    {
      id: 2,
      name: "Restaurant Launch",
      description: "Launch campaign for our new Mediterranean restaurant",
      reward: "0.015",
      reviews: 8,
      maxReviews: 30,
      status: "active",
      created: "1 week ago",
      link: "https://example.com/restaurant"
    },
    {
      id: 3,
      name: "Retail Store Opening",
      description: "Grand opening reviews for our flagship store",
      reward: "0.02",
      reviews: 15,
      maxReviews: 25,
      status: "completed",
      created: "2 weeks ago",
      link: "https://example.com/retail-store"
    }
  ];

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedAddress(id);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/')}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-lg">B</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">BaseReviews</h1>
                  <p className="text-sm text-gray-600">Business Dashboard</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {!isConnected ? (
                <Button
                  onClick={connectWallet}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
                >
                  Connect Wallet
                </Button>
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-600 flex flex-col items-end">
                    <div>{address?.slice(0, 6)}...{address?.slice(-4)}</div>
                    <div className="text-xs text-gray-500">
                      {balance === 'N/A' ? 'Balance unavailable' : `${parseFloat(balance || '0').toFixed(4)} ETH`}
                    </div>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              )}
              <button
                onClick={() => router.push('/gigs')}
                className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Browse Worker Gigs
              </button>
              <Button
                onClick={() => isConnected ? setShowCreateCampaign(true) : connectWallet()}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={!isConnected}
              >
                <Plus className="w-4 h-4 mr-2" />
                {isConnected ? 'Create Campaign' : 'Connect Wallet to Create'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h2>
          <p className="text-gray-600">Manage your review campaigns and track performance.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center">
                <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Campaigns Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Your Campaigns</h3>
              <Button
                onClick={() => setShowCreateCampaign(true)}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Campaign
              </Button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {(userCampaigns?.created || mockCampaigns).map((campaign: any) => (
                <div
                  key={campaign.id}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">{campaign.name}</h4>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          campaign.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {campaign.status === 'active' ? 'Active' : 'Completed'}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{campaign.description}</p>
                      <div className="flex items-center space-x-2">
                        <a
                          href={campaign.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View Business
                        </a>
                        <button
                          onClick={() => copyToClipboard(campaign.link, `link-${campaign.id}`)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        {copiedAddress === `link-${campaign.id}` && (
                          <span className="text-xs text-green-600">Copied!</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-gray-500">Reward per Review</p>
                      <p className="font-semibold text-gray-900">{campaign.reward} ETH</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Reviews</p>
                      <p className="font-semibold text-gray-900">{campaign.reviews}/{campaign.maxReviews}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Progress</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(campaign.reviews / campaign.maxReviews) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500">Created</p>
                      <p className="font-semibold text-gray-900">{campaign.created}</p>
                    </div>
                  </div>

                  {campaign.status === 'active' && (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-600 text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Close Campaign
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
            <BarChart3 className="w-10 h-10 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
            <p className="text-gray-600 text-sm mb-4">View detailed campaign performance and insights</p>
            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              View Analytics
            </Button>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
            <Users className="w-10 h-10 text-emerald-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Worker Pool</h3>
            <p className="text-gray-600 text-sm mb-4">Browse available workers and their ratings</p>
            <Button 
              variant="outline" 
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              onClick={() => router.push('/gigs')}
            >
              Browse Workers
            </Button>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
            <DollarSign className="w-10 h-10 text-purple-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Payments</h3>
            <p className="text-gray-600 text-sm mb-4">Track payments and reward distribution</p>
            <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50">
              View Payments
            </Button>
          </div>
        </div>
      </main>

      {/* Campaign Creator Component */}
      {showCreateCampaign && (
        <CampaignCreator
          user={{ 
            address: address || '', 
            balance: balance || '0', 
            isConnected: isConnected 
          }}
          onCampaignCreated={() => {
            setShowCreateCampaign(false);
            refetch(); // Refresh campaigns
          }}
        />
      )}
    </div>
  );
}