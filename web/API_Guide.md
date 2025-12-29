# Frontend Authentication Guide

This guide explains how to handle JWT tokens in your frontend application.

## Login Response

When you successfully login, you'll receive:

```json
{
  "user": {
    "id": "uuid",
    "level": 1,
    "email": "user@example.com",
    "username": "testuser",
    "firstName": "John",
    "lastName": "Doe",
    // ... other user fields
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 900  // 15 minutes in seconds
}
```

## Token Storage

### Option 1: localStorage (Simple, but less secure)
```javascript
// After successful login
const response = await fetch('http://10.0.251.78:1025/api/account/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    emailOrUsername: 'user@example.com',
    password: 'password123'
  })
});

const data = await response.json();
localStorage.setItem('accessToken', data.accessToken);
localStorage.setItem('refreshToken', data.refreshToken);
localStorage.setItem('user', JSON.stringify(data.user));
```

### Option 2: httpOnly Cookies (More secure, recommended for production)
The backend should set httpOnly cookies. For now, you can use localStorage with additional security measures.

### Option 3: Memory + Secure Storage (Most secure)
```javascript
// Store refresh token in secure storage, access token in memory
sessionStorage.setItem('refreshToken', data.refreshToken);
// Keep accessToken in memory (React state, Vue data, etc.)
```

## Making Authenticated Requests

### Using Fetch API
```javascript
const accessToken = localStorage.getItem('accessToken');

const response = await fetch('http://10.0.251.78:1025/api/account', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});
```

### Using Axios
```javascript
import axios from 'axios';

// Set default authorization header
axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('accessToken')}`;

// Or for a specific request
const response = await axios.get('http://10.0.251.78:1025/api/account', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
  }
});
```

## Token Refresh

Access tokens expire after 15 minutes. Use the refresh token to get a new access token:

```javascript
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    // Redirect to login
    window.location.href = '/login';
    return null;
  }

  try {
    const response = await fetch('http://10.0.251.78:1025/api/account/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    
    return data.accessToken;
  } catch (error) {
    // Refresh token expired or invalid - logout user
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
    return null;
  }
}
```

## Automatic Token Refresh on 401

Intercept 401 responses and automatically refresh the token:

```javascript
// Using Fetch with interceptor
async function fetchWithAuth(url, options = {}) {
  let accessToken = localStorage.getItem('accessToken');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`
    }
  });

  // If token expired, try to refresh
  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    
    if (newToken) {
      // Retry the original request with new token
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${newToken}`
        }
      });
    }
  }

  return response;
}
```

## React Example

```jsx
import { useState, useEffect } from 'react';

function useAuth() {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const login = async (emailOrUsername, password) => {
    const response = await fetch('http://10.0.251.78:1025/api/account/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrUsername, password })
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    setAccessToken(data.accessToken);
    setUser(data.user);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (refreshToken) {
      await fetch('http://10.0.251.78:1025/api/account/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setAccessToken(null);
    setUser(null);
  };

  return { user, accessToken, login, logout };
}
```

## Vue Example

```javascript
import { ref, onMounted } from 'vue';

export function useAuth() {
  const user = ref(null);
  const accessToken = ref(localStorage.getItem('accessToken'));

  onMounted(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      user.value = JSON.parse(userData);
    }
  });

  const login = async (emailOrUsername, password) => {
    const response = await fetch('http://10.0.251.78:1025/api/account/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrUsername, password })
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    accessToken.value = data.accessToken;
    user.value = data.user;
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (refreshToken) {
      await fetch('http://10.0.251.78:1025/api/account/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    accessToken.value = null;
    user.value = null;
  };

  return { user, accessToken, login, logout };
}
```

## Security Best Practices

1. **Never store tokens in plain text** - Always use secure storage
2. **Use HTTPS in production** - Tokens should only be sent over encrypted connections
3. **Implement token rotation** - Refresh tokens should be rotated on use
4. **Set token expiration** - Access tokens expire in 15 minutes, refresh tokens in 7 days
5. **Handle token expiration gracefully** - Automatically refresh or redirect to login
6. **Clear tokens on logout** - Always revoke refresh tokens server-side
7. **Protect against XSS** - Sanitize user input, use Content Security Policy

## API Endpoints

- `POST /api/account/login` - Login and get tokens
- `POST /api/account/refresh` - Refresh access token
- `POST /api/account/logout` - Logout and revoke refresh token

