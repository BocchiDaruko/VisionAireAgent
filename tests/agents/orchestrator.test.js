const VisionAireOrchestrator = require('../../src/agents/orchestrator');

// Mock all providers
jest.mock('../../src/providers/deepseek');
jest.mock('../../src/providers/nanobanana');
jest.mock('../../src/providers/leonardo');
jest.mock('../../src/providers/seaart');
jest.mock('../../src/providers/lensgo');
jest.mock('../../src/providers/playground');
jest.mock('../../src/providers/krea');
jest.mock('../../src/utils/image_downloader');
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
}));

const DeepSeekProvider = require('../../src/providers/deepseek');

describe('VisionAireOrchestrator', () => {
  let agent;

  beforeEach(() => {
    jest.clearAllMocks();

    DeepSeekProvider.mockImplementation(() => ({
      chat: jest.fn().mockResolvedValue('["nanobanana"]')
    }));

    agent = new VisionAireOrchestrator();

    // Mock prompt optimizer and result evaluator
    agent.promptOptimizer = {
      enhance: jest.fn().mockResolvedValue('Enhanced: a beautiful landscape')
    };
    agent.resultEvaluator = {
      rank: jest.fn().mockImplementation((images) => images)
    };
    agent.downloader = {
      download: jest.fn().mockResolvedValue('./output/test.png')
    };
  });

  test('generate() returns images array on success', async () => {
    // Mock nanobanana provider
    agent.getProvider = jest.fn().mockReturnValue({
      generate: jest.fn().mockResolvedValue({
        url: 'https://example.com/image.png',
        metadata: { provider: 'nanobanana' }
      })
    });

    const result = await agent.generate({
      prompt: 'A beautiful landscape',
      providers: ['nanobanana'],
      count: 1
    });

    expect(result).toHaveProperty('images');
    expect(result.images.length).toBeGreaterThan(0);
    expect(result).toHaveProperty('optimized_prompt');
  });

  test('generate() uses auto provider selection when providers is ["auto"]', async () => {
    agent.selectProviders = jest.fn().mockResolvedValue(['nanobanana']);
    agent.getProvider = jest.fn().mockReturnValue({
      generate: jest.fn().mockResolvedValue({
        url: 'https://example.com/image.png',
        metadata: {}
      })
    });

    await agent.generate({ prompt: 'test', providers: ['auto'], count: 1 });

    expect(agent.selectProviders).toHaveBeenCalled();
  });

  test('generate() throws when all providers fail', async () => {
    agent.getProvider = jest.fn().mockReturnValue({
      generate: jest.fn().mockRejectedValue(new Error('Provider failed'))
    });

    await expect(
      agent.generate({ prompt: 'test', providers: ['nanobanana'], count: 1 })
    ).rejects.toThrow('All providers failed');
  });

  test('selectProviders() falls back to default on DeepSeek parse error', async () => {
    agent.deepseek.chat = jest.fn().mockResolvedValue('not valid json');

    const selected = await agent.selectProviders('test prompt', 'auto', 1);
    expect(Array.isArray(selected)).toBe(true);
    expect(selected.length).toBeGreaterThan(0);
  });
});
