module.exports = {
  // Default provider when none is specified and DeepSeek auto-selection fails
  defaultProvider: 'leonardo',

  // All available providers and their capabilities metadata
  providers: {
    nanobanana: {
      name: 'NanoBanana Pro',
      strengths: ['abstract', 'concept art', 'fast generation'],
      supportsNegativePrompt: true,
      async: false,
      maxWidth: 1024,
      maxHeight: 1024
    },
    leonardo: {
      name: 'Leonardo AI',
      strengths: ['photorealistic', 'cinematic', 'portraits', 'environments'],
      supportsNegativePrompt: true,
      async: true,
      maxWidth: 1536,
      maxHeight: 1536
    },
    seaart: {
      name: 'SeaArt AI',
      strengths: ['anime', 'manga', 'illustrated', 'fantasy'],
      supportsNegativePrompt: true,
      async: false,
      maxWidth: 1024,
      maxHeight: 1024
    },
    lensgo: {
      name: 'LensGo AI',
      strengths: ['scene generation', 'environmental', 'video-to-image'],
      supportsNegativePrompt: true,
      async: true,
      maxWidth: 1280,
      maxHeight: 720
    },
    playground: {
      name: 'Playground AI',
      strengths: ['versatile', 'mixed styles', 'product images', 'UI'],
      supportsNegativePrompt: true,
      async: false,
      maxWidth: 1024,
      maxHeight: 1024
    },
    krea: {
      name: 'Krea AI',
      strengths: ['real-time canvas', 'logo', 'design assets', 'typography'],
      supportsNegativePrompt: true,
      async: true,
      maxWidth: 1024,
      maxHeight: 1024
    }
  }
};
