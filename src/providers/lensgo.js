const axios = require('axios');
const BaseProvider = require('./base_provider');
const logger = require('../utils/logger');

class LensGoProvider extends BaseProvider {
  constructor() {
    super('lensgo');
    this.requireEnv(['LENSGO_API_KEY']);

    this.client = axios.create({
      baseURL: process.env.LENSGO_BASE_URL || 'https://api.lensgo.ai/v1',
      headers: {
        Authorization: `Bearer ${process.env.LENSGO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: parseInt(process.env.AGENT_TIMEOUT_MS || '60000')
    });
  }

  isConfigured() {
    return !!process.env.LENSGO_API_KEY;
  }

  /**
   * Generate image using LensGo AI
   * @param {object} params
   * @returns {Promise<{url: string, metadata: object}>}
   */
  async generate({ prompt, width = 1024, height = 1024, negative_prompt = '' }) {
    logger.info('LensGo AI: generating image', { prompt: prompt.slice(0, 60) });

    const response = await this.client.post('/generate/image', {
      prompt,
      negative_prompt,
      width,
      height,
      num_outputs: 1,
      guidance_scale: 7.5,
      num_inference_steps: 25,
      scheduler: 'DPMSolverMultistep'
    });

    // LensGo may return a task ID that requires polling
    if (response.data?.task_id) {
      return this.pollTask(response.data.task_id);
    }

    const url = response.data?.output?.[0] || response.data?.url;
    if (!url) throw new Error('LensGo AI: no image URL in response');

    return {
      url,
      metadata: {
        provider: this.name,
        task_id: response.data?.task_id
      }
    };
  }

  /**
   * Poll LensGo for async task completion
   * @param {string} taskId
   * @returns {Promise<{url: string, metadata: object}>}
   */
  async pollTask(taskId, maxAttempts = 15) {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await delay(4000);
      logger.debug(`LensGo AI: polling task ${taskId}, attempt ${attempt}`);

      const response = await this.client.get(`/tasks/${taskId}`);
      const status = response.data?.status;

      if (status === 'completed' || status === 'success') {
        const url = response.data?.output?.[0] || response.data?.result?.url;
        if (!url) throw new Error('LensGo AI: task completed but no URL found');
        return { url, metadata: { provider: this.name, task_id: taskId } };
      }

      if (status === 'failed') {
        throw new Error(`LensGo AI: task ${taskId} failed`);
      }
    }

    throw new Error(`LensGo AI: task ${taskId} timed out`);
  }
}

module.exports = LensGoProvider;
