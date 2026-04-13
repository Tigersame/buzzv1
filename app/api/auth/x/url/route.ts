import { NextResponse } from 'next/server';

export async function GET() {
  const appUrl = process.env.APP_URL || 'https://basebuzz.app';
  const redirectUri = `${appUrl}/api/auth/x/callback`;
  
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.X_CLIENT_ID || '',
    redirect_uri: redirectUri,
    scope: 'users.read tweet.read',
    state: 'state123', // In production, use a secure random string
    code_challenge: 'challenge', // For PKCE
    code_challenge_method: 'plain',
  });

  const authUrl = `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
  
  return NextResponse.json({ url: authUrl });
}
