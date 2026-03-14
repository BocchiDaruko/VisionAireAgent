const logger = require('../utils/logger');

class ResultEvaluator {
  constructor(deepseek) {
    this.deepseek = deepseek;
  }

  /**
   * Rank generated images by relevance to the original prompt
   * @param {object[]} images
   * @param {string} originalPrompt
   * @returns {object[]} ranked images
   */
  async rank(images, originalPrompt) {
    if (!images || images.length <= 1) return images;

    try {
      const candidates = images
        .map((img, i) => `${i + 1}. Provider: ${img.provider}, URL: ${img.url}`)
        .join('\n');

      const systemPrompt = `You are an image quality evaluator for the VisionAire system.
Given a list of image generation results from different providers and the original prompt,
rank them by expected quality and prompt adherence.
Respond ONLY with a JSON array of indices in ranked order (best first), like: [2, 1, 3]`;

      const response = await this.deepseek.chat([
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Original prompt: "${originalPrompt}"\n\nCandidates:\n${candidates}`
        }
      ]);

      const cleaned = response.replace(/```json|```/g, '').trim();
      const ranking = JSON.parse(cleaned);

      const ranked = ranking
        .map((rank) => images[rank - 1])
        .filter(Boolean);

      // Append any images that weren't in the ranking
      const rankedIndices = new Set(ranking.map((r) => r - 1));
      images.forEach((img, i) => {
        if (!rankedIndices.has(i)) ranked.push(img);
      });

      logger.info('Images ranked by DeepSeek evaluator', { order: ranking });
      return ranked;
    } catch (err) {
      logger.warn('Result evaluation failed, returning original order', {
        error: err.message
      });
      return images;
    }
  }
}

module.exports = ResultEvaluator;
