const axios = require('axios');
const BaseProvider = require('./base_provider');
const logger = require('../utils/logger');

class SeaArtProvider extends BaseProvider {
  constructor() {
    super('seaart');
    this.requireEnv(['SEAART_API_KEY']);

    this.client = axios.create({
      baseURL: process.env.SEAART_BASE_URL || 'https://api.seaart.ai/v1',
      headers: {
        Authorization: `Bearer ${process.env.SEAART_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: parseInt(process.env.AGENT_TIMEOUT_MS || '60000')
    });
  }

  isConfigured() {
    return !!process.env.SEAART_API_KEY;
  }

  /**
   * Generate image using SeaArt AI
   * @param {object} params
   * @returns {Promise<{url: string, metadata: object}>}
   */
  async generate({ prompt, width = 1024, height = 1024, negative_prompt = '' }) {
    logger.info('SeaArt AI: generating image', { prompt: prompt.slice(0, 60) });

    const response = await this.client.post('/text2img', {
      prompt,
      negative_prompt: negative_prompt || 'low quality, blurry, watermark, deformed',
      width,
      height,
      steps: 28,
      cfg_scale: 7,
      batch_size: 1,
      restore_faces: false,
      enable_hr: false
    });

    const url = response.data?.images?.[0]?.url || response.data?.url;
    if (!url) throw new Error('SeaArt AI: no image URL in response');

    return {
      url,
      metadata: {
        provider: this.name,
        seed: response.data?.info?.seed,
        steps: 28
      }
    };
  }
}

module.exports = SeaArtProvider;
