# Wolfmed — Full Integration Plan
## React Native (Expo) + C# .NET 10 CQRS API + Neon PostgreSQL

> **Goal:** Extend the existing Wolfmed RN app with a proper C# .NET 10 backend
> using CQRS (Vertical Slice Architecture with MediatR), connected to the existing
> Neon PostgreSQL database, running in Docker locally, optionally deployed to Azure.

---

## Stack Summary

| Layer | Technology |
|---|---|
| Mobile App | React Native + Expo SDK (latest) |
| Routing | Expo Router (file-based) |
| Auth | Clerk (JWT issued to RN, validated by C# API) |
| API Backend | C# .NET 10 Web API |
| Architecture | CQRS — Vertical Slice (MediatR) |
| Validation | FluentValidation |
| Database ORM (C#) | Entity Framework Core 10 + Npgsql |
| Database ORM (RN) | Drizzle ORM (schema management only) |
| Database | Neon PostgreSQL (existing) |
| Containerization | Docker + docker-compose |
| Deployment | Azure App Service (Free F1 tier) |

---

## Current Database State

6 existing tables (all prefixed `wolfmed_mobile_`):

| Table | Notes |
|---|---|
| `wolfmed_mobile_users` | UUID PK, Clerk `userId` as FK anchor |
| `wolfmed_mobile_tests` | UUID PK, `category` is plain varchar ("medical"), `data` is jsonb |
| `wolfmed_mobile_procedures` | UUID PK, `data` is jsonb |
| `wolfmed_mobile_completed_tests` | UUID PK, FK → users.userId, `testResult` jsonb |
| `wolfmed_mobile_blog_posts` | UUID PK |
| `wolfmed_mobile_messages` | serial (int) PK |

**Important notes:**
- All 664 tests currently have `category = "medical"` (only one value exists)
- 31 procedures exist with Polish medical content
- `wolfmed_mobile_messages` is the only table with an integer PK (serial)
- Drizzle ORM owns and manages the schema — EF Core will only **read/write**, never migrate existing tables

---

## Academic Requirements Mapping

| Requirement | Implementation |
|---|---|
| Full CRUD on 6+ complex tables | 9 entities, each with full CRUD via CQRS |
| 2–3 one-to-many relationships | Category→Tests, User→CompletedTests, BlogPost→Comments |
| 1 many-to-many relationship | Procedure ↔ Tag via ProcedureTag join table |
| CQRS pattern | MediatR Vertical Slice — full guide implementation |
| Docker | Dockerfile + docker-compose for C# API |

---

## Final Entity List (9 classes)

### Existing → Mapped to C# (6)

```
User              wolfmed_mobile_users
Test              wolfmed_mobile_tests
Procedure         wolfmed_mobile_procedures
CompletedTest     wolfmed_mobile_completed_tests
BlogPost          wolfmed_mobile_blog_posts
Message           wolfmed_mobile_messages
```

### New → Created via Drizzle, then mapped in C# (3)

```
Category          wolfmed_mobile_categories      (normalizes Test.category)
Tag               wolfmed_mobile_tags            (labels for procedures)
Comment           wolfmed_mobile_comments        (comments on blog posts)
ProcedureTag      wolfmed_mobile_procedure_tags  (join table — many:many)
```

### Relationships

```
Category    1 ──── many    Test             (categoryId FK on tests)
User        1 ──── many    CompletedTest    (userId FK — already exists)
BlogPost    1 ──── many    Comment          (blogPostId FK)
Procedure   many ── many   Tag              (via ProcedureTag join table)
```

---

## Part 0 — Dependency Updates

### 0.1 — Update Expo & React Native

> Do this first before any other changes. Updating dependencies on top of other
> in-progress changes causes hard-to-debug conflicts.

- [ ] Check current versions: `pnpm list expo react-native react`
- [ ] Check latest stable Expo SDK: `npx expo install expo@latest`
- [ ] Run Expo upgrade tool: `npx expo install --fix`
- [ ] Run doctor to verify all packages are compatible: `npx expo-doctor`
- [ ] Fix any peer dependency warnings reported by expo-doctor
- [ ] Update remaining outdated packages: `pnpm update --latest`
- [ ] Run the app and verify nothing is broken: `pnpm start`
- [ ] Test on Android emulator: `pnpm android`
- [ ] Test on iOS simulator: `pnpm ios`
- [ ] Commit: `chore: update Expo SDK and dependencies to latest`

### 0.2 — Verify Node & pnpm versions

- [ ] Confirm Node.js ≥ 20 LTS: `node -v`
- [ ] Confirm pnpm is up to date: `pnpm -v` / `npm install -g pnpm@latest`

---

## Part 1 — Database Schema Extension (Drizzle / RN)

> **Rule:** Drizzle is the single source of truth for the database schema.
> EF Core (C# side) will connect to what Drizzle creates — no EF migrations
> will be run against existing tables.

### 1.1 — Update `server/db/schema.ts`

- [ ] Add `categories` table:
  - `id` serial PK
  - `name` varchar(256) NOT NULL
  - `description` varchar(512)
  - `isActive` boolean DEFAULT true NOT NULL

- [ ] Add `tags` table:
  - `id` serial PK
  - `name` varchar(256) NOT NULL
  - `isActive` boolean DEFAULT true NOT NULL

- [ ] Add `procedure_tags` table (join):
  - `procedureId` uuid NOT NULL FK → procedures.id (cascade delete)
  - `tagId` integer NOT NULL FK → tags.id (cascade delete)
  - Composite PK: `(procedureId, tagId)`

- [ ] Add `comments` table:
  - `id` uuid PK defaultRandom
  - `blogPostId` uuid NOT NULL FK → blog_posts.id (cascade delete)
  - `userId` varchar(256) NOT NULL FK → users.userId (cascade delete)
  - `content` text NOT NULL
  - `createdAt` timestamp defaultNow NOT NULL
  - `updatedAt` timestamp

- [ ] Modify `tests` table — add new column:
  - `categoryId` integer NULLABLE FK → categories.id
  - **Keep** the existing `category` varchar column — do NOT remove it yet
  - The `category` varchar stays as a safety fallback during migration
  - It will be removed in a later step after `categoryId` is fully populated

### 1.2 — Push schema to Neon

- [ ] Ensure `.env` file has `NEON_DATABASE_URL` set correctly
- [ ] Run: `pnpm db:push`
- [ ] Confirm output shows all new tables created and `tests` table altered
- [ ] Open Neon console → verify 5 new/modified tables appear:
  - `wolfmed_mobile_categories`
  - `wolfmed_mobile_tags`
  - `wolfmed_mobile_procedure_tags`
  - `wolfmed_mobile_comments`
  - `wolfmed_mobile_tests` now has `categoryId` column

### 1.3 — Create seed data files in `/data`

**`data/categories.json`**
```json
[
  { "id": 1, "name": "Pielęgnacja", "description": "Procedury pielęgnacyjne" },
  { "id": 2, "name": "Diagnostyka", "description": "Procedury diagnostyczne" },
  { "id": 3, "name": "Farmakologia", "description": "Podawanie leków i tlenoterapia" },
  { "id": 4, "name": "Ratownictwo Medyczne", "description": "Procedury ratownicze" },
  { "id": 5, "name": "medical", "description": "Pytania testowe — ogólne" }
]
```
> Note: "medical" gets id=5 to match all 664 existing tests via `category` string.

**`data/tags.json`**
```json
[
  { "id": 1,  "name": "Stoma" },
  { "id": 2,  "name": "Gastrostomia" },
  { "id": 3,  "name": "Insulinoterapia" },
  { "id": 4,  "name": "Farmakologia" },
  { "id": 5,  "name": "Nebulizacja" },
  { "id": 6,  "name": "Pomiary Vitalne" },
  { "id": 7,  "name": "Pobranie Materiałów" },
  { "id": 8,  "name": "Opatrunki" },
  { "id": 9,  "name": "Tlenoterapia" },
  { "id": 10, "name": "Dostęp Dożylny" },
  { "id": 11, "name": "Higiena" },
  { "id": 12, "name": "Transport Pacjenta" },
  { "id": 13, "name": "Żywienie" },
  { "id": 14, "name": "Kał i Mocz" }
]
```

**`data/procedureTags.json`**
Map each of the 31 procedure UUIDs to relevant tag IDs:
```json
[
  { "procedureId": "001d29de-5728...", "tagId": 1 },
  { "procedureId": "001d29de-5728...", "tagId": 8 },
  ...
]
```
> Complete this mapping manually. Each procedure should have 1–3 tags.
> Procedure list (31 total) is in `data/procedures.json` — use `data.name` to decide tags.

- [ ] Create `data/categories.json`
- [ ] Create `data/tags.json`
- [ ] Create `data/procedureTags.json` — map all 31 procedures to tags

### 1.4 — Update `server/db/populateDb.ts`

- [ ] Add `populateCategories()`:
  - Read `data/categories.json`
  - Insert into `wolfmed_mobile_categories`
  - Use `onConflictDoNothing()` to make it safe to re-run

- [ ] Add `populateTags()`:
  - Read `data/tags.json`
  - Insert into `wolfmed_mobile_tags`
  - Use `onConflictDoNothing()`

- [ ] Add `populateProcedureTags()`:
  - Read `data/procedureTags.json`
  - Insert into `wolfmed_mobile_procedure_tags`
  - Use `onConflictDoNothing()`

- [ ] Update `populateTests()`:
  - After inserting tests, run an UPDATE to set `categoryId`
  - Logic: `WHERE category = 'medical' → SET categoryId = 5`
  - If you add more category values in the future, extend this mapping

### 1.5 — Create a populate runner script

- [ ] Create `scripts/populate.ts` (or add npm script entry point)
- [ ] Script runs populate functions **in dependency order**:
  1. `populateCategories()` ← must run first (tests FK depends on it)
  2. `populateTags()`
  3. `populateTests()` (with categoryId mapping)
  4. `populateProcedures()`
  5. `populateProcedureTags()` ← depends on both procedures and tags
  6. `populatePosts()`
- [ ] Add script to `package.json`: `"db:seed": "tsx scripts/populate.ts"`

### 1.6 — Run and verify

- [ ] Run: `pnpm db:seed`
- [ ] Verify in Neon console:
  - `wolfmed_mobile_categories` has 5 rows
  - `wolfmed_mobile_tags` has 14 rows
  - `wolfmed_mobile_procedure_tags` has entries for all 31 procedures
  - `wolfmed_mobile_tests` — all 664 rows have `categoryId = 5`
- [ ] Verify existing app still works (data not corrupted): `pnpm start`

---

## Part 2 — C# .NET 10 Solution Setup (Visual Studio)

### 2.1 — Create the solution

- [ ] Open Visual Studio 2022 (v17.12+ for .NET 10 support)
- [ ] New Solution → name: `WolfmedAPI`
- [ ] Add new project:
  - Template: `ASP.NET Core Web API`
  - Name: `WolfmedAPI`
  - Framework: `.NET 10`
  - Enable: OpenAPI/Swagger support ✓
  - Enable: HTTPS ✓
  - Do NOT enable: Docker (we'll add Dockerfile manually)
- [ ] Delete default generated files:
  - `WeatherForecast.cs`
  - `Controllers/WeatherForecastController.cs`
- [ ] Verify solution builds: `Ctrl+Shift+B`

### 2.2 — Install NuGet packages

Install via NuGet Package Manager or `dotnet add package`:

- [ ] `MediatR` — CQRS mediator
- [ ] `FluentValidation` — request validation
- [ ] `FluentValidation.AspNetCore` — DI integration
- [ ] `Microsoft.EntityFrameworkCore` — ORM core
- [ ] `Microsoft.EntityFrameworkCore.Tools` — migrations CLI
- [ ] `Npgsql.EntityFrameworkCore.PostgreSQL` — PostgreSQL provider
- [ ] `Microsoft.AspNetCore.Authentication.JwtBearer` — Clerk JWT validation
- [ ] `Swashbuckle.AspNetCore` — Swagger UI (included if OpenAPI was ticked)

> **Note:** Ensure all EF Core packages are version 10.x to match .NET 10.
> MediatR 12.x is compatible with .NET 10.

### 2.3 — Configure `appsettings.json`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=<neon-host>;Database=<db>;Username=<user>;Password=<pass>;SSL Mode=Require;Trust Server Certificate=true"
  },
  "Clerk": {
    "Authority": "https://<your-clerk-domain>.clerk.accounts.dev",
    "Audience": "<your-clerk-frontend-api>"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore.Database.Command": "Warning"
    }
  }
}
```

- [ ] Add `appsettings.Development.json` for local dev overrides
- [ ] Add to `.gitignore`:
  ```
  appsettings.Development.json
  appsettings.Production.json
  ```
- [ ] **Never commit real credentials** — use `dotnet user-secrets` locally:
  ```bash
  dotnet user-secrets init
  dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=..."
  ```

> **Connection string note:** Neon requires SSL. The C# format is different from
> the JavaScript Neon URL. Use this format exactly:
> `Host=ep-xxx.eu-central-1.aws.neon.tech;Database=neondb;Username=user;Password=pass;SSL Mode=Require;Trust Server Certificate=true`

### 2.4 — Configure `.csproj` for XML docs (Swagger comments)

In `WolfmedAPI.csproj`, add inside `<PropertyGroup>`:
```xml
<GenerateDocumentationFile>true</GenerateDocumentationFile>
<NoWarn>$(NoWarn);1591</NoWarn>
```

- [ ] Update `.csproj` file
- [ ] Verify build still succeeds

---

## Part 3 — Models (9 entity classes)

Create folder: `Models/`

### 3.1 — `User.cs`

```csharp
public class User
{
    public Guid Id { get; set; }
    public string UserId { get; set; }        // Clerk ID
    public string Username { get; set; }
    public string Motto { get; set; }
    public int TestLimit { get; set; }
    public bool Supporter { get; set; }
    public int TestsAttempted { get; set; }
    public int TotalScore { get; set; }
    public int TotalQuestions { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public ICollection<CompletedTest> CompletedTests { get; set; }
    public ICollection<Comment> Comments { get; set; }
}
```

### 3.2 — `Category.cs`

```csharp
public class Category
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; }

    public ICollection<Test> Tests { get; set; }
}
```

### 3.3 — `Test.cs`

```csharp
public class Test
{
    public Guid Id { get; set; }
    public int? CategoryId { get; set; }
    public string Category { get; set; }       // keep during migration period
    public JsonDocument Data { get; set; }     // { question, answers[] }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public Category? CategoryNav { get; set; }
}
```

> `JsonDocument` (System.Text.Json) maps to PostgreSQL jsonb.
> The navigation property is named `CategoryNav` to avoid collision with
> the string `Category` field.

### 3.4 — `Procedure.cs`

```csharp
public class Procedure
{
    public Guid Id { get; set; }
    public JsonDocument Data { get; set; }     // { name, procedure, algorithm[] }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public ICollection<ProcedureTag> ProcedureTags { get; set; }
}
```

### 3.5 — `Tag.cs`

```csharp
public class Tag
{
    public int Id { get; set; }
    public string Name { get; set; }
    public bool IsActive { get; set; }

    public ICollection<ProcedureTag> ProcedureTags { get; set; }
}
```

### 3.6 — `ProcedureTag.cs` (join table)

```csharp
public class ProcedureTag
{
    public Guid ProcedureId { get; set; }
    public int TagId { get; set; }

    public Procedure Procedure { get; set; }
    public Tag Tag { get; set; }
}
```

> Composite PK — must be configured explicitly in `AppDbContext.OnModelCreating`.

### 3.7 — `CompletedTest.cs`

```csharp
public class CompletedTest
{
    public Guid Id { get; set; }
    public string UserId { get; set; }         // FK → User.UserId (varchar)
    public int Score { get; set; }
    public JsonDocument TestResult { get; set; } // [{ questionId, answer }]
    public DateTime CompletedAt { get; set; }

    public User User { get; set; }
}
```

### 3.8 — `BlogPost.cs`

```csharp
public class BlogPost
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Date { get; set; }
    public string Excerpt { get; set; }
    public string Content { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public ICollection<Comment> Comments { get; set; }
}
```

### 3.9 — `Comment.cs`

```csharp
public class Comment
{
    public Guid Id { get; set; }
    public Guid BlogPostId { get; set; }
    public string UserId { get; set; }
    public string Content { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public BlogPost BlogPost { get; set; }
    public User User { get; set; }
}
```

### 3.10 — `Message.cs`

```csharp
public class Message
{
    public int Id { get; set; }               // serial (int), not UUID
    public string Email { get; set; }
    public string MessageContent { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
```

> The DB column is `message` but the C# property is `MessageContent` to avoid
> collision with the class name. Map explicitly in `AppDbContext`.

---

## Part 4 — AppDbContext

Create: `Data/AppDbContext.cs`

### 4.1 — DbSet declarations

- [ ] `DbSet<User> Users`
- [ ] `DbSet<Test> Tests`
- [ ] `DbSet<Procedure> Procedures`
- [ ] `DbSet<CompletedTest> CompletedTests`
- [ ] `DbSet<BlogPost> BlogPosts`
- [ ] `DbSet<Message> Messages`
- [ ] `DbSet<Category> Categories`
- [ ] `DbSet<Tag> Tags`
- [ ] `DbSet<Comment> Comments`
- [ ] No `DbSet<ProcedureTag>` — configured via navigation properties only

### 4.2 — `OnModelCreating` configuration

- [ ] Map every entity to its `wolfmed_mobile_*` table name:
  ```csharp
  modelBuilder.Entity<User>().ToTable("wolfmed_mobile_users");
  modelBuilder.Entity<Test>().ToTable("wolfmed_mobile_tests");
  // ... etc for all 9 entities
  ```

- [ ] Map column names that differ from C# property names:
  - `User.UserId` → column `"userId"`
  - `User.TestsAttempted` → column `"tests_attempted"`
  - `User.TotalScore` → column `"total_score"`
  - `User.TotalQuestions` → column `"total_questions"`
  - `Message.MessageContent` → column `"message"`
  - `Test.CategoryNav` navigation → FK column `"categoryId"`

- [ ] Configure composite PK for `ProcedureTag`:
  ```csharp
  modelBuilder.Entity<ProcedureTag>()
      .HasKey(pt => new { pt.ProcedureId, pt.TagId });
  ```

- [ ] Configure many-to-many via ProcedureTag:
  ```csharp
  modelBuilder.Entity<Procedure>()
      .HasMany(p => p.ProcedureTags)
      .WithOne(pt => pt.Procedure)
      .HasForeignKey(pt => pt.ProcedureId);

  modelBuilder.Entity<Tag>()
      .HasMany(t => t.ProcedureTags)
      .WithOne(pt => pt.Tag)
      .HasForeignKey(pt => pt.TagId);
  ```

- [ ] Configure FK from `CompletedTest` to `User.UserId` (varchar, not the Guid PK):
  ```csharp
  modelBuilder.Entity<CompletedTest>()
      .HasOne(ct => ct.User)
      .WithMany(u => u.CompletedTests)
      .HasForeignKey(ct => ct.UserId)
      .HasPrincipalKey(u => u.UserId);
  ```

- [ ] Configure `JsonDocument` columns for EF Core (Npgsql handles this natively):
  - `Test.Data`
  - `Procedure.Data`
  - `CompletedTest.TestResult`

- [ ] Configure `Comment` FK to `User.UserId` (same varchar pattern as CompletedTest):
  ```csharp
  modelBuilder.Entity<Comment>()
      .HasOne(c => c.User)
      .WithMany(u => u.Comments)
      .HasForeignKey(c => c.UserId)
      .HasPrincipalKey(u => u.UserId);
  ```

### 4.3 — DO NOT run EF Core migrations against existing tables

- [ ] No `Database.EnsureCreated()` call
- [ ] No `Database.Migrate()` call
- [ ] EF Core only connects — Drizzle manages schema
- [ ] For health check, use `Database.CanConnectAsync()`

---

## Part 5 — CQRS Features (follow the guide — Vertical Slice)

Create folder: `Features/`

### 5.1 — Feature folder structure (replicate for each entity)

```
Features/
├── Tests/
│   ├── Queries/
│   │   ├── GetAllTests/
│   │   │   ├── GetAllTestsQuery.cs
│   │   │   └── GetAllTestsHandler.cs
│   │   └── GetTestById/
│   │       ├── GetTestByIdQuery.cs
│   │       └── GetTestByIdHandler.cs
│   ├── Commands/
│   │   ├── CreateTest/
│   │   │   ├── CreateTestCommand.cs
│   │   │   ├── CreateTestHandler.cs
│   │   │   └── CreateTestValidator.cs
│   │   ├── UpdateTest/
│   │   │   ├── UpdateTestCommand.cs
│   │   │   ├── UpdateTestHandler.cs
│   │   │   └── UpdateTestValidator.cs
│   │   └── DeleteTest/
│   │       ├── DeleteTestCommand.cs
│   │       └── DeleteTestHandler.cs
│   └── TestDto.cs
```

### 5.2 — Entities to implement (9 total)

- [ ] `Features/Tests/`
- [ ] `Features/Procedures/`
- [ ] `Features/Categories/`
- [ ] `Features/Tags/`
- [ ] `Features/CompletedTests/`
- [ ] `Features/BlogPosts/`
- [ ] `Features/Comments/`
- [ ] `Features/Users/`
- [ ] `Features/Messages/`

### 5.3 — Per feature checklist

For **each** of the 9 entities, create:

- [ ] `GetAll` Query + Handler — returns `List<TDto>`, filters `IsActive` where applicable
- [ ] `GetById` Query + Handler — returns `TDto?`, returns null if not found
- [ ] `Create` Command + Handler + Validator — returns new record's Id (Guid or int)
- [ ] `Update` Command + Handler + Validator — returns `Unit`, throws `KeyNotFoundException` if not found
- [ ] `Delete` Command + Handler — **soft delete** (`IsActive = false`) where field exists,
  hard delete for `CompletedTest` and `Message` (no `IsActive` field)
- [ ] `TDto.cs` — DTO class in the feature folder, includes related entity names
  (e.g. `TestDto` includes `CategoryName` from the join)

### 5.4 — Special DTO considerations

**TestDto** — include category info from join:
```csharp
public class TestDto
{
    public Guid Id { get; set; }
    public string? Category { get; set; }
    public int? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public JsonElement Data { get; set; }    // question + answers
    public DateTime? CreatedAt { get; set; }
}
```

**ProcedureDto** — include tags from many-to-many:
```csharp
public class ProcedureDto
{
    public Guid Id { get; set; }
    public JsonElement Data { get; set; }    // name, procedure, algorithm[]
    public List<string> Tags { get; set; }   // tag names from join
    public DateTime? CreatedAt { get; set; }
}
```

**CompletedTestDto** — include score summary:
```csharp
public class CompletedTestDto
{
    public Guid Id { get; set; }
    public string UserId { get; set; }
    public int Score { get; set; }
    public JsonElement TestResult { get; set; }
    public DateTime CompletedAt { get; set; }
}
```

### 5.5 — FluentValidation examples

**CreateTestValidator:**
```csharp
public class CreateTestValidator : AbstractValidator<CreateTestCommand>
{
    public CreateTestValidator()
    {
        RuleFor(x => x.CategoryId).NotNull().GreaterThan(0);
        RuleFor(x => x.Data).NotNull();
    }
}
```

- [ ] Add `ValidationBehavior<TRequest, TResponse>` pipeline behavior
  (intercepts all Commands before Handler runs)
- [ ] Register in `Program.cs`: `services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>))`

---

## Part 6 — Controllers (9 total)

Create folder: `Controllers/`

### 6.1 — Controller list

- [ ] `TestsController.cs`
- [ ] `ProceduresController.cs`
- [ ] `CategoriesController.cs`
- [ ] `TagsController.cs`
- [ ] `CompletedTestsController.cs`
- [ ] `BlogPostsController.cs`
- [ ] `CommentsController.cs`
- [ ] `UsersController.cs`
- [ ] `MessagesController.cs`

### 6.2 — Per controller checklist

Each controller follows this exact pattern (from the guide):

- [ ] `[ApiController]` + `[Route("api/[controller]")]` attributes
- [ ] Constructor injects `IMediator` (and optionally `ILogger<T>`)
- [ ] `GET /` → `GetAllQuery` → `Ok(result)`
- [ ] `GET /{id}` → `GetByIdQuery` → `Ok(result)` or `NotFound()`
- [ ] `POST /` → `CreateCommand` → `CreatedAtAction(...)`
- [ ] `PUT /{id}` → `UpdateCommand` → `NoContent()` or `NotFound()`
- [ ] `DELETE /{id}` → `DeleteCommand` → `NoContent()` or `NotFound()`
- [ ] XML `<summary>` comments on each action (feeds Swagger docs)

### 6.3 — Auth protection strategy

Not all endpoints need auth. Suggested approach:

**Public (no `[Authorize]`):**
- `GET /api/tests` — reading tests is public
- `GET /api/procedures` — reading procedures is public
- `GET /api/categories` — public reference data
- `GET /api/tags` — public reference data
- `GET /api/blogposts` — public content
- `POST /api/messages` — contact form, no auth needed

**Protected (`[Authorize]`):**
- All `CompletedTests` endpoints (user-specific data)
- `PUT`, `DELETE` on Users
- `POST /api/comments` (must be logged in to comment)
- `POST`, `PUT`, `DELETE` on Tests/Procedures/BlogPosts (admin operations)

- [ ] Decide auth strategy per endpoint
- [ ] Apply `[Authorize]` attributes accordingly
- [ ] For now, start with all public, add auth after API is working end-to-end

---

## Part 7 — Program.cs Configuration

### 7.1 — Service registrations

```csharp
// MediatR — auto-discovers all Handlers in the assembly
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));

// FluentValidation
builder.Services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

// FluentValidation Pipeline Behavior
builder.Services.AddTransient(
    typeof(IPipelineBehavior<,>),
    typeof(ValidationBehavior<,>));

// EF Core + Npgsql (PostgreSQL)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// CORS — allow RN dev (Android emulator + iOS simulator + physical device)
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevelopmentPolicy", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
    options.AddPolicy("ProductionPolicy", policy =>
    {
        policy.WithOrigins("https://your-azure-url.azurewebsites.net")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Clerk JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = builder.Configuration["Clerk:Authority"];
        options.Audience  = builder.Configuration["Clerk:Audience"];
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer   = true,
            ValidateAudience = true,
            ValidateLifetime = true,
        };
    });

// Swagger with JWT support
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "WolfmedAPI", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme { ... });
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    c.IncludeXmlComments(xmlPath);
});

// Health checks
builder.Services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>();
```

### 7.2 — Middleware pipeline (order is critical)

```csharp
app.UseSwagger();
app.UseSwaggerUI();
app.UseHttpsRedirection();
app.UseCors(isDevelopment ? "DevelopmentPolicy" : "ProductionPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<GlobalExceptionMiddleware>();
app.MapControllers();
app.MapHealthChecks("/health");
```

- [ ] All services registered
- [ ] Middleware in correct order (CORS before Auth)
- [ ] Health check endpoint at `/health`

### 7.3 — Global exception middleware

Create: `Middleware/GlobalExceptionMiddleware.cs`

- [ ] Catch `KeyNotFoundException` → return 404 JSON response
- [ ] Catch `ValidationException` (FluentValidation) → return 400 with errors list
- [ ] Catch all unhandled exceptions → return 500 with generic message
- [ ] Log all exceptions with `ILogger`
- [ ] Never expose stack traces in production

---

## Part 8 — Testing (Swagger)

### 8.1 — Startup verification

- [ ] Run the project: `F5` in Visual Studio
- [ ] Confirm app starts without exceptions
- [ ] Open Swagger UI: `https://localhost:xxxx/swagger`
- [ ] Verify all 9 controllers appear in Swagger
- [ ] Verify all 45 endpoints are listed

### 8.2 — Test each controller (using Swagger "Try it out")

**Categories** (test first — other tests depend on this data existing):
- [ ] `GET /api/categories` → returns 5 categories
- [ ] `GET /api/categories/1` → returns "Pielęgnacja"
- [ ] `POST /api/categories` → creates new category, returns 201
- [ ] `PUT /api/categories/{id}` → updates, returns 204
- [ ] `DELETE /api/categories/{id}` → soft delete, returns 204

**Tags:**
- [ ] `GET /api/tags` → returns 14 tags
- [ ] Full CRUD verified

**Tests:**
- [ ] `GET /api/tests` → returns all 664 tests with `categoryName` in DTO
- [ ] `GET /api/tests/{id}` → returns single test with JSON `data` field
- [ ] `POST /api/tests` → creates test with `categoryId`
- [ ] `PUT /api/tests/{id}` → updates
- [ ] `DELETE /api/tests/{id}` → soft delete (sets `isActive = false`)
  > Note: current tests table has no `isActive` column — either add it via Drizzle
  > or implement hard delete for tests. Decide before implementing.

**Procedures:**
- [ ] `GET /api/procedures` → returns all 31 with `Tags` list in DTO
- [ ] Verify jsonb `data` field is correctly deserialized (name, procedure, algorithm[])

**CompletedTests:**
- [ ] `GET /api/completedtests` → returns all (or filter by userId query param)
- [ ] `POST /api/completedtests` → creates completed test result

**Users, BlogPosts, Comments, Messages:**
- [ ] Full CRUD verified for each

### 8.3 — Relational queries verification

- [ ] `GET /api/tests` response includes `categoryName` (not just `categoryId`)
- [ ] `GET /api/procedures` response includes `tags: ["Stoma", "Opatrunki"]` array
- [ ] `GET /api/blogposts/{id}` response includes `comments` count or list

---

## Part 9 — Docker

### 9.1 — Create `Dockerfile`

Place in `WolfmedAPI/` (same folder as `.csproj`):

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["WolfmedAPI/WolfmedAPI.csproj", "WolfmedAPI/"]
RUN dotnet restore "WolfmedAPI/WolfmedAPI.csproj"
COPY . .
WORKDIR "/src/WolfmedAPI"
RUN dotnet build "WolfmedAPI.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "WolfmedAPI.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "WolfmedAPI.dll"]
```

### 9.2 — Create `docker-compose.yml`

Place at solution root (`WolfmedAPI/`):

```yaml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: WolfmedAPI/Dockerfile
    ports:
      - "5000:80"
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ConnectionStrings__DefaultConnection=Host=<neon-host>;...
      - Clerk__Authority=https://<clerk-domain>.clerk.accounts.dev
    restart: unless-stopped
```

> No local PostgreSQL service — Neon is already hosted.
> Docker only wraps the C# API.

- [ ] Create `Dockerfile`
- [ ] Create `docker-compose.yml`
- [ ] Add `.dockerignore`:
  ```
  **/bin
  **/obj
  **/.vs
  appsettings.Development.json
  ```
- [ ] Build image: `docker-compose build`
- [ ] Run: `docker-compose up`
- [ ] Verify API at `http://localhost:5000/swagger`
- [ ] Verify `/health` returns 200
- [ ] Verify `GET /api/tests` returns data from Neon

---

## Part 10 — React Native App Integration

### 10.1 — Create `constants/apiConfig.ts`

```typescript
// constants/apiConfig.ts

const DEV_API_ANDROID = 'http://10.0.2.2:5000/api'  // Android emulator → host machine
const DEV_API_IOS     = 'http://localhost:5000/api'   // iOS simulator → host machine
const PROD_API        = 'https://wolfmed-api.azurewebsites.net/api'

export const API_BASE = __DEV__
  ? Platform.OS === 'android' ? DEV_API_ANDROID : DEV_API_IOS
  : PROD_API
```

- [ ] Create `constants/apiConfig.ts`

### 10.2 — Create `services/apiClient.ts`

```typescript
// services/apiClient.ts
import { API_BASE } from '@/constants/apiConfig'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export const createApiClient = (getToken: () => Promise<string | null>) => {
  const request = async <T>(
    path: string,
    method: HttpMethod = 'GET',
    body?: unknown
  ): Promise<T> => {
    const token = await getToken()
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }

    const response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      ...(body ? { body: JSON.stringify(body) } : {}),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message ?? `HTTP ${response.status}`)
    }

    if (response.status === 204) return undefined as T
    return response.json() as Promise<T>
  }

  return {
    get:    <T>(path: string)                    => request<T>(path, 'GET'),
    post:   <T>(path: string, body: unknown)     => request<T>(path, 'POST', body),
    put:    <T>(path: string, body: unknown)     => request<T>(path, 'PUT', body),
    delete: <T>(path: string)                    => request<T>(path, 'DELETE'),
  }
}
```

- [ ] Create `services/apiClient.ts`
- [ ] Note: `getToken` comes from Clerk's `useAuth().getToken` — passed in when the client is used in a hook

### 10.3 — Create service files

Each service is a pure function taking an `apiClient` instance.

- [ ] Create `services/testsService.ts`:
  - `getAll()` → `GET /api/tests`
  - `getById(id)` → `GET /api/tests/{id}`
  - `create(data)` → `POST /api/tests`
  - `update(id, data)` → `PUT /api/tests/{id}`
  - `remove(id)` → `DELETE /api/tests/{id}`

- [ ] Create `services/proceduresService.ts` — same pattern

- [ ] Create `services/categoriesService.ts` — same pattern

- [ ] Create `services/blogService.ts` — same pattern

- [ ] Create `services/completedTestsService.ts`:
  - `getByUser(userId)` → `GET /api/completedtests?userId={userId}`
  - `create(data)` → `POST /api/completedtests`
  - `remove(id)` → `DELETE /api/completedtests/{id}`

- [ ] Create `services/userService.ts`:
  - `getByUserId(userId)` → `GET /api/users/{userId}`
  - `updateUsername(userId, username)` → `PUT /api/users/{userId}`
  - `getStats(userId)` → `GET /api/users/{userId}/stats`

- [ ] Create `services/messagesService.ts`:
  - `send(email, message)` → `POST /api/messages`

### 10.4 — Create / update hooks

- [ ] Update `hooks/useTests.ts`:
  - Import `createApiClient` and `API_BASE`
  - Use Clerk `useAuth().getToken` for the client
  - Replace `queryFn: fileData.getAllTests` with `testsService.getAll()`
  - Keep same `staleTime`, `queryKey`

- [ ] Create `hooks/useProcedures.ts`:
  - Same pattern as `useTests`
  - `queryKey: ['procedures']`
  - Returns `{ procedures, isLoading, error }`

- [ ] Create `hooks/useCategories.ts`:
  - `queryKey: ['categories']`
  - Returns `{ categories, isLoading, error }`

- [ ] Create `hooks/useBlogPosts.ts`:
  - `queryKey: ['blogPosts']`
  - Returns `{ posts, isLoading, error }`

- [ ] Create `hooks/useCompletedTests.ts`:
  - Takes `userId` as parameter
  - `queryKey: ['completedTests', userId]`
  - Only fetches when `userId` is defined

- [ ] Create `hooks/useUserProfile.ts`:
  - Takes `userId` as parameter
  - `queryKey: ['userProfile', userId]`
  - Returns user stats, username, motto

### 10.5 — Update screen components

**`app/(tabs)/(dashboard)/(drawer)/(learn)/procedures.tsx`**

- [ ] Currently imports: `import proceduresData from "@/data/procedures.json"`
- [ ] Replace with `useProcedures()` hook
- [ ] Image mapping (`procedureImages`) stays local — match by `procedure.data.name`
  > **Important:** The image lookup uses `procedure.data.name` string matching.
  > The API returns `data` as a JSON object — ensure `data.name` is accessible
  > in the DTO (not buried in raw JsonElement).

**`app/(tabs)/(dashboard)/(drawer)/tests.tsx`** (and related quiz screens)

- [ ] Currently uses `useTests()` which calls `fileData` — already fixed by hook update
- [ ] Verify test generation logic still works with API data shape

**`components/QuickStats.tsx`** (or wherever user stats are displayed)

- [ ] Replace any direct `server/queries.ts` calls with `useUserProfile` hook

### 10.6 — Update `types/dataTypes.ts`

- [ ] Add `Category` interface:
  ```typescript
  export interface Category {
    id: number
    name: string
    description?: string
    isActive: boolean
  }
  ```

- [ ] Add `Tag` interface:
  ```typescript
  export interface Tag {
    id: number
    name: string
    isActive: boolean
  }
  ```

- [ ] Add `Comment` interface:
  ```typescript
  export interface Comment {
    id: string
    blogPostId: string
    userId: string
    content: string
    createdAt: Date
    updatedAt?: Date
  }
  ```

- [ ] Update `Test` interface — add `categoryId` and `categoryName`:
  ```typescript
  export interface Test {
    id: string
    data: TestData
    category: string       // keep for now
    categoryId?: number    // new
    categoryName?: string  // from DTO join
    createdAt?: Date | null
    updatedAt?: Date | null
  }
  ```

- [ ] Update `Procedure` interface — add `tags`:
  ```typescript
  export interface Procedure {
    id: string
    data: ProcedureData
    tags?: string[]        // tag names from join
    image?: any
  }
  ```

### 10.7 — End-to-end verification

- [ ] Start Docker C# API: `docker-compose up`
- [ ] Start RN app: `pnpm start`
- [ ] Open Android emulator
- [ ] Verify `Procedures` screen loads from API (not JSON file)
- [ ] Verify `Tests` screen loads from API
- [ ] Verify `Dashboard` stats load from API
- [ ] Verify `Blog` screen loads posts from API
- [ ] Verify completing a test saves result via API
- [ ] Verify user profile update works via API

---

## Part 11 — Azure Deployment (Optional)

### 11.1 — Create Azure resources

- [ ] Create Azure account or log in at portal.azure.com
- [ ] Create Resource Group: `wolfmed-rg`
- [ ] Create App Service Plan: Free F1 tier (Linux)
- [ ] Create App Service (Web App): `wolfmed-api`
  - Runtime: .NET 10
  - OS: Linux

### 11.2 — Configure environment variables in Azure

In App Service → Configuration → Application Settings:

- [ ] `ConnectionStrings__DefaultConnection` = Neon C# connection string
- [ ] `Clerk__Authority` = Clerk authority URL
- [ ] `Clerk__Audience` = Clerk audience
- [ ] `ASPNETCORE_ENVIRONMENT` = `Production`

### 11.3 — Deploy

**Option A — Publish from Visual Studio:**
- [ ] Right-click project → Publish → Azure → App Service
- [ ] Select `wolfmed-api`
- [ ] Click Publish

**Option B — GitHub Actions (recommended for repeated deploys):**
- [ ] Add `.github/workflows/deploy.yml`
- [ ] Trigger on push to `main`
- [ ] Uses `azure/webapps-deploy@v2` action
- [ ] Store Azure publish profile as GitHub Secret

- [ ] After deploy, verify: `https://wolfmed-api.azurewebsites.net/health` returns 200
- [ ] Verify: `https://wolfmed-api.azurewebsites.net/swagger` loads

### 11.4 — Update RN for production

- [ ] Update `constants/apiConfig.ts` — set `PROD_API` to Azure URL
- [ ] Build and test release variant of RN app against Azure API

---

## Part 12 — Cleanup (after full end-to-end works)

### 12.1 — RN cleanup

- [ ] Remove `server/fetchData.ts` — replaced by service layer
- [ ] Remove `server/queries.ts` — replaced by API calls
  > **Wait:** Only remove `queries.ts` after confirming ALL calls are migrated.
  > Search for any remaining imports: `grep -r "server/queries" app/ components/ hooks/`
- [ ] Remove `server/db/index.ts` — no direct DB access needed from RN client
- [ ] Remove `server/db/schema.ts` — move to separate schema-only project if needed,
  or keep purely for running `pnpm db:push` (schema management, not app code)
- [ ] Remove `drizzle-orm`, `@neondatabase/serverless` from dependencies
  if no longer used client-side (keep `drizzle-kit` for schema migrations)
- [ ] Remove `import 'server-only'` workaround — no longer needed

### 12.2 — Database cleanup (after `categoryId` is confirmed working)

- [ ] Verify all 664 tests have `categoryId` set in Neon console
- [ ] Remove `category` varchar column from `wolfmed_mobile_tests` via Drizzle:
  - Remove `category` from `schema.ts`
  - Run `pnpm db:push`
- [ ] Update C# `Test` model — remove `Category` string property
- [ ] Update C# `TestDto` — remove `Category` string field
- [ ] Verify app still works

### 12.3 — Final checklist

- [ ] All 45 API endpoints working in production
- [ ] All RN screens loading from API (not JSON files)
- [ ] Auth protected endpoints require valid Clerk JWT
- [ ] No secrets committed to git
- [ ] Docker image builds successfully
- [ ] Azure deployment live and stable

---

## Appendix A — Key File Locations

### React Native

| File | Purpose |
|---|---|
| `server/db/schema.ts` | Drizzle schema — source of truth for DB |
| `server/db/populateDb.ts` | Seed data functions |
| `scripts/populate.ts` | Runner for all seed functions |
| `data/categories.json` | Category seed data |
| `data/tags.json` | Tag seed data |
| `data/procedureTags.json` | Procedure-tag mapping |
| `constants/apiConfig.ts` | API base URL config |
| `services/apiClient.ts` | Base HTTP client with Clerk JWT |
| `services/*Service.ts` | Per-entity API service files |
| `hooks/useTests.ts` | Updated — calls API |
| `hooks/useProcedures.ts` | New hook |
| `hooks/useBlogPosts.ts` | New hook |
| `hooks/useCompletedTests.ts` | New hook |
| `hooks/useUserProfile.ts` | New hook |
| `types/dataTypes.ts` | Updated with new interfaces |

### C# API

| File | Purpose |
|---|---|
| `WolfmedAPI.sln` | Solution file |
| `WolfmedAPI/Program.cs` | App entry point, all registrations |
| `WolfmedAPI/Data/AppDbContext.cs` | EF Core context |
| `WolfmedAPI/Models/*.cs` | 9 entity classes |
| `WolfmedAPI/Features/**` | CQRS handlers, commands, queries |
| `WolfmedAPI/Controllers/*.cs` | 9 thin controllers |
| `WolfmedAPI/Middleware/GlobalExceptionMiddleware.cs` | 404/400/500 handling |
| `WolfmedAPI/appsettings.json` | Config (no secrets) |
| `WolfmedAPI/Dockerfile` | Container definition |
| `docker-compose.yml` | Local dev container setup |

---

## Appendix B — Commands Reference

### React Native

```bash
pnpm db:push                  # Push Drizzle schema to Neon
pnpm db:seed                  # Run all populate scripts
pnpm db:studio                # Open Drizzle Studio (visual DB browser)
pnpm start                    # Start Expo dev server
pnpm android                  # Run on Android emulator
pnpm ios                      # Run on iOS simulator
npx expo-doctor               # Check for dependency issues
npx expo install --fix        # Fix dependency version mismatches
```

### C# / .NET

```bash
dotnet restore                # Restore NuGet packages
dotnet build                  # Build solution
dotnet run --project WolfmedAPI  # Run API locally
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "..."
dotnet publish -c Release     # Build release
```

### Docker

```bash
docker-compose build          # Build the API image
docker-compose up             # Start API container
docker-compose up -d          # Start in background (detached)
docker-compose down           # Stop containers
docker-compose logs api       # View API logs
```

### Git

```bash
git checkout claude/setup-rn-expo-branch-gct5O
git pull origin claude/setup-rn-expo-branch-gct5O
```

---

## Appendix C — Neon Connection String Formats

**JavaScript (Drizzle / `@neondatabase/serverless`):**
```
postgresql://user:password@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

**C# (Npgsql / Entity Framework Core):**
```
Host=ep-xxx.eu-central-1.aws.neon.tech;Database=neondb;Username=user;Password=password;SSL Mode=Require;Trust Server Certificate=true
```

> These are two different formats for the **same Neon database**.
> Both can connect simultaneously — Drizzle from RN schema scripts,
> EF Core from the C# API. They do not conflict.

---

## Appendix D — Gotchas & Things Easy to Miss

| # | Issue | Solution |
|---|---|---|
| 1 | `server/queries.ts` has `import 'server-only'` | Can't use in RN client — new service layer avoids this entirely |
| 2 | All 664 tests have `category = "medical"` | Run `populateTests()` update after categories are seeded |
| 3 | `categoryId` must be nullable initially | Make it `integer NULLABLE` in Drizzle schema, only enforce NOT NULL after all rows updated |
| 4 | EF Core property names vs DB column names | Column names in Neon use `camelCase` and `snake_case` mixed — every property needs explicit `.HasColumnName()` |
| 5 | FK from `CompletedTest.UserId` to `User.UserId` (varchar, not Guid PK) | Use `.HasPrincipalKey(u => u.UserId)` in EF Core config |
| 6 | `Message` table column is named `message` (same as class) | Rename C# property to `MessageContent`, map with `.HasColumnName("message")` |
| 7 | `JsonDocument` in EF Core needs `.HasColumnType("jsonb")` | Npgsql handles this, but be explicit in `OnModelCreating` |
| 8 | CORS blocks RN emulator calls | Must add `UseCors()` BEFORE `UseAuthentication()` in middleware pipeline |
| 9 | Android emulator uses `10.0.2.2`, iOS uses `localhost` | Use `Platform.OS` check in `apiConfig.ts` |
| 10 | Procedure images stay local | `procedureImages` constant maps by `data.name` string — API must return `data.name` in DTO |
| 11 | Don't cache Clerk JWT in RN | Call `getToken()` fresh for every request — Clerk handles token refresh internally |
| 12 | `.gitignore` `appsettings.Development.json` | Real Neon connection string must never be committed |
| 13 | `ProcedureTag` composite PK | Without explicit `HasKey(pt => new { pt.ProcedureId, pt.TagId })`, EF Core will error |
| 14 | Populate order matters | Categories → Tags → Tests → Procedures → ProcedureTags (FK dependencies) |
| 15 | `wolfmed_mobile_` prefix on all tables | Every entity needs `.ToTable("wolfmed_mobile_xxx")` in EF Core |
