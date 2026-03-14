/**
 * BaseProvider - Abstract interface for all image generation providers.
 * All providers must extend this class and implement the generate() method.
 */
class BaseProvider {
  constructor(name) {
    if (!name) throw new Error('Provider must have a name');
    this.name = name;
  }

  /**
   * Generate an image from a prompt.
   * @param {object} params
   * @param {string} params.prompt - The image generation prompt
   * @param {number} [params.width=1024] - Output image width
   * @param {number} [params.height=1024] - Output image height
   * @param {string} [params.negative_prompt] - Things to exclude from the image
   * @returns {Promise<{url: string, metadata: object}>}
   */
  async generate(params) {
    throw new Error(`${this.name}: generate() method not implemented`);
  }

  /**
   * Check if the provider is properly configured with API keys.
   * @returns {boolean}
   */
  isConfigured() {
    throw new Error(`${this.name}: isConfigured() method not implemented`);
  }

  /**
   * Validate that required environment variables are set.
   * @param {string[]} keys
   */
  requireEnv(keys) {
    const missing = keys.filter((k) => !process.env[k]);
    if (missing.length > 0) {
      throw new Error(
        `${this.name}: Missing required environment variables: ${missing.join(', ')}`
      );
    }
  }
}

module.exports = BaseProvider;
