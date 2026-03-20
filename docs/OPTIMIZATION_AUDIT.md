# Optimization & Memory Leak Audit

Date: 2026-03-20
Scope: All custom hooks (`hooks/`), components (`components/`), stores (`store/`)

---

## Why This Was Done

RN apps accumulate memory leaks and performance bugs that are invisible at first but cause slowdowns, stale UI, and crashes as the app grows. The most common sources in this codebase were:
1. Animations started repeatedly without being stopped
2. Event listeners re-registered on every render
3. Incorrect React rendering patterns (inline functions in lists, missing `memo`)
4. Browser-only APIs (`localStorage`) used in RN code
5. Silent mutation failures with no error visibility

---

## Fix 1 — ExamCountdown.tsx (CRITICAL memory leak)

**File:** `components/ExamCountdown.tsx`

**Problem:**
```tsx
// BEFORE — called every second inside setInterval:
const timer = setInterval(() => {
  ...
  Animated.loop(pulse).reset()  // creates a NEW loop object each second
  pulse.start()                  // starts animation on top of existing one
}, 1000)
```
Every second, a new `Animated.loop()` instance was created AND the old one was never stopped. After 60 seconds there were 60 stacked animation objects running simultaneously. Over time this caused significant memory growth and jank.

**Fix:**
```tsx
// AFTER — animation started once, stopped in cleanup:
const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null)

useEffect(() => {
  const pulse = Animated.sequence([...])
  pulseLoopRef.current = Animated.loop(pulse)
  pulseLoopRef.current.start()  // start once

  const timer = setInterval(() => {
    // only update time state — no animation here
    setTimeLeft({...})
  }, 1000)

  return () => {
    clearInterval(timer)
    pulseLoopRef.current?.stop()  // clean up on unmount
  }
}, [examDate, pulseAnim])
```
The loop runs once and is properly stopped when the component unmounts or `examDate` changes.

---

## Fix 2 — FloatingShapes.tsx (stacking animations + position re-randomization)

**File:** `components/FloatingShapes.tsx`

**Problem 1 — stacking animations:**
```tsx
// BEFORE — useEffect runs again on colorScheme change:
React.useEffect(() => {
  opacity.value = withRepeat(...)   // NEW animation started on top of old
  rotation.value = withRepeat(...)  // OLD withRepeat still running
  ...
}, [index, colorScheme, opacity, rotation, scale, translateY])
```
When the user switched between dark/light mode, `colorScheme` changed, triggering the effect again. New `withRepeat` animations were stacked on top of still-running ones — each shape ended up with multiple competing animation drivers.

**Fix:**
```tsx
React.useEffect(() => {
  cancelAnimation(opacity)    // kill running animation before starting new
  cancelAnimation(rotation)
  cancelAnimation(translateY)
  cancelAnimation(scale)

  opacity.value = withRepeat(...)  // now safe to start fresh
  ...
}, [index, colorScheme, ...])
```

**Problem 2 — positions re-randomized on theme change:**
```tsx
// BEFORE:
const shapes = React.useMemo(() => {
  return Array.from({ length: count }, () => ({
    left: Math.random() * ...,   // new random position
    ...
  }))
}, [count, colorScheme])  // colorScheme dep causes re-randomization on theme toggle
```
Every theme change teleported all shapes to new random positions — jarring UX.

**Fix:** Remove `colorScheme` from `useMemo` deps. Positions only need to change when `count` changes.

---

## Fix 3 — useSearchTermStore.ts (CRITICAL crash in RN)

**File:** `store/useSearchTermStore.ts`

**Problem:**
```ts
storage: createJSONStorage(() => localStorage),  // localStorage does not exist in RN
```
`localStorage` is a browser API. In React Native there is no `window.localStorage`. This would throw `ReferenceError: localStorage is not defined` when the store initialized — crashing the app if this store was ever used.

**Additional finding:** The store was not imported anywhere in the mobile app (only referenced in CLAUDE.md). It's a leftover from the web version.

**Fix:** Removed the `persist` middleware entirely. The store still functions as in-memory Zustand state. If persistence is needed later, use `@react-native-async-storage/async-storage`.

---

## Fix 4 — LearningCard.tsx (FlatList re-render + UX issues)

**File:** `components/LearningCard.tsx`

**Problem 1 — inline renderItem:**
```tsx
// BEFORE:
<FlatList
  renderItem={({ item, index }) => (   // new function reference every render
    <LearningCardItem ... />
  )}
/>
```
React's `FlatList` uses referential equality to decide whether to re-render items. A new inline arrow function on every render means every item always re-renders, even if data didn't change.

**Fix:**
```tsx
const renderItem = useCallback(({ item, index }) => (
  <LearningCardItem ... />
), [showCorrectAnswer, colorScheme])  // only deps that actually affect the render
```

**Problem 2 — English button labels:**
```tsx
// BEFORE:
'Hide Answer' / 'Show Answer'

// AFTER:
'Ukryj odpowiedź' / 'Pokaż odpowiedź'
```
App language is Polish throughout. English labels were inconsistent.

**Problem 3 — wrong dark background color:**
```ts
// BEFORE: cardDark: { backgroundColor: '#333333' }
// AFTER:  cardDark: { backgroundColor: '#27272a' }  // matches design token
```

**Additional fix:** Added `scrollEnabled={false}` to the inner `FlatList` to prevent nested scroll conflicts (the card is already inside a ScrollView).

---

## Fix 5 — AnimatedAuthInput.tsx (unnecessary re-renders)

**File:** `components/AnimatedAuthInput.tsx`

**Problem:**
```tsx
// BEFORE:
const AnimatedAuthInput = forwardRef<TextInput, AnimatedAuthInputProps>(...)
```
`forwardRef` alone does not prevent re-renders when parent state changes. This component is rendered in `AuthForm` which updates state on every keypress (email/password fields). Without `memo`, both inputs re-render on every character typed in either one.

**Fix:**
```tsx
const AnimatedAuthInput = React.memo(forwardRef<TextInput, AnimatedAuthInputProps>(...))
```
`React.memo` wraps the forwarded ref component. Now an input only re-renders when its own props change (e.g. `hasError` flag, `isDark`).

---

## Fix 6 — useUserProfile.ts (debug logs + retry config)

**File:** `hooks/useUserProfile.ts`

**Problem 1 — production console.logs:**
```ts
console.log('[useUserProfile] fetching for userId:', userId)
console.log('[useUserProfile] result:', JSON.stringify(result))
```
Debug logs left in production code. `JSON.stringify(result)` on a user object serializes the entire response on every fetch — unnecessary CPU/memory work, and exposes user data in logs.

**Problem 2 — fixed retry delay:**
```ts
retryDelay: 1000,  // retries every 1 second regardless of attempt number
```
Fixed delay causes thundering-herd: if the API is overloaded, all retries fire at the same interval.

**Fix:**
```ts
retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
// attempt 0 → 1s, attempt 1 → 2s, attempt 2 → 4s (capped at 10s)
```
Exponential backoff gives the API time to recover.

---

## Fix 7 — QuickActions.tsx (AppState listener re-registration)

**File:** `components/QuickActions.tsx`

**Problem:**
```tsx
useEffect(() => {
  const subscription = AppState.addEventListener('change', (nextAppState) => {
    if (nextAppState === 'active') {
      setIsDarkMode(colorScheme === 'dark')  // colorScheme captured in closure
    }
  })
  return () => subscription.remove()
}, [colorScheme])  // fires on every theme change → removes + re-adds listener every time
```
The `[colorScheme]` dependency caused the AppState listener to be torn down and re-created on every theme change. While functionally correct (old subscription is properly removed), it's wasteful — the listener only needs to exist once for the component's lifetime.

**Fix:** Use a `ref` to always have access to the latest `colorScheme` without making it a dep of the AppState effect:
```tsx
const colorSchemeRef = useRef(colorScheme)

useEffect(() => {
  colorSchemeRef.current = colorScheme
}, [colorScheme])

useEffect(() => {
  const subscription = AppState.addEventListener('change', (nextAppState) => {
    if (nextAppState === 'active') {
      setIsDarkMode(colorSchemeRef.current === 'dark')  // always current, no stale closure
    }
  })
  return () => subscription.remove()
}, [])  // mount once
```

---

## Fix 8 — GradientOverlay.tsx (misleading useEffect deps)

**File:** `components/GradientOverlay.tsx`

**Problem:**
```tsx
useEffect(() => {
  opacity.value = withDelay(...)
  rotation.value = withRepeat(...)
  scale.value = withRepeat(...)
}, [opacity, rotation, scale])  // these are Reanimated shared values
```
Reanimated shared values (created by `useSharedValue`) are **stable object references** — they never change between renders, just like a `useRef`. Including them in the deps array implies they could change and trigger a re-run, which is misleading and incorrect. Eslint's exhaustive-deps rule flags this differently for shared values.

**Fix:**
```tsx
}, []) // shared values are stable refs — no deps needed
```
The effect now correctly runs once on mount.

---

## Fix 9 — useSubmitCompletedTest, useAddComment, useSendMessage, useUpdateProfile (silent failures)

**Files:**
- `hooks/useSubmitCompletedTest.ts`
- `hooks/useAddComment.ts`
- `hooks/useSendMessage.ts`
- `hooks/useUpdateProfile.ts`

**Problem:**
All four mutation hooks had no `onError` handler. A network error, 4xx, or 5xx response would silently fail — the user would see no feedback, and there would be no log to diagnose the issue.

**Fix:** Added `onError` handler to all four:
```ts
onError: (error) => {
  console.error('[hookName]', error)
},
```
This is a minimum viable fix. The next step (per APP_PLAN.md Part 10) is to surface these errors to the user via a toast or inline message.

---

## Summary Table

| File | Issue | Severity | Fix |
|---|---|---|---|
| `components/ExamCountdown.tsx` | New animation object created every second, never stopped | Critical | Start loop once via ref, stop in cleanup |
| `components/FloatingShapes.tsx` | Animations stacked on theme change, positions re-randomized | High | `cancelAnimation` before restart, remove colorScheme from positions memo |
| `store/useSearchTermStore.ts` | `localStorage` used in RN — crashes on use | Critical | Remove persist middleware |
| `components/LearningCard.tsx` | Inline FlatList renderItem, English labels, wrong dark bg | Medium | `useCallback`, Polish labels, `#27272a` bg |
| `components/AnimatedAuthInput.tsx` | Missing `React.memo` — re-renders on every parent keystroke | Medium | Wrap with `React.memo` |
| `hooks/useUserProfile.ts` | Debug logs in production, fixed retry delay | Low | Remove logs, exponential backoff |
| `components/QuickActions.tsx` | AppState listener re-registered on every theme change | Low | `colorSchemeRef` + stable `[]` deps |
| `components/GradientOverlay.tsx` | Shared values in useEffect deps — misleading, not a bug | Low | Change to `[]` |
| `hooks/useSubmitCompletedTest.ts` | Silent mutation failure | Medium | Add `onError` |
| `hooks/useAddComment.ts` | Silent mutation failure | Medium | Add `onError` |
| `hooks/useSendMessage.ts` | Silent mutation failure | Medium | Add `onError` |
| `hooks/useUpdateProfile.ts` | Silent mutation failure | Medium | Add `onError` |

---

## What Was NOT Changed (and why)

- **useDashboardAnimation.ts** — `useEffect` deps `[isCircleExpanded]` and `[isMinimized]` are correct primitives. When they change, the new animation correctly overrides the running one via Reanimated's animation queue. No issue.
- **DashboardCircle.tsx** — `renderMenuItems` as `useCallback` returning JSX is an anti-pattern but causes no leak. Left as-is to minimize blast radius.
- **QuickStats.tsx** — `positions` memo with `[]` deps is intentional. Shared values must not be re-created, they are keyed by static card IDs.
- **useAuth.ts** — `createApiClient(getToken)` called inside async functions, not during render. No re-render issue.
- **ProfilePreview.tsx** — Clean component, no issues. Passes empty strings as defaults which is correct RN behavior.
- **useDashboardGesture.ts** — Gesture handlers are worklets. `cancelAnimation` is called in `onBegin`. No cleanup needed — Reanimated handles shared value lifecycle.

---

## How to Revert Any Fix

Each fix is a targeted edit. To revert a specific fix:
1. The original code is documented above in each "Problem" section
2. Use `git diff` to see exact line changes per file
3. Use `git checkout <file>` to revert a single file if a fix causes regression
