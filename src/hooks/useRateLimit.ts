/**
 * useRateLimit Hook
 * React hook for client-side rate limiting
 */

import { useState, useCallback } from 'react';
import { RateLimiter, RateLimitResult, formatRetryAfter } from '../utils/security/rateLimiter';
import { securityLogger } from '../services/SecurityLogger';

export interface UseRateLimitResult {
  checkLimit: (identifier?: string) => RateLimitResult;
  isAllowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
  retryAfterFormatted?: string;
  error?: string;
}

export function useRateLimit(limiter: RateLimiter, identifier?: string): UseRateLimitResult {
  const [lastCheck, setLastCheck] = useState<RateLimitResult>({
    allowed: true,
    remaining: 0,
    resetTime: Date.now(),
  });

  const checkLimit = useCallback(
    (id?: string): RateLimitResult => {
      const result = limiter.check(id || identifier || 'default');
      setLastCheck(result);

      // Log rate limit exceeded
      if (!result.allowed && result.retryAfter) {
        securityLogger.logRateLimitExceeded(id || identifier || 'default');
      }

      return result;
    },
    [limiter, identifier]
  );

  return {
    checkLimit,
    isAllowed: lastCheck.allowed,
    remaining: lastCheck.remaining,
    resetTime: lastCheck.resetTime,
    retryAfter: lastCheck.retryAfter,
    retryAfterFormatted: lastCheck.retryAfter
      ? formatRetryAfter(lastCheck.retryAfter)
      : undefined,
    error: !lastCheck.allowed
      ? `Rate limit exceeded. Please try again in ${formatRetryAfter(lastCheck.retryAfter || lastCheck.resetTime - Date.now())}.`
      : undefined,
  };
}

/**
 * Higher-order function to wrap async functions with rate limiting
 */
export function withRateLimit<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  limiter: RateLimiter,
  identifier?: string
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const result = limiter.check(identifier || 'default');

    if (!result.allowed) {
      const retryAfter = result.retryAfter || result.resetTime - Date.now();
      throw new Error(`Rate limit exceeded. Please try again in ${formatRetryAfter(retryAfter)}.`);
    }

    return fn(...args);
  }) as T;
}
