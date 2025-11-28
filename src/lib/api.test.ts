import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api, requireAuth } from './api.js';

// Mock the undici module
vi.mock('undici', () => ({
  request: vi.fn(),
}));

// Mock the config module
vi.mock('../config/index.js', () => ({
  getApiToken: vi.fn(() => 'test-token-12345'),
}));

import { request } from 'undici';
import { getApiToken } from '../config/index.js';

describe('ApiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('endpoints', () => {
    it('exposes API endpoints', () => {
      expect(api.endpoints).toBeDefined();
      expect(api.endpoints.chat).toContain('/api-chat');
      expect(api.endpoints.agents).toContain('/api-agents');
      expect(api.endpoints.memory).toContain('/api-memory');
    });
  });

  describe('get', () => {
    it('makes GET request with auth header', async () => {
      const mockResponse = {
        statusCode: 200,
        body: {
          json: vi.fn().mockResolvedValue({ data: 'test' }),
        },
      };
      vi.mocked(request).mockResolvedValue(mockResponse as any);

      const result = await api.get<{ data: string }>('https://api.test.com/endpoint');

      expect(request).toHaveBeenCalledWith('https://api.test.com/endpoint', {
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token-12345',
        }),
        body: undefined,
      });
      expect(result.data).toEqual({ data: 'test' });
    });

    it('returns error for failed requests', async () => {
      const mockResponse = {
        statusCode: 401,
        body: {
          json: vi.fn().mockResolvedValue({ error: 'Unauthorized' }),
        },
      };
      vi.mocked(request).mockResolvedValue(mockResponse as any);

      const result = await api.get('https://api.test.com/endpoint');

      expect(result.error).toBeDefined();
      expect(result.error?.error).toBe('Unauthorized');
    });

    it('handles network errors', async () => {
      vi.mocked(request).mockRejectedValue(new Error('Network error'));

      const result = await api.get('https://api.test.com/endpoint');

      expect(result.error).toBeDefined();
      expect(result.error?.error).toBe('Network error');
      expect(result.error?.status).toBe(500);
    });
  });

  describe('post', () => {
    it('makes POST request with body', async () => {
      const mockResponse = {
        statusCode: 200,
        body: {
          json: vi.fn().mockResolvedValue({ success: true }),
        },
      };
      vi.mocked(request).mockResolvedValue(mockResponse as any);

      const result = await api.post<{ success: boolean }>(
        'https://api.test.com/endpoint',
        { key: 'value' }
      );

      expect(request).toHaveBeenCalledWith('https://api.test.com/endpoint', {
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token-12345',
        }),
        body: JSON.stringify({ key: 'value' }),
      });
      expect(result.data).toEqual({ success: true });
    });
  });

  describe('patch', () => {
    it('makes PATCH request', async () => {
      const mockResponse = {
        statusCode: 200,
        body: {
          json: vi.fn().mockResolvedValue({ updated: true }),
        },
      };
      vi.mocked(request).mockResolvedValue(mockResponse as any);

      const result = await api.patch<{ updated: boolean }>(
        'https://api.test.com/endpoint',
        { field: 'new value' }
      );

      expect(request).toHaveBeenCalledWith('https://api.test.com/endpoint', {
        method: 'PATCH',
        headers: expect.any(Object),
        body: JSON.stringify({ field: 'new value' }),
      });
      expect(result.data).toEqual({ updated: true });
    });
  });

  describe('delete', () => {
    it('makes DELETE request', async () => {
      const mockResponse = {
        statusCode: 200,
        body: {
          json: vi.fn().mockResolvedValue({ deleted: true }),
        },
      };
      vi.mocked(request).mockResolvedValue(mockResponse as any);

      const result = await api.delete<{ deleted: boolean }>('https://api.test.com/endpoint/123');

      expect(request).toHaveBeenCalledWith('https://api.test.com/endpoint/123', {
        method: 'DELETE',
        headers: expect.any(Object),
        body: undefined,
      });
      expect(result.data).toEqual({ deleted: true });
    });
  });

  describe('stream', () => {
    it('calls onChunk for each content chunk', async () => {
      const mockChunks = [
        'data: {"choices":[{"delta":{"content":"Hello"}}]}\n',
        'data: {"choices":[{"delta":{"content":" World"}}]}\n',
        'data: [DONE]\n',
      ];

      const mockBody = {
        async *[Symbol.asyncIterator]() {
          for (const chunk of mockChunks) {
            yield Buffer.from(chunk);
          }
        },
        json: vi.fn(),
      };

      const mockResponse = {
        statusCode: 200,
        body: mockBody,
      };
      vi.mocked(request).mockResolvedValue(mockResponse as any);

      const chunks: string[] = [];
      let done = false;

      await api.stream(
        'https://api.test.com/stream',
        { message: 'test' },
        (chunk) => chunks.push(chunk),
        () => { done = true; },
        () => {}
      );

      expect(chunks).toEqual(['Hello', ' World']);
      expect(done).toBe(true);
    });

    it('calls onError for stream errors', async () => {
      const mockResponse = {
        statusCode: 500,
        body: {
          json: vi.fn().mockResolvedValue({ error: 'Server error' }),
        },
      };
      vi.mocked(request).mockResolvedValue(mockResponse as any);

      let errorMsg = '';

      await api.stream(
        'https://api.test.com/stream',
        { message: 'test' },
        () => {},
        () => {},
        (error) => { errorMsg = error.message; }
      );

      expect(errorMsg).toBe('Server error');
    });

    it('handles network failures', async () => {
      vi.mocked(request).mockRejectedValue(new Error('Connection failed'));

      let errorMsg = '';

      await api.stream(
        'https://api.test.com/stream',
        { message: 'test' },
        () => {},
        () => {},
        (error) => { errorMsg = error.message; }
      );

      expect(errorMsg).toBe('Connection failed');
    });
  });
});

describe('requireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns true when token is set', () => {
    vi.mocked(getApiToken).mockReturnValue('valid-token');
    expect(requireAuth()).toBe(true);
  });

  it('returns false and logs error when token is not set', () => {
    vi.mocked(getApiToken).mockReturnValue(undefined);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(requireAuth()).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Not authenticated. Run `aleph auth login` first.'
    );
    
    consoleSpy.mockRestore();
  });
});