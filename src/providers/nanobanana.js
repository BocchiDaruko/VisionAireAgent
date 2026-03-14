const axios = require('axios');
const BaseProvider = require('./base_provider');
const logger = require('../utils/logger');

class NanoBananaProvider extends BaseProvider {
  constructor() {
    super('nanobanana');
    this.requireEnv(['NANOBANANA_API_KEY']);

    this.client = axios.create({
      baseURL: process.env.NANOBANANA_BASE_URL || 'https://api.nanobanana.ai/v1',
      headers: {
        Authorization: `Bearer ${process.env.NANOBANANA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: parseInt(process.env.AGENT_TIMEOUT_MS || '60000')
    });
  }

  isConfigured() {
    return !!process.env.NANOBANANA_API_KEY;
  }

  /**
   * Generate an image using NanoBanana Pro
   * @param {object} params
   * @returns {Promise<{url: string, metadata: object}>}
   */
  async generate({ prompt, width = 1024, height = 1024, negative_prompt = '' }) {
    logger.info('NanoBanana Pro: generating image', { prompt: prompt.slice(0, 60) });

    const response = await this.client.post('/generate', {
      prompt,
      negative_prompt,
      width,
      height,
      steps: 30,
      cfg_scale: 7.5,
      sampler: 'dpmpp_2m'
    });

    const url = response.data?.image_url || response.data?.url;
    if (!url) throw new Error('NanoBanana Pro: no image URL in response');

    return {
      url,
      metadata: {
        provider: this.name,
        model: response.data?.model,
        seed: response.data?.seed,
        steps: 30
      }
    };
  }
}

module.exports = NanoBananaProvider;
