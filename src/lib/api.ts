const BASE_URL = 'http://localhost:8000/api';

export const api = {
  get: async (endpoint: string, token?: string) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Token ${token}` }),
    };
    const response = await fetch(`${BASE_URL}${endpoint}`, { headers });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  post: async (endpoint: string, body: any, token?: string) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Token ${token}` }),
    };
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  put: async (endpoint: string, body: any, token?: string) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Token ${token}` }),
    };
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  patch: async (endpoint: string, body: any, token?: string) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Token ${token}` }),
    };
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },

  delete: async (endpoint: string, token?: string) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Token ${token}` }),
    };
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json(); // or just return true
  },
};
