const axios = require('axios');
const BaseProvider = require('./base_provider');
const logger = require('../utils/logger');

class PlaygroundProvider extends BaseProvider {
  constructor() {
    super('playground');
    this.requireEnv(['PLAYGROUND_API_KEY']);

    this.client = axios.create({
      baseURL: process.env.PLAYGROUND_BASE_URL || 'https://api.playground.com/v1',
      headers: {
        Authorization: `Bearer ${process.env.PLAYGROUND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: parseInt(process.env.AGENT_TIMEOUT_MS || '60000')
    });
  }

  isConfigured() {
    return !!process.env.PLAYGROUND_API_KEY;
  }

  /**
   * Generate image using Playground AI
   * @param {object} params
   * @returns {Promise<{url: string, metadata: object}>}
   */
  async generate({ prompt, width = 1024, height = 1024, negative_prompt = '' }) {
    logger.info('Playground AI: generating image', { prompt: prompt.slice(0, 60) });

    const response = await this.client.post('/images/generations', {
      prompt,
      negative_prompt,
      width,
      height,
      num_images_per_prompt: 1,
      guidance_scale: 3,
      model: 'playground-v2.5-1024px-aesthetic'
    });

    const url =
      response.data?.images?.[0]?.url ||
      response.data?.data?.[0]?.url ||
      response.data?.url;

    if (!url) throw new Error('Playground AI: no image URL in response');

    return {
      url,
      metadata: {
        provider: this.name,
        model: 'playground-v2.5',
        seed: response.data?.images?.[0]?.seed
      }
    };
  }
}

module.exports = PlaygroundProvider;
