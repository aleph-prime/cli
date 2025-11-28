import chalk from 'chalk';

export const VERSION = '1.0.0';

export const BANNER = `${chalk.cyan('ℵ')} ${chalk.bold('Aleph CLI')} ${chalk.dim(`v${VERSION}`)}
${chalk.dim('Prime-Resonant Neuro-Symbolic Architecture')}`;

// API Configuration
export const API_BASE_URL = 'https://wrochovhpqrxiypqamcv.supabase.co/functions/v1';

export const API_ENDPOINTS = {
  chat: `${API_BASE_URL}/api-chat`,
  agents: `${API_BASE_URL}/api-agents`,
  memory: `${API_BASE_URL}/api-memory`,
  conversations: `${API_BASE_URL}/api-conversations`,
  usage: `${API_BASE_URL}/api-usage`,
  sria: `${API_BASE_URL}/api-sria`,
  tokens: `${API_BASE_URL}/api-tokens`,
} as const;

// Default configuration values
export const DEFAULTS = {
  model: 'google/gemini-2.5-flash',
  maxTokens: 4096,
  temperature: 0.7,
  streamEnabled: true,
} as const;

// Prime ontology (108 system)
export const PRIME_ONTOLOGY = {
  2: { name: 'Duality', description: 'Existence, Binary logic, Polarity' },
  3: { name: 'Structure', description: 'Space, Interaction, Triads' },
  5: { name: 'Change', description: 'Time, Dynamics, Growth' },
  7: { name: 'Identity', description: 'Self-reference, Recursion, Individuation' },
  11: { name: 'Complexity', description: 'Emergence, Systems, Networks' },
  13: { name: 'Entropy', description: 'Chaos, Probability, Uncertainty' },
  17: { name: 'Harmony', description: 'Balance, Resonance, Synchrony' },
  19: { name: 'Boundary', description: 'Limits, Containers, Definitions' },
  23: { name: 'Transformation', description: 'Metamorphosis, Evolution, Phase shifts' },
  29: { name: 'Connection', description: 'Links, Bridges, Relationships' },
  31: { name: 'Reflection', description: 'Mirror, Self-awareness, Meta-cognition' },
  37: { name: 'Creation', description: 'Genesis, Innovation, Origination' },
} as const;

// Status indicators
export const STATUS = {
  success: chalk.green('✓'),
  error: chalk.red('✗'),
  warning: chalk.yellow('⚠'),
  info: chalk.blue('ℹ'),
  pending: chalk.dim('○'),
  running: chalk.cyan('◉'),
} as const;
