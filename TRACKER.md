# Project Change Tracker

This document tracks all changes, fixes, and improvements made to the SFTP Gateway project.

---

## [2026-02-20] SFTP Gateway GUI Console

### Overview

Built a complete Next.js dashboard application for managing the SFTP Gateway:
- JWT-based authentication with role-based access
- File management (browse, upload, download, create folders)
- User management (list, approve, disable, change roles)
- Real-time audit logs via Server-Sent Events
- Multi-tenant org switching (admin)

### Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| State | Zustand |
| Data Fetching | Axios with interceptors |
| Forms | React Hook Form + Zod |
| Real-time | Server-Sent Events |

### Project Structure

```
sftp-gui/
├── app/
│   ├── (auth)/login/         # Login page
│   ├── (dashboard)/          # Protected dashboard pages
│   │   ├── page.tsx          # Dashboard home
│   │   ├── files/            # File browser
│   │   ├── users/            # User management
│   │   ├── logs/             # Real-time logs
│   │   └── settings/         # Settings page
│   └── layout.tsx
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── layout/               # Sidebar, header, guards
│   ├── files/                # File list, upload
│   ├── users/                # User table, role/status selects
│   └── logs/                 # Log stream viewer
├── hooks/                    # useAuth, useFiles, useSSE
├── lib/                      # API client, utils, constants
├── stores/                   # Zustand auth/org stores
└── types/                    # TypeScript definitions
```

### Features

| Feature | Description |
|---------|-------------|
| **Authentication** | JWT login with token refresh |
| **Role-Based UI** | Pages/actions hidden based on role |
| **File Browser** | Navigate folders, upload, download |
| **User Management** | Admin can approve/disable users |
| **Real-time Logs** | SSE stream of audit events |
| **Org Switcher** | Admin can switch between orgs |

### Backend Changes

#### New Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/auth/me` | Get current user profile |
| GET | `/v1/logs/stream` | SSE for real-time logs |
| GET | `/v1/admin/organizations` | List orgs for switcher |

#### CORS Support

Added CORS middleware to allow requests from `http://localhost:3000`.

### Files Created (GUI)

| File | Purpose |
|------|---------|
| `sftp-gui/*` | Complete Next.js application |
| `server/src/routes/logs.route.ts` | SSE log streaming endpoint |

### Files Modified (Backend)

| File | Changes |
|------|---------|
| `server/src/app.ts` | Added CORS, logs route |
| `server/auth/auth.routes.ts` | Added `/me` endpoint |
| `server/auth/admin.routes.ts` | Added `/organizations` endpoint |
| `server/middlewares/requireAuth.ts` | Include email, status in user payload |
| `server/src/types/index.ts` | Extended JwtPayload interface |

### RBAC Matrix

| Page/Action | READ_ONLY | READ_WRITE | ADMIN |
|-------------|-----------|------------|-------|
| Dashboard | ❌ | ✅ | ✅ |
| Files - List/Download | ✅ | ✅ | ✅ |
| Files - Upload/Mkdir | ❌ | ✅ | ✅ |
| Users | ❌ | ❌ | ✅ |
| Logs | ✅ | ✅ | ✅ |
| Settings | ❌ | ❌ | ✅ |
| Org Switcher | ❌ | ❌ | ✅ |

### Running the GUI

```bash
cd sftp-gui
npm install
npm run dev
```

Open http://localhost:3000

---

## [2026-02-20] Multi-Tenant SFTP Server with Audit Logging

### Overview

Completely redesigned the SFTP server from a simple single-user setup to a production-ready multi-tenant system with:
- Configurable users via JSON file
- Per-user directory isolation (chroot)
- Persistent storage (files, keys, logs)
- Structured audit logging
- Security hardening

### Architecture Changes

**Before:**
```
sftp-server/
├── Dockerfile         # Ubuntu + hardcoded user
└── sshd_config        # Basic config
```

**After:**
```
sftp-server/
├── Dockerfile         # Alpine-based, minimal footprint
├── entrypoint.sh      # Dynamic user creation from config
├── sshd_config        # Hardened security config
└── logrotate.conf     # Log rotation

sftp-config/
└── users.json         # User definitions (mounted)

sftp-data/             # Persistent volumes (mounted)
├── data/              # User files
├── keys/              # SSH host keys
└── logs/              # Audit logs

scripts/
└── generate-sftp-password.sh  # Password hash utility
```

### Files Created

| File | Purpose |
|------|---------|
| `sftp-server/Dockerfile` | Alpine-based image with health check |
| `sftp-server/entrypoint.sh` | Dynamic user creation, SSH key management |
| `sftp-server/sshd_config` | Hardened security configuration |
| `sftp-server/logrotate.conf` | Log rotation configuration |
| `sftp-config/users.json` | User configuration file |
| `scripts/generate-sftp-password.sh` | Password hash generation utility |

### Files Modified

| File | Changes |
|------|---------|
| `docker-compose.yaml` | Added volumes, health check, security options |

### Features Added

| Feature | Description |
|---------|-------------|
| **Multi-tenancy** | Each user gets isolated directory via chroot |
| **Config-based users** | Users defined in `sftp-config/users.json` |
| **Persistent storage** | Files, SSH keys, logs survive container restarts |
| **Audit logging** | All SFTP operations logged to JSON |
| **Security hardening** | Modern crypto, disabled forwarding, rate limiting |
| **Health checks** | Docker health check for orchestration |
| **Per-user permissions** | Read/write permissions per directory |

### User Configuration Format

```json
{
  "users": [
    {
      "username": "client-a",
      "password": "$6$rounds=4096$...$hash",
      "uid": 2002,
      "directories": {
        "inbound": "rw",
        "outbound": "r"
      }
    }
  ]
}
```

### Directory Structure per User

```
/sftp/data/
├── admin/
│   ├── inbound/     # rw - others upload here
│   ├── outbound/    # rw - files for distribution
│   └── archive/     # rw - archived files
├── client-a/
│   ├── inbound/     # rw - client uploads
│   └── outbound/    # r  - files for client
└── client-b/
    ├── inbound/
    └── outbound/
```

### Security Improvements

| Setting | Value | Purpose |
|---------|-------|---------|
| `PermitRootLogin` | no | Prevent root access |
| `MaxAuthTries` | 3 | Brute force protection |
| `AllowTcpForwarding` | no | Prevent tunneling |
| `X11Forwarding` | no | Prevent GUI forwarding |
| `PermitTTY` | no | Shell access denied |
| `ChrootDirectory` | /sftp/data/%u | User isolation |
| `ForceCommand` | internal-sftp | SFTP only |

### Usage Commands

```bash
# Build and start SFTP server
docker-compose up -d sftp

# Generate password hash
./scripts/generate-sftp-password.sh -p "MyPassword@123"

# Update user password
./scripts/generate-sftp-password.sh -p "MyPassword@123" -u client-a

# List users
./scripts/generate-sftp-password.sh -l

# View audit logs
tail -f sftp-data/logs/sftp-server.log | jq .
```

---

## [2026-02-20] User Registration API with RBAC

### Overview

Implemented a complete user registration system with Role-Based Access Control (RBAC):
- Public registration endpoint with strong password requirements
- User status management (PENDING → ACTIVE → DISABLED)
- Admin-only user management endpoints
- Database-stored status checked on each authenticated request

### Database Schema Changes

#### New Fields
| Table | Field | Type | Description |
|-------|-------|------|-------------|
| User | email | String (unique) | User email address |
| User | status | UserStatus (enum) | PENDING, ACTIVE, DISABLED |
| User | updatedAt | DateTime | Auto-updated timestamp |

#### Updated Enums
| Enum | Values |
|------|--------|
| Role | READ_ONLY, READ_WRITE, ADMIN |
| UserStatus | PENDING, ACTIVE, DISABLED |

### Files Created

| File | Purpose |
|------|---------|
| `prisma/seed.ts` | Seed script to create initial admin user |
| `auth/admin.routes.ts` | Admin user management endpoints |

### Files Modified

| File | Changes |
|------|---------|
| `prisma/schema.prisma` | Added email field, ADMIN role, UserStatus enum, updatedAt, indexes |
| `prisma.config.ts` | Added seed command configuration |
| `package.json` | Added prisma.seed script, ts-node dependency |
| `src/schemas/index.ts` | Added registerSchema, updateStatusSchema, updateRoleSchema, listUsersQuerySchema |
| `src/repositories/user.repo.ts` | Added createUser, findUserByEmail, findUserById, listUsers, countUsers, updateUserStatus, updateUserRole |
| `auth/auth.service.ts` | Added registerUser function, status checks in loginUser |
| `auth/auth.routes.ts` | Added POST /register endpoint, enhanced login error handling for PENDING/DISABLED |
| `middlewares/requireAuth.ts` | Now async, fetches user from DB, checks status (PENDING/DISABLED rejection) |
| `src/routes/files.route.ts` | Updated role names to READ_ONLY, READ_WRITE (matching schema) |
| `src/app.ts` | Added admin routes registration at /v1/admin |

### New API Endpoints

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/v1/auth/register` | No | - | Register new user (PENDING status) |
| GET | `/v1/admin/users` | Yes | ADMIN | List users (paginated, filterable) |
| PATCH | `/v1/admin/users/:id/status` | Yes | ADMIN | Update user status |
| PATCH | `/v1/admin/users/:id/role` | Yes | ADMIN | Update user role |

### Registration Flow

```
POST /v1/auth/register
├── Validate: username (3+ chars, alphanumeric+underscore), email, password (strong)
├── Check username uniqueness → 409 if exists
├── Check email uniqueness → 409 if exists
├── Hash password with bcrypt (12 rounds)
├── Create user: status=PENDING, role=READ_ONLY
└── Return 201 { message: "Account created. Awaiting admin approval." }
```

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&#^)

### Role Permissions

| Role | Permissions |
|------|-------------|
| READ_ONLY | List files, Download files |
| READ_WRITE | Upload files, Create directories |
| ADMIN | All above + User management |

### Status Checks

- **PENDING**: Cannot login, cannot access API
- **ACTIVE**: Can login, can access API based on role
- **DISABLED**: Cannot login, cannot access API

### Admin User Seeding

```bash
# Default credentials
npx prisma db seed
# Creates: admin / admin@example.com / Admin@123456

# Custom credentials
ADMIN_USERNAME=sysadmin ADMIN_EMAIL=admin@company.com ADMIN_PASSWORD=Secure!123 npx prisma db seed
```

### Security Measures

1. Admins cannot modify their own status or role
2. Passwords hashed with bcrypt (12 rounds)
3. Status checked on every authenticated request (DB lookup)
4. Strong password validation via Zod schema
5. Audit logging for all admin actions

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
