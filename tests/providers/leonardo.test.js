process.env.LEONARDO_API_KEY = 'test_key';

const LeonardoProvider = require('../../src/providers/leonardo');

jest.mock('axios');
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
}));

const axios = require('axios');

describe('LeonardoProvider', () => {
  let provider;
  let mockPost;
  let mockGet;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPost = jest.fn();
    mockGet = jest.fn();

    axios.create.mockReturnValue({
      post: mockPost,
      get: mockGet
    });

    provider = new LeonardoProvider();
  });

  test('generate() submits a job and polls for result', async () => {
    mockPost.mockResolvedValue({
      data: { sdGenerationJob: { generationId: 'gen-123' } }
    });

    mockGet.mockResolvedValue({
      data: {
        generations_by_pk: {
          status: 'COMPLETE',
          generated_images: [{ url: 'https://cdn.leonardo.ai/image.png' }]
        }
      }
    });

    const result = await provider.generate({ prompt: 'test prompt' });

    expect(result.url).toBe('https://cdn.leonardo.ai/image.png');
    expect(result.metadata.generation_id).toBe('gen-123');
    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  test('generate() throws if no generationId is returned', async () => {
    mockPost.mockResolvedValue({ data: {} });

    await expect(provider.generate({ prompt: 'test' })).rejects.toThrow(
      'Leonardo AI: no generationId returned'
    );
  });

  test('pollForResult() throws if generation fails', async () => {
    mockGet.mockResolvedValue({
      data: {
        generations_by_pk: { status: 'FAILED', generated_images: [] }
      }
    });

    await expect(provider.pollForResult('gen-fail')).rejects.toThrow(
      'Leonardo AI: generation failed'
    );
  });

  test('isConfigured() returns true when API key is set', () => {
    expect(provider.isConfigured()).toBe(true);
  });
});
