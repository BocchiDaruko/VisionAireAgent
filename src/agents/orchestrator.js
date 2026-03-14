const DeepSeekProvider = require('../providers/deepseek');
const PromptOptimizer = require('./prompt_optimizer');
const ResultEvaluator = require('./result_evaluator');
const ProviderRouter = require('../utils/rate_limiter');
const logger = require('../utils/logger');
const { retry } = require('../utils/retry');
const ImageDownloader = require('../utils/image_downloader');
const agentConfig = require('../config/agent.config');
const providerConfig = require('../config/providers.config');

// Lazy-load providers to avoid unnecessary instantiation
const PROVIDER_MAP = {
  nanobanana: () => require('../providers/nanobanana'),
  leonardo: () => require('../providers/leonardo'),
  seaart: () => require('../providers/seaart'),
  lensgo: () => require('../providers/lensgo'),
  playground: () => require('../providers/playground'),
  krea: () => require('../providers/krea')
};

class VisionAireOrchestrator {
  constructor(options = {}) {
    this.deepseek = new DeepSeekProvider();
    this.promptOptimizer = new PromptOptimizer(this.deepseek);
    this.resultEvaluator = new ResultEvaluator(this.deepseek);
    this.downloader = new ImageDownloader();
    this.config = { ...agentConfig, ...options };
    this.providers = {};
  }

  /**
   * Load and cache a provider instance by name
   * @param {string} name
   * @returns {BaseProvider}
   */
  getProvider(name) {
    if (!this.providers[name]) {
      const factory = PROVIDER_MAP[name];
      if (!factory) throw new Error(`Unknown provider: ${name}`);
      const Provider = factory();
      this.providers[name] = new Provider();
    }
    return this.providers[name];
  }

  /**
   * Use DeepSeek to select the best provider(s) for a given prompt and style
   * @param {string} prompt
   * @param {string} style
   * @param {number} count
   * @returns {string[]} selected provider names
   */
  async selectProviders(prompt, style, count) {
    logger.info('Asking DeepSeek to select optimal providers', { style, count });

    const systemPrompt = `You are VisionAire's routing engine. 
Your job is to select the best image generation providers for a given prompt and style.

Available providers and their strengths:
- nanobanana: fast creative outputs, good for abstract and concept art
- leonardo: photorealistic, cinematic, high detail portraits and environments
- seaart: anime, manga, illustrated styles, fantasy
- lensgo: scene generation, environmental shots, video-to-image
- playground: versatile, mixed styles, UI and product images
- krea: real-time canvas generation, logo and design assets, typography

Respond ONLY with a JSON array of provider names, ordered by best fit. Example: ["leonardo","playground"]
Select between 1 and ${count} providers. No explanation needed.`;

    const response = await this.deepseek.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Prompt: "${prompt}"\nStyle: "${style}"\nNeeded images: ${count}` }
    ]);

    try {
      const cleaned = response.replace(/```json|```/g, '').trim();
      const selected = JSON.parse(cleaned);
      logger.info('Providers selected by DeepSeek', { selected });
      return selected.slice(0, count);
    } catch {
      logger.warn('DeepSeek provider selection failed, falling back to default provider');
      return [providerConfig.defaultProvider];
    }
  }

  /**
   * Main generation method
   * @param {object} params
   * @param {string} params.prompt
   * @param {string} [params.style]
   * @param {string[]} [params.providers]
   * @param {number} [params.count]
   * @param {number} [params.width]
   * @param {number} [params.height]
   * @returns {object} result with images array
   */
  async generate({
    prompt,
    style = 'auto',
    providers = ['auto'],
    count = 1,
    width = 1024,
    height = 1024
  }) {
    logger.info('VisionAire generation started', { prompt, style, providers, count });

    // Step 1: Optimize the prompt using DeepSeek
    const optimizedPrompt = await this.promptOptimizer.enhance(prompt, style);
    logger.info('Prompt optimized', { original: prompt, optimized: optimizedPrompt });

    // Step 2: Resolve provider list
    let selectedProviders = providers;
    if (providers.includes('auto')) {
      selectedProviders = await this.selectProviders(optimizedPrompt, style, count);
    }

    // Step 3: Generate images concurrently across providers
    const generationTasks = selectedProviders.map((providerName) =>
      retry(
        () => this.generateWithProvider(providerName, optimizedPrompt, { width, height }),
        this.config.maxRetries,
        providerName
      )
    );

    const rawResults = await Promise.allSettled(generationTasks);

    // Step 4: Collect successful results
    const successfulImages = [];
    const providersUsed = [];

    for (let i = 0; i < rawResults.length; i++) {
      const res = rawResults[i];
      const providerName = selectedProviders[i];

      if (res.status === 'fulfilled' && res.value) {
        successfulImages.push({ ...res.value, provider: providerName });
        providersUsed.push(providerName);
      } else {
        logger.warn(`Provider ${providerName} failed`, {
          reason: res.reason?.message || 'Unknown error'
        });
      }
    }

    if (successfulImages.length === 0) {
      throw new Error('All providers failed to generate images');
    }

    // Step 5: Download images locally
    const downloadedImages = await Promise.all(
      successfulImages.map((img) =>
        this.downloader.download(img.url, img.provider).then((local_path) => ({
          ...img,
          local_path
        }))
      )
    );

    // Step 6: Optionally evaluate and rank results
    const evaluatedImages =
      downloadedImages.length > 1
        ? await this.resultEvaluator.rank(downloadedImages, prompt)
        : downloadedImages;

    return {
      prompt,
      optimized_prompt: optimizedPrompt,
      style,
      providers_used: providersUsed,
      images: evaluatedImages
    };
  }

  /**
   * Generate a single image using a specific provider
   * @param {string} providerName
   * @param {string} prompt
   * @param {object} options
   */
  async generateWithProvider(providerName, prompt, options) {
    const provider = this.getProvider(providerName);
    logger.info(`Generating with provider: ${providerName}`);
    return provider.generate({ prompt, ...options });
  }
}

module.exports = VisionAireOrchestrator;
