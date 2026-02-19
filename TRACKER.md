# Project Change Tracker

This document tracks all changes, fixes, and improvements made to the SFTP Gateway project.

---

## [2026-02-19] README.md Corrections

### Issues Fixed

| # | Issue | Location | Fix Applied |
|---|-------|----------|-------------|
| 1 | Architecture diagram had broken formatting with escaped characters (`\|`, `\`) | Section: Architecture | Replaced with proper ASCII diagram using code block |
| 2 | File extensions showed `.js` instead of `.ts` | Section: Project Structure | Updated all extensions to `.ts` (TypeScript) |
| 3 | Role names incorrect (`READ_ONLY`, `READ_WRITE`) | Section: Authorization | Updated to match codebase: `READONLY`, `WRITEONLY`, `ADMIN` |
| 4 | Folder structure incorrect - `auth/` shown inside `src/` | Section: Project Structure | Moved `auth/` to server root level |
| 5 | Folder structure incorrect - `middleware/` instead of `middlewares/` | Section: Project Structure | Corrected to `middlewares/` |
| 6 | Missing `certs/` directory in structure | Section: Project Structure | Added `certs/` with `cert.pem`, `key.pem` |
| 7 | Missing `src/types/` directory in structure | Section: Project Structure | Added `types/index.ts` |
| 8 | File naming inconsistency (`files.routes.js` vs `files.route.ts`) | Section: Project Structure | Corrected to match actual: `files.route.ts` |
| 9 | File naming inconsistency (`sftp.service.js` vs `sftp.services.ts`) | Section: Project Structure | Corrected to match actual: `sftp.services.ts` |
| 10 | Trailing backslashes in prose sections | Multiple lines | Removed escaped backslashes |
| 11 | Trailing backslash in Author section | Section: Author | Removed escaped backslash |

### Files Modified

- `README.md` - Comprehensive corrections to reflect actual project structure

---

## [2026-02-19] Build & Start Script Fixes

### Issues Fixed

| # | Issue | Location | Fix Applied |
|---|-------|----------|-------------|
| 1 | `tsconfig.json` had `emitDeclarationOnly: true` preventing JS generation | server/tsconfig.json | Removed `emitDeclarationOnly` and `allowImportingTsExtensions` options |
| 2 | `package.json` start script referenced `.ts` file instead of `.js` | server/package.json | Changed `node dist/src/server.ts` to `node dist/src/server.js` |
| 3 | All imports used `.ts` extensions (incompatible with NodeNext module resolution) | All *.ts files | Replaced `.ts` extensions with `.js` in all import statements |
| 4 | Prisma generated client not copied to dist folder | server/package.json | Updated build script: `tsc && cp -r src/generated dist/src/` |

### Files Modified

- `server/tsconfig.json` - Removed `emitDeclarationOnly` and `allowImportingTsExtensions`
- `server/package.json` - Fixed start script path, added Prisma copy to build script
- `server/auth/*.ts` - Changed import extensions from `.ts` to `.js`
- `server/middlewares/*.ts` - Changed import extensions from `.ts` to `.js`
- `server/src/**/*.ts` - Changed import extensions from `.ts` to `.js`

### Result

- `npm run build` now successfully compiles TypeScript to JavaScript
- `npm run start` now successfully runs the server on port 8443
- Health endpoint returns: `{"status":"ok","server":"SFTP Gateway"}`

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
