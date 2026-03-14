const logger = require('../utils/logger');

class PromptOptimizer {
  constructor(deepseek) {
    this.deepseek = deepseek;
  }

  /**
   * Enhance a user prompt using DeepSeek's reasoning
   * @param {string} prompt
   * @param {string} style
   * @returns {string} optimized prompt
   */
  async enhance(prompt, style = 'auto') {
    const systemPrompt = `You are an expert AI image prompt engineer.
Your job is to transform a simple user prompt into a rich, detailed image generation prompt.

Guidelines:
- Add specific visual details: lighting, composition, mood, camera angle
- Include technical quality terms: 4K, sharp focus, professional photography
- Preserve the user's original intent exactly
- Add style-specific keywords if a style is specified
- Keep the prompt under 300 words
- Respond ONLY with the improved prompt. No explanation, no quotes, no preamble.`;

    const userMessage = `Original prompt: "${prompt}"\nStyle: "${style}"`;

    try {
      const enhanced = await this.deepseek.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ]);

      return enhanced.trim();
    } catch (err) {
      logger.warn('Prompt optimization failed, using original prompt', {
        error: err.message
      });
      return prompt;
    }
  }

  /**
   * Generate style-specific negative prompts
   * @param {string} style
   * @returns {string}
   */
  getNegativePrompt(style) {
    const negativeMap = {
      cinematic: 'blurry, low quality, watermark, text, logo, overexposed, flat lighting',
      anime: 'realistic, photo, 3d render, ugly, extra limbs, bad anatomy',
      photorealistic: 'cartoon, anime, illustration, painting, blurry, watermark',
      abstract: 'realistic, photo, boring, simple, plain',
      auto: 'blurry, low quality, watermark, text, ugly, deformed'
    };

    return negativeMap[style] || negativeMap.auto;
  }
}

module.exports = PromptOptimizer;
