# Authentication System

This document outlines the authentication system implemented in the React frontend.

## Features

### User Roles
- **Seller**: Service providers who offer their services to clients
- **Buyer**: Clients who hire freelancers for their projects

### Authentication Features
- User registration with role selection
- User login with email verification requirement
- Email verification for account activation
- JWT token-based authentication
- Protected routes for authenticated users
- User profile management
- Secure logout with token blacklisting

## Components

### AuthContext (`src/contexts/AuthContext.js`)
Global authentication state management with the following methods:
- `login(credentials)` - Authenticate user
- `register(userData)` - Register new user
- `logout()` - Logout and clear tokens
- `verifyEmail(token)` - Verify email address
- `resendVerification(email)` - Resend verification email

### Login Component (`src/components/auth/Login.js`)
- Email and password authentication
- Form validation with error handling
- Test credentials display for development
- Redirect to dashboard on successful login

### Register Component (`src/components/auth/Register.js`)
- User registration with role selection
- Form validation for all fields
- Password confirmation
- Email verification requirement
- Success message with next steps

### EmailVerification Component (`src/components/auth/EmailVerification.js`)
- Email verification via token
- Resend verification email functionality
- Success/error state handling
- Navigation to appropriate pages

### ProtectedRoute Component (`src/components/auth/ProtectedRoute.js`)
- Route protection for authenticated users
- Role-based access control
- Loading state during authentication check
- Redirect to login for unauthenticated users

## API Integration

The authentication system integrates with the Django backend at `https://django-final.vercel.app/api`:

### Endpoints Used
- `POST /auth/login/` - User login
- `POST /auth/register/` - User registration
- `GET /auth/verify-email/{token}/` - Email verification
- `POST /auth/resend-verification/` - Resend verification email
- `POST /auth/logout/` - User logout

### Authentication Flow
1. User registers with email, password, and role
2. Backend sends verification email
3. User clicks verification link
4. User can now login with verified credentials
5. JWT tokens are stored for authenticated requests

## Styling

All authentication components follow the black and white theme:
- Clean, minimal design
- High contrast for accessibility
- Responsive layout for mobile devices
- Consistent button and form styling

## Test Credentials

For development and testing, the following accounts are available:

- **Admin**: admin@gmail.com / admin123
- **Seller**: supabase_seller@example.com / seller123
- **Buyer**: supabase_buyer@example.com / buyer123

## Security Features

- Email verification required before login
- JWT token expiration handling
- Automatic token refresh
- Secure logout with token blacklisting
- Form validation on both client and server
- Protected routes with role-based access

## Usage

### Basic Authentication Flow
```javascript
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  const handleLogin = async () => {
    const result = await login({ email, password });
    if (result.success) {
      // Redirect to dashboard
    }
  };
  
  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user.first_name}!</p>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### Protected Routes
```javascript
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
```

## Error Handling

The authentication system includes comprehensive error handling:
- Network errors
- Validation errors
- Authentication failures
- Token expiration
- Email verification errors

All errors are displayed to users with clear, actionable messages.
