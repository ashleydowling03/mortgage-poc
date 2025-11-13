// api.ts - Frontend API service for MongoDB backend

import { SavedScenario, User } from "./types";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// ==================== AUTH FUNCTIONS ====================

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export async function register(email: string, password: string, name: string): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, name }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }

  const data = await response.json();
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  const data = await response.json();
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
}

export function logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function getStoredUser(): User | null {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// ==================== SCENARIO FUNCTIONS ====================

function getAuthHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

export async function getAllScenarios(): Promise<SavedScenario[]> {
  const response = await fetch(`${API_URL}/scenarios`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch scenarios');
  }

  return response.json();
}

export async function getScenarioById(id: string): Promise<SavedScenario> {
  const response = await fetch(`${API_URL}/scenarios/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch scenario');
  }

  return response.json();
}

export async function createScenario(scenario: Omit<SavedScenario, '_id' | 'createdAt' | 'updatedAt'>): Promise<SavedScenario> {
  const response = await fetch(`${API_URL}/scenarios`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(scenario),
  });

  if (!response.ok) {
    throw new Error('Failed to create scenario');
  }

  return response.json();
}

export async function updateScenario(id: string, scenario: Partial<SavedScenario>): Promise<SavedScenario> {
  const response = await fetch(`${API_URL}/scenarios/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(scenario),
  });

  if (!response.ok) {
    throw new Error('Failed to update scenario');
  }

  return response.json();
}

export async function deleteScenario(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/scenarios/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to delete scenario');
  }
}

// Alias for createScenario - used by SaveScenarioModal
export const saveScenario = createScenario;

export async function searchScenarios(query: string): Promise<SavedScenario[]> {
  const response = await fetch(`${API_URL}/scenarios/search/${encodeURIComponent(query)}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to search scenarios');
  }

  return response.json();
}

// ==================== HEALTH CHECK ====================

export async function checkHealth(): Promise<{ status: string; timestamp: string }> {
  const response = await fetch(`${API_URL}/health`);
  return response.json();
}