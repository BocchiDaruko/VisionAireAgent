const logger = require('./logger');

/**
 * Simple token-bucket rate limiter per provider.
 * Tracks request timestamps and enforces per-minute limits.
 */
class RateLimiter {
  constructor() {
    this.buckets = {};
  }

  /**
   * Get or create a bucket for a provider
   * @param {string} provider
   * @returns {object} bucket
   */
  getBucket(provider) {
    if (!this.buckets[provider]) {
      const limitEnvKey = `RATE_LIMIT_${provider.toUpperCase()}`;
      const limit = parseInt(process.env[limitEnvKey] || '30');
      this.buckets[provider] = {
        limit,
        requests: [],
        windowMs: 60 * 1000 // 1 minute
      };
    }
    return this.buckets[provider];
  }

  /**
   * Check if a request can proceed for the given provider.
   * Waits if the rate limit would be exceeded.
   * @param {string} provider
   */
  async acquire(provider) {
    const bucket = this.getBucket(provider);
    const now = Date.now();

    // Remove timestamps outside the window
    bucket.requests = bucket.requests.filter((ts) => now - ts < bucket.windowMs);

    if (bucket.requests.length >= bucket.limit) {
      const oldest = bucket.requests[0];
      const waitMs = bucket.windowMs - (now - oldest) + 100;
      logger.warn(`Rate limit for ${provider}: waiting ${waitMs}ms`);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      return this.acquire(provider); // Recurse after waiting
    }

    bucket.requests.push(Date.now());
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();
module.exports = rateLimiter;
