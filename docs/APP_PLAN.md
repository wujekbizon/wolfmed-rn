# WolfMed RN — App Layout & API Wiring Plan

## Context
The app has navigation structure and many components in place but most screens use hardcoded data or are empty. The C# API is live (Part 9 done). This plan wires every screen to real API data, removes dead code, builds missing screens (blog, contact), and fixes broken flows (test submission, profile editing).

---

## Current State Summary

### Working ✓
- Auth (Clerk sign-in/sign-up)
- Drawer navigation + circular dashboard nav
- Procedures screen + detail (API-wired)
- Questions screen (API-wired, read-only)

### Broken / Hardcoded / Empty ✗
- `hooks/useAuth.ts` — uses old Clerk API (`setActive`, `isLoaded`) — **broken with @clerk/expo v3**
- `blog.tsx` — empty placeholder
- `forum.tsx` — empty placeholder (repurposing)
- `quizes.tsx` + `QuizzesScreen.tsx` — both empty, removing
- `ProfilePreview` — hardcoded dummy user data
- `QuickStats` — hardcoded stat values
- `tests.tsx` — test flow exists but never saves completed test to API
- `tests-procedures.tsx` — 2 hardcoded cards only
- `NewsFeed` — hardcoded news items constant

---

## Part 0 — Fix Auth Hook + User Sync (do this first)

### 0.1 — Rewrite `hooks/useAuth.ts` for Clerk v3

**Breaking change in `@clerk/expo` v3:** `useSignIn()` and `useSignUp()` no longer return `setActive` or `isLoaded`. New return: `{ signIn, errors, fetchStatus }`.

**New API pattern:**
```ts
// OLD (broken)
const { signIn, setActive, isLoaded } = useSignIn()
await setActive({ session: signInAttempt.createdSessionId })

// NEW (v3)
const { signIn, fetchStatus } = useSignIn()
await signIn.finalize({ navigate: ({ decorateUrl }) => router.replace(decorateUrl('/') as any) })
```

**Changes needed in `hooks/useAuth.ts`:**
- `useSignIn()` → destructure `{ signIn, fetchStatus: signInFetchStatus }`
- `useSignUp()` → destructure `{ signUp, fetchStatus: signUpFetchStatus }`
- Replace `isLoaded` guards → use `fetchStatus === 'idle'`
- Replace `signUp.prepareEmailAddressVerification()` → `signUp.verifications.sendEmailCode()`
- Replace `signUp.attemptEmailAddressVerification({ code })` → `signUp.verifications.verifyEmailCode({ code })`
- Replace `setSignInActive({ session: id })` → `signIn.finalize()`
- Replace `setSignUpActive({ session: id })` → `signUp.finalize()`
- `createdUserId` available after `status === 'complete'`: `signUp.createdUserId`
- `createdSessionId` still available on signUp object if needed

### 0.2 — User Sync: client-side upsert (Option A)

**Flow:**
1. User completes sign-up → `signUp.status === 'complete'` → `signUp.createdUserId` available
2. Before calling `finalize()`, call `POST /api/users` with:
   ```json
   { "userId": "<createdUserId>", "username": "User-<random8>", "motto": "<randomMotto>" }
   ```
3. Same for OAuth sign-up: `oauthSignUp.createdUserId` already checked on existing line 102
4. **Sign-in (returning user):** call `GET /api/users/{userId}` after `finalize()` — if `404` call `POST /api/users` as fallback (handles edge case where user exists in Clerk but not in DB)

**Random username/motto generation:**
- Add `lib/helpers/generateUserDefaults.ts`:
  - `generateRandomUsername()` → `"User-" + Math.random().toString(36).slice(2,10)`
  - `generateRandomMotto()` → port from web app (array of Polish motivational phrases, pick random)

**API call in hook:**
- Use `createApiClient` + `createUserService` (already exist in `services/`)
- For sign-up: no Clerk token yet, but `POST /api/users` can be public endpoint on C# side
- For sign-in fallback: use `getToken` from `useAuth()`

**`services/userService.ts`** — add:
```ts
upsert: (data: { userId: string; username: string; motto: string }) =>
  api.post<User>('/users', data)
```
> Note: C# API needs `POST /api/users` to be an upsert (insert if not exists) — verify this works or add endpoint

### 0.3 — Handle loading state in profile screens
- `useUserProfile` query: add `retry: 2, retryDelay: 1000` for webhook-delay edge case
- `ProfilePreview` and `QuickStats`: show skeleton/`LoadingSpinner` when `userProfile === undefined`

---

## Part 1 — Navigation Cleanup

### 1.1 Remove quizzes
- Delete `app/(tabs)/(dashboard)/(drawer)/(learn)/quizes.tsx`
- Delete `app/(tabs)/(dashboard)/(drawer)/(learn)/QuizzesScreen.tsx`
- Remove `quizes` Stack.Screen from `app/(tabs)/(dashboard)/(drawer)/(learn)/_layout.tsx`
- Remove quizzes card from `constants/learningMaterials.ts` (only show Baza pytań + Procedury)

### 1.2 Forum tab → Kontakt
- Rename/replace `app/(tabs)/forum.tsx` with Contact/Messages form
- Update `app/(tabs)/_layout.tsx`: change label `"Forum"` → `"Kontakt"`, icon to `mail-outline`

---

## Part 2 — Mutation Hooks (needed by Parts 3–5)

Create hooks in `hooks/` using `useMutation` from React Query + `useAuth` from `@clerk/expo`:

### 2.1 `hooks/useUpdateProfile.ts`
- `mutationFn`: PUT `/api/users/{userId}` — accepts full user object `{ userId, username, motto, testLimit, supporter }`
- Fetch current `userProfile` first, then merge the changed field and send full object
- Update `services/userService.ts`: add `update(userId, data: Partial<User>)` method
- On success: `queryClient.invalidateQueries(['userProfile', userId])`

### 2.2 `hooks/useSubmitCompletedTest.ts`
- `mutationFn`: POST `/api/completedtests` with `{ userId, score, testResult }`
- On success: `queryClient.invalidateQueries(['completedTests', userId])`
- Add `createCompletedTestsService(api).create(data)` — already defined in service

### 2.3 `hooks/useSendMessage.ts`
- `mutationFn`: POST `/api/messages` with `{ email, message }`
- Uses `createMessagesService(api).send(email, message)` — already defined
- No auth required (public endpoint)

### 2.4 `hooks/useAddComment.ts`
- `mutationFn`: POST `/api/comments` with `{ blogPostId, userId, content }`
- On success: `queryClient.invalidateQueries(['blogPost', blogPostId])`
- Add `createCommentsService(api)` in `services/commentsService.ts` → `POST /api/comments`

---

## Part 3 — Profile & Stats (Real Data)

### 3.1 Wire `ProfilePreview` to API
File: `components/ProfilePreview.tsx`
- Add `const { userId } = useAuth()` (from `@clerk/expo`)
- Add `const { userProfile, isLoading } = useUserProfile(userId ?? undefined)`
- Replace hardcoded `{ username: 'User123', motto: 'Learning every day' }` with `{ username: userProfile?.username ?? '', motto: userProfile?.motto ?? '' }`
- Pass `userId` down to `UsernameForm` and `MottoForm` so they can call `useUpdateProfile`

### 3.2 Wire `UsernameForm` to API mutation
File: `components/UsernameForm.tsx`
- Accept `userId` prop
- On valid submit: call `useUpdateProfile` mutation with `{ username: value }`
- Show loading state on button while mutating

### 3.3 Wire `MottoForm` to API mutation
File: `components/MottoForm.tsx`
- Same pattern as UsernameForm
- On valid submit: call `useUpdateProfile` mutation with `{ motto: value }`

### 3.4 Wire `QuickStats` to real data
File: `components/QuickStats.tsx`
- Add `const { userId } = useAuth()`
- Add `const { userProfile } = useUserProfile(userId ?? undefined)`
- Map real fields to stat cards:
  - `testsAttempted` → "Testy ukończone"
  - `totalScore` / `totalQuestions` → percentage score "Wynik ogólny"
  - `totalQuestions` → "Pytania odpowiedziane"
  - `supporter` → show/hide supporter badge

---

## Part 4 — Test Submission Flow

File: `app/(tabs)/(dashboard)/(drawer)/tests.tsx`

### 4.1 Track user answers
- Add local state `answers: Record<string, string>` — key=questionId, value=selected option
- Pass answer setter down to `TestCard`
- `TestCard` currently accepts `formState` — extend to call `onAnswer(questionId, answer)`

### 4.2 Submit completed test
- On "Prześlij Test" press:
  1. Calculate score: count correct answers
  2. Format `testResult: Array<{ questionId, answer: boolean }>`
  3. Call `useSubmitCompletedTest` mutation
  4. On success: show score summary (modal or inline), reset test state

### 4.3 Score summary
- Simple inline result view after submission:
  - Show `score / total` correct
  - "Spróbuj ponownie" → reset
  - "Wróć do menu" → `setIsTest(false)`

---

## Part 5 — Blog Tab

Convert `app/(tabs)/blog.tsx` to a stack navigator directory.

### 5.1 New structure
```
app/(tabs)/blog/
├── _layout.tsx       ← Stack navigator
├── index.tsx         ← Post list
└── [id].tsx          ← Post detail + comments
```

> **Note:** Rename `blog.tsx` → `blog/index.tsx`, add `blog/_layout.tsx` (Stack), add `blog/[id].tsx`

### 5.2 `blog/index.tsx` — Post list
- Use `useBlogPosts()` hook
- Render `FlatList` of `BlogPostCard` components
- On press → navigate to `blog/[id]`
- Loading state via `LoadingSpinner`

### 5.3 New component: `components/BlogPostCard.tsx`
- Props: `post: Post`, `onPress: () => void`
- Shows: title, excerpt, date
- Styled with BlurView (match existing card style)

### 5.4 `blog/[id].tsx` — Post detail + comments
- Get `id` from `useLocalSearchParams`
- Fetch single post: `createBlogService(api).getById(id)` → wrap in `useQuery(['blogPost', id])`
- API returns: `{ id, title, date, excerpt, content, commentCount, createdAt, updatedAt }` — no comments array
- Show full `content` in `ScrollView`
- Show "X komentarzy" count below content
- Add comment form below (TextInput + submit):
  - Auth required: get `userId` from `useAuth()`
  - On submit → `useAddComment` mutation → POST `/api/comments` with `{ blogPostId, userId, content }`
  - On success: `queryClient.invalidateQueries(['blogPost', id])` to update count, clear input, show inline "Dodano komentarz!" confirmation
- No comments list (GET /api/comments not defined in integration plan)

### 5.5 New service: `services/commentsService.ts`
```typescript
export const createCommentsService = (api: ApiClient) => ({
  create: (data: { blogPostId: string; userId: string; content: string }) =>
    api.post<Comment>('/comments', data),
})
```

---

## Part 6 — Contact Tab

File: `app/(tabs)/forum.tsx` (replacing content)

### 6.1 Contact form screen
- Two fields: `email` (TextInput, prefilled from Clerk user email if signed in), `message` (multiline TextInput)
- Zod validation: email format, message min 10 chars (add to `lib/validations/`)
- Submit button → calls `useSendMessage` mutation
- Success: show "Wiadomość wysłana!" confirmation, clear form
- Loading/error states on button

---

## Part 7 — Cleanup

### 7.1 Remove dead server-side code
- Delete `server/fetchData.ts` — no longer used
- Delete `server/queries.ts` — replaced by API calls
- Keep `server/db/schema.ts` + `server/db/populateDb.ts` — still needed for `pnpm db:push` / `pnpm db:seed`
- Keep `server/db.ts` — used for Clerk webhook user sync (insertUserToDb etc.)

### 7.2 Remove unused constants
- Remove quizzes entry from `constants/learningMaterials.ts`
- `constants/newsItems.ts` — keep for now (NewsFeed uses it, real news API not in scope)

### 7.3 Clean up types
- `types/forumPostsTypes.ts` — delete (forum removed)
- `types/chatTypes.ts` — check if used anywhere, delete if not

---

## Critical Files

| File | Action |
|---|---|
| `app/(tabs)/forum.tsx` | Replace with Contact form |
| `app/(tabs)/blog.tsx` | Convert to `blog/` directory with Stack |
| `app/(tabs)/_layout.tsx` | Update Forum tab label + icon |
| `app/(tabs)/(dashboard)/(drawer)/tests.tsx` | Add answer tracking + submission |
| `app/(tabs)/(dashboard)/(drawer)/(learn)/_layout.tsx` | Remove quizzes screen |
| `components/ProfilePreview.tsx` | Wire to useUserProfile |
| `components/UsernameForm.tsx` | Add userId prop + mutation |
| `components/MottoForm.tsx` | Add userId prop + mutation |
| `components/QuickStats.tsx` | Wire to useUserProfile stats |
| `services/commentsService.ts` | Create new |
| `hooks/useUpdateProfile.ts` | Create new |
| `hooks/useSubmitCompletedTest.ts` | Create new |
| `hooks/useSendMessage.ts` | Create new |
| `hooks/useAddComment.ts` | Create new |
| `components/BlogPostCard.tsx` | Create new |

---

## UI/UX — Native Feel Requirement

All new screens and components must feel native, consistent with existing app style:
- **Animations**: Use Reanimated (`withSpring`, `withTiming`) for any transitions — no JS-thread animations
- **Haptics**: `expo-haptics` on all button presses (match `MinimizedProcedureCard` pattern)
- **Cards**: BlurView with `intensity={80}` + `tint` based on colorScheme (match `ProfileHeader` style)
- **Inputs**: Styled with colored border + `borderRadius` (match `UsernameForm` TextInput style)
- **Loading**: Use existing `LoadingSpinner` component, never plain `ActivityIndicator`
- **Colors**: Use `useColorScheme()` + `themeColors` pattern from existing components
- **Lists**: `FlatList` with `removeClippedSubviews`, `maxToRenderPerBatch=10` (match `TestList`)
- **No modals** for simple results — use inline animated views (`formHeight` expand pattern from `UsernameForm`)
- **Gestures**: swipe-to-dismiss on expandable forms (match existing pan gesture pattern in `UsernameForm`)

---

## Reuse — Existing Patterns

- All mutation hooks follow same pattern as query hooks: `createApiClient(getToken)` + service factory
- `useMutation` from `@tanstack/react-query` with `onSuccess: queryClient.invalidateQueries`
- BlurView card style from `ProfileHeader.tsx` — reuse for `BlogPostCard`
- Zod + Polish error messages pattern from `lib/validations/auth.ts` — extend for contact form
- `LoadingSpinner` component for all loading states
- `useAuth()` from `@clerk/expo` for `getToken` + `userId`

---

## Verification

1. **Profile**: Sign in → open drawer → Panel → see real username/motto → edit username → confirm API updates (check Neon)
2. **Stats**: QuickStats cards show real testsAttempted / score from API
3. **Tests**: Complete a test → "Prześlij" → score shown → check `wolfmed_mobile_completed_tests` in Neon
4. **Blog**: Blog tab → post list loads → tap post → full content + comments → add comment → appears in list
5. **Contact**: Kontakt tab → fill form → submit → check `wolfmed_mobile_messages` in Neon
6. **Quizzes removed**: Learning center shows only 2 cards (Baza pytań, Procedury)
7. Run `pnpm lint` — no new errors

---

## Corner Cases (handle later)

### Auth / User Sync
- `syncUserToDb` failure: user exists in Clerk but not in DB — broken state. Needs retry logic + fallback sign-out if all retries fail.
- OAuth sign-in returning user: `POST /api/users` is upsert so safe, but if API is down the user lands in app with no DB record.
- Sign-in for user that exists in Clerk but not in DB (edge case: manually deleted from Neon). Currently no fallback — needs `GET /api/users/{userId}` 404 check after sign-in + trigger upsert.
- Token expiry during `syncUserToDb`: `getToken()` may return null if called too quickly after `finalize()`. Needs small retry delay.

### General Error Handling
- API down / network offline: all React Query hooks fail silently — needs global error boundary or offline indicator.
- Clerk token refresh failure: `getToken()` returns null — API calls get 401 — needs graceful handling (prompt re-login).
- Zod validation errors not covering all Clerk error codes — `handleAuthError` may return `{}` for unknown errors leaving user with no feedback.

---

## Unresolved questions
- Does `/api/users/{userId}` accept `{ motto }` in PUT body, or is there a separate endpoint? (plan assumes same PUT endpoint handles both username and motto)
- `blog/[id].tsx` needs single post fetch — check if C# API has `GET /api/blogposts/{id}` returning comments array (plan assumes yes per integration plan Part 7)
