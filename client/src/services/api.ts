// Default to backend running on localhost:9090 in development.
// Override with VITE_API_BASE_URL when building or running in other environments.
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090/api/authentication';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = 'An error occurred';
    try {
      const body = await response.json();
      message = body.message || body.error || JSON.stringify(body);
    } catch {
      const text = await response.text().catch(() => '');
      if (text) message = text;
    }

    switch (response.status) {
      case 400:
        message = message || 'Invalid request. Please check your input.';
        break;
      case 401:
        message = message || 'Invalid credentials. Please try again.';
        break;
      case 409:
        message = message || 'This account already exists.';
        break;
    }

    throw new ApiError(message, response.status);
  }

  const text = await response.text();
  if (!text) return null as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}

export interface LoginResponse {
  token: string;
  userId?: number;
  email?: string;
  username?: string;
  [key: string]: unknown;
}

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  [key: string]: unknown;
}

export const authApi = {
  register: (data: { username: string; email: string; password: string; confirmPassword: string }) =>
    request('/register', { method: 'POST', body: JSON.stringify(data) }),

  // backend expects { email, otp } on POST /verify-email
  verifyOtp: (email: string, otp: string) =>
    request('/verify-email', { method: 'POST', body: JSON.stringify({ email, otp }) }),

  resendOtp: (data: { email: string }) =>
    request('/resend-otp', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request<LoginResponse>('/login', { method: 'POST', body: JSON.stringify(data) }),

  forgotPassword: (data: { email: string }) =>
    request('/password-reset-request', { method: 'POST', body: JSON.stringify(data) }),

  resetPassword: (data: { otp: string; newPassword: string }) =>
    request('/password-reset', { method: 'POST', body: JSON.stringify(data) }),

  getAllUsers: (token: string) =>
    request<UserInfo[]>('/all', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  deleteUser: (userId: string, token: string) =>
    request(`/delete/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }),

  updateUsername: (data: { username: string }, token: string) =>
    request('/update-username', {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` },
    }),
};
