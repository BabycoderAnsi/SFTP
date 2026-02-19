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
