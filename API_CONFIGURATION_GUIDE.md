# API Configuration Guide

## Overview
All API requests in the frontend now use the centralized configuration from `lib/api/config.ts`. This ensures consistent API base URL usage across development and production environments.

## Environment Variable

Set the following in your `.env.local` or `.env` file:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api
```

For production:
```env
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api
```

## Usage

### In API Route Files (Server-Side)

```typescript
import { getApiBaseUrl } from "@/lib/api/config"

const API_BASE_URL = getApiBaseUrl()
// Use API_BASE_URL for all API calls
```

### In Component Files (Client-Side)

```typescript
const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "/api"
// Or use the centralized config:
import { getApiBaseUrl } from "@/lib/api/client"
const apiBase = getApiBaseUrl()
```

### For Storage URLs

```typescript
import { getStorageUrl } from "@/lib/api/config"

const storageUrl = getStorageUrl()
// Returns: http://127.0.0.1:8000/storage (or your configured URL)
```

## Centralized Configuration

The `lib/api/config.ts` file provides:

- `getApiBaseUrl()` - Returns API base URL (with /api suffix)
- `getApiUrl()` - Returns API URL without /api suffix
- `getStorageUrl()` - Returns storage URL for file access
- `API_BASE_URL` - Constant export for convenience
- `API_URL` - Constant export for API URL
- `STORAGE_URL` - Constant export for storage URL

## Files Updated

All API route files have been updated to use the centralized configuration:

- ✅ All `/app/api/**/route.ts` files
- ✅ `next.config.mjs` (rewrite configuration)
- ✅ Component files with hardcoded URLs
- ✅ Middleware configuration

## Migration Checklist

- [x] Created `lib/api/config.ts` utility
- [x] Updated all API route files
- [x] Updated `next.config.mjs` rewrites
- [x] Updated component files
- [x] Updated storage URL references

## Notes

- The `NEXT_PUBLIC_` prefix is required for environment variables to be accessible in the browser
- All hardcoded URLs have been replaced with environment variable references
- The configuration automatically handles trailing slashes
- Default fallback is `http://127.0.0.1:8000/api` for development

## Testing

After setting `NEXT_PUBLIC_API_BASE_URL` in your `.env` file:

1. Restart your Next.js development server
2. Verify API calls use the configured URL
3. Check browser network tab to confirm correct API endpoints

