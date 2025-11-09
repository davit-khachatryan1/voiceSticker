// Rate limiting implementation
import { IncomingMessage } from 'http';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Max requests per window
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 60 * 1000,  // 1 hour
  maxRequests: 30,
};

const CHAT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 60 * 1000,  // 1 hour
  maxRequests: 60,
};

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = identifier;
  
  let entry = store[key];
  
  // Reset if window expired
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
    };
    store[key] = entry;
  }
  
  // Check limit
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }
  
  // Increment count
  entry.count++;
  
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

export function checkUserRateLimit(userId: string): ReturnType<typeof checkRateLimit> {
  return checkRateLimit(`user:${userId}`, DEFAULT_CONFIG);
}

export function checkChatRateLimit(chatId: string): ReturnType<typeof checkRateLimit> {
  return checkRateLimit(`chat:${chatId}`, CHAT_CONFIG);
}

export function getRateLimitHeaders(result: ReturnType<typeof checkRateLimit>) {
  return {
    'X-RateLimit-Limit': DEFAULT_CONFIG.maxRequests.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
  };
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000); // Clean every 5 minutes

