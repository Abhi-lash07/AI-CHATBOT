import { storageService } from './storageService';

const ANONYMOUS_ID_KEY = 'chatbot_ai_anonymous_id';

export function getAnonymousSessionId() {
  let anonymousId = localStorage.getItem(ANONYMOUS_ID_KEY);
  if (!anonymousId) {
    anonymousId = crypto.randomUUID();
    localStorage.setItem(ANONYMOUS_ID_KEY, anonymousId);
  }
  return anonymousId;
}

async function request(url, options = {}) {
  const token = storageService.getToken();
  const headers = {
    'Content-Type': 'application/json',
    'X-Anonymous-Id': getAnonymousSessionId(),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Feedback service returned ${response.status}.`);
  }
  return data;
}

export const feedbackApi = {
  submit: (feedback) =>
    request('/api/feedback', {
      method: 'POST',
      body: JSON.stringify(feedback),
    }),
  getMine: () => request('/api/feedback/mine'),
};
