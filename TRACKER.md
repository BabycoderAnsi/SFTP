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
- `server/auth/auth.routes.ts` - Fixed imports
- `server/auth/auth.service.ts` - Fixed imports
- `server/auth/jwt.utils.ts` - Fixed imports
- `server/middlewares/audit.ts` - Fixed imports
- `server/middlewares/requireAuth.ts` - Fixed imports
- `server/src/app.ts` - Fixed imports
- `server/src/db/prisma.ts` - Fixed imports, SSL config added
- `server/src/logging/logging.ts` - Fixed imports
- `server/src/middlewares/audit.ts` - Fixed imports
- `server/src/repositories/audit.repo.ts` - Fixed imports
- `server/src/repositories/user.repo.ts` - Fixed imports
- `server/src/routes/files.route.ts` - Fixed imports
- `server/src/server.ts` - Fixed imports
- `server/src/services/sftp.services.ts` - Fixed imports
- `server/src/types/express.d.ts` - Fixed imports

### New Dependencies Added

- `rimraf` - Cross-platform rm -rf for clean builds
- `ts-node-dev` - TypeScript development runtime with hot reload

### Configuration Changes

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "module": "commonjs",        // Changed from NodeNext
    "moduleResolution": "node",  // Changed from NodeNext
    "baseUrl": "."               // Added for cleaner imports
    // Removed: emitDeclarationOnly, allowImportingTsExtensions
  }
}
```

**package.json scripts:**
```json
{
  "build": "rimraf dist && tsc && cp -r src/generated dist/src/",
  "start": "node dist/src/server.js",
  "start:dev": "ts-node-dev --respawn --transpile-only src/server.ts"
}
```

### Result

- Build and start scripts work correctly
- Server runs on port 8443
- Health endpoint returns: `{"status":"ok","server":"SFTP Gateway"}`
- Project now follows Atlas pattern for TypeScript configuration
- Development branch merged into main with all fixes

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
