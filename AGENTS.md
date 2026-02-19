# AGENTS.md - Project Context for AI Assistants

This document provides context for any AI assistant working on the SFTP Gateway project.

---

## Project Overview

**Name:** SFTP Gateway (Secure File Exchange Gateway)  
**Purpose:** A production-style Node.js service that exposes HTTPS APIs to interact with an SFTP server for regulated file exchange.  
**Pattern:** Designed to reflect patterns used in NBFCs and financial institutions.

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Language | TypeScript (ES2022) |
| Runtime | Node.js with CommonJS modules |
| Framework | Express.js 5.x |
| ORM | Prisma 7.x with PostgreSQL |
| SFTP Client | ssh2-sftp-client |
| Authentication | JWT (jsonwebtoken) |
| Password Hashing | bcryptjs |
| File Uploads | multer |
| Dev Runtime | ts-node-dev |
| Build | TypeScript Compiler (tsc) |

---

## Project Structure

```
SFTP/
├── AGENTS.md                    # This file - AI context
├── README.md                    # Project documentation
├── TRACKER.md                   # Change log and tracking
├── docker-compose.yaml          # Docker orchestration
├── sftp-server/                 # SFTP server container
│   ├── Dockerfile
│   └── sshd_config
└── server/                      # Main Node.js application
    ├── package.json
    ├── tsconfig.json
    ├── .env                     # Environment variables (not committed)
    ├── certs/                   # TLS certificates
    │   ├── cert.pem
    │   └── key.pem
    ├── prisma/
    │   └── schema.prisma        # Database schema
    ├── auth/                    # Authentication module
    │   ├── auth.routes.ts       # Login endpoint
    │   ├── auth.service.ts      # Login logic
    │   └── jwt.utils.ts         # JWT signing/verification
    ├── middlewares/             # Express middlewares
    │   ├── requireAuth.ts       # JWT authentication guard
    │   ├── upload.middleware.ts # File upload handling
    │   └── audit.ts             # Audit logging (DB + structured)
    └── src/
        ├── app.ts               # Express app setup
        ├── server.ts            # HTTPS server entry point
        ├── types/               # TypeScript type definitions
        │   ├── index.ts
        │   └── express.d.ts
        ├── routes/              # API route handlers
        │   ├── files.route.ts   # File operations
        │   └── health.route.ts  # Health check
        ├── services/            # Business logic
        │   └── sftp.services.ts # SFTP client operations
        ├── repositories/        # Data access layer
        │   ├── user.repo.ts
        │   └── audit.repo.ts
        ├── db/                  # Database connection
        │   └── prisma.ts
        ├── logging/             # Structured logging
        │   └── logging.ts
        ├── middlewares/         # Request-scoped middlewares
        │   └── requestId.ts
        ├── resilience/          # Retry logic
        │   └── retry.ts
        └── utils/               # Utility functions
            └── path.utils.ts    # Path traversal protection
```

---

## Module System

**IMPORTANT:** This project uses **CommonJS** (not ES Modules).

### Configuration

- `tsconfig.json`: `"module": "commonjs"`, `"moduleResolution": "node"`
- `package.json`: No `"type": "module"` (defaults to CommonJS)

### Import Pattern

```typescript
// ✅ Correct - No file extensions
import { something } from './local-file';
import pkg from 'external-package';

// ❌ Wrong - Don't use extensions
import { something } from './local-file.ts';
import { something } from './local-file.js';
```

---

## API Endpoints

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/auth/login` | No | - | Authenticate and get JWT |
| GET | `/health` | No | - | Health check |
| GET | `/files/list` | Yes | READONLY, ADMIN | List files |
| GET | `/files/download` | Yes | READONLY, ADMIN | Download file |
| POST | `/files/upload` | Yes | WRITEONLY, ADMIN | Upload file |
| POST | `/files/mkdir` | Yes | WRITEONLY, ADMIN | Create directory |

---

## User Roles

| Role | Permissions |
|------|-------------|
| READONLY | List, Download |
| WRITEONLY | Upload, Create Directory |
| ADMIN | All operations |

---

## Database Models

### User
```prisma
model User {
  id        String   @id @default(uuid())
  username  String   @unique
  password  String   // bcrypt hashed
  role      String   // READONLY | WRITEONLY | ADMIN
  createdAt DateTime @default(now())
}
```

### AuditLog
```prisma
model AuditLog {
  id        String   @id @default(uuid())
  requestId String
  user      String?
  role      String?
  action    String   // LIST | DOWNLOAD | UPLOAD | MKDIR
  path      String?
  status    Int
  createdAt DateTime @default(now())
}
```

---

## Common Commands

```bash
# Install dependencies
cd server && npm install

# Development (with hot reload)
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start

# Run Prisma migrations
npx prisma migrate dev --name <migration_name>

# Generate Prisma client
npx prisma generate
```

---

## Environment Variables

Required in `server/.env`:

```env
# Server
SFTP_SERVER_PORT=8443
NODE_ENV=development
LOG_LEVEL=info

# JWT
JWT_SECRET=your-secret-key

# SFTP
SFTP_HOST=localhost
SFTP_PORT=2222
SFTP_USER=sftpuser
SFTP_PASSWORD=password

# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

---

## Logging Standards

This project uses structured JSON logging via `src/logging/logging.ts`.

### Log Levels

```typescript
type LogLevel = "debug" | "info" | "warn" | "error" | "audit";
```

- `debug`: Detailed debugging info (disabled in production)
- `info`: Normal operations (startup, shutdown, connections)
- `warn`: Recoverable issues, security events (auth failures, path traversal)
- `error`: Errors, failures (unhandled errors, service failures)
- `audit`: Compliance audit trail (file operations)

### Usage

```typescript
import { log } from './logging/logging';

// Log levels: debug | info | warn | error | audit
log("info", "operation_completed", {
  requestId: req.requestId,
  user: req.user?.sub,
  result: "success"
});
```

### Log Output Format

```json
{
  "timestamp": "2026-02-19T12:00:00.000Z",
  "level": "info",
  "message": "operation_completed",
  "requestId": "uuid-here",
  "user": "username",
  "result": "success"
}
```

### Guidelines

1. Always include `requestId` when available for traceability
2. Use appropriate log levels (see above)
3. **NEVER** use `console.log` or `console.error` directly - use `log()` function
4. Include relevant context in metadata
5. Error logs go to stderr, others go to stdout
6. Log level filtering is controlled by `LOG_LEVEL` env var

---

## Security Features

1. **HTTPS/TLS** - All traffic encrypted
2. **JWT Authentication** - Bearer tokens with 1-hour expiry
3. **Role-Based Access Control** - READONLY, WRITEONLY, ADMIN
4. **Path Traversal Protection** - `resolveSafePath()` in `path.utils.ts`
5. **Helmet.js** - HTTP security headers
6. **Request ID Tracking** - Unique ID per request
7. **Audit Logging** - All operations logged to database AND structured logs

---

## Error Handling

### Global Error Handler

All unhandled errors are caught by the global error handler in `app.ts`:

```typescript
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  log("error", "unhandled_error", {
    requestId: req.requestId,
    user: req.user?.sub,
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });
  
  res.status(500).json({ error: "Internal server error" });
});
```

### In Routes

Always propagate errors via `next(err)`:

```typescript
try {
  // operation
} catch (err) {
  next(err);  // Will be caught by global handler
}
```

---

## Coding Conventions

### TypeScript

- Strict mode enabled
- Use explicit types (avoid `any` where possible)
- Interfaces in `src/types/`
- CommonJS imports (no file extensions)

### Express

- Routes in `src/routes/`
- Business logic in `src/services/`
- Data access in `src/repositories/`
- Middlewares in `middlewares/` (global) or `src/middlewares/` (request-scoped)

### File Naming

- Routes: `*.route.ts`
- Services: `*.services.ts`
- Repositories: `*.repo.ts`
- Middlewares: `*.middleware.ts` or descriptive name
- Utils: `*.utils.ts`

---

## Audit Middleware

The `auditMiddleware` in `middlewares/audit.ts` handles both:
1. Structured JSON logging (for SIEM ingestion)
2. Database write (for compliance records)

Both happen automatically when using the middleware:

```typescript
router.get("/list", 
  requireAuth(["READONLY", "ADMIN"]),
  auditMiddleware("LIST"),  // Logs + writes to DB
  handler
);
```

---

## Known Issues / TODOs

| Item | Status | Priority |
|------|--------|----------|
| Test suite (Jest) | Pending | High |
| CI/CD configuration | Pending | Medium |
| API documentation (OpenAPI) | Pending | Low |

---

## Related Projects

This project follows patterns from:
- `atlas-api-manager-kubernetes-admin-service` - CommonJS, ts-node-dev, structured logging

---

## When Making Changes

1. Update `TRACKER.md` with all changes
2. Follow existing code patterns
3. Use structured logging via `log()` function (never console.log)
4. Include requestId in all logs
5. Test with `npm run build && npm run start`
6. Ensure HTTPS works: `curl -k https://localhost:8443/health`
7. Check logs are valid JSON: `npm run start 2>&1 | jq .`

---

## Quick Reference

### Adding a new API endpoint

1. Create route handler in `src/routes/`
2. Add authentication with `requireAuth()`
3. Add audit logging with `auditMiddleware()`
4. Register route in `src/app.ts`
5. Update this file (AGENTS.md) with endpoint details

### Adding a new service

1. Create file in `src/services/`
2. Import logging: `import { log } from '../logging/logging'`
3. Log important operations with appropriate level
4. Throw errors (don't catch) - let global handler deal with them

### Adding a new middleware

1. Create in `middlewares/` if global, `src/middlewares/` if request-scoped
2. Include `requestId` in any logs
3. Call `next()` to continue chain
