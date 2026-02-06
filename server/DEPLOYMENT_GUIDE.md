# Production Deployment & Configuration Guide

## Table of Contents
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Security Hardening](#security-hardening)
- [Database Setup](#database-setup)
- [Environment Configuration](#environment-configuration)
- [Deployment Options](#deployment-options)
- [Monitoring & Logging](#monitoring--logging)
- [Performance Optimization](#performance-optimization)
- [SSL/TLS Configuration](#ssltls-configuration)
- [Backup & Recovery](#backup--recovery)
- [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### Security Review
- [ ] Change all default passwords and secrets
- [ ] Generate strong JWT secret key (min. 64 chars)
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS for specific domains only
- [ ] Set appropriate CORS headers
- [ ] Review OAuth2 configurations
- [ ] Implement rate limiting
- [ ] Enable logging and monitoring
- [ ] Configure firewall rules
- [ ] Review database credentials

### Code Review
- [ ] All sensitive data removed from code
- [ ] No hardcoded passwords or secrets
- [ ] Error messages don't expose system details
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention verified
- [ ] CSRF protection enabled
- [ ] Security dependencies updated

### Database Review
- [ ] Database backup strategy planned
- [ ] Connection pool configured
- [ ] Indexes created on frequently queried fields
- [ ] User permissions set correctly
- [ ] SSL connection enabled

### Infrastructure Review
- [ ] Server specifications adequate
- [ ] Disk space sufficient (min. 10GB recommended)
- [ ] Memory adequate (min. 2GB recommended)
- [ ] Network bandwidth sufficient
- [ ] Monitoring tools configured
- [ ] Backup systems in place
- [ ] Disaster recovery plan created

---

## Security Hardening

### 1. Generate Strong JWT Secret
```bash
# Using OpenSSL (Linux/Mac)
openssl rand -base64 64

# Using Java
java -cp . -jar jwtutil.jar generate

# Example output:
# 7hJ9kL2mN4pQ6sT8vW1xY3zA5bC7dE9fG1hI3jK5lM7nO9pQ1rS3tU5vW7xY9zA
```

### 2. Update application.properties
```properties
# CHANGE THESE FOR PRODUCTION
security.jwt.secret-key=YOUR_GENERATED_64_CHAR_SECRET_KEY_HERE
spring.datasource.password=STRONG_DATABASE_PASSWORD
spring.mail.password=APP_SPECIFIC_PASSWORD

# Additional Security Headers
server.servlet.session.cookie.secure=true
server.servlet.session.cookie.http-only=true
server.servlet.session.cookie.same-site=strict
```

### 3. Configure CORS for Production
```java
// In CorsConfig.java - Update allowed origins
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("https://yourdomain.com", "https://www.yourdomain.com")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
    }
}
```

### 4. Implement Rate Limiting
```xml
<!-- Add to pom.xml -->
<dependency>
    <groupId>io.github.bucket4j</groupId>
    <artifactId>bucket4j-core</artifactId>
    <version>7.6.0</version>
</dependency>
```

```java
// Create Rate Limiter Filter
@Component
public class RateLimitFilter extends OncePerRequestFilter {
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain chain) throws ServletException, IOException {
        String key = request.getRemoteUser();
        Bucket bucket = buckets.computeIfAbsent(key, k -> createNewBucket());
        
        if (bucket.tryConsume(1)) {
            chain.doFilter(request, response);
        } else {
            response.setStatus(429); // Too Many Requests
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Rate limit exceeded\"}");
        }
    }
    
    private Bucket createNewBucket() {
        Bandwidth limit = Bandwidth.simple(100, Duration.ofMinutes(1));
        return Bucket.builder()
            .addLimit(limit)
            .build();
    }
}
```

### 5. Enable HTTPS Only
```properties
# application.properties
server.ssl.key-store=classpath:keystore.p12
server.ssl.key-store-password=your-keystore-password
server.ssl.key-store-type=PKCS12
server.ssl.key-alias=tomcat

# Redirect HTTP to HTTPS
server.servlet.session.cookie.secure=true
server.servlet.session.cookie.http-only=true
```

### 6. Implement Security Headers
```java
@Configuration
@EnableWebSecurity
public class SecurityConfiguration {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .headers()
            .xssProtection()
            .and()
            .contentSecurityPolicy("default-src 'self'")
            .and()
            .frameOptions().sameOrigin()
            .and()
            .httpStrictTransportSecurity()
            .maxAgeInSeconds(31536000)
            .includeSubDomains(true);
        return http.build();
    }
}
```

---

## Database Setup

### PostgreSQL Production Setup

#### 1. Create Production Database
```sql
-- Connect as superuser
CREATE DATABASE auth_production;

CREATE USER app_user WITH PASSWORD 'strong_password_here';

-- Grant privileges
GRANT CONNECT ON DATABASE auth_production TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_user;
```

#### 2. Create Backup User
```sql
CREATE USER backup_user WITH PASSWORD 'backup_password_here';
GRANT pg_read_all_data ON DATABASE auth_production TO backup_user;
```

#### 3. Enable SSL Connections
```bash
# In postgresql.conf
ssl = on
ssl_cert_file = '/etc/postgresql/server.crt'
ssl_key_file = '/etc/postgresql/server.key'
```

#### 4. Create Indexes for Performance
```sql
-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_active ON users(active);
CREATE INDEX idx_users_created_at ON users(created_at);

-- For OTP queries
CREATE INDEX idx_users_otp_generated_at ON users(otp_generated_at) WHERE otp IS NOT NULL;

-- For reset token queries
CREATE INDEX idx_users_reset_token_expiry ON users(reset_token_expiry) WHERE reset_token IS NOT NULL;
```

#### 5. Connection Pooling Setup
```properties
# application.properties
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.idle-timeout=600000
spring.datasource.hikari.max-lifetime=1800000
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.connection-test-query=SELECT 1
```

---

## Environment Configuration

### Production application.properties Template
```properties
# ============ SERVER CONFIGURATION ============
server.port=8080
server.servlet.context-path=/
server.compression.enabled=true
server.compression.min-response-size=1024

# ============ DATABASE CONFIGURATION ============
spring.datasource.url=jdbc:postgresql://your-db-host:5432/auth_production?sslmode=require
spring.datasource.username=app_user
spring.datasource.password=CHANGE_ME
spring.datasource.driver-class-name=org.postgresql.Driver

# Connection Pooling
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.idle-timeout=600000

# JPA/Hibernate Configuration
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQL10Dialect
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=false
spring.jpa.properties.hibernate.jdbc.batch_size=20
spring.jpa.properties.hibernate.order_inserts=true
spring.jpa.properties.hibernate.order_updates=true

# ============ EMAIL CONFIGURATION ============
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=CHANGE_ME
spring.mail.protocol=smtp
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
spring.mail.properties.mail.smtp.socketFactory.port=587
spring.mail.properties.mail.smtp.socketFactory.class=javax.net.ssl.SSLSocketFactory

# ============ JWT CONFIGURATION ============
security.jwt.secret-key=CHANGE_ME_MIN_64_CHARS
security.jwt.expiration-time=86400000
security.jwt.refresh-token-expiration-time=604800000

# ============ LOGGING CONFIGURATION ============
logging.level.root=WARN
logging.level.auth=INFO
logging.file.name=logs/application.log
logging.file.max-size=10MB
logging.file.max-history=30
logging.pattern.file=%d{yyyy-MM-dd HH:mm:ss} - %msg%n

# ============ ACTUATOR CONFIGURATION ============
management.endpoints.web.exposure.include=health,metrics,info
management.endpoint.health.show-details=when-authorized

# ============ SECURITY CONFIGURATION ============
server.servlet.session.cookie.secure=true
server.servlet.session.cookie.http-only=true
server.servlet.session.cookie.same-site=strict
```

---

## Deployment Options

### Option 1: Docker Deployment

#### Dockerfile
```dockerfile
FROM openjdk:17-jdk-slim

WORKDIR /app

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
COPY src src

RUN chmod +x mvnw && ./mvnw clean package -DskipTests

FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=0 /app/target/demo-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: auth_production
      POSTGRES_USER: app_user
      POSTGRES_PASSWORD: strong_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  auth-app:
    build: .
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/auth_production?sslmode=require
      SPRING_DATASOURCE_USERNAME: app_user
      SPRING_DATASOURCE_PASSWORD: strong_password
      SECURITY_JWT_SECRET_KEY: your-secret-key
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  postgres_data:
```

#### Build and Deploy
```bash
docker-compose up -d
```

### Option 2: AWS Deployment

#### 1. Create RDS Instance
```bash
aws rds create-db-instance \
    --db-instance-identifier auth-production-db \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --master-username admin \
    --master-user-password StrongPassword123! \
    --allocated-storage 100 \
    --publicly-accessible false
```

#### 2. Deploy to Elastic Beanstalk
```bash
# Initialize EB
eb init -p java-17 auth-app

# Create environment
eb create auth-production

# Deploy
eb deploy
```

### Option 3: Digital Ocean App Platform

Create `.do/app.yaml`:
```yaml
name: auth-app
services:
- name: api
  github:
    repository: your-repo
    branch: main
  build_command: mvn clean package -DskipTests
  run_command: java -jar target/demo-0.0.1-SNAPSHOT.jar
  http_port: 8080
  environment_slug: java
  envs:
  - key: SPRING_DATASOURCE_URL
    value: ${db.connection_string}
  - key: DATABASE_USER
    value: ${db.username}
  - key: DATABASE_PASSWORD
    value: ${db.password}

databases:
- name: auth-db
  engine: PG
  version: "15"
  production: true
```

---

## Monitoring & Logging

### 1. Spring Boot Actuator
```properties
management.endpoints.web.exposure.include=health,metrics,info,prometheus
management.endpoint.health.show-details=when-authorized
management.metrics.export.prometheus.enabled=true
```

### 2. Logging Configuration
```xml
<!-- logback-spring.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <property name="LOG_FILE" value="${LOG_FILE:-${LOG_PATH:-${LOG_TEMP:-${java.io.tmpdir:-/tmp}}/}spring.log}"/>
    
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_FILE}</file>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss} | %-5level | %logger{36} | %msg%n</pattern>
        </encoder>
        <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
            <fileNamePattern>${LOG_FILE}.%d{yyyy-MM-dd}.%i.gz</fileNamePattern>
            <maxHistory>30</maxHistory>
            <maxFileSize>10MB</maxFileSize>
        </rollingPolicy>
    </appender>

    <root level="INFO">
        <appender-ref ref="FILE"/>
    </root>
</configuration>
```

### 3. Prometheus Integration
```xml
<!-- Add to pom.xml -->
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

---

## Performance Optimization

### 1. Database Query Optimization
```java
// Use projections to fetch only needed fields
@Query("SELECT NEW auth.dto.UserDto(u.id, u.username, u.email) FROM User u")
List<UserDto> getAllUsers();

// Use pagination for large datasets
Page<User> findAll(Pageable pageable);
```

### 2. Caching Configuration
```xml
<!-- Add to pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
</dependency>
```

```java
@EnableCaching
@Configuration
public class CacheConfig {
    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager("users");
    }
}

// Use in service
@Cacheable("users")
public List<User> getAllUsers() {
    return userRepository.findAll();
}
```

### 3. Async Email Sending
```java
@Service
public class EmailService {
    @Async
    public void sendOtpEmail(String email, String otp, String template) {
        // Email sending logic
    }
}
```

---

## SSL/TLS Configuration

### 1. Generate Self-Signed Certificate
```bash
keytool -genkeypair -alias tomcat -keyalg RSA -keysize 2048 \
  -keystore keystore.p12 -keypass password -storepass password \
  -validity 365 -dname "CN=localhost"
```

### 2. Update application.properties
```properties
server.ssl.key-store=file:/config/keystore.p12
server.ssl.key-store-password=password
server.ssl.key-store-type=PKCS12
server.ssl.key-alias=tomcat
server.ssl.enabled=true
server.port=8443

# Redirect HTTP to HTTPS
server.http2.enabled=true
```

---

## Backup & Recovery

### 1. PostgreSQL Automated Backup
```bash
#!/bin/bash
# backup.sh
BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/auth_db_$DATE.sql.gz"

mkdir -p $BACKUP_DIR

pg_dump -U app_user auth_production | gzip > $BACKUP_FILE

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

### 2. Schedule with Cron
```bash
# Run backup daily at 2 AM
0 2 * * * /usr/local/bin/backup.sh
```

### 3. Recovery Procedure
```bash
# Restore from backup
gunzip -c backup_file.sql.gz | psql -U app_user auth_production
```

---

## Troubleshooting

### Issue: Database Connection Timeout
**Symptom:** `SQLException: Cannot get a connection`

**Solution:**
1. Check database is running
2. Verify credentials in application.properties
3. Check network connectivity
4. Increase pool size: `spring.datasource.hikari.maximum-pool-size=30`

### Issue: Email Not Sending
**Symptom:** Email verification not received

**Solution:**
1. Verify Gmail app password (not account password)
2. Enable "Less secure apps" in Gmail
3. Check SMTP settings match exactly
4. Review logs for error messages

### Issue: JWT Token Invalid
**Symptom:** `401 Unauthorized` on valid token

**Solution:**
1. Verify secret key hasn't changed
2. Check token hasn't expired
3. Ensure token format is correct: `Bearer <token>`
4. Check Authorization header case sensitivity

### Issue: High Memory Usage
**Symptom:** Application OOM error

**Solution:**
1. Increase JVM heap: `-Xmx1024m`
2. Enable caching for frequently accessed data
3. Use pagination for large queries
4. Monitor with: `jps -lv`

### Issue: Slow API Response
**Symptom:** Requests take >1s to complete

**Solution:**
1. Add database indexes on frequently queried fields
2. Enable query caching
3. Use async for email sending
4. Monitor with Prometheus metrics

---

## Security Checklist - Final Review

- [ ] All hardcoded secrets removed
- [ ] Strong JWT secret generated (64+ chars)
- [ ] HTTPS/SSL enabled
- [ ] Database credentials secured
- [ ] Email credentials secured
- [ ] CORS limited to specific domains
- [ ] Rate limiting implemented
- [ ] Logging configured
- [ ] Monitoring enabled
- [ ] Backups configured
- [ ] Security headers added
- [ ] OWASP Top 10 covered
- [ ] Dependencies updated
- [ ] Code reviewed for vulnerabilities

---

**Last Updated:** February 6, 2026
**Version:** 1.0
