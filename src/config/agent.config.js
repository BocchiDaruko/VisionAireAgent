module.exports = {
  // Maximum number of retries per provider before giving up
  maxRetries: parseInt(process.env.AGENT_MAX_RETRIES || '3'),

  // Timeout in milliseconds for each provider request
  timeoutMs: parseInt(process.env.AGENT_TIMEOUT_MS || '60000'),

  // Maximum number of concurrent provider requests
  concurrency: parseInt(process.env.AGENT_CONCURRENCY || '3'),

  // Default output directory for downloaded images
  outputDir: process.env.AGENT_OUTPUT_DIR || './output',

  // Logging level: error | warn | info | debug
  logLevel: process.env.AGENT_LOG_LEVEL || 'info',

  // Whether to rank results using DeepSeek after generation
  enableResultRanking: true,

  // Whether to optimize prompts using DeepSeek before generation
  enablePromptOptimization: true,

  // Default image dimensions
  defaultWidth: 1024,
  defaultHeight: 1024
};
