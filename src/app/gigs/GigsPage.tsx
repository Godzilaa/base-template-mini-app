"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, DollarSign, Clock, MapPin, ExternalLink, Briefcase, ArrowLeft, Star, TrendingUp, Users, Eye } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { useWalletConnect } from '~/hooks/useWalletConnect';
import { useCampaigns, useUserCampaigns, useSubmitReview } from '~/hooks/useBlockchain';
import { ethers } from 'ethers';

export default function GigsPage() {
  const router = useRouter();
  const { isConnected, address, balance, connectWallet } = useWalletConnect();
  const { campaigns: allCampaigns } = useCampaigns();
  const { userCampaigns } = useUserCampaigns(address || undefined);
  const { submitReview } = useSubmitReview();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
  const [showReviewSubmitter, setShowReviewSubmitter] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'available' | 'high-reward'>('all');

  // Calculate stats from blockchain data
  const stats = useMemo(() => {
    const claimedCampaigns = userCampaigns?.claimed || [];
    const availableGigs = allCampaigns?.filter(c => c.isActive).length || 0;
    const ethEarned = claimedCampaigns.reduce((sum, campaign) => {
      return sum + parseFloat(ethers.formatEther(campaign.rewardAmount));
    }, 0);

    return [
      { label: 'Available Gigs', value: availableGigs.toString(), icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-100' },
      { label: 'Your Reviews', value: claimedCampaigns.length.toString(), icon: Star, color: 'text-green-600', bg: 'bg-green-100' },
      { label: 'ETH Earned', value: ethEarned.toFixed(3), icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-100' },
      { label: 'This Month', value: claimedCampaigns.length.toString(), icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-100' },
    ];
  }, [allCampaigns, userCampaigns]);

  // Mock data for fallback
  const mockCampaigns = [
    {
      id: 1,
      businessName: "Downtown Coffee Co.",
      description: "Write a genuine review about our new specialty coffee blends and cozy atmosphere",
      reward: "0.015",
      reviewsNeeded: 5,
      totalReviews: 23,
      maxReviews: 50,
      businessOwner: "0x1234...5678",
      reviewLink: "https://example.com/coffee-downtown",
      category: "Food & Beverage",
      location: "New York, NY",
      timeRemaining: "3 days",
      difficulty: "Easy"
    },
    {
      id: 2,
      businessName: "Mediterranean Delights",
      description: "Share your experience about our authentic Mediterranean cuisine and family recipes",
      reward: "0.02",
      reviewsNeeded: 8,
      totalReviews: 15,
      maxReviews: 30,
      businessOwner: "0x2345...6789",
      reviewLink: "https://example.com/mediterranean-restaurant",
      category: "Restaurant",
      location: "Los Angeles, CA",
      timeRemaining: "1 week",
      difficulty: "Medium"
    },
    {
      id: 3,
      businessName: "Tech Gadgets Plus",
      description: "Review our latest electronics and customer service experience",
      reward: "0.025",
      reviewsNeeded: 3,
      totalReviews: 8,
      maxReviews: 20,
      businessOwner: "0x3456...7890",
      reviewLink: "https://example.com/tech-gadgets",
      category: "Electronics",
      location: "San Francisco, CA",
      timeRemaining: "5 days",
      difficulty: "Easy"
    },
    {
      id: 4,
      businessName: "Fitness First Gym",
      description: "Write about your workout experience and our new equipment",
      reward: "0.01",
      reviewsNeeded: 12,
      totalReviews: 35,
      maxReviews: 60,
      businessOwner: "0x4567...8901",
      reviewLink: "https://example.com/fitness-gym",
      category: "Health & Fitness",
      location: "Chicago, IL",
      timeRemaining: "2 weeks",
      difficulty: "Medium"
    }
  ];

  // Filter campaigns
  const filteredCampaigns = React.useMemo(() => {
    const campaigns: any[] = allCampaigns?.length ? allCampaigns : mockCampaigns;
    let filtered: any[] = campaigns;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((campaign: any) =>
        campaign.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    switch (filterType) {
      case 'available':
        filtered = filtered.filter((campaign: any) => 
          campaign.reviewsNeeded > 0 || campaign.availableSlots > 0
        );
        break;
      case 'high-reward':
        filtered = filtered.filter((campaign: any) => {
          const reward = campaign.reward ? parseFloat(campaign.reward) : 
            parseFloat(ethers.formatEther(campaign.rewardAmount || '0'));
          return reward >= 0.02;
        });
        break;
      default:
        break;
    }

    return filtered;
  }, [searchTerm, filterType, allCampaigns]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleClaimGig = (campaign: any) => {
    setSelectedCampaign(campaign);
    setShowReviewSubmitter(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
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
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-lg">W</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">BaseReviews</h1>
                  <p className="text-sm text-gray-600">Worker Dashboard</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {!isConnected ? (
                <Button
                  onClick={connectWallet}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
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
                onClick={() => router.push('/business')}
                className="text-gray-600 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Business Dashboard
              </button>
              <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                <Star className="w-4 h-4 mr-2" />
                My Reviews
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Find Review Gigs</h2>
          <p className="text-gray-600">Discover businesses looking for authentic reviews and earn crypto rewards.</p>
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

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by business name, category, or location..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
              >
                <option value="all">All Gigs</option>
                <option value="available">Available Now</option>
                <option value="high-reward">High Reward (≥0.02 ETH)</option>
              </select>
              
              <Button
                variant="outline"
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              >
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Gigs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{campaign.businessName}</h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm text-gray-600">{campaign.category}</span>
                    <span className="text-gray-300">•</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(campaign.difficulty)}`}>
                      {campaign.difficulty}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-600">{campaign.reward} ETH</div>
                  <div className="text-sm text-gray-500">per review</div>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{campaign.description}</p>

              {/* Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Reviews Needed:</span>
                  <span className="font-medium">{campaign.reviewsNeeded} remaining</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Progress:</span>
                  <span className="font-medium">{campaign.totalReviews}/{campaign.maxReviews}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Time Left:</span>
                  <span className="font-medium">{campaign.timeRemaining}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className="bg-emerald-600 h-2 rounded-full"
                  style={{
                    width: `${(campaign.totalReviews / campaign.maxReviews) * 100}%`
                  }}
                ></div>
              </div>

              {/* Location */}
              <div className="flex items-center text-sm text-gray-600 mb-4">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{campaign.location}</span>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => window.open(campaign.reviewLink, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Visit Business
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  onClick={() => isConnected ? handleClaimGig(campaign) : connectWallet()}
                  disabled={campaign.reviewsNeeded === 0}
                >
                  {campaign.reviewsNeeded === 0 ? 'Fully Claimed' : 
                   !isConnected ? 'Connect Wallet' : 'Claim Gig'}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredCampaigns.length === 0 && (
          <div className="text-center py-16">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No gigs found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or check back later for new opportunities.</p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Ready to Start Earning?</h3>
            <p className="text-emerald-100 mb-6">Join thousands of reviewers earning crypto for authentic feedback</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">47</div>
                <div className="text-emerald-100">Active Campaigns</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">1,200+</div>
                <div className="text-emerald-100">Reviews Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">25 ETH</div>
                <div className="text-emerald-100">Total Rewards Paid</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Review Submission Modal */}
      {showReviewSubmitter && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Submit Your Review</h2>
              <p className="text-gray-600">{selectedCampaign.businessName}</p>
              <p className="text-emerald-600 font-semibold">Reward: {selectedCampaign.reward} ETH</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Review Text</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  rows={4}
                  placeholder="Write your honest review about your experience..."
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating (1-5 stars)</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                  <option value="">Select rating</option>
                  <option value="5">5 Stars - Excellent</option>
                  <option value="4">4 Stars - Very Good</option>
                  <option value="3">3 Stars - Good</option>
                  <option value="2">2 Stars - Fair</option>
                  <option value="1">1 Star - Poor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Proof of Visit (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Upload a photo from your visit (receipt, food, etc.)</p>
              </div>
            </div>
            
            <div className="flex space-x-4 mt-8">
              <Button
                onClick={() => setShowReviewSubmitter(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                onClick={() => {
                  // Handle review submission
                  setShowReviewSubmitter(false);
                  setSelectedCampaign(null);
                }}
              >
                Submit Review
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}