const PromptOptimizer = require('../../src/agents/prompt_optimizer');

jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
}));

describe('PromptOptimizer', () => {
  let optimizer;
  let mockDeepSeek;

  beforeEach(() => {
    mockDeepSeek = {
      chat: jest.fn()
    };
    optimizer = new PromptOptimizer(mockDeepSeek);
  });

  test('enhance() returns optimized prompt from DeepSeek', async () => {
    const enhanced = 'A stunning photorealistic sunset, golden hour, dramatic lighting, 4K';
    mockDeepSeek.chat.mockResolvedValue(enhanced);

    const result = await optimizer.enhance('sunset', 'cinematic');
    expect(result).toBe(enhanced);
    expect(mockDeepSeek.chat).toHaveBeenCalledTimes(1);
  });

  test('enhance() falls back to original prompt on DeepSeek error', async () => {
    mockDeepSeek.chat.mockRejectedValue(new Error('API error'));

    const result = await optimizer.enhance('original prompt', 'auto');
    expect(result).toBe('original prompt');
  });

  test('getNegativePrompt() returns style-specific negatives', () => {
    const cinematic = optimizer.getNegativePrompt('cinematic');
    expect(cinematic).toContain('blurry');

    const anime = optimizer.getNegativePrompt('anime');
    expect(anime).toContain('realistic');

    const unknown = optimizer.getNegativePrompt('unknown_style');
    expect(typeof unknown).toBe('string');
    expect(unknown.length).toBeGreaterThan(0);
  });
});
