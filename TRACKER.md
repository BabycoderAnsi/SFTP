# Project Change Tracker

This document tracks all changes, fixes, and improvements made to the SFTP Gateway project.

---

## [2026-02-19] Comprehensive Logging Implementation

### Overview

Implemented structured JSON logging across the entire application to ensure:
- All operations are traceable via `requestId`
- Security events are logged for compliance
- Errors are captured with full context
- Logs are SIEM-ready (JSON format)

### Files Modified

| File | Changes |
|------|---------|
| `src/logging/logging.ts` | Added LogLevel type, log level filtering, stderr for errors |
| `src/app.ts` | Added global error handler with structured logging |
| `src/server.ts` | Replaced console.log with structured log() calls |
| `auth/auth.routes.ts` | Added login attempt/success/failure logging |
| `middlewares/requireAuth.ts` | Added auth failure logging (missing token, invalid token, forbidden) |
| `src/services/sftp.services.ts` | Added SFTP lifecycle logging (connect, disconnect, upload, mkdir) |
| `src/resilience/retry.ts` | Added retry attempt and exhausted logging |
| `src/db/prisma.ts` | Added DB connection logging |
| `src/utils/path.utils.ts` | Added path traversal security event logging |
| `middlewares/audit.ts` | Merged: now does both structured logging AND DB write |
| `middlewares/upload.middleware.ts` | Added upload error handling with logging |
| `src/routes/files.route.ts` | Updated import path for merged audit middleware |

### Files Deleted

| File | Reason |
|------|--------|
| `src/middlewares/audit.ts` | Merged into `middlewares/audit.ts` |

### Files Created

| File | Purpose |
|------|---------|
| `AGENTS.md` | AI assistant context file for project understanding |

### Log Events Added

| Event | Level | Location |
|-------|-------|----------|
| Server started | info | server.ts |
| Server shutdown (SIGTERM/SIGINT) | info | server.ts |
| Login attempt | info | auth.routes.ts |
| Login success | info | auth.routes.ts |
| Login failed (missing credentials) | warn | auth.routes.ts |
| Login failed (invalid credentials) | warn | auth.routes.ts |
| Login error (server error) | error | auth.routes.ts |
| Auth missing token | warn | requireAuth.ts |
| Auth invalid token | warn | requireAuth.ts |
| Auth forbidden (wrong role) | warn | requireAuth.ts |
| SFTP connecting | debug | sftp.services.ts |
| SFTP connected | debug | sftp.services.ts |
| SFTP disconnected | debug | sftp.services.ts |
| SFTP error | error | sftp.services.ts |
| SFTP upload start/success/failed | debug/error | sftp.services.ts |
| SFTP mkdir start/success/failed | debug/error | sftp.services.ts |
| Retry attempt | warn | retry.ts |
| Retry exhausted | error | retry.ts |
| DB connected | info | prisma.ts |
| Path traversal blocked | warn | path.utils.ts |
| Audit write failed | error | audit.ts |
| Upload error (file too large) | warn | upload.middleware.ts |
| Unhandled error | error | app.ts (global handler) |

### Configuration

Added `LOG_LEVEL` environment variable support:
```env
LOG_LEVEL=info  # debug | info | warn | error
```

### Log Output Example

```json
{
  "timestamp": "2026-02-19T12:00:00.000Z",
  "level": "info",
  "message": "server_started",
  "port": 8443,
  "environment": "development",
  "protocol": "https"
}
```

---

## [2026-02-19] CommonJS Module System Conversion (Atlas Pattern)

### Issues Fixed

| # | Issue | Location | Fix Applied |
|---|-------|----------|-------------|
| 1 | ES Modules (`"type": "module"`) caused compatibility issues | server/package.json | Removed `"type": "module"` to use CommonJS |
| 2 | `tsconfig.json` used `NodeNext` module resolution | server/tsconfig.json | Changed to `module: "commonjs"`, `moduleResolution: "node"` |
| 3 | `emitDeclarationOnly` and `allowImportingTsExtensions` prevented proper compilation | server/tsconfig.json | Removed both options |
| 4 | All imports required `.ts` or `.js` extensions (ES Module requirement) | All *.ts files | Removed all file extensions from local imports |
| 5 | No clean build process | server/package.json | Added `rimraf` to clean dist before build |
| 6 | Dev runtime used `tsx` (ES Module focused) | server/package.json | Changed to `ts-node-dev` for CommonJS support |
| 7 | Development branch had SSL config not in main | server/src/db/prisma.ts | Merged SSL configuration from development |

### Files Modified

- `server/tsconfig.json` - Changed module system to CommonJS
- `server/package.json` - Removed type:module, updated scripts, added dependencies
- `server/auth/*.ts` - Fixed imports
- `server/middlewares/*.ts` - Fixed imports
- `server/src/**/*.ts` - Fixed imports

### New Dependencies Added

- `rimraf` - Cross-platform rm -rf for clean builds
- `ts-node-dev` - TypeScript development runtime with hot reload

---

## [2026-02-19] API Improvements & Security Fixes

### Overview

Comprehensive API improvements addressing security vulnerabilities, bad practices, and functional issues across all 6 API endpoints.

### New Dependencies Added

| Package | Purpose |
|---------|---------|
| `zod` | Input validation |
| `express-rate-limit` | Rate limiting for login endpoint |

### Files Created

| File | Purpose |
|------|---------|
| `src/schemas/index.ts` | Zod validation schemas for all endpoints |
| `middlewares/validate.middleware.ts` | Request body/query validation middleware |
| `middlewares/rateLimit.middleware.ts` | Rate limiting middleware |
| `middlewares/timeout.middleware.ts` | Request timeout middleware |
| `src/utils/sanitize.utils.ts` | Filename and path sanitization utilities |
| `src/utils/response.utils.ts` | Standardized API response helpers |

### Files Modified

| File | Changes |
|------|---------|
| `auth/jwt.utils.ts` | Added refresh token support, 15min access tokens |
| `auth/auth.service.ts` | Returns both access and refresh tokens |
| `auth/auth.routes.ts` | Added rate limiting, validation, `/refresh` and `/logout` endpoints |
| `src/routes/files.route.ts` | Fixed download streaming, upload streaming, pagination, validation |
| `src/routes/health.route.ts` | Added DB and SFTP dependency checks |
| `src/services/sftp.services.ts` | Added streaming upload, removed buffer-based upload |
| `middlewares/upload.middleware.ts` | Changed to disk storage for streaming |
| `src/app.ts` | Added API versioning (`/v1/`), timeout, rate limiting, 404 handler |

### Security Fixes

| Issue | Fix |
|-------|-----|
| No rate limiting on login | Added 5 attempts per 15 minutes limit |
| Filename path traversal | Added `sanitizeFilename()` utility |
| No input validation | Added Zod schemas for all endpoints |
| Username in logs (PII) | Changed to `***` in success logs |
| No API versioning | Added `/v1/` prefix to all routes |

### Functional Fixes

| Issue | Fix |
|-------|-----|
| Download returns JSON, not file | Now streams file directly to response |
| Upload uses memory (OOM risk) | Changed to disk storage + streaming |
| No pagination on list | Added `limit` and `offset` query params |
| Health check doesn't check dependencies | Now checks DB and SFTP connectivity |
| No refresh token flow | Added `/auth/refresh` endpoint |
| No request timeout | Added 30-second timeout middleware |

### API Changes

#### New Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/auth/refresh` | Refresh access token using refresh token |
| POST | `/v1/auth/logout` | Logout (logs event) |

#### Changed Endpoints

| Old | New |
|-----|-----|
| `/auth/login` | `/v1/auth/login` |
| `/files/list` | `/v1/files/list` |
| `/files/download` | `/v1/files/download` |
| `/files/upload` | `/v1/files/upload` |
| `/files/mkdir` | `/v1/files/mkdir` |

#### New Query Parameters

| Endpoint | Param | Type | Default | Description |
|----------|-------|------|---------|-------------|
| `/v1/files/list` | `limit` | number | 100 | Max files to return |
| `/v1/files/list` | `offset` | number | 0 | Pagination offset |

#### Response Format

All responses now follow standardized format:

**Success:**
```json
{
  "status": "success",
  "requestId": "uuid",
  "data": { ... }
}
```

**Error:**
```json
{
  "status": "error",
  "requestId": "uuid",
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": [...]
  }
}
```

---

## [2026-02-19] Aiven PostgreSQL SSL Configuration

### Issue

Database connection was failing with:
```
Error opening a TLS connection: self-signed certificate in certificate chain
```

### Root Cause

1. Aiven PostgreSQL requires SSL connections
2. The `sslmode=require` in `DATABASE_URL` conflicted with custom SSL config in the pg Pool
3. The pg library doesn't handle `sslmode` parameter in connection string when custom `ssl` config is provided

### Solution

1. Strip `sslmode` parameter from `DATABASE_URL` before passing to Pool
2. Use Aiven CA certificate (`ca.pem`) for proper certificate verification
3. Fallback to `rejectUnauthorized: false` if CA cert is not present (for local dev)

### Files Modified

| File | Changes |
|------|---------|
| `src/db/prisma.ts` | Added CA certificate loading, stripped sslmode from URL, proper SSL config |

### Implementation Details

```typescript
// Strip sslmode from connection string to avoid conflicts
const databaseUrl = rawDatabaseUrl.replace(/[?&]sslmode=[^&]*/gi, '');

// Use CA cert if available
const sslConfig = hasCaCert
  ? { ca: fs.readFileSync(caCertPath).toString(), rejectUnauthorized: true }
  : { rejectUnauthorized: process.env.NODE_ENV === 'production' };
```

### Certificate Location

```
server/certs/ca.pem  # Aiven CA certificate (DO NOT COMMIT)
```

### Verification

Health check now returns:
```json
{
  "status": "ok",
  "checks": {
    "database": { "status": "healthy", "latency": 943 },
    "sftp": { "status": "healthy", "latency": 120 }
  }
}
```

---

## Pending Tasks

| Task | Status | Priority | Notes |
|------|--------|----------|-------|
| Add test suite (Jest) | Pending | High | ~38 tests planned (unit + integration) |
| Add CI/CD configuration | Pending | Medium | GitHub Actions workflow |
| Add API documentation (OpenAPI/Swagger) | Pending | Low | Optional enhancement |

---

## Change Log Format

```
## [YYYY-MM-DD] Brief Description

### Issues Fixed
| # | Issue | Location | Fix Applied |
|---|-------|----------|-------------|
| 1 | ... | ... | ... |

### Files Modified
- file1.ts - description
- file2.ts - description

### Files Added
- newfile.ts - description
```
