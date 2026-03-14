const axios = require('axios');
const logger = require('../utils/logger');

class DeepSeekProvider {
  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY;
    this.baseURL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1';
    this.model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';

    if (!this.apiKey) {
      throw new Error('DeepSeek: DEEPSEEK_API_KEY is required');
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: parseInt(process.env.AGENT_TIMEOUT_MS || '60000')
    });
  }

  /**
   * Send a chat completion request to DeepSeek
   * @param {Array<{role: string, content: string}>} messages
   * @param {object} options
   * @returns {string} assistant response text
   */
  async chat(messages, options = {}) {
    logger.debug('DeepSeek chat request', {
      model: this.model,
      messages_count: messages.length
    });

    const response = await this.client.post('/chat/completions', {
      model: this.model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 1024,
      ...options
    });

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('DeepSeek returned an empty response');
    }

    return content;
  }

  /**
   * Analyze an image URL and return a description (if DeepSeek supports vision)
   * @param {string} imageUrl
   * @param {string} question
   * @returns {string}
   */
  async analyzeImage(imageUrl, question = 'Describe this image in detail') {
    const messages = [
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: imageUrl } },
          { type: 'text', text: question }
        ]
      }
    ];

    return this.chat(messages, { model: 'deepseek-vision' });
  }
}

module.exports = DeepSeekProvider;
