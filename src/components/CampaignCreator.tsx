"use client";

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Plus, DollarSign, Link, Calculator } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { useCreateCampaign } from '~/hooks/useBlockchain';
import { CreateCampaignForm, User } from '~/lib/types';

interface CampaignCreatorProps {
  user: User | null;
  onCampaignCreated: () => void;
}

export default function CampaignCreator({ user, onCampaignCreated }: CampaignCreatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<CreateCampaignForm>({
    reviewLink: '',
    totalPool: '',
    rewardAmount: '',
  });
  const [availableSlots, setAvailableSlots] = useState(0);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { createCampaign, transaction, resetTransaction } = useCreateCampaign();

  useEffect(() => {
    // Calculate available slots when form data changes
    if (formData.totalPool && formData.rewardAmount) {
      try {
        const totalPool = parseFloat(formData.totalPool);
        const rewardAmount = parseFloat(formData.rewardAmount);
        
        if (totalPool > 0 && rewardAmount > 0) {
          const slots = Math.floor(totalPool / rewardAmount);
          setAvailableSlots(slots);
        } else {
          setAvailableSlots(0);
        }
      } catch {
        setAvailableSlots(0);
      }
    } else {
      setAvailableSlots(0);
    }
  }, [formData.totalPool, formData.rewardAmount]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate review link
    if (!formData.reviewLink.trim()) {
      errors.reviewLink = 'Review link is required';
    } else if (!isValidUrl(formData.reviewLink)) {
      errors.reviewLink = 'Please enter a valid URL';
    } else if (!isGoogleMapsUrl(formData.reviewLink)) {
      errors.reviewLink = 'Please enter a valid Google Maps review URL';
    }

    // Validate total pool
    if (!formData.totalPool) {
      errors.totalPool = 'Total pool amount is required';
    } else {
      const totalPool = parseFloat(formData.totalPool);
      if (isNaN(totalPool) || totalPool <= 0) {
        errors.totalPool = 'Total pool must be a positive number';
      } else if (totalPool < 0.001) {
        errors.totalPool = 'Total pool must be at least 0.001 ETH';
      }
    }

    // Validate reward amount
    if (!formData.rewardAmount) {
      errors.rewardAmount = 'Reward amount is required';
    } else {
      const rewardAmount = parseFloat(formData.rewardAmount);
      if (isNaN(rewardAmount) || rewardAmount <= 0) {
        errors.rewardAmount = 'Reward amount must be a positive number';
      } else if (rewardAmount < 0.001) {
        errors.rewardAmount = 'Reward amount must be at least 0.001 ETH';
      }
    }

    // Validate pool divisibility
    if (formData.totalPool && formData.rewardAmount) {
      const totalPool = parseFloat(formData.totalPool);
      const rewardAmount = parseFloat(formData.rewardAmount);
      
      if (!isNaN(totalPool) && !isNaN(rewardAmount) && totalPool > 0 && rewardAmount > 0) {
        if (totalPool < rewardAmount) {
          errors.totalPool = 'Total pool must be greater than or equal to reward amount';
        }
        
        // Check if total pool is evenly divisible by reward amount (within small tolerance)
        const slots = totalPool / rewardAmount;
        if (Math.abs(slots - Math.round(slots)) > 0.0001) {
          errors.rewardAmount = 'Total pool must be evenly divisible by reward amount';
        }
      }
    }

    // Check user balance
    if (user?.balance && formData.totalPool) {
      const userBalance = parseFloat(user.balance);
      const totalPool = parseFloat(formData.totalPool);
      
      if (!isNaN(userBalance) && !isNaN(totalPool) && totalPool > userBalance) {
        errors.totalPool = 'Insufficient balance';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isGoogleMapsUrl = (url: string): boolean => {
    const googleMapsPatterns = [
      /maps\.google\./,
      /goo\.gl\/maps/,
      /maps\.app\.goo\.gl/,
      /google\.[a-z]{2,}\/maps/
    ];
    
    return googleMapsPatterns.some(pattern => pattern.test(url));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await createCampaign(formData);
      // Reset form and close modal on success
      setFormData({ reviewLink: '', totalPool: '', rewardAmount: '' });
      setIsOpen(false);
      onCampaignCreated();
    } catch (error) {
      // Error is handled in the hook
      console.error('Campaign creation failed:', error);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    resetTransaction();
    setFormErrors({});
  };

  if (!user?.isConnected) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Connect your wallet to create campaigns</p>
      </div>
    );
  }

  return (
    <>
      {/* Create Campaign Button */}
      <div className="flex justify-center mb-8">
        <Button 
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Campaign
        </Button>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Create Review Campaign</h2>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Review Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Link className="w-4 h-4 inline mr-2" />
                    Google Maps Review URL
                  </label>
                  <input
                    type="url"
                    value={formData.reviewLink}
                    onChange={(e) => setFormData(prev => ({ ...prev, reviewLink: e.target.value }))}
                    placeholder="https://maps.google.com/..."
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.reviewLink ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.reviewLink && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.reviewLink}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    Link to your business on Google Maps where users will leave reviews
                  </p>
                </div>

                {/* Total Pool */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-2" />
                    Total Pool (ETH)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    value={formData.totalPool}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalPool: e.target.value }))}
                    placeholder="0.1"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.totalPool ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.totalPool && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.totalPool}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    Total amount to distribute among reviewers
                  </p>
                </div>

                {/* Reward Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calculator className="w-4 h-4 inline mr-2" />
                    Reward per Review (ETH)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    value={formData.rewardAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, rewardAmount: e.target.value }))}
                    placeholder="0.01"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.rewardAmount ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.rewardAmount && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.rewardAmount}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    Amount each reviewer will receive
                  </p>
                </div>

                {/* Campaign Summary */}
                {availableSlots > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">Campaign Summary</h3>
                    <div className="space-y-1 text-sm text-blue-700">
                      <p>Available review slots: <span className="font-semibold">{availableSlots}</span></p>
                      <p>Total payout: <span className="font-semibold">{formData.totalPool} ETH</span></p>
                      <p>Per review: <span className="font-semibold">{formData.rewardAmount} ETH</span></p>
                    </div>
                  </div>
                )}

                {/* User Balance */}
                <div className="text-sm text-gray-600">
                  Your balance: {parseFloat(user.balance || '0').toFixed(4)} ETH
                </div>

                {/* Transaction Status */}
                {transaction.status === 'pending' && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      Creating campaign... Please confirm the transaction in your wallet.
                    </p>
                    {transaction.hash && (
                      <p className="text-yellow-700 text-xs mt-1">
                        Transaction: {transaction.hash.slice(0, 10)}...
                      </p>
                    )}
                  </div>
                )}

                {transaction.status === 'error' && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-red-800 text-sm">
                      Error: {transaction.error}
                    </p>
                  </div>
                )}

                {transaction.status === 'success' && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-green-800 text-sm">
                      Campaign created successfully!
                    </p>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={transaction.status === 'pending' || transaction.status === 'success'}
                    className="flex-1"
                  >
                    {transaction.status === 'pending' 
                      ? 'Creating...' 
                      : transaction.status === 'success'
                      ? 'Created!'
                      : 'Create Campaign'
                    }
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}