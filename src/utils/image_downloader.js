const axios = require('axios');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

class ImageDownloader {
  constructor() {
    this.outputDir = process.env.AGENT_OUTPUT_DIR || './output';
    this.ensureOutputDir();
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Download an image from a URL and save it locally
   * @param {string} url
   * @param {string} providerName
   * @returns {string} local file path
   */
  async download(url, providerName) {
    if (!url) {
      logger.warn('ImageDownloader: no URL provided, skipping download');
      return null;
    }

    const timestamp = Date.now();
    const filename = `${providerName}_${timestamp}.png`;
    const filePath = path.join(this.outputDir, filename);

    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000
      });

      fs.writeFileSync(filePath, response.data);
      logger.info('Image saved', { path: filePath, provider: providerName });
      return filePath;
    } catch (err) {
      logger.warn('ImageDownloader: failed to download image', {
        url,
        error: err.message
      });
      return null;
    }
  }

  /**
   * Download multiple images in parallel
   * @param {Array<{url: string, provider: string}>} images
   * @returns {string[]} local file paths
   */
  async downloadAll(images) {
    return Promise.all(images.map((img) => this.download(img.url, img.provider)));
  }
}

module.exports = ImageDownloader;
