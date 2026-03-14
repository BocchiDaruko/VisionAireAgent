const axios = require('axios');
const BaseProvider = require('./base_provider');
const logger = require('../utils/logger');

class KreaProvider extends BaseProvider {
  constructor() {
    super('krea');
    this.requireEnv(['KREA_API_KEY']);

    this.client = axios.create({
      baseURL: process.env.KREA_BASE_URL || 'https://api.krea.ai/v1',
      headers: {
        Authorization: `Bearer ${process.env.KREA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: parseInt(process.env.AGENT_TIMEOUT_MS || '60000')
    });
  }

  isConfigured() {
    return !!process.env.KREA_API_KEY;
  }

  /**
   * Generate image using Krea AI
   * @param {object} params
   * @returns {Promise<{url: string, metadata: object}>}
   */
  async generate({ prompt, width = 1024, height = 1024, negative_prompt = '' }) {
    logger.info('Krea AI: generating image', { prompt: prompt.slice(0, 60) });

    const response = await this.client.post('/generate', {
      prompt,
      negative_prompt,
      width,
      height,
      guidance_scale: 6.5,
      steps: 20,
      output_format: 'png'
    });

    // Krea may be async
    if (response.data?.generation_id) {
      return this.pollGeneration(response.data.generation_id);
    }

    const url = response.data?.image_url || response.data?.url || response.data?.output;
    if (!url) throw new Error('Krea AI: no image URL in response');

    return {
      url,
      metadata: {
        provider: this.name,
        generation_id: response.data?.generation_id
      }
    };
  }

  /**
   * Poll Krea AI for generation status
   * @param {string} generationId
   * @returns {Promise<{url: string, metadata: object}>}
   */
  async pollGeneration(generationId, maxAttempts = 15) {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await delay(3000);
      logger.debug(`Krea AI: polling generation ${generationId}, attempt ${attempt}`);

      const response = await this.client.get(`/generations/${generationId}`);
      const status = response.data?.status;

      if (status === 'completed' || status === 'done') {
        const url = response.data?.image_url || response.data?.output;
        if (!url) throw new Error('Krea AI: generation done but no URL found');
        return { url, metadata: { provider: this.name, generation_id: generationId } };
      }

      if (status === 'failed') {
        throw new Error(`Krea AI: generation ${generationId} failed`);
      }
    }

    throw new Error(`Krea AI: generation ${generationId} timed out`);
  }
}

module.exports = KreaProvider;
