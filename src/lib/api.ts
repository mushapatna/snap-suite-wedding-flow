import type { ApiListResponse } from './api-types';

const BASE_URL = 'http://localhost:8000/api';

interface ApiErrorBody {
  detail?: string;
  error?: string;
  message?: string;
  [key: string]: unknown;
}

export class ApiError extends Error {
  status: number;
  body: unknown;
  displayMessage: string;

  constructor(status: number, body: unknown, fallbackMessage: string) {
    super(fallbackMessage);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
    this.displayMessage = fallbackMessage;
  }
}

const isApiErrorBody = (value: unknown): value is ApiErrorBody => {
  return typeof value === 'object' && value !== null;
};

const getNormalizedMessage = (status: number, body: unknown, fallbackText: string) => {
  if (isApiErrorBody(body)) {
    if (typeof body.detail === 'string' && body.detail.length > 0) {
      return body.detail;
    }

    if (typeof body.error === 'string' && body.error.length > 0) {
      return body.error;
    }

    if (typeof body.message === 'string' && body.message.length > 0) {
      return body.message;
    }
  }

  if (fallbackText.length > 0) {
    return fallbackText;
  }

  return `Request failed with status ${status}`;
};

const parseResponseBody = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

const buildHeaders = (token?: string): HeadersInit => ({
  'Content-Type': 'application/json',
  Accept: 'application/json',
  ...(token ? { Authorization: `Token ${token}` } : {}),
});

const request = async <TResponse, TBody = unknown>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    token?: string;
    body?: TBody;
  } = {}
): Promise<TResponse> => {
  const { method = 'GET', token, body } = options;
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: buildHeaders(token),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const parsedBody = await parseResponseBody(response);

  if (!response.ok) {
    const fallbackText = typeof parsedBody === 'string' ? parsedBody : '';
    const message = getNormalizedMessage(response.status, parsedBody, fallbackText);
    throw new ApiError(response.status, parsedBody, message);
  }

  return parsedBody as TResponse;
};

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof ApiError) {
    return error.displayMessage;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export const normalizeListResponse = <T>(response: ApiListResponse<T>): T[] => {
  return Array.isArray(response) ? response : response.results;
};

export const api = {
  get: <TResponse>(endpoint: string, token?: string) =>
    request<TResponse>(endpoint, { method: 'GET', token }),

  post: <TResponse, TBody = unknown>(endpoint: string, body: TBody, token?: string) =>
    request<TResponse, TBody>(endpoint, { method: 'POST', body, token }),

  put: <TResponse, TBody = unknown>(endpoint: string, body: TBody, token?: string) =>
    request<TResponse, TBody>(endpoint, { method: 'PUT', body, token }),

  patch: <TResponse, TBody = unknown>(endpoint: string, body: TBody, token?: string) =>
    request<TResponse, TBody>(endpoint, { method: 'PATCH', body, token }),

  delete: <TResponse = { detail?: string }>(endpoint: string, token?: string) =>
    request<TResponse>(endpoint, { method: 'DELETE', token }),
};
