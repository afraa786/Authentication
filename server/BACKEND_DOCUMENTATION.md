# Authentication Backend Documentation

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Setup & Installation](#setup--installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Authentication Flow](#authentication-flow)
- [Error Handling](#error-handling)
- [Security Features](#security-features)

---

## 🎯 Project Overview

This is a Spring Boot 4.0.0 based authentication backend that provides secure user registration, login, OTP verification, JWT-based authentication, and password reset functionality. The application uses PostgreSQL for data persistence and integrates email services for OTP and account verification.

**Project Details:**
- **Artifact ID:** auth/demo
- **Version:** 0.0.1-SNAPSHOT
- **Java Version:** 17
- **Spring Boot Version:** 4.0.0

---

## 🛠️ Technology Stack

### Core Framework
- **Spring Boot:** 4.0.0
- **Java:** 17
- **Build Tool:** Maven

### Security & Authentication
- Spring Security
- OAuth2 (Authorization Server, Client, Resource Server)
- JWT (JSON Web Token) with JJWT Library
- Spring Security Test

### Database
- PostgreSQL (Neon)
- Spring Data JPA / Hibernate
- ORM: Hibernate

### Additional Libraries
- **Lombok:** For reducing boilerplate code
- **Spring Mail:** For email notifications
- **Jackson:** For JSON processing

### Testing
- Spring Boot Test
- OAuth2 Security Tests

---

## ✨ Features

### User Management
- ✅ User Registration with email validation
- ✅ Duplicate username and email prevention
- ✅ Get all users (admin endpoint)
- ✅ Delete user account
- ✅ Update username functionality

### Authentication
- ✅ Login with email and password
- ✅ JWT token generation and validation
- ✅ Token refresh mechanism
- ✅ Configurable token expiration

### OTP (One-Time Password)
- ✅ OTP generation on registration
- ✅ OTP verification with 10-minute expiry
- ✅ Resend OTP functionality
- ✅ Email-based OTP delivery

### Password Management
- ✅ Password reset request
- ✅ Password reset with confirmation
- ✅ Password hashing using BCrypt
- ✅ Reset token expiry validation

### Email Service
- ✅ Registration OTP email
- ✅ Account verification emails
- ✅ Password reset emails
- ✅ Customizable email templates

### Security
- ✅ CORS configuration
- ✅ JWT Authentication Filter
- ✅ Password encoding (BCrypt)
- ✅ OAuth2 support
- ✅ Token blacklist for logout

---

## 📁 Project Structure

```
src/main/
├── java/auth/
│   ├── DemoApplication.java           # Spring Boot entry point
│   ├── config/
│   │   ├── CorsConfig.java           # CORS configuration
│   │   ├── EmailConfiguration.java    # Email service setup
│   │   ├── JwtAuthenticationFilter.java # JWT validation filter
│   │   ├── JwtKeyGenerator.java       # JWT key generation
│   │   └── SecurityConfiguration.java  # Spring Security config
│   ├── controller/
│   │   └── userController.java        # REST API endpoints
│   ├── dto/
│   │   ├── LoginRequest.java
│   │   ├── LoginResponse.java
│   │   ├── OtpUpdateRequest.java
│   │   ├── PasswordResetConfirmation.java
│   │   ├── PasswordResetRequest.java
│   │   ├── ResendOtpRequest.java
│   │   ├── UpdateUsernameRequest.java
│   │   ├── UserDto.java
│   │   └── UserRegistrationRequest.java
│   ├── entity/
│   │   └── User.java                  # User JPA Entity
│   ├── repository/
│   │   └── UserRepository.java        # Database operations
│   └── service/
│       ├── EmailService.java          # Email sending logic
│       ├── JwtService.java            # JWT token management
│       └── UserService.java           # Business logic
└── resources/
    ├── application.properties          # Configuration properties
    └── META-INF/
        └── additional-spring-configuration-metadata.json
```

---

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    active BOOLEAN DEFAULT false,
    otp VARCHAR(4),
    otp_generated_at TIMESTAMP,
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### User Entity Fields
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| username | VARCHAR(255) | NOT NULL, UNIQUE | User's chosen username |
| email | VARCHAR(255) | NOT NULL, UNIQUE | User's email address (login credential) |
| password | VARCHAR(255) | NOT NULL | Encrypted password |
| active | BOOLEAN | DEFAULT: false | Account activation status |
| otp | VARCHAR(4) | NULL | One-time password for verification |
| otp_generated_at | TIMESTAMP | NULL | OTP generation timestamp |
| reset_token | VARCHAR(255) | NULL | Token for password reset |
| reset_token_expiry | TIMESTAMP | NULL | Password reset token expiry |
| created_at | TIMESTAMP | DEFAULT: NOW | Account creation timestamp |
| updated_at | TIMESTAMP | DEFAULT: NOW | Last update timestamp |

---

## 🚀 Setup & Installation

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- PostgreSQL 12+
- Git

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd Authentication
```

### Step 2: Configure Database Connection
Edit `src/main/resources/application.properties` with your PostgreSQL credentials:
```properties
spring.datasource.url=jdbc:postgresql://your-host:5432/your-database
spring.datasource.username=your-username
spring.datasource.password=your-password
```

### Step 3: Configure Email Service
Update email credentials in `application.properties`:
```properties
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-specific-password
```

### Step 4: Configure JWT Settings
```properties
security.jwt.secret-key=your-secret-key-min-32-chars
security.jwt.expiration-time=86400000
security.jwt.refresh-token-expiration-time=604800000
```

### Step 5: Build the Project
```bash
mvn clean install
```

### Step 6: Run the Application
```bash
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

---

## ⚙️ Configuration

### application.properties

```properties
# Server Configuration
server.port=8080

# Database Configuration
spring.datasource.url=jdbc:postgresql://ep-calm-paper-ahsc1448-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
spring.datasource.username=neondb_owner
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# Email Configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=shaikhafraabi@gmail.com
spring.mail.protocol=smtp
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# JWT Configuration
security.jwt.secret-key=2M4k9Z7V0a1B2c3D4e5F6g7H8i9J0K1L2M3N4O5P6Q7=
security.jwt.expiration-time=86400000        # 24 hours in milliseconds
security.jwt.refresh-token-expiration-time=604800000  # 7 days in milliseconds
```

### Key Configuration Classes

1. **SecurityConfiguration.java** - Spring Security setup and filter chain
2. **CorsConfig.java** - CORS policy for frontend integration
3. **EmailConfiguration.java** - JavaMailSender configuration
4. **JwtAuthenticationFilter.java** - JWT token validation filter
5. **JwtKeyGenerator.java** - Cryptographic key generation for JWT signing

---

## 📡 API Endpoints

### Base URL
```
http://localhost:8080/api/authentication
```

### 1. User Registration
**Endpoint:** `POST /api/authentication/register`

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!"
}
```

**Response:**
- Status: `201 Created`
- Body: Empty (OTP sent to email)

**Validations:**
- All fields are required
- Passwords must match
- Email must be unique
- Username must be unique

**Error Response:**
```json
{
  "error": "Email already exists"
}
```

---

### 2. User Login
**Endpoint:** `POST /api/authentication/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
- Status: `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400000,
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

**Error Cases:**
- User not found
- Password incorrect
- User account not active (OTP not verified)

---

### 3. Verify OTP
**Endpoint:** `PUT /api/authentication/otp/{userId}`

**Request Body:**
```json
{
  "otp": "1234"
}
```

**Response:**
- Status: `202 Accepted`
- Body: Empty (Welcome email sent)

**Validations:**
- OTP must be 4 digits
- OTP must match stored value
- OTP must be within 10-minute window
- User must not already be active

**Error Response:**
```json
{
  "error": "OTP expired"
}
```

---

### 4. Resend OTP
**Endpoint:** `POST /api/authentication/resend-otp`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
- Status: `200 OK`
- Body: Empty (New OTP sent)

**Validations:**
- Email must exist
- User must not be already active

---

### 5. Request Password Reset
**Endpoint:** `POST /api/authentication/password-reset-request`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
- Status: `200 OK`
- Body: Empty (Reset link sent to email)

**Behavior:**
- Generates reset token
- Sets token expiry (typically 1 hour)
- Sends reset link via email

---

### 6. Reset Password
**Endpoint:** `POST /api/authentication/password-reset`

**Request Body:**
```json
{
  "email": "john@example.com",
  "resetToken": "generated-token-from-email",
  "newPassword": "NewSecurePassword123!",
  "confirmPassword": "NewSecurePassword123!"
}
```

**Response:**
- Status: `200 OK`
- Body: Empty

**Validations:**
- Reset token must be valid
- Reset token must not be expired
- Passwords must match

---

### 7. Get All Users
**Endpoint:** `GET /api/authentication/all`

**Response:**
- Status: `200 OK`
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

---

### 8. Delete User
**Endpoint:** `DELETE /api/authentication/delete/{userId}`

**Response:**
- Status: `204 No Content`
- Body: Empty

**Validations:**
- User must exist

**Error Response:**
```json
{
  "error": "User not found"
}
```

---

### 9. Update Username
**Endpoint:** `PUT /api/authentication/update-username`

**Request Body:**
```json
{
  "userId": 1,
  "newUsername": "jane_doe_new"
}
```

**Response:**
- Status: `202 Accepted`
- Body: Empty

**Validations:**
- New username must be unique
- User must exist

---

## 🔐 Authentication Flow

### User Registration & Verification Flow
```
1. User sends registration request with email, username, and password
   ↓
2. System validates inputs and checks uniqueness
   ↓
3. Password is hashed using BCrypt
   ↓
4. User created with active=false and OTP generated
   ↓
5. OTP sent to user's email
   ↓
6. User receives OTP email with 4-digit code
   ↓
7. User calls /otp/{userId} endpoint with OTP
   ↓
8. System validates OTP (must be within 10 minutes)
   ↓
9. If valid: User marked as active, OTP cleared
   ↓
10. Welcome email sent to user
```

### Login Flow
```
1. User sends login request (email + password)
   ↓
2. System verifies user exists
   ↓
3. System checks user is active (OTP verified)
   ↓
4. Password verification using BCrypt
   ↓
5. If credentials valid:
   - JWT token generated (24-hour expiry)
   - Refresh token generated (7-day expiry)
   - Tokens returned to client
   ↓
6. Client stores tokens in localStorage/sessionStorage
```

### JWT Token Usage
```
1. Client includes token in Authorization header:
   Authorization: Bearer <jwt-token>
   ↓
2. JwtAuthenticationFilter intercepts request
   ↓
3. Filter validates token signature and expiry
   ↓
4. If valid: Request proceeds with authenticated user
   ↓
5. If invalid/expired: 401 Unauthorized response
```

### Password Reset Flow
```
1. User requests password reset with email
   ↓
2. System generates reset token (1-hour expiry)
   ↓
3. Reset link sent to email with token
   ↓
4. User clicks link and provides new password
   ↓
5. System validates token and expiry
   ↓
6. Password updated (hashed) and token cleared
   ↓
7. Confirmation email sent
```

---

## ⚠️ Error Handling

### HTTP Status Codes

| Code | Scenario |
|------|----------|
| 200 OK | Successful GET/POST operations |
| 201 Created | User successfully registered |
| 202 Accepted | Async operations (OTP update, password reset) |
| 204 No Content | Successful DELETE operation |
| 400 Bad Request | Invalid input or validation failure |
| 401 Unauthorized | Invalid/expired JWT token |
| 403 Forbidden | User lacks required permissions |
| 404 Not Found | Resource doesn't exist |
| 409 Conflict | Duplicate email/username |
| 500 Internal Server Error | Server error |

### Common Error Scenarios

**Invalid Credentials**
```json
{
  "error": "Invalid email or password"
}
```

**Email Already Exists**
```json
{
  "error": "Email already exists"
}
```

**OTP Expired**
```json
{
  "error": "OTP expired"
}
```

**Invalid OTP**
```json
{
  "error": "Invalid OTP"
}
```

**User Not Active**
```json
{
  "error": "User account not active. Please verify OTP first."
}
```

**Token Expired**
```json
{
  "error": "JWT token expired"
}
```

---

## 🔒 Security Features

### 1. Password Security
- **Hashing Algorithm:** BCrypt
- **Salt Rounds:** Auto-configured by Spring Security
- **Minimum Length:** Enforced through validation
- **Special Characters:** Recommended (not enforced)

### 2. JWT Security
- **Algorithm:** HS256 (HMAC with SHA-256)
- **Secret Key:** 64+ character random key
- **Token Expiry:** Configurable (default: 24 hours)
- **Claims:** Includes username, issued-at, expiration
- **Refresh Token:** Separate token for token renewal (7 days)

### 3. OTP Security
- **Length:** 4 digits (0000-9999)
- **Expiry:** 10 minutes from generation
- **Generation:** Cryptographically random
- **Delivery:** Email only (no SMS)
- **Single Use:** Cleared after verification

### 4. CORS Protection
- Configured in CorsConfig
- Allows specific origins (configurable)
- Restricts HTTP methods
- Controls headers and credentials

### 5. Logout Mechanism
- Token blacklist implementation
- In-memory storage (Redis recommended for production)
- Prevents token reuse after logout

### 6. SQL Injection Prevention
- Uses Spring Data JPA with parameterized queries
- No raw SQL queries
- Entity-based persistence

### 7. HTTPS/TLS
- Should be enforced in production
- PostgreSQL SSL connection supported (`sslmode=require`)

### 8. Rate Limiting
- Should be implemented for production
- Recommended for login and OTP endpoints

---

## 📧 Email Templates

The application uses email templates for:

1. **registration_otp.html** - OTP delivery during signup
2. **otp_resend.html** - Resent OTP for verification
3. **password_reset.html** - Password reset link
4. **welcome_email.html** - Account activation confirmation

Email templates should be placed in: `src/main/resources/templates/`

---

## 🧪 Testing

Run tests with:
```bash
mvn test
```

Test file: `src/test/java/auth/DemoApplicationTests.java`

---

## 🔧 Troubleshooting

### Email Not Sending
1. Check Gmail app-specific password
2. Verify SMTP settings in application.properties
3. Check "Less secure app access" setting in Gmail

### JWT Token Invalid
1. Verify secret key hasn't changed
2. Check token expiration time
3. Ensure token format is correct (Bearer <token>)

### Database Connection Issues
1. Verify PostgreSQL is running
2. Check database URL and credentials
3. Ensure SSL mode is correct (sslmode=require for Neon)

### OTP Verification Failed
1. Verify OTP hasn't expired (10-minute window)
2. Check OTP is exactly 4 digits
3. Ensure user exists and isn't already active

---

## 📝 Future Enhancements

- [ ] Implement rate limiting
- [ ] Add refresh token rotation
- [ ] Implement two-factor authentication (2FA)
- [ ] Add Redis for token blacklist (production)
- [ ] Social login integration (Google, GitHub)
- [ ] Email verification for password reset links
- [ ] Account lockout after failed login attempts
- [ ] Audit logging for security events
- [ ] API documentation with Swagger/OpenAPI
- [ ] GraphQL support

---

## 📞 Support & Contact

For issues or questions about the authentication system, please contact the development team.

---

## 📄 License

This project is provided as-is. Modify and distribute as needed.

---

**Last Updated:** February 6, 2026
**Version:** 0.0.1-SNAPSHOT
**Spring Boot Version:** 4.0.0
