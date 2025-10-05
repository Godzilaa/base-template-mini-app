import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '~/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, signature, message } = await request.json();

    if (!walletAddress || !signature || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const user = await AuthService.authenticateWallet(walletAddress, signature, message);

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        role: user.role,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}