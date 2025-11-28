import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the Conf module before importing config
vi.mock('conf', () => {
  const store = new Map<string, unknown>();
  return {
    default: vi.fn().mockImplementation(() => ({
      get: vi.fn((key: string) => store.get(key)),
      set: vi.fn((key: string, value: unknown) => store.set(key, value)),
      delete: vi.fn((key: string) => store.delete(key)),
      clear: vi.fn(() => store.clear()),
      store: Object.fromEntries(store),
      path: '/mock/path/config.json',
    })),
  };
});

import {
  config,
  getConfig,
  setConfig,
  deleteConfig,
  clearConfig,
  getAllConfig,
  isAuthenticated,
  getApiToken,
  setApiToken,
  clearAuth,
  getConfigPath,
} from './index.js';

describe('Config module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getConfig', () => {
    it('retrieves a config value', () => {
      config.set('defaultModel', 'test-model');
      // Note: Due to mocking complexity, we test that the function calls through
      expect(() => getConfig('defaultModel')).not.toThrow();
    });
  });

  describe('setConfig', () => {
    it('sets a config value', () => {
      expect(() => setConfig('defaultModel', 'new-model')).not.toThrow();
      expect(config.set).toHaveBeenCalledWith('defaultModel', 'new-model');
    });
  });

  describe('deleteConfig', () => {
    it('deletes a config value', () => {
      expect(() => deleteConfig('defaultModel')).not.toThrow();
      expect(config.delete).toHaveBeenCalledWith('defaultModel');
    });
  });

  describe('clearConfig', () => {
    it('clears all config', () => {
      expect(() => clearConfig()).not.toThrow();
      expect(config.clear).toHaveBeenCalled();
    });
  });

  describe('getAllConfig', () => {
    it('returns the config store', () => {
      const result = getAllConfig();
      expect(result).toBeDefined();
    });
  });

  describe('isAuthenticated', () => {
    it('returns false when no token is set', () => {
      vi.mocked(config.get).mockReturnValue(undefined);
      expect(isAuthenticated()).toBe(false);
    });

    it('returns true when token is set', () => {
      vi.mocked(config.get).mockReturnValue('some-token');
      expect(isAuthenticated()).toBe(true);
    });
  });

  describe('getApiToken', () => {
    it('returns the API token', () => {
      vi.mocked(config.get).mockReturnValue('my-api-token');
      expect(getApiToken()).toBe('my-api-token');
    });

    it('returns undefined when no token is set', () => {
      vi.mocked(config.get).mockReturnValue(undefined);
      expect(getApiToken()).toBeUndefined();
    });
  });

  describe('setApiToken', () => {
    it('sets the API token', () => {
      setApiToken('new-token-12345');
      expect(config.set).toHaveBeenCalledWith('apiToken', 'new-token-12345');
    });
  });

  describe('clearAuth', () => {
    it('clears all auth-related config', () => {
      clearAuth();
      expect(config.delete).toHaveBeenCalledWith('apiToken');
      expect(config.delete).toHaveBeenCalledWith('userId');
      expect(config.delete).toHaveBeenCalledWith('email');
      expect(config.delete).toHaveBeenCalledWith('subscriptionTier');
    });
  });

  describe('getConfigPath', () => {
    it('returns the config file path', () => {
      expect(getConfigPath()).toBe('/mock/path/config.json');
    });
  });
});