# VisionAire - Configuration Reference

All configuration is controlled through environment variables. Copy `.env.example` to `.env` and fill in the values.

---

## Agent Behavior

| Variable | Type | Default | Description |
|---|---|---|---|
| AGENT_DEFAULT_PROVIDER | string | auto | Default provider when none is specified |
| AGENT_MAX_RETRIES | number | 3 | Max retry attempts per provider before failing |
| AGENT_TIMEOUT_MS | number | 60000 | Request timeout in milliseconds |
| AGENT_CONCURRENCY | number | 3 | Max simultaneous provider requests |
| AGENT_OUTPUT_DIR | string | ./output | Directory where downloaded images are saved |
| AGENT_LOG_LEVEL | string | info | Log level: error, warn, info, debug |

---

## Rate Limits

Rate limits are expressed in requests per minute per provider.

| Variable | Default | Provider |
|---|---|---|
| RATE_LIMIT_DEEPSEEK | 60 | DeepSeek |
| RATE_LIMIT_NANOBANANA | 30 | NanoBanana Pro |
| RATE_LIMIT_LEONARDO | 20 | Leonardo AI |
| RATE_LIMIT_SEAART | 30 | SeaArt AI |
| RATE_LIMIT_LENSGO | 20 | LensGo AI |
| RATE_LIMIT_PLAYGROUND | 30 | Playground AI |
| RATE_LIMIT_KREA | 20 | Krea AI |

If a provider is called more frequently than its rate limit allows, VisionAire will automatically wait before sending the next request.

---

## Feature Flags

These features are toggled in `src/config/agent.config.js`:

| Option | Default | Description |
|---|---|---|
| enablePromptOptimization | true | Use DeepSeek to enhance prompts before generation |
| enableResultRanking | true | Use DeepSeek to rank results after generation |

To disable either feature, set the corresponding field to `false` in the config file or pass the option when constructing the orchestrator:

```javascript
const agent = new VisionAireOrchestrator({
  enablePromptOptimization: false,
  enableResultRanking: false
});
```

---

## Image Dimensions

Default image size is 1024x1024. You can override dimensions per request:

```javascript
const result = await agent.generate({
  prompt: 'Wide cinematic landscape',
  width: 1280,
  height: 720
});
```

Note that each provider has its own maximum supported resolution. Values exceeding the provider maximum will be clamped automatically by that provider's API.

---

## Output Directory

Generated images are downloaded and saved to the directory defined by `AGENT_OUTPUT_DIR`. Files are named using the format:

```
{provider}_{timestamp}.png
```

Example: `leonardo_1742123456789.png`

---

## Logging

VisionAire uses Winston for structured logging. Log files are written to:

- `logs/combined.log` - All log levels
- `logs/error.log` - Errors only

The log directory is created automatically on first run.
