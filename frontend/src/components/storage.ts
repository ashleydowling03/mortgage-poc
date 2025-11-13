// storage.ts - LocalStorage management functions

import { SavedScenario, User } from "./types";

const STORAGE_KEY = "loansure_scenarios";
const USER_KEY = "loansure_user";

// Scenario Management
export function saveScenario(scenario: SavedScenario): void {
  const scenarios = getSavedScenarios();
  const index = scenarios.findIndex(s => s.id === scenario.id);
  
  if (index >= 0) {
    scenarios[index] = scenario;
  } else {
    scenarios.push(scenario);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
}

export function getSavedScenarios(): SavedScenario[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function getScenarioById(id: string): SavedScenario | null {
  const scenarios = getSavedScenarios();
  return scenarios.find(s => s.id === id) || null;
}

export function deleteScenario(id: string): void {
  const scenarios = getSavedScenarios().filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
}

// User Management
export function saveUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser(): User | null {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
}

export function logout(): void {
  localStorage.removeItem(USER_KEY);
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}