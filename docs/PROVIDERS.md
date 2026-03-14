# VisionAire - Provider Reference

This document describes each integrated image generation provider, their strengths, configuration, and API requirements.

---

## DeepSeek

**Role**: Reasoning engine (not an image generator)

DeepSeek powers three core functions inside VisionAire:
- Prompt optimization: transforms simple user prompts into rich, detailed generation prompts
- Provider routing: selects the best provider(s) based on the prompt content and requested style
- Result ranking: evaluates multiple generated images and orders them by relevance

**Environment Variables**

| Variable | Required | Default |
|---|---|---|
| DEEPSEEK_API_KEY | Yes | - |
| DEEPSEEK_MODEL | No | deepseek-chat |
| DEEPSEEK_BASE_URL | No | https://api.deepseek.com/v1 |

**API Reference**: https://platform.deepseek.com/docs

---

## NanoBanana Pro

**Strengths**: Fast creative outputs, abstract and concept art, experimental styles

NanoBanana Pro is used when fast generation speed is the priority or when the prompt leans toward experimental and abstract aesthetics.

**Environment Variables**

| Variable | Required | Default |
|---|---|---|
| NANOBANANA_API_KEY | Yes | - |
| NANOBANANA_BASE_URL | No | https://api.nanobanana.ai/v1 |

**Generation mode**: Synchronous (result returned immediately)

---

## Leonardo AI

**Strengths**: Photorealistic renders, cinematic lighting, portrait photography, architectural environments

Leonardo AI is the top choice for photorealistic and high-fidelity outputs. It uses an asynchronous generation model that requires polling for results.

**Environment Variables**

| Variable | Required | Default |
|---|---|---|
| LEONARDO_API_KEY | Yes | - |
| LEONARDO_BASE_URL | No | https://cloud.leonardo.ai/api/rest/v1 |
| LEONARDO_DEFAULT_MODEL | No | 6bef9f1b-29cb-40c7-b9df-32b51c1f67d3 |

**Generation mode**: Asynchronous (polls every 3 seconds, up to 20 attempts)

**API Reference**: https://docs.leonardo.ai

---

## SeaArt AI

**Strengths**: Anime, manga, illustrated fantasy art, character design

SeaArt AI excels at illustrated and stylized outputs. Ideal for prompts that reference Japanese art styles, fantasy characters, or illustrated environments.

**Environment Variables**

| Variable | Required | Default |
|---|---|---|
| SEAART_API_KEY | Yes | - |
| SEAART_BASE_URL | No | https://api.seaart.ai/v1 |

**Generation mode**: Synchronous

**API Reference**: https://www.seaart.ai/api-docs

---

## LensGo AI

**Strengths**: Environmental scene generation, landscape photography, video-to-image conversion

LensGo AI is well suited for wide scenes, outdoor environments, and photographic landscape prompts.

**Environment Variables**

| Variable | Required | Default |
|---|---|---|
| LENSGO_API_KEY | Yes | - |
| LENSGO_BASE_URL | No | https://api.lensgo.ai/v1 |

**Generation mode**: Asynchronous (polls every 4 seconds, up to 15 attempts)

**API Reference**: https://lensgo.ai/api

---

## Playground AI

**Strengths**: Versatile style support, product imagery, UI/UX mockups, mixed creative styles

Playground AI is the most versatile provider and can handle a wide range of prompt types including product renders, marketing imagery, and concept designs.

**Environment Variables**

| Variable | Required | Default |
|---|---|---|
| PLAYGROUND_API_KEY | Yes | - |
| PLAYGROUND_BASE_URL | No | https://api.playground.com/v1 |

**Generation mode**: Synchronous

**API Reference**: https://playground.com/docs/api

---

## Krea AI

**Strengths**: Real-time canvas generation, logo design, typography, branding assets

Krea AI is optimized for design-forward tasks such as logo creation, poster design, and assets that require clean typography and geometric precision.

**Environment Variables**

| Variable | Required | Default |
|---|---|---|
| KREA_API_KEY | Yes | - |
| KREA_BASE_URL | No | https://api.krea.ai/v1 |

**Generation mode**: Asynchronous (polls every 3 seconds, up to 15 attempts)

**API Reference**: https://krea.ai/docs

---

## Provider Selection Logic

When `providers: ["auto"]` is passed, VisionAire uses DeepSeek to analyze the prompt and map it to the most suitable provider(s) based on content signals:

| Prompt signal | Likely provider selected |
|---|---|
| "portrait", "person", "photorealistic" | leonardo |
| "anime", "manga", "fantasy character" | seaart |
| "landscape", "environment", "scene" | lensgo |
| "logo", "brand", "typography" | krea |
| "product", "UI", "mockup" | playground |
| "abstract", "concept", "fast" | nanobanana |

DeepSeek may select multiple providers when count > 1, distributing the work across the best-matched options.
