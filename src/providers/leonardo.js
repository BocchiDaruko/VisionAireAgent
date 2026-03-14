const axios = require('axios');
const BaseProvider = require('./base_provider');
const logger = require('../utils/logger');

class LeonardoProvider extends BaseProvider {
  constructor() {
    super('leonardo');
    this.requireEnv(['LEONARDO_API_KEY']);

    this.baseURL = process.env.LEONARDO_BASE_URL || 'https://cloud.leonardo.ai/api/rest/v1';
    this.defaultModel =
      process.env.LEONARDO_DEFAULT_MODEL || '6bef9f1b-29cb-40c7-b9df-32b51c1f67d3';

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        Authorization: `Bearer ${process.env.LEONARDO_API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      timeout: parseInt(process.env.AGENT_TIMEOUT_MS || '60000')
    });
  }

  isConfigured() {
    return !!process.env.LEONARDO_API_KEY;
  }

  /**
   * Generate image using Leonardo AI - uses a polling approach as Leonardo is async
   * @param {object} params
   * @returns {Promise<{url: string, metadata: object}>}
   */
  async generate({ prompt, width = 1024, height = 1024, negative_prompt = '' }) {
    logger.info('Leonardo AI: initiating generation', { prompt: prompt.slice(0, 60) });

    // Step 1: Submit generation request
    const initResponse = await this.client.post('/generations', {
      prompt,
      negative_prompt,
      modelId: this.defaultModel,
      width,
      height,
      num_images: 1,
      guidance_scale: 7,
      num_inference_steps: 30,
      photoReal: false,
      alchemy: true
    });

    const generationId = initResponse.data?.sdGenerationJob?.generationId;
    if (!generationId) {
      throw new Error('Leonardo AI: no generationId returned');
    }

    // Step 2: Poll for results
    const imageUrl = await this.pollForResult(generationId);
    return {
      url: imageUrl,
      metadata: {
        provider: this.name,
        generation_id: generationId,
        model: this.defaultModel
      }
    };
  }

  /**
   * Poll Leonardo API until generation is complete
   * @param {string} generationId
   * @param {number} maxAttempts
   * @returns {string} image URL
   */
  async pollForResult(generationId, maxAttempts = 20) {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await delay(3000);
      logger.debug(`Leonardo AI: polling attempt ${attempt}/${maxAttempts}`, { generationId });

      const response = await this.client.get(`/generations/${generationId}`);
      const status = response.data?.generations_by_pk?.status;
      const images = response.data?.generations_by_pk?.generated_images;

      if (status === 'COMPLETE' && images?.length > 0) {
        return images[0].url;
      }

      if (status === 'FAILED') {
        throw new Error('Leonardo AI: generation failed');
      }
    }

    throw new Error('Leonardo AI: generation timed out after polling');
  }
}

module.exports = LeonardoProvider;
