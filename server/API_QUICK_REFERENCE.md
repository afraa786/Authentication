# API Quick Reference Guide

## Base URL
```
http://localhost:8080/api/authentication
```

## Quick Endpoint Summary

| Method | Endpoint | Status | Purpose |
|--------|----------|--------|---------|
| POST | `/register` | 201 | Register new user |
| POST | `/login` | 200 | Login and get JWT token |
| PUT | `/otp/{userId}` | 202 | Verify OTP and activate account |
| POST | `/resend-otp` | 200 | Resend OTP to email |
| POST | `/password-reset-request` | 200 | Request password reset |
| POST | `/password-reset` | 200 | Complete password reset |
| GET | `/all` | 200 | Get all users |
| DELETE | `/delete/{userId}` | 204 | Delete user account |
| PUT | `/update-username` | 202 | Update username |

---

## cURL Examples

### 1. Register User
```bash
curl -X POST http://localhost:8080/api/authentication/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePassword123!",
    "confirmPassword": "SecurePassword123!"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:8080/api/authentication/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }'
```

### 3. Verify OTP
```bash
curl -X PUT http://localhost:8080/api/authentication/otp/1 \
  -H "Content-Type: application/json" \
  -d '{
    "otp": "1234"
  }'
```

### 4. Resend OTP
```bash
curl -X POST http://localhost:8080/api/authentication/resend-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

### 5. Request Password Reset
```bash
curl -X POST http://localhost:8080/api/authentication/password-reset-request \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

### 6. Reset Password
```bash
curl -X POST http://localhost:8080/api/authentication/password-reset \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "resetToken": "your-reset-token",
    "newPassword": "NewPassword123!",
    "confirmPassword": "NewPassword123!"
  }'
```

### 7. Get All Users
```bash
curl -X GET http://localhost:8080/api/authentication/all \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 8. Delete User
```bash
curl -X DELETE http://localhost:8080/api/authentication/delete/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 9. Update Username
```bash
curl -X PUT http://localhost:8080/api/authentication/update-username \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userId": 1,
    "newUsername": "jane_doe"
  }'
```

---

## JavaScript/Fetch Examples

### Register User
```javascript
const register = async () => {
  const response = await fetch('http://localhost:8080/api/authentication/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: 'john_doe',
      email: 'john@example.com',
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!'
    })
  });
  
  if (response.status === 201) {
    console.log('User registered successfully');
  }
};
```

### Login
```javascript
const login = async () => {
  const response = await fetch('http://localhost:8080/api/authentication/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'john@example.com',
      password: 'SecurePassword123!'
    })
  });
  
  const data = await response.json();
  if (response.status === 200) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    console.log('Login successful');
  }
};
```

### Verify OTP
```javascript
const verifyOtp = async (userId, otp) => {
  const response = await fetch(`http://localhost:8080/api/authentication/otp/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      otp: otp
    })
  });
  
  if (response.status === 202) {
    console.log('OTP verified successfully');
  }
};
```

### Using JWT Token in Requests
```javascript
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

const getAllUsers = async () => {
  const response = await fetch('http://localhost:8080/api/authentication/all', {
    method: 'GET',
    headers: getAuthHeader()
  });
  
  const users = await response.json();
  return users;
};
```

---

## Request/Response Examples

### Registration Response (201)
**Note:** No response body, only status code and headers

### Login Response (200)
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqb2huQGV4YW1wbGUuY29tIiwiaWF0IjoxNjM5MjQ1NzcwLCJleHAiOjE2MzkyNDk2NzB9.k1Jq8pR2xZ7lQ9sM3dE5fG6hJ4kL0nO2pR3sT4uV5w",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "expiresIn": 86400000,
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

### Get All Users Response (200)
```json
[
  {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "active": true,
    "createdAt": "2026-02-06T10:30:00"
  },
  {
    "id": 2,
    "username": "jane_doe",
    "email": "jane@example.com",
    "active": true,
    "createdAt": "2026-02-06T11:15:00"
  }
]
```

### Error Response (400)
```json
{
  "error": "Email already exists"
}
```

---

## Common Status Codes

```
201 Created     → User registered successfully
200 OK          → Successful GET/POST
202 Accepted    → Async request accepted
204 No Content  → Delete successful
400 Bad Request → Validation error
401 Unauthorized → Invalid/expired token
409 Conflict    → Duplicate resource
500 Server Error → Internal error
```

---

## Development Tips

### 1. Store JWT Tokens Securely
```javascript
// Store in localStorage
localStorage.setItem('token', response.token);

// Retrieve for requests
const token = localStorage.getItem('token');
```

### 2. Handle Token Expiry
```javascript
const handleApiResponse = (response) => {
  if (response.status === 401) {
    // Token expired - redirect to login
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  return response.json();
};
```

### 3. Auto-Include JWT in All Requests
```javascript
// Axios interceptor example
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 4. Handle OTP Verification
```javascript
// 1. After registration, prompt for OTP
// 2. User receives OTP in email
// 3. Submit OTP to verify account
const userId = response.userId;
await fetch(`/api/authentication/otp/${userId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ otp: userInputOtp })
});
```

---

## Environment Variables

Create a `.env` file or set these in your frontend:

```
REACT_APP_API_URL=http://localhost:8080
REACT_APP_API_ENDPOINT=/api/authentication
REACT_APP_JWT_TOKEN_KEY=authToken
REACT_APP_REFRESH_TOKEN_KEY=refreshToken
```

---

## Postman Collection

### Import to Postman

1. Create new Collection
2. Add requests with these details:

**Register**
- POST: `{{base_url}}/register`
- Body: `application/json`

**Login**
- POST: `{{base_url}}/login`
- Body: `application/json`

**Verify OTP**
- PUT: `{{base_url}}/otp/{{userId}}`
- Body: `application/json`

Set variable `base_url = http://localhost:8080/api/authentication`

---

## WebSocket Support (Future)

To implement real-time notifications:
```javascript
// WebSocket for OTP delivery confirmation
const socket = new WebSocket('ws://localhost:8080/ws/notifications');

socket.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  if (notification.type === 'OTP_SENT') {
    console.log('OTP sent to:', notification.email);
  }
};
```

---

**Last Updated:** February 6, 2026
