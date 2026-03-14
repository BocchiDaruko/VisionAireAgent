# VisionAire Agent

VisionAire is an autonomous AI image generation agent that orchestrates multiple AI platforms through a unified interface. It uses DeepSeek as the reasoning brain to intelligently route, refine, and generate prompts across seven specialized image generation providers.

---

## Supported Providers

| Provider | Strength | API Required |
|---|---|---|
| DeepSeek | Prompt reasoning and orchestration | Yes |
| NanoBanana Pro | Fast creative generation | Yes |
| Leonardo AI | Photorealistic and artistic outputs | Yes |
| SeaArt AI | Anime and stylized art | Yes |
| LensGo AI | Video-to-image and scene generation | Yes |
| Playground AI | Versatile mixed styles | Yes |
| Krea AI | Real-time AI canvas generation | Yes |

---

## Architecture

```
User Input
    |
    v
DeepSeek Reasoning Engine
    |
    +-- Prompt Optimization
    +-- Provider Selection
    +-- Style Analysis
    |
    v
Provider Router
    |
    +-- NanoBanana Pro
    +-- Leonardo AI
    +-- SeaArt AI
    +-- LensGo AI
    +-- Playground AI
    +-- Krea AI
    |
    v
Result Aggregator
    |
    v
Output Handler
```

---

## Project Structure

```
visionaire-agent/
├── src/
│   ├── agents/
│   │   ├── orchestrator.js        # Main agent brain (DeepSeek-powered)
│   │   ├── prompt_optimizer.js    # Prompt enhancement logic
│   │   └── result_evaluator.js    # Ranks and filters results
│   ├── providers/
│   │   ├── base_provider.js       # Abstract provider interface
│   │   ├── deepseek.js            # DeepSeek reasoning client
│   │   ├── nanobanana.js          # NanoBanana Pro client
│   │   ├── leonardo.js            # Leonardo AI client
│   │   ├── seaart.js              # SeaArt AI client
│   │   ├── lensgo.js              # LensGo AI client
│   │   ├── playground.js          # Playground AI client
│   │   └── krea.js                # Krea AI client
│   ├── utils/
│   │   ├── logger.js              # Structured logging
│   │   ├── retry.js               # Retry logic with backoff
│   │   ├── rate_limiter.js        # Per-provider rate limiting
│   │   └── image_downloader.js   # Download and cache results
│   └── config/
│       ├── providers.config.js    # Provider configuration
│       └── agent.config.js        # Agent behavior settings
├── tests/
│   ├── agents/
│   ├── providers/
│   └── utils/
├── docs/
│   ├── PROVIDERS.md               # Provider-specific documentation
│   ├── CONFIGURATION.md           # Configuration reference
│   └── EXAMPLES.md                # Usage examples
├── .env.example
├── .gitignore
├── package.json
└── index.js
```

---

## Installation

```bash
git clone https://github.com/yourusername/visionaire-agent.git
cd visionaire-agent
npm install
cp .env.example .env
```

Edit `.env` with your API keys, then run:

```bash
node index.js
```

---

## Quick Start

```javascript
const VisionAire = require('./src/agents/orchestrator');

const agent = new VisionAire();

const result = await agent.generate({
  prompt: "A futuristic city at sunset with neon reflections on wet streets",
  style: "cinematic",
  providers: ["auto"],   // let DeepSeek choose the best provider
  count: 3
});

console.log(result.images);
```

---

## Environment Variables

See `.env.example` for the full list of required and optional keys.

---

## License

MIT
