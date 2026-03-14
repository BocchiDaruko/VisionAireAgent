# VisionAire - Usage Examples

---

## Basic Generation

Generate one image automatically using DeepSeek to pick the best provider:

```javascript
const VisionAire = require('./src/agents/orchestrator');
require('dotenv').config();

const agent = new VisionAire();

const result = await agent.generate({
  prompt: 'A futuristic city at sunset with neon reflections on wet streets',
  providers: ['auto'],
  count: 1
});

console.log(result.images[0].url);
console.log(result.images[0].local_path);
```

---

## Generate with a Specific Provider

Force generation through Leonardo AI regardless of prompt content:

```javascript
const result = await agent.generate({
  prompt: 'A professional headshot of a woman with soft studio lighting',
  providers: ['leonardo'],
  count: 1,
  width: 1024,
  height: 1024
});
```

---

## Multi-Provider Comparison

Generate the same prompt across multiple providers and get results ranked by DeepSeek:

```javascript
const result = await agent.generate({
  prompt: 'An enchanted forest with glowing mushrooms and fairies',
  style: 'fantasy',
  providers: ['seaart', 'playground', 'leonardo'],
  count: 3
});

result.images.forEach((img) => {
  console.log(`Provider: ${img.provider}`);
  console.log(`URL: ${img.url}`);
  console.log(`Saved: ${img.local_path}`);
});
```

---

## Auto Selection with Count

Request 3 images and let DeepSeek distribute across the best providers:

```javascript
const result = await agent.generate({
  prompt: 'Abstract geometric art with metallic textures',
  style: 'abstract',
  providers: ['auto'],
  count: 3
});

console.log('Providers used:', result.providers_used);
console.log('Original prompt:', result.prompt);
console.log('Optimized prompt:', result.optimized_prompt);
```

---

## Disable Prompt Optimization

Skip DeepSeek prompt enhancement and use the raw prompt directly:

```javascript
const VisionAire = require('./src/agents/orchestrator');

const agent = new VisionAire({
  enablePromptOptimization: false
});

const result = await agent.generate({
  prompt: 'cat sitting on a window sill',
  providers: ['playground']
});
```

---

## Anime Style Generation via SeaArt

```javascript
const result = await agent.generate({
  prompt: 'A samurai standing in cherry blossom rain, dramatic pose, ink wash style',
  style: 'anime',
  providers: ['seaart'],
  count: 1,
  width: 768,
  height: 1024
});
```

---

## Logo and Brand Asset via Krea AI

```javascript
const result = await agent.generate({
  prompt: 'Minimalist geometric logo for a tech startup, dark background, electric blue accent',
  style: 'design',
  providers: ['krea'],
  count: 1,
  width: 1024,
  height: 1024
});
```

---

## Landscape via LensGo AI

```javascript
const result = await agent.generate({
  prompt: 'Aerial view of a volcanic island at dawn, dramatic clouds, turquoise ocean',
  providers: ['lensgo'],
  count: 1,
  width: 1280,
  height: 720
});
```

---

## Handling Errors

VisionAire throws if all providers fail. Wrap in try/catch for production use:

```javascript
try {
  const result = await agent.generate({
    prompt: 'Abstract composition',
    providers: ['auto'],
    count: 2
  });

  return result.images;
} catch (err) {
  console.error('Generation failed:', err.message);
  // Implement your fallback logic here
}
```
