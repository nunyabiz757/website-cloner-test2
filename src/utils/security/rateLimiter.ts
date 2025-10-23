/**
 * Client-Side Rate Limiting Service
 * Prevents abuse by limiting request frequency using localStorage
 */

export interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Maximum requests allowed in window
  keyPrefix: string;     // Prefix for localStorage keys
  blockDuration?: number; // Optional: How long to block after limit (ms)
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blockedUntil?: number;
}

/**
 * Rate Limiter Class
 */
export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Check if request is allowed
   */
  check(identifier: string = 'default'): RateLimitResult {
    const key = `${this.config.keyPrefix}:${identifier}`;
    const now = Date.now();

    // Get existing entry
    const entry = this.getEntry(key);

    // Check if blocked
    if (entry.blockedUntil && entry.blockedUntil > now) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockedUntil,
        retryAfter: entry.blockedUntil - now,
      };
    }

    // Check if window has expired
    if (entry.resetTime <= now) {
      // Reset the counter
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + this.config.windowMs,
      };
      this.setEntry(key, newEntry);

      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: newEntry.resetTime,
      };
    }

    // Increment counter
    entry.count++;

    // Check if limit exceeded
    if (entry.count > this.config.maxRequests) {
      // Apply block if configured
      if (this.config.blockDuration) {
        entry.blockedUntil = now + this.config.blockDuration;
      }

      this.setEntry(key, entry);

      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: entry.blockedUntil ? entry.blockedUntil - now : entry.resetTime - now,
      };
    }

    // Update entry
    this.setEntry(key, entry);

    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Reset rate limit for identifier
   */
  reset(identifier: string = 'default'): void {
    const key = `${this.config.keyPrefix}:${identifier}`;
    localStorage.removeItem(key);
  }

  /**
   * Get current status without incrementing
   */
  getStatus(identifier: string = 'default'): RateLimitResult {
    const key = `${this.config.keyPrefix}:${identifier}`;
    const entry = this.getEntry(key);
    const now = Date.now();

    if (entry.blockedUntil && entry.blockedUntil > now) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockedUntil,
        retryAfter: entry.blockedUntil - now,
      };
    }

    if (entry.resetTime <= now) {
      return {
        allowed: true,
        remaining: this.config.maxRequests,
        resetTime: now + this.config.windowMs,
      };
    }

    return {
      allowed: entry.count < this.config.maxRequests,
      remaining: Math.max(0, this.config.maxRequests - entry.count),
      resetTime: entry.resetTime,
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    const keys = Object.keys(localStorage);

    keys.forEach((key) => {
      if (key.startsWith(this.config.keyPrefix)) {
        try {
          const entry = JSON.parse(localStorage.getItem(key) || '{}');
          if (entry.resetTime && entry.resetTime <= now && (!entry.blockedUntil || entry.blockedUntil <= now)) {
            localStorage.removeItem(key);
          }
        } catch (error) {
          // Invalid entry, remove it
          localStorage.removeItem(key);
        }
      }
    });
  }

  private getEntry(key: string): RateLimitEntry {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error reading rate limit entry:', error);
    }

    return {
      count: 0,
      resetTime: Date.now() + this.config.windowMs,
    };
  }

  private setEntry(key: string, entry: RateLimitEntry): void {
    try {
      localStorage.setItem(key, JSON.stringify(entry));
    } catch (error) {
      console.error('Error storing rate limit entry:', error);
    }
  }
}

/**
 * Pre-configured Rate Limiters
 */

// General API rate limiter (100 requests per 15 minutes)
export const generalLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  maxRequests: 100,
  keyPrefix: 'rl:general',
});

// Authentication rate limiter (5 attempts per 15 minutes)
export const authLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  maxRequests: 5,
  keyPrefix: 'rl:auth',
  blockDuration: 30 * 60 * 1000,  // Block for 30 minutes after limit
});

// Clone operation limiter (10 clones per hour)
export const cloneLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000,  // 1 hour
  maxRequests: 10,
  keyPrefix: 'rl:clone',
});

// Export operation limiter (10 exports per hour)
export const exportLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000,  // 1 hour
  maxRequests: 10,
  keyPrefix: 'rl:export',
});

// Optimization limiter (20 optimizations per hour)
export const optimizationLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000,  // 1 hour
  maxRequests: 20,
  keyPrefix: 'rl:optimize',
});

/**
 * Helper function to format retry after time
 */
export function formatRetryAfter(milliseconds: number): string {
  const seconds = Math.ceil(milliseconds / 1000);

  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }

  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }

  const hours = Math.ceil(minutes / 60);
  return `${hours} hour${hours !== 1 ? 's' : ''}`;
}

/**
 * Cleanup all rate limiters (call periodically)
 */
export function cleanupAllRateLimiters(): void {
  generalLimiter.cleanup();
  authLimiter.cleanup();
  cloneLimiter.cleanup();
  exportLimiter.cleanup();
  optimizationLimiter.cleanup();
}

// Auto cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(cleanupAllRateLimiters, 5 * 60 * 1000);
}
