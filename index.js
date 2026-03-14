require('dotenv').config();

const VisionAireOrchestrator = require('./src/agents/orchestrator');
const logger = require('./src/utils/logger');

async function main() {
  logger.info('VisionAire Agent starting...');

  const agent = new VisionAireOrchestrator();

  // Example: Generate images from a prompt
  const result = await agent.generate({
    prompt: 'A futuristic city at sunset, neon reflections on rain-soaked streets, cinematic depth of field',
    style: 'cinematic',
    providers: ['auto'],
    count: 2,
    width: 1024,
    height: 1024
  });

  logger.info('Generation complete', {
    total: result.images.length,
    providers: result.providers_used
  });

  result.images.forEach((img, i) => {
    logger.info(`Image ${i + 1}`, {
      provider: img.provider,
      url: img.url,
      saved_to: img.local_path
    });
  });
}

main().catch((err) => {
  logger.error('Fatal error', { message: err.message, stack: err.stack });
  process.exit(1);
});
