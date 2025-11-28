import { request } from 'undici';
import { getApiToken } from '../config/index.js';
import { API_ENDPOINTS } from '../config/constants.js';
import type { ApiResponse, ApiError } from '../types/index.js';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
  stream?: boolean;
}

class ApiClient {
  private getHeaders(additionalHeaders?: Record<string, string>): Record<string, string> {
    const token = getApiToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...additionalHeaders,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  async request<T>(
    url: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { method = 'GET', body, headers: additionalHeaders, stream = false } = options;
    
    try {
      const response = await request(url, {
        method,
        headers: this.getHeaders(additionalHeaders),
        body: body ? JSON.stringify(body) : undefined,
      });

      if (stream) {
        return { data: response.body as unknown as T };
      }

      const data = await response.body.json() as T | ApiError;
      
      if (response.statusCode >= 400) {
        return { error: data as ApiError };
      }
      
      return { data: data as T };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { error: { error: message, status: 500 } };
    }
  }

  async get<T>(url: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(url, { method: 'GET', headers });
  }

  async post<T>(
    url: string,
    body?: Record<string, unknown>,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, { method: 'POST', body, headers });
  }

  async patch<T>(
    url: string,
    body?: Record<string, unknown>,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, { method: 'PATCH', body, headers });
  }

  async delete<T>(url: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(url, { method: 'DELETE', headers });
  }

  async stream(
    url: string,
    body: Record<string, unknown>,
    onChunk: (chunk: string) => void,
    onDone: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      const response = await request(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ ...body, stream: true }),
      });

      if (response.statusCode >= 400) {
        const errorData = await response.body.json() as ApiError;
        onError(new Error(errorData.error || 'Request failed'));
        return;
      }

      let buffer = '';
      
      for await (const chunk of response.body) {
        buffer += chunk.toString();
        
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(':')) continue;
          if (!trimmed.startsWith('data: ')) continue;
          
          const data = trimmed.slice(6);
          if (data === '[DONE]') {
            onDone();
            return;
          }
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              onChunk(content);
            }
          } catch {
            // Partial JSON, will be completed in next chunk
          }
        }
      }
      
      onDone();
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Stream failed'));
    }
  }

  // Convenience methods for specific endpoints
  get endpoints() {
    return API_ENDPOINTS;
  }
}

export const api = new ApiClient();

// Helper to check if authenticated
export function requireAuth(): boolean {
  const token = getApiToken();
  if (!token) {
    console.error('Not authenticated. Run `aleph auth login` first.');
    return false;
  }
  return true;
}
