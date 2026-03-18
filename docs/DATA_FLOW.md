# WolfMed Data Flow

## Before (old)
```
Screen → JSON file (local) → display
```

## After (new)
```
Screen → hook → useQuery → service → apiClient → C# API → Neon PostgreSQL
```

---

## Full picture step by step

### 1. Screen renders
e.g. `procedures.tsx` calls `useProcedures()`

### 2. Hook (`hooks/useProcedures.ts`)
- Gets `getToken` from Clerk (`useAuth`)
- Calls `useQuery` with `queryKey: ['procedures']`
- React Query checks its cache first — if fresh, returns cached data immediately (no HTTP call)
- If stale/missing, runs `queryFn`

### 3. queryFn
```ts
const api = createApiClient(getToken)       // build the client
return createProceduresService(api).getAll() // GET /api/procedures
```

### 4. apiClient (`services/apiClient.ts`)
- Calls `getToken()` → Clerk returns a signed JWT
- Sends `fetch` to `API_BASE + path` with `Authorization: Bearer <jwt>`
- Throws on non-2xx, returns parsed JSON

### 5. API_BASE (`constants/apiConfig.ts`)
| Environment | URL |
|---|---|
| Android emulator (dev) | `http://10.0.2.2:5000/api` |
| iOS simulator (dev) | `http://localhost:5000/api` |
| Production | `https://wolfmed-api.azurewebsites.net/api` |

### 6. C# API (WolfmedAPI)
- Receives request
- Validates Clerk JWT (signature + expiry)
- MediatR routes to the correct Query/Command handler
- EF Core queries Neon PostgreSQL
- Returns JSON DTO

### 7. Back in the hook
- `useQuery` stores result in cache (stale after `staleTime`)
- Returns `{ data, isLoading, error }` to the screen

### 8. Screen re-renders with data

---

## Cache behaviour
- `staleTime` = how long data is considered fresh (no refetch)
- Tests/Procedures: 10 min (rarely change)
- Categories: 30 min (almost never change)
- Blog/CompletedTests/UserProfile: 5 min (change more often)
- On app refocus or manual `queryClient.invalidateQueries(key)` — refetches

---

## Auth flow
```
Clerk (sign in) → issues JWT → stored in SecureStore
                                      ↓
                          useAuth().getToken() reads it
                                      ↓
                          sent as Bearer token in every API request
                                      ↓
                          C# API validates → allows or 401
```

---

## What still uses local data (to be cleaned up in Part 12)
- `server/fetchData.ts` — no longer used by any hook
- `data/tests.json`, `data/procedures.json` — only used by seed scripts now
- `server/queries.ts` — direct Drizzle queries (old path, not called by new hooks)
