"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Users, Shield, ArrowRight, Star, Sparkles, TrendingUp, DollarSign, CheckCircle, Zap } from 'lucide-react';
import { Button } from '~/components/ui/Button';

export default function LandingPage() {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const handleRoleSelection = (role: 'business' | 'gigs') => {
    if (role === 'business') {
      router.push('/business');
    } else {
      router.push('/gigs');
    }
  };

  const features = [
    {
      icon: Briefcase,
      title: "For Businesses",
      description: "Create review campaigns and incentivize genuine customer feedback with crypto rewards",
      color: "from-blue-500 to-indigo-600",
      hoverColor: "from-blue-600 to-indigo-700",
      textColor: "text-blue-600"
    },
    {
      icon: Users,
      title: "For Workers", 
      description: "Earn crypto by writing authentic reviews for businesses you've actually visited",
      color: "from-emerald-500 to-teal-600",
      hoverColor: "from-emerald-600 to-teal-700",
      textColor: "text-emerald-600"
    },
    {
      icon: Shield,
      title: "Blockchain Verified",
      description: "All transactions are transparent and secure on the Base network",
      color: "from-purple-500 to-violet-600",
      hoverColor: "from-purple-600 to-violet-700",
      textColor: "text-purple-600"
    }
  ];

  const stats = [
    { label: "Reviews Posted", value: "10,000+", icon: Star },
    { label: "ETH Distributed", value: "50+", icon: DollarSign },
    { label: "Active Campaigns", value: "200+", icon: TrendingUp },
    { label: "Verified Businesses", value: "500+", icon: CheckCircle }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="relative">
                <Star className="w-8 h-8 text-blue-600 mr-2" />
                <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BaseReviews
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">How it Works</a>
              <a href="#stats" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Stats</a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-medium mb-6">
                <Zap className="w-4 h-4 mr-2" />
                Powered by Base Blockchain
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Decentralized Reviews,
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
                Real Rewards
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Connect businesses with authentic reviewers on Base blockchain. 
              Earn crypto for honest reviews, build trust through transparency.
            </p>

            {/* Get Started Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button
                onClick={() => handleRoleSelection('business')}
                className="px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Briefcase className="mr-2 w-5 h-5" />
                I'm a Business
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              <Button
                onClick={() => handleRoleSelection('gigs')}
                className="px-8 py-4 text-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Users className="mr-2 w-5 h-5" />
                I'm a Worker
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose BaseReviews?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built on blockchain technology for maximum transparency and trust
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`relative group p-8 rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100
                  ${hoveredCard === feature.title ? 'scale-105' : ''}`}
                onMouseEnter={() => setHoveredCard(feature.title)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
                
                <div className="relative">
                  <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">{feature.title}</h3>
                  <p className="text-gray-600 text-center leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">Simple steps to get started</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* For Businesses */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 ml-4">For Businesses</h3>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Click "I'm a Business"</h4>
                    <p className="text-gray-600">Access the business dashboard instantly</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Create Campaign</h4>
                    <p className="text-gray-600">Set up review campaigns with crypto rewards</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Get Reviews</h4>
                    <p className="text-gray-600">Receive authentic reviews from verified users</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Workers */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 ml-4">For Workers</h3>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Click "I'm a Worker"</h4>
                    <p className="text-gray-600">Access available gigs immediately</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Write Review</h4>
                    <p className="text-gray-600">Visit the business and write an honest review</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Earn Crypto</h4>
                    <p className="text-gray-600">Get paid instantly in ETH for verified reviews</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="relative py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Platform Statistics
            </h2>
            <p className="text-xl text-blue-100">
              Join thousands of users building trust together
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="mb-4">
                  <stat.icon className="w-12 h-12 text-white/80 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2 group-hover:text-yellow-300 transition-colors duration-300">
                  {stat.value}
                </div>
                <div className="text-blue-100 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Choose your path and start earning or getting reviews today
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => handleRoleSelection('business')}
              className="px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Briefcase className="mr-2 w-5 h-5" />
              Start as Business
            </Button>
            
            <Button
              onClick={() => handleRoleSelection('gigs')}
              className="px-8 py-4 text-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Users className="mr-2 w-5 h-5" />
              Start as Worker
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Star className="w-8 h-8 text-blue-400 mr-2" />
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                BaseReviews
              </h3>
            </div>
            <p className="text-gray-400 mb-6">
              Decentralized review platform powered by Base blockchain
            </p>
            <div className="flex justify-center space-x-8 mb-6">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Terms</a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Support</a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Docs</a>
            </div>
            <div className="text-sm text-gray-500">
              © 2025 BaseReviews. Built on Base Network.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}