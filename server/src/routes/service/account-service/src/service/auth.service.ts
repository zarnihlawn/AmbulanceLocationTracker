import { UserRepository } from '../repo/user.repo';
import { RefreshTokenRepository } from '../repo/token.repo';
import { appEnv } from '../config/app.config';

// JWT Secret (in production, use environment variable)
const JWT_SECRET = appEnv.ACCOUNT_JWT_TOKEN;
const JWT_ACCESS_EXPIRY = '24h'; // 24 hours
const JWT_REFRESH_EXPIRY = '7d'; // 7 days

interface JWTPayload {
  userId: string;
  email?: string | null;
  username?: string | null;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number; // seconds
}

// Simple JWT implementation (use jsonwebtoken library in production)
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return Buffer.from(str, 'base64').toString();
}

function createJWT(
  payload: JWTPayload,
  expiresIn: string,
): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  let exp: number;

  if (expiresIn.endsWith('m')) {
    exp = now + parseInt(expiresIn) * 60;
  } else if (expiresIn.endsWith('h')) {
    exp = now + parseInt(expiresIn) * 3600;
  } else if (expiresIn.endsWith('d')) {
    exp = now + parseInt(expiresIn) * 86400;
  } else {
    exp = now + 900; // default 15 minutes
  }

  const jwtPayload = {
    ...payload,
    iat: now,
    exp,
  };

  const encodedHeader = base64UrlEncode(
    JSON.stringify(header),
  );
  const encodedPayload = base64UrlEncode(
    JSON.stringify(jwtPayload),
  );

  const signature = require('crypto')
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyJWT(
  token: string,
): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] =
      parts;

    // Verify signature
    const expectedSignature = require('crypto')
      .createHmac('sha256', JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    if (signature !== expectedSignature) return null;

    // Decode payload
    const payload = JSON.parse(
      base64UrlDecode(encodedPayload ?? ''),
    );

    // Check expiration
    if (
      payload.exp &&
      payload.exp < Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
      username: payload.username,
    };
  } catch {
    return null;
  }
}

export class AuthService {
  constructor(
    private userRepo: UserRepository,
    private tokenRepo: RefreshTokenRepository,
  ) {}

  async generateTokens(user: {
    id: string;
    email?: string | null;
    username?: string | null;
  }): Promise<TokenResponse> {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
    };

    // Generate access token
    const accessToken = createJWT(
      payload,
      JWT_ACCESS_EXPIRY,
    );

    // Generate refresh token (with different payload to distinguish)
    const refreshPayload = {
      ...payload,
      tokenType: 'refresh',
    };
    const refreshToken = createJWT(
      refreshPayload,
      JWT_REFRESH_EXPIRY,
    );

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.tokenRepo.create({
      userId: user.id,
      token: refreshToken,
      expiresAt,
      isRevoked: false,
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: 24 * 60 * 60, // 24 hours in seconds
    };
  }

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<TokenResponse> {
    // Verify refresh token
    const payload = verifyJWT(refreshToken);
    if (!payload) {
      throw new Error('Invalid refresh token');
    }

    // Check if token exists in database and is not revoked
    const storedToken =
      await this.tokenRepo.findByToken(refreshToken);
    if (
      !storedToken ||
      storedToken.isRevoked ||
      storedToken.expiresAt < new Date()
    ) {
      throw new Error('Refresh token expired or revoked');
    }

    // Get user
    const user = await this.userRepo.findById(
      payload.userId,
    );
    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }

    // Revoke old refresh token (token rotation for security)
    await this.tokenRepo.revokeToken(refreshToken);

    // Generate new tokens
    return this.generateTokens(user);
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.tokenRepo.revokeToken(token);
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.tokenRepo.revokeAllUserTokens(userId);
  }

  verifyAccessToken(token: string): JWTPayload | null {
    return verifyJWT(token);
  }
}
