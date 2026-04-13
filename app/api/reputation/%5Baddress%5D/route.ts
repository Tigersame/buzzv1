import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  if (!address || !address.startsWith('0x')) {
    return NextResponse.json(
      { error: 'Invalid wallet address' },
      { status: 400 }
    );
  }

  // Mock calculation logic based on address
  // In a real app, this would fetch data from Basescan, Dune, or a custom indexer
  const hash = address.toLowerCase();
  const lastChar = hash.charAt(hash.length - 1);
  const seed = parseInt(lastChar, 16) || 0;

  const reputationScore = 40 + (seed * 3);
  const trustScore = 50 + (seed * 2);
  const onchainAge = (1 + (seed / 5)).toFixed(1) + ' Years';
  const txCount = (100 + (seed * 50)).toString();

  const data = {
    address,
    reputationScore: Math.min(reputationScore, 100),
    trustScore: Math.min(trustScore, 100),
    onchainAge,
    txCount,
    level: reputationScore > 80 ? 'Legend' : reputationScore > 50 ? 'Influencer' : 'Explorer',
    lastUpdated: new Date().toISOString(),
  };

  return NextResponse.json(data);
}
