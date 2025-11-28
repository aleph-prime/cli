import Conf from 'conf';
import { DEFAULTS } from './constants.js';

interface AlephConfig {
  apiToken?: string;
  apiUrl?: string;
  defaultModel?: string;
  streamEnabled?: boolean;
  userId?: string;
  email?: string;
  subscriptionTier?: string;
  theme?: 'dark' | 'light' | 'auto';
  historyEnabled?: boolean;
  maxHistoryItems?: number;
}

const schema = {
  apiToken: { type: 'string' as const },
  apiUrl: { type: 'string' as const },
  defaultModel: { type: 'string' as const, default: DEFAULTS.model },
  streamEnabled: { type: 'boolean' as const, default: DEFAULTS.streamEnabled },
  userId: { type: 'string' as const },
  email: { type: 'string' as const },
  subscriptionTier: { type: 'string' as const, default: 'free' },
  theme: { type: 'string' as const, default: 'auto' },
  historyEnabled: { type: 'boolean' as const, default: true },
  maxHistoryItems: { type: 'number' as const, default: 100 },
};

export const config = new Conf<AlephConfig>({
  projectName: 'aleph-cli',
  schema,
  defaults: {
    defaultModel: DEFAULTS.model,
    streamEnabled: DEFAULTS.streamEnabled,
    theme: 'auto',
    historyEnabled: true,
    maxHistoryItems: 100,
  },
});

export function getConfig<K extends keyof AlephConfig>(key: K): AlephConfig[K] {
  return config.get(key);
}

export function setConfig<K extends keyof AlephConfig>(key: K, value: AlephConfig[K]): void {
  config.set(key, value);
}

export function deleteConfig(key: keyof AlephConfig): void {
  config.delete(key);
}

export function clearConfig(): void {
  config.clear();
}

export function getAllConfig(): AlephConfig {
  return config.store;
}

export function isAuthenticated(): boolean {
  return !!config.get('apiToken');
}

export function getApiToken(): string | undefined {
  return config.get('apiToken');
}

export function setApiToken(token: string): void {
  config.set('apiToken', token);
}

export function clearAuth(): void {
  config.delete('apiToken');
  config.delete('userId');
  config.delete('email');
  config.delete('subscriptionTier');
}

// Export the config file path for debugging
export function getConfigPath(): string {
  return config.path;
}
