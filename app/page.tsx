'use client';

import { useAccount, useBalance } from 'wagmi';
import { Name, Avatar, Identity, Address } from '@coinbase/onchainkit/identity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Star, Zap, Share2, ExternalLink, Award, TrendingUp, Twitter, CheckCircle2, Lock, Loader2, Rocket, Hammer, Vote, BarChart3, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { sdk } from '@farcaster/miniapp-sdk';
import { useEffect, useState, useMemo } from 'react';

export default function ReputationDashboard() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    address: address,
  });

  const [isXConnected, setIsXConnected] = useState(false);
  const [isConnectingX, setIsConnectingX] = useState(false);

  // Mock reputation metrics
  const metrics = useMemo(() => {
    if (!isConnected || !address) return null;
    
    const balanceValue = parseFloat(balance?.formatted || '0');
    const hasBasename = true; // We'll assume they have one for the demo or check via Identity
    
    // Simple score calculation
    let score = 20; // Base score for being onchain
    if (balanceValue > 0.01) score += 20;
    if (balanceValue > 0.1) score += 15;
    if (hasBasename) score += 25;
    
    // Boost from X
    if (isXConnected) score += 20;
    
    return {
      score: Math.min(score, 100),
      level: score > 80 ? 'Legend' : score > 50 ? 'Influencer' : 'Explorer',
      onchainAge: '2.4 Years',
      txCount: '1,240',
      trustScore: Math.min(score + 5, 100),
      eligibleForBoost: parseFloat('2.4') >= 1 && parseInt('1240') >= 100,
    };
  }, [isConnected, address, balance, isXConnected]);

  const reputationScore = metrics?.score || 0;
  const isCalculated = !!metrics;

  // OAuth Message Listener
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) return;
      
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data?.provider === 'x') {
        setIsXConnected(true);
        setIsConnectingX(false);
      }
      if (event.data?.type === 'OAUTH_AUTH_ERROR') {
        setIsConnectingX(false);
        console.error('X Auth Error:', event.data.error);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleConnectX = async () => {
    if (!metrics?.eligibleForBoost) return;
    
    setIsConnectingX(true);
    try {
      const response = await fetch('/api/auth/x/url');
      const { url } = await response.json();
      
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      window.open(
        url,
        'x_oauth',
        `width=${width},height=${height},left=${left},top=${top}`
      );
    } catch (e) {
      console.error('Failed to initiate X auth:', e);
      setIsConnectingX(false);
    }
  };

  const handleShare = async () => {
    try {
      const appUrl = process.env.NEXT_PUBLIC_URL || window.location.origin;
      await sdk.actions.openUrl(`https://warpcast.com/~/compose?text=Check out my onchain reputation on BaseBuzz! 🚀&embeds[]=${appUrl}`);
    } catch (e) {
      console.error('Share error:', e);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md space-y-6"
        >
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-blue-200">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900">BaseBuzz</h1>
          <p className="text-neutral-600 text-lg">
            The definitive onchain reputation layer for the Base ecosystem. Connect your wallet to verify your influence.
          </p>
          <div className="pt-4">
            {/* OnchainKit Connect Wallet would go here, but we'll use a standard button for simplicity in this demo if needed, or just let the user connect via the app's native wallet if it's a mini app */}
            <p className="text-sm text-neutral-400 italic">Please connect your wallet using the Base app interface.</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">BaseBuzz</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleShare}>
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
            <CardContent className="p-8">
              <div className="flex items-center gap-6">
                <Identity address={address} className="bg-transparent p-0">
                  <Avatar className="w-20 h-20 border-4 border-white/20" />
                </Identity>
                <div className="space-y-1">
                  <Identity address={address} className="bg-transparent p-0">
                    <Name className="text-2xl font-bold text-white" />
                  </Identity>
                  <div className="flex items-center gap-2 opacity-80">
                    <Address className="text-sm font-mono" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Badge variant="secondary" className="bg-white/20 text-white border-none backdrop-blur-sm">
                      {metrics?.level}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white border-none backdrop-blur-sm">
                      Base Native
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Reputation Score */}
        <Card className="border-neutral-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium text-neutral-500 uppercase tracking-wider">Reputation Score</CardTitle>
                <CardDescription className="text-3xl font-bold text-neutral-900 pt-1">
                  {isCalculated ? reputationScore : '--'} / 100
                </CardDescription>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={reputationScore} className="h-3 bg-neutral-100" />
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="text-center">
                <p className="text-xs text-neutral-500 uppercase">Trust</p>
                <p className="font-bold text-neutral-900">{metrics?.trustScore}%</p>
              </div>
              <div className="text-center border-x border-neutral-100">
                <p className="text-xs text-neutral-500 uppercase">Age</p>
                <p className="font-bold text-neutral-900">{metrics?.onchainAge}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-neutral-500 uppercase">TXs</p>
                <p className="font-bold text-neutral-900">{metrics?.txCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* X Boost Section */}
        <Card className="border-neutral-200 shadow-sm overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium text-neutral-500 uppercase tracking-wider">Reputation Boost</CardTitle>
                <CardDescription className="text-lg font-bold text-neutral-900">Social Verification</CardDescription>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Twitter className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-bold text-neutral-900">X (Twitter) Boost</p>
                <p className="text-sm text-neutral-500">
                  Connect your X account to verify your social presence and gain a <span className="text-blue-600 font-bold">+20 point</span> boost.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="outline" className={`text-[10px] ${parseFloat(metrics?.onchainAge || '0') >= 1 ? 'text-green-600 border-green-200 bg-green-50' : 'text-neutral-400'}`}>
                    {parseFloat(metrics?.onchainAge || '0') >= 1 ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                    1yr+ Onchain
                  </Badge>
                  <Badge variant="outline" className={`text-[10px] ${parseInt(metrics?.txCount || '0') >= 100 ? 'text-green-600 border-green-200 bg-green-50' : 'text-neutral-400'}`}>
                    {parseInt(metrics?.txCount || '0') >= 100 ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                    100+ TXs
                  </Badge>
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {isXConnected ? (
                <motion.div
                  key="connected"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-2 p-3 bg-green-50 text-green-700 rounded-xl font-bold border border-green-100"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Boost Applied! (+20)
                </motion.div>
              ) : (
                <motion.div
                  key="not-connected"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Button 
                    className="w-full h-12 bg-black hover:bg-neutral-800 text-white font-bold rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleConnectX}
                    disabled={!metrics?.eligibleForBoost || isConnectingX}
                  >
                    {isConnectingX ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <Twitter className="w-5 h-5 mr-2 fill-current" />
                    )}
                    {metrics?.eligibleForBoost ? 'Connect X to Boost' : 'Requirements Not Met'}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Tabs for detailed metrics */}
        <Tabs defaultValue="activity" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-neutral-100 p-1">
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
          </TabsList>
          
          <TabsContent value="activity" className="pt-4 space-y-4">
            {[
              { label: 'Network Participation', value: 85, icon: Zap },
              { label: 'Governance Votes', value: 42, icon: Award },
              { label: 'Social Engagement', value: 68, icon: Star },
            ].map((item, i) => (
              <Card key={i} className="border-neutral-100 shadow-none">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-neutral-50 rounded-lg">
                    <item.icon className="w-5 h-5 text-neutral-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-neutral-700">{item.label}</span>
                      <span className="text-neutral-500">{item.value}%</span>
                    </div>
                    <Progress value={item.value} className="h-1.5 bg-neutral-50" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="assets" className="pt-4">
            <Card className="border-neutral-100 shadow-none">
              <CardContent className="p-6 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                    <Zap className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900">Base Assets Verified</h3>
                  <p className="text-sm text-neutral-500">Your wallet contains {balance?.formatted.slice(0, 6)} {balance?.symbol} on Base.</p>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <a href={`https://basescan.org/address/${address}`} target="_blank" rel="noopener noreferrer">
                    View on Basescan <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="badges" className="pt-4 grid grid-cols-2 gap-4">
            {[
              { 
                name: 'Early Adopter', 
                color: 'bg-amber-100 text-amber-700', 
                icon: Rocket, 
                desc: 'Joined Base in year 1',
                earned: true 
              },
              { 
                name: 'Base Builder', 
                color: 'bg-blue-100 text-blue-700', 
                icon: Hammer, 
                desc: 'Deployed a contract',
                earned: true 
              },
              { 
                name: 'Active Voter', 
                color: 'bg-green-100 text-green-700', 
                icon: Vote, 
                desc: '3+ Governance votes',
                earned: false 
              },
              { 
                name: 'High Volume', 
                color: 'bg-purple-100 text-purple-700', 
                icon: BarChart3, 
                desc: '1000+ Transactions',
                earned: true 
              },
            ].map((badge, i) => (
              <div 
                key={i} 
                className={`p-4 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 border transition-all duration-300 ${
                  badge.earned 
                    ? `${badge.color} border-current/10 shadow-sm scale-100` 
                    : 'bg-neutral-50 text-neutral-400 border-neutral-200 grayscale opacity-60'
                }`}
              >
                <div className="relative">
                  <badge.icon className="w-8 h-8" />
                  {!badge.earned && (
                    <div className="absolute -top-1 -right-1 bg-neutral-200 rounded-full p-0.5 border border-white">
                      <Lock className="w-2.5 h-2.5 text-neutral-500" />
                    </div>
                  )}
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-bold uppercase tracking-tighter block">{badge.name}</span>
                  <p className="text-[10px] opacity-80 leading-tight max-w-[100px] mx-auto">{badge.desc}</p>
                </div>
                {badge.earned && (
                  <div className="pt-1">
                    <Badge variant="secondary" className="bg-white/40 text-[8px] h-4 px-1.5 border-none backdrop-blur-sm">
                      Earned
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </TabsContent>
        </Tabs>

        {/* Footer Action */}
        <div className="pt-6">
          <Button className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200" onClick={handleShare}>
            Share Reputation <Share2 className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </main>
    </div>
  );
}
