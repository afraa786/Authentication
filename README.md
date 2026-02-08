 # Authentication Project — Frontend API Integration Guide

This README explains how frontend developers should integrate with the backend authentication API (register, login, OTP verification, password reset, profile updates). It describes environment variables, common headers, expected routes/payloads (inferred from the backend DTOs), example fetch snippets, and testing tips.

## Quick links (backend sources)
- Controller / routes: [server/src/main/java/auth/controller/userController.java](server/src/main/java/auth/controller/userController.java)
- DTOs: [server/src/main/java/auth/dto](server/src/main/java/auth/dto)
- JWT logic: [server/src/main/java/auth/service/JwtService.java](server/src/main/java/auth/service/JwtService.java)
- Security config: [server/src/main/java/auth/config/SecurityConfiguration.java](server/src/main/java/auth/config/SecurityConfiguration.java)
- CORS config: [server/src/main/java/auth/config/CorsConfig.java](server/src/main/java/auth/config/CorsConfig.java)

---

## Base URL & environment
- Default backend base URL for local development: `http://localhost:9090`
- Frontend environment variable: set `VITE_API_BASE_URL` (Vite) or `REACT_APP_API_BASE_URL` (CRA) to the backend base URL.
	- Example: `VITE_API_BASE_URL=http://localhost:9090`

## CORS
- CORS is configured server-side (see `CorsConfig.java`). If you hit CORS errors, confirm the frontend origin is allowed or run the frontend with a proxy to the backend.

## Authentication approach
- Auth uses JWT tokens. The server returns a token on login (see `LoginResponse` DTO).
- Recommended (dev): store token in `localStorage` under `accessToken` for quick integration.
- Recommended (prod): prefer secure, httpOnly cookies or short-lived access tokens with refresh tokens.
- Include the token on protected requests: `Authorization: Bearer <token>`

## Common headers
- `Content-Type: application/json`
- `Accept: application/json`
- `Authorization: Bearer <token>` (for protected endpoints)

## Expected endpoints (verify exact paths in `userController.java`)
The routes below are inferred from DTOs and common conventions — confirm exact paths in the controller.

- Register
	- POST `/api/authentication/register`
	- Body: `{ "username": "alice", "email": "alice@example.com", "password": "P@ssw0rd" }`

- Login
	- POST `/api/authentication/login`
	- Body: `{ "username": "alice" /* or email */, "password": "P@ssw0rd" }`
	- Response (example): `{ "accessToken": "<jwt>", "tokenType": "Bearer", "expiresIn": 3600, "user": { "id": "...", "email": "...", "username": "..." } }`

- OTP verification
	- POST `/api/authentication/verify-otp` (or similar)
	- Body: `{ "email": "alice@example.com", "otp": "123456" }`

- Resend OTP
	- POST `/api/authentication/resend-otp`
	- Body: `{ "email": "alice@example.com" }`

- Forgot password (request reset)
	- POST `/api/authentication/forgot-password`
	- Body: `{ "email": "alice@example.com" }`

- Reset password (confirm)
	- POST `/api/authentication/reset-password`
	- Body: `{ "email": "alice@example.com", "token": "<reset-token-or-otp>", "newPassword": "NewP@ss1" }`

- Update username
	- PUT `/api/authentication/update-username`
	- Body: `{ "userId": "...", "newUsername": "alice2" }` (protected)

- Get current user
	- GET `/api/authentication/me` (protected) — returns `UserDto`

## Error handling
- Expect JSON error responses with `message` and/or `errors`.
- Handle statuses: 400 (validation), 401 (unauthorized), 403 (forbidden), 404 (not found), 500 (server error).

## Example fetch helpers

Set base URL in a single place (Vite example):

```javascript
const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090';
```

Login (store token):

```javascript
async function login({ usernameOrEmail, password }) {
	const res = await fetch(`${API}/api/auth/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username: usernameOrEmail, password })
	});
	const data = await res.json();
	if (!res.ok) throw new Error(data.message || 'Login failed');
	localStorage.setItem('accessToken', data.accessToken);
	return data;
}
```

Helper for protected requests:

```javascript
function authFetch(path, opts = {}) {
	const token = localStorage.getItem('accessToken');
	const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
	if (token) headers['Authorization'] = `Bearer ${token}`;
	return fetch(`${API}${path}`, { ...opts, headers });
}

// Example usage
// await authFetch('/api/auth/me');
```

Verify OTP example:

```javascript
await fetch(`${API}/api/auth/verify-otp`, {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({ email: 'alice@example.com', otp: '123456' })
});
```

## Testing & debugging
- Use Postman / Insomnia to confirm exact endpoints, request/response shapes, and headers.
- Inspect backend logs when debugging unexpected responses.
- If you get a 404, confirm the path in `userController.java`.

## Security & best practices
- Prefer `Authorization` header with Bearer token for API calls.
- Do not leak tokens in URLs or logs.
- Use HTTPS in production.
- Implement token expiry handling: redirect to login or refresh token flow if available.

## Integration checklist
- [ ] Set `VITE_API_BASE_URL` for local dev
- [ ] Confirm exact endpoint paths & payload keys in `userController.java`
- [ ] Implement login, persist token, and use `authFetch` for protected calls
- [ ] Implement OTP flows (verify and resend)
- [ ] Implement forgot/reset password flows and UX for email & token entry
- [ ] Add error handling and token expiry UX

---

If you'd like, I can also generate a Postman collection from the exact routes in `userController.java` or open a PR with this README committed.
