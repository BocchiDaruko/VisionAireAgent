const logger = require('./logger');

/**
 * Retry an async function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxAttempts - Maximum number of attempts
 * @param {string} label - Identifier for logging
 * @param {number} baseDelayMs - Initial delay in milliseconds
 * @returns {Promise<any>}
 */
async function retry(fn, maxAttempts = 3, label = 'task', baseDelayMs = 1000) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const isLastAttempt = attempt === maxAttempts;

      if (isLastAttempt) {
        logger.error(`${label}: all ${maxAttempts} attempts failed`, {
          error: err.message
        });
        break;
      }

      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      logger.warn(`${label}: attempt ${attempt}/${maxAttempts} failed, retrying in ${delay}ms`, {
        error: err.message
      });

      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Sleep for a given number of milliseconds
 * @param {number} ms
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { retry, sleep };
