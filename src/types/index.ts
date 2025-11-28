// Chat types
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  id: string;
  choices: Array<{
    message: ChatMessage;
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface StreamDelta {
  choices: Array<{
    delta: {
      content?: string;
      role?: string;
    };
    finish_reason: string | null;
  }>;
}

// Agent types
export interface Agent {
  id: string;
  name: string;
  description: string | null;
  trigger_type: 'manual' | 'schedule' | 'webhook' | 'memory_condition';
  trigger_config: Record<string, unknown>;
  task_config: {
    steps: AgentStep[];
  };
  is_active: boolean;
  run_count: number;
  last_triggered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgentStep {
  name: string;
  type: 'llm' | 'code' | 'webhook' | 'condition';
  config: Record<string, unknown>;
}

export interface AgentRun {
  id: string;
  agent_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  current_step: number;
  total_steps: number;
  triggered_by: string;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  input_data: Record<string, unknown>;
  output_data: Record<string, unknown>;
  created_at: string;
}

export interface AgentStepResult {
  id: string;
  run_id: string;
  step_name: string;
  step_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  input_data: Record<string, unknown>;
  output_data: Record<string, unknown>;
  error_message: string | null;
  duration_ms: number | null;
}

// Memory field types
export interface MemoryField {
  id: string;
  name: string;
  description: string | null;
  field_type: 'personal' | 'shared' | 'public';
  is_public: boolean;
  entropy_threshold: number;
  consensus_score: number | null;
  is_locked: boolean;
  owner_id: string;
  member_count?: number;
  created_at: string;
  updated_at: string;
}

export interface MemoryContribution {
  id: string;
  field_id: string;
  content: string;
  prime_factors: number[];
  entropy_score: number | null;
  status: 'pending' | 'accepted' | 'rejected';
  reinforcement_count: number;
  semantic_similarity: number;
  created_at: string;
  verified_at: string | null;
}

// Prime resonance types
export interface PrimeFactorization {
  primes: number[];
  factors: Map<number, number>;
  product: number;
  resonanceSignature: string;
}

export interface ResonanceResult {
  similarity: number;
  sharedPrimes: number[];
  uniqueToA: number[];
  uniqueToB: number[];
  interpretation: string;
}

// API response types
export interface ApiError {
  error: string;
  code?: string;
  status?: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

// User/Auth types
export interface UserInfo {
  user_id: string;
  email: string;
  subscription_tier: string;
  credits_remaining: number;
}

export interface TokenValidation {
  valid: boolean;
  user?: UserInfo;
  scopes?: string[];
  expires_at?: string;
}

// Conversation types
export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  prime_factors?: number[];
  is_verified?: boolean;
  lyapunov_status?: string;
  created_at: string;
}
