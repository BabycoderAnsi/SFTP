# SFTP Gateway GUI

Next.js dashboard application for the SFTP Gateway service.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- **Authentication**: JWT-based login with role-based access
- **File Management**: Browse, upload, download files on SFTP server
- **User Management**: Manage users, roles, and permissions (admin only)
- **Real-time Logs**: Live stream of audit logs via Server-Sent Events
- **Dashboard**: Overview of file stats and recent activity

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zustand (state management)
- TanStack Query
- React Hook Form + Zod

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=https://localhost:8443
NEXT_PUBLIC_SSE_URL=https://localhost:8443/v1/logs/stream
```

## Project Structure

```
sftp-gui/
├── app/                    # Next.js app router pages
│   ├── (auth)/             # Authentication pages
│   ├── (dashboard)/        # Dashboard pages
│   └── layout.tsx          # Root layout
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── layout/             # Layout components (sidebar, header)
│   ├── files/              # File management components
│   ├── users/              # User management components
│   └── logs/               # Log streaming components
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions and API client
├── stores/                 # Zustand state stores
└── types/                  # TypeScript type definitions
```

## Roles and Permissions

| Role | Dashboard | Files | Users | Logs | Settings |
|------|-----------|-------|-------|------|----------|
| READ_ONLY | ❌ | List, Download | ❌ | Own | ❌ |
| READ_WRITE | ✅ | Full access | ❌ | Own | ❌ |
| ADMIN | ✅ | Full access | ✅ | All | ✅ |

## API Requirements

The GUI requires the following backend endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/auth/login` | User login |
| POST | `/v1/auth/refresh` | Refresh access token |
| POST | `/v1/auth/logout` | User logout |
| GET | `/v1/auth/me` | Get current user |
| GET | `/v1/files/list` | List files |
| GET | `/v1/files/download` | Download file |
| POST | `/v1/files/upload` | Upload file |
| POST | `/v1/files/mkdir` | Create directory |
| GET | `/v1/admin/users` | List users |
| PATCH | `/v1/admin/users/:id/status` | Update user status |
| PATCH | `/v1/admin/users/:id/role` | Update user role |
| GET | `/v1/logs/stream` | SSE log stream |
