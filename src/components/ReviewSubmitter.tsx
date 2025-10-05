"use client";

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Link, FileText, DollarSign, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { useSubmitReview } from '~/hooks/useBlockchain';
import { Campaign, User, SubmitReviewForm } from '~/lib/types';

interface ReviewSubmitterProps {
  campaign: Campaign | null;
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted: () => void;
}

export default function ReviewSubmitter({ 
  campaign, 
  user, 
  isOpen, 
  onClose, 
  onReviewSubmitted 
}: ReviewSubmitterProps) {
  const [formData, setFormData] = useState<SubmitReviewForm>({
    campaignId: 0,
    proofLink: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'instructions' | 'submit'>('instructions');

  const { submitReview, transaction, resetTransaction } = useSubmitReview();

  useEffect(() => {
    if (campaign) {
      setFormData({
        campaignId: campaign.id,
        proofLink: '',
      });
      setStep('instructions');
      setFormErrors({});
    }
  }, [campaign]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.proofLink.trim()) {
      errors.proofLink = 'Proof link is required';
    } else if (!isValidUrl(formData.proofLink)) {
      errors.proofLink = 'Please enter a valid URL';
    } else if (!isGoogleMapsUrl(formData.proofLink)) {
      errors.proofLink = 'Please enter a valid Google Maps review URL or screenshot link';
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
    const validPatterns = [
      /maps\.google\./,
      /goo\.gl\/maps/,
      /maps\.app\.goo\.gl/,
      /google\.[a-z]{2,}\/maps/,
      /imgur\.com/,
      /drive\.google\.com/,
      /photos\.app\.goo\.gl/,
      /screenshot/i,
      /image/i
    ];
    
    return validPatterns.some(pattern => pattern.test(url));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await submitReview(formData);
      onReviewSubmitted();
      handleClose();
    } catch (error) {
      console.error('Review submission failed:', error);
    }
  };

  const handleClose = () => {
    onClose();
    resetTransaction();
    setFormErrors({});
    setStep('instructions');
    setFormData({ campaignId: 0, proofLink: '' });
  };

  const formatEth = (wei: string) => {
    try {
      return parseFloat(ethers.formatEther(wei)).toFixed(4);
    } catch {
      return '0.0000';
    }
  };

  if (!isOpen || !campaign) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Submit Review</h2>
              <p className="text-sm text-gray-600">Campaign #{campaign.id}</p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Campaign Info */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">Reward Amount</span>
              <span className="text-lg font-bold text-blue-800">
                {formatEth(campaign.rewardAmount)} ETH
              </span>
            </div>
            <div className="text-sm text-blue-700">
              Business: {campaign.businessOwner.slice(0, 6)}...{campaign.businessOwner.slice(-4)}
            </div>
          </div>

          {step === 'instructions' && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-yellow-800 mb-2">Important Instructions</h3>
                    <ol className="text-sm text-yellow-700 space-y-2 list-decimal list-inside">
                      <li>Click the link below to visit the business on Google Maps</li>
                      <li>Write a genuine, helpful review (minimum 50 characters)</li>
                      <li>Take a screenshot of your published review</li>
                      <li>Upload the screenshot to a public link (imgur, google drive, etc.)</li>
                      <li>Submit the proof link to claim your reward</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Review Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Maps Business Link
                </label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Link className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <div className="flex-1 text-sm text-gray-600 truncate">
                    {campaign.reviewLink}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => window.open(campaign.reviewLink, '_blank')}
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open
                  </Button>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-green-800 mb-1">Reward Policy</h3>
                    <p className="text-sm text-green-700">
                      You'll receive {formatEth(campaign.rewardAmount)} ETH once your review proof is verified and the transaction is confirmed on the blockchain.
                    </p>
                  </div>
                </div>
              </div>

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
                  type="button"
                  onClick={() => setStep('submit')}
                  className="flex-1"
                >
                  I've Written My Review
                </Button>
              </div>
            </div>
          )}

          {step === 'submit' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Proof Link (Screenshot of Your Review)
                </label>
                <input
                  type="url"
                  value={formData.proofLink}
                  onChange={(e) => setFormData(prev => ({ ...prev, proofLink: e.target.value }))}
                  placeholder="https://imgur.com/... or https://drive.google.com/..."
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.proofLink ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.proofLink && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.proofLink}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  Provide a public link to a screenshot of your published Google Maps review
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-800 mb-2">Accepted Proof Links:</h3>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Imgur (imgur.com)</li>
                  <li>• Google Drive (drive.google.com)</li>
                  <li>• Google Photos (photos.app.goo.gl)</li>
                  <li>• Direct image links (.jpg, .png, .gif)</li>
                </ul>
              </div>

              {/* Transaction Status */}
              {transaction.status === 'pending' && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    Submitting review... Please confirm the transaction in your wallet.
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
                    Review submitted successfully! Your reward has been sent to your wallet.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('instructions')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={transaction.status === 'pending' || transaction.status === 'success'}
                  className="flex-1"
                >
                  {transaction.status === 'pending' 
                    ? 'Submitting...' 
                    : transaction.status === 'success'
                    ? 'Submitted!'
                    : 'Submit Review'
                  }
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}