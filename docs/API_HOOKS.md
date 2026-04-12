# API Hooks

All hooks follow the same pattern: `useMemo` for stable service instantiation, React Query for caching, `onError` logging with `[hookName]` prefix. Errors are exposed via `query.error` / `mutation.error` for UI feedback.

---

## Shared Patterns

**Service instantiation** — stable per session, no per-render allocation:
```ts
const service = useMemo(() => createFooService(createApiClient(getToken)), [getToken])
```

**Cache invalidation vs reset**
- `invalidateQueries` — marks stale, background refetch when component mounted
- `resetQueries` — removes from cache, forces hard refetch (used only for `userProfile` after test submit)

**staleTime**

| Resource       | staleTime | Reason                        |
|----------------|-----------|-------------------------------|
| categories     | 30 min    | near-static config            |
| tests          | 10 min    | admin-only changes            |
| procedures     | 10 min    | admin-only changes            |
| blogPosts      | 5 min     | moderate update frequency     |
| completedTests | 5 min     | user-scoped                   |
| tags           | 5 min     | moderate                      |
| comments       | 2 min     | active discussion              |
| messages       | 2 min     | admin inbox                   |
| userProfile    | 0         | must always be fresh (score)  |

---

## Tests — `useTests` · `useCreateTest` · `useUpdateTest` · `useDeleteTest`

```ts
const { tests, isLoading, error } = useTests()
mutate({ data: TestData, category: string, categoryId?: number })   // create
mutate({ id: string, data: UpdateTestPayload })                      // update
mutate(id: string)                                                   // delete
```
All mutations invalidate `['tests']`. Payload types: `CreateTestPayload`, `UpdateTestPayload` in `types/dataTypes.ts`.

---

## Completed Tests — `useCompletedTests` · `useSubmitCompletedTest`

```ts
const { completedTests, isLoading, error } = useCompletedTests(userId)  // enabled: !!userId
mutate({ userId, score, testResult: FormattedAnswer[] })                 // submit
```
Submit invalidates `['completedTests', userId]` + resets `['userProfile', userId]` (score affects stats).  
Payload: `SubmitTestPayload` in `types/dataTypes.ts`.

---

## Categories — `useCategories` · `useCreateCategory` · `useUpdateCategory` · `useDeleteCategory`

```ts
const { categories, isLoading, error } = useCategories()
mutate({ name, description?, isActive? })           // create
mutate({ id: number, data: UpdateCategoryPayload }) // update
mutate(id: number)                                  // delete
```
All mutations invalidate `['categories']`. Payload types: `CreateCategoryPayload`, `UpdateCategoryPayload`.

---

## Tags — `useTags` · `useCreateTag` · `useUpdateTag` · `useDeleteTag`

```ts
const { tags, isLoading, error } = useTags()
mutate({ name, isActive? })                      // create
mutate({ id: number, data: UpdateTagPayload })   // update
mutate(id: number)                               // delete
```
All mutations invalidate `['tags']`. Payload types: `CreateTagPayload`, `UpdateTagPayload`.

---

## Procedures — `useProcedures`

```ts
const { procedures, isLoading, error } = useProcedures()
```
Read-only. `tags?: string[]` included (joined names from `procedureTags`). No mutation hooks yet — admin-managed via seed.

---

## Blog — `useBlogPosts` · `useCreatePost` · `useUpdatePost` · `useDeletePost`

```ts
const { posts, isLoading, error } = useBlogPosts()
mutate({ title, excerpt, content, date })                    // create → invalidates ['blogPosts']
mutate({ postId: string, data: Partial<PostFormData> })      // update → invalidates ['blogPosts'] + ['blogPost', postId]
mutate(postId: string)                                       // delete → invalidates ['blogPosts']
```
`PostFormData` lives in `services/blogService.ts`.

---

## Comments — `useComments` · `useAddComment` · `useUpdateComment` · `useDeleteComment`

```ts
const { comments, isLoading } = useComments(blogPostId, { enabled?: boolean })
mutate({ blogPostId, userId, content })               // add
mutate({ commentId, blogPostId, content })            // update — blogPostId for cache key only
mutate({ commentId, blogPostId })                     // delete — blogPostId for cache key only
```
Add/delete also invalidate `['blogPost', blogPostId]` (comment count on post detail).

---

## User — `useUserProfile` · `useUpdateProfile`

```ts
const { userProfile, isLoading, error } = useUserProfile(userId)   // staleTime: 0, retry: 2
mutate(patch: Partial<User>)                                         // merges with cached profile before PUT
```
`useUpdateProfile` reads current cache, merges patch, sends full object — avoids partial PUT to API.

---

## Messages — `useMessages` · `useSendMessage`

```ts
const { messages, isLoading, error } = useMessages()           // admin inbox
mutate({ email: string, message: string })                     // contact form → POST /messages
```
`useSendMessage` has no `onSuccess` invalidation — admin reads inbox on next visit.
