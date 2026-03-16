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

> All models use proper namespace declarations and C# null-safe initializers.
> `JsonDocument` (System.Text.Json) maps to PostgreSQL `jsonb` via Npgsql.

### 3.1 — `User.cs`

```csharp
namespace WolfmedAPI.Models
{
    public class User
    {
        public Guid Id { get; set; }
        public string UserId { get; set; } = string.Empty;      // Clerk ID
        public string Username { get; set; } = string.Empty;
        public string Motto { get; set; } = string.Empty;
        public int TestLimit { get; set; } = 150;
        public bool Supporter { get; set; } = false;
        public int TestsAttempted { get; set; } = 0;
        public int TotalScore { get; set; } = 0;
        public int TotalQuestions { get; set; } = 0;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public ICollection<CompletedTest> CompletedTests { get; set; } = new List<CompletedTest>();
        public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    }
}
```

### 3.2 — `Category.cs`

```csharp
namespace WolfmedAPI.Models
{
    public class Category
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;

        public ICollection<Test> Tests { get; set; } = new List<Test>();
    }
}
```

### 3.3 — `Test.cs`

```csharp
using System.Text.Json;

namespace WolfmedAPI.Models
{
    public class Test
    {
        public Guid Id { get; set; }
        public int? CategoryId { get; set; }
        public string Category { get; set; } = string.Empty;   // keep during migration period
        public JsonDocument Data { get; set; } = null!;         // { question, answers[] }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public Category? CategoryNav { get; set; }
    }
}
```

> `JsonDocument` (System.Text.Json) maps to PostgreSQL jsonb.
> The navigation property is named `CategoryNav` to avoid collision with
> the string `Category` field.

### 3.4 — `Procedure.cs`

```csharp
using System.Text.Json;

namespace WolfmedAPI.Models
{
    public class Procedure
    {
        public Guid Id { get; set; }
        public JsonDocument Data { get; set; } = null!;         // { name, procedure, algorithm[] }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public ICollection<ProcedureTag> ProcedureTags { get; set; } = new List<ProcedureTag>();
    }
}
```

### 3.5 — `Tag.cs`

```csharp
namespace WolfmedAPI.Models
{
    public class Tag
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;

        public ICollection<ProcedureTag> ProcedureTags { get; set; } = new List<ProcedureTag>();
    }
}
```

### 3.6 — `ProcedureTag.cs` (join table)

```csharp
namespace WolfmedAPI.Models
{
    public class ProcedureTag
    {
        public Guid ProcedureId { get; set; }
        public int TagId { get; set; }

        public Procedure Procedure { get; set; } = null!;
        public Tag Tag { get; set; } = null!;
    }
}
```

> Composite PK — must be configured explicitly in `AppDbContext.OnModelCreating`.

### 3.7 — `CompletedTest.cs`

```csharp
using System.Text.Json;

namespace WolfmedAPI.Models
{
    public class CompletedTest
    {
        public Guid Id { get; set; }
        public string UserId { get; set; } = string.Empty;      // FK → User.UserId (varchar)
        public int Score { get; set; }
        public JsonDocument TestResult { get; set; } = null!;   // [{ questionId, answer }]
        public DateTime CompletedAt { get; set; }

        public User User { get; set; } = null!;
    }
}
```

### 3.8 — `BlogPost.cs`

```csharp
namespace WolfmedAPI.Models
{
    public class BlogPost
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Date { get; set; } = string.Empty;
        public string Excerpt { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    }
}
```

### 3.9 — `Comment.cs`

```csharp
namespace WolfmedAPI.Models
{
    public class Comment
    {
        public Guid Id { get; set; }
        public Guid BlogPostId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public BlogPost BlogPost { get; set; } = null!;
        public User User { get; set; } = null!;
    }
}
```

### 3.10 — `Message.cs`

```csharp
namespace WolfmedAPI.Models
{
    public class Message
    {
        public int Id { get; set; }                              // serial (int), not UUID
        public string Email { get; set; } = string.Empty;
        public string MessageContent { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
```

> The DB column is `message` but the C# property is `MessageContent` to avoid
> collision with the class name. Map explicitly in `AppDbContext`.

---

## Part 4 — AppDbContext

Create: `Data/AppDbContext.cs`

### 4.1 — Complete `AppDbContext.cs`

```csharp
using Microsoft.EntityFrameworkCore;
using WolfmedAPI.Models;

namespace WolfmedAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Test> Tests => Set<Test>();
        public DbSet<Procedure> Procedures => Set<Procedure>();
        public DbSet<CompletedTest> CompletedTests => Set<CompletedTest>();
        public DbSet<BlogPost> BlogPosts => Set<BlogPost>();
        public DbSet<Message> Messages => Set<Message>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Tag> Tags => Set<Tag>();
        public DbSet<Comment> Comments => Set<Comment>();
        // No DbSet<ProcedureTag> — configured via navigation properties only

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // ── Table name mappings (wolfmed_mobile_ prefix) ──────────────────
            modelBuilder.Entity<User>().ToTable("wolfmed_mobile_users");
            modelBuilder.Entity<Test>().ToTable("wolfmed_mobile_tests");
            modelBuilder.Entity<Procedure>().ToTable("wolfmed_mobile_procedures");
            modelBuilder.Entity<CompletedTest>().ToTable("wolfmed_mobile_completed_tests");
            modelBuilder.Entity<BlogPost>().ToTable("wolfmed_mobile_blog_posts");
            modelBuilder.Entity<Message>().ToTable("wolfmed_mobile_messages");
            modelBuilder.Entity<Category>().ToTable("wolfmed_mobile_categories");
            modelBuilder.Entity<Tag>().ToTable("wolfmed_mobile_tags");
            modelBuilder.Entity<Comment>().ToTable("wolfmed_mobile_comments");
            modelBuilder.Entity<ProcedureTag>().ToTable("wolfmed_mobile_procedure_tags");

            // ── User ────────────────────────────────────────────────────────
            modelBuilder.Entity<User>(entity =>
            {
                entity.Property(u => u.UserId).HasColumnName("userId");
                entity.Property(u => u.Username).HasColumnName("username");
                entity.Property(u => u.Motto).HasColumnName("motto");
                entity.Property(u => u.TestLimit).HasColumnName("testLimit");
                entity.Property(u => u.Supporter).HasColumnName("supporter");
                entity.Property(u => u.TestsAttempted).HasColumnName("tests_attempted");
                entity.Property(u => u.TotalScore).HasColumnName("total_score");
                entity.Property(u => u.TotalQuestions).HasColumnName("total_questions");
                entity.Property(u => u.CreatedAt).HasColumnName("createdAt");
                entity.Property(u => u.UpdatedAt).HasColumnName("updatedAt");
                entity.HasIndex(u => u.UserId).IsUnique();
            });

            // ── Test ─────────────────────────────────────────────────────────
            modelBuilder.Entity<Test>(entity =>
            {
                entity.Property(t => t.CategoryId).HasColumnName("categoryId");
                entity.Property(t => t.Category).HasColumnName("category");
                entity.Property(t => t.Data).HasColumnName("data").HasColumnType("jsonb");
                entity.Property(t => t.CreatedAt).HasColumnName("createdAt");
                entity.Property(t => t.UpdatedAt).HasColumnName("updatedAt");
                entity.HasOne(t => t.CategoryNav)
                      .WithMany(c => c.Tests)
                      .HasForeignKey(t => t.CategoryId);
            });

            // ── Procedure ────────────────────────────────────────────────────
            modelBuilder.Entity<Procedure>(entity =>
            {
                entity.Property(p => p.Data).HasColumnName("data").HasColumnType("jsonb");
                entity.Property(p => p.CreatedAt).HasColumnName("createdAt");
                entity.Property(p => p.UpdatedAt).HasColumnName("updatedAt");
            });

            // ── CompletedTest — FK to User.UserId (varchar, not Guid PK) ─────
            modelBuilder.Entity<CompletedTest>(entity =>
            {
                entity.Property(ct => ct.UserId).HasColumnName("userId");
                entity.Property(ct => ct.Score).HasColumnName("score");
                entity.Property(ct => ct.TestResult).HasColumnName("testResult").HasColumnType("jsonb");
                entity.Property(ct => ct.CompletedAt).HasColumnName("completedAt");
                entity.HasOne(ct => ct.User)
                      .WithMany(u => u.CompletedTests)
                      .HasForeignKey(ct => ct.UserId)
                      .HasPrincipalKey(u => u.UserId);  // FK to varchar userId, NOT Guid PK
            });

            // ── BlogPost ──────────────────────────────────────────────────────
            modelBuilder.Entity<BlogPost>(entity =>
            {
                entity.Property(b => b.CreatedAt).HasColumnName("createdAt");
                entity.Property(b => b.UpdatedAt).HasColumnName("updatedAt");
            });

            // ── Comment — FK to BlogPost and FK to User.UserId (varchar) ──────
            modelBuilder.Entity<Comment>(entity =>
            {
                entity.Property(c => c.BlogPostId).HasColumnName("blogPostId");
                entity.Property(c => c.UserId).HasColumnName("userId");
                entity.Property(c => c.CreatedAt).HasColumnName("createdAt");
                entity.Property(c => c.UpdatedAt).HasColumnName("updatedAt");
                entity.HasOne(c => c.BlogPost)
                      .WithMany(b => b.Comments)
                      .HasForeignKey(c => c.BlogPostId);
                entity.HasOne(c => c.User)
                      .WithMany(u => u.Comments)
                      .HasForeignKey(c => c.UserId)
                      .HasPrincipalKey(u => u.UserId);  // FK to varchar userId
            });

            // ── Message ────────────────────────────────────────────────────────
            modelBuilder.Entity<Message>(entity =>
            {
                entity.Property(m => m.MessageContent).HasColumnName("message");
                entity.Property(m => m.CreatedAt).HasColumnName("createdAt");
                entity.Property(m => m.UpdatedAt).HasColumnName("updatedAt");
            });

            // ── Category ───────────────────────────────────────────────────────
            modelBuilder.Entity<Category>(entity =>
            {
                entity.Property(c => c.IsActive).HasColumnName("isActive");
            });

            // ── Tag ─────────────────────────────────────────────────────────────
            modelBuilder.Entity<Tag>(entity =>
            {
                entity.Property(t => t.IsActive).HasColumnName("isActive");
            });

            // ── ProcedureTag — composite PK ─────────────────────────────────────
            modelBuilder.Entity<ProcedureTag>(entity =>
            {
                entity.HasKey(pt => new { pt.ProcedureId, pt.TagId });
                entity.Property(pt => pt.ProcedureId).HasColumnName("procedureId");
                entity.Property(pt => pt.TagId).HasColumnName("tagId");
                entity.HasOne(pt => pt.Procedure)
                      .WithMany(p => p.ProcedureTags)
                      .HasForeignKey(pt => pt.ProcedureId);
                entity.HasOne(pt => pt.Tag)
                      .WithMany(t => t.ProcedureTags)
                      .HasForeignKey(pt => pt.TagId);
            });
        }
    }
}
```

### 4.2 — Checklist

- [ ] Create `Data/AppDbContext.cs` with code above
- [ ] No `Database.EnsureCreated()` call
- [ ] No `Database.Migrate()` call
- [ ] EF Core only connects — Drizzle manages schema
- [ ] For health check, use `Database.CanConnectAsync()`

---

## Part 5 — CQRS Features (follow the guide — Vertical Slice)

Create folder: `Features/`

### 5.0 — Supporting Infrastructure

**`Behaviors/ValidationBehavior.cs`** — intercepts all Commands before Handler runs:

```csharp
using FluentValidation;
using MediatR;

namespace WolfmedAPI.Behaviors
{
    public class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
        where TRequest : IRequest<TResponse>
    {
        private readonly IEnumerable<IValidator<TRequest>> _validators;

        public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators)
        {
            _validators = validators;
        }

        public async Task<TResponse> Handle(
            TRequest request,
            RequestHandlerDelegate<TResponse> next,
            CancellationToken cancellationToken)
        {
            if (!_validators.Any()) return await next();

            var context = new ValidationContext<TRequest>(request);
            var errors = _validators
                .Select(v => v.Validate(context))
                .SelectMany(r => r.Errors)
                .Where(e => e != null)
                .ToList();

            if (errors.Count != 0)
                throw new ValidationException(errors);

            return await next();
        }
    }
}
```

**`Middleware/GlobalExceptionMiddleware.cs`** — catches 404/400/500:

```csharp
using FluentValidation;
using System.Net;
using System.Text.Json;

namespace WolfmedAPI.Middleware
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionMiddleware> _logger;

        public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning("Not found: {Message}", ex.Message);
                await WriteResponse(context, HttpStatusCode.NotFound, ex.Message);
            }
            catch (ValidationException ex)
            {
                _logger.LogWarning("Validation error");
                var errors = ex.Errors.Select(e => new { field = e.PropertyName, error = e.ErrorMessage });
                await WriteResponse(context, HttpStatusCode.BadRequest, "Validation failed", errors);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception");
                await WriteResponse(context, HttpStatusCode.InternalServerError, "An unexpected error occurred");
            }
        }

        private static async Task WriteResponse(HttpContext context, HttpStatusCode statusCode, string message, object? details = null)
        {
            context.Response.StatusCode = (int)statusCode;
            context.Response.ContentType = "application/json";
            var response = new { message, details };
            await context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }
    }
}
```

### 5.1 — Feature folder structure (replicate for each entity)

```
Features/Categories/
├── Handlers/
│   ├── Commands/
│   │   ├── CreateCategoryHandler.cs
│   │   ├── DeleteCategoryHandler.cs
│   │   └── UpdateCategoryHandler.cs
│   └── Queries/
│       ├── GetAllCategoriesHandler.cs
│       └── GetCategoryByIdHandler.cs
├── Mappings/
│   └── CategoryMappingConfig.cs
├── Messages/
│   ├── Commands/
│   │   ├── CreateCategoryCommand.cs
│   │   ├── DeleteCategoryCommand.cs
│   │   └── UpdateCategoryCommand.cs
│   ├── DTOs/
│   │   └── CategoryDto.cs
│   └── Queries/
│       ├── GetAllCategoriesQuery.cs
│       └── GetCategoryByIdQuery.cs
├── Providers/
│   ├── ICategoryProvider.cs
│   └── CategoryProvider.cs
├── Services/
│   ├── ICategoryService.cs
│   └── CategoryService.cs
├── Validators/
|   └── Commands/
|        ├── CreateCategoryValidator.cs
|        ├── DeleteCategoryValidator.cs
|        └── UpdateCategoryValidator.cs
|        
├── Tests/
├── Procedures/
├── Tags/
├── CompletedTests/
├── BlogPosts/
├── Comments/
├── Users/
└── Messages/
```

### 5.2 — Complete Categories Feature (reference implementation)

> Categories is the reference feature. All other entities follow the same pattern.

**`Features/Categories/Messages/DTOs/CategoryDto.cs`:**

```csharp
namespace WolfmedAPI.Features.Categories.Messages.DTOs
{
    public class CategoryDto
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public int TestCount { get; set; }
    }
}
```
**`Features/Categories/Messages/Commands/CreateCategoryCommand.cs`:**

```csharp
using MediatR;

namespace WolfmedAPI.Features.Categories.Messages.Commands
{
    public class CreateCategoryCommand : IRequest<int>
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}
```

**`Features/Categories/Messages/Commands/UpdateCategoryCommand.cs`:**

```csharp
using MediatR;

namespace WolfmedAPI.Features.Categories.Messages.Commands
{
    public class UpdateCategoryCommand : IRequest<Unit>
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; }
    }
}
```

**`Features/Categories/Messages/Commands/DeleteCategoryCommand.cs`:**

```csharp
using MediatR;

namespace WolfmedAPI.Features.Categories.Messages.Commands
{
    public class DeleteCategoryCommand : IRequest<Unit>
    {
        public int Id { get; set; }
        public DeleteCategoryCommand(int id) => Id = id;
    }
}
```

**`Features/Categories/Mappings/CategoryMappingConfig.cs`:**

```csharp
using Mapster;
using WolfmedAPI.Features.Categories.Messages.Commands;
using WolfmedAPI.Features.Categories.Messages.DTOs;
using WolfmedAPI.Models;

namespace WolfmedAPI.Features.Categories.Mappings
{
    public class CategoryMappingConfig : IRegister
    {
        public void Register(TypeAdapterConfig config)
        {
            config.NewConfig<Category, CategoryDto>()
                .Map(dest => dest.TestCount, src => src.Tests.Count);

            config.NewConfig<CreateCategoryCommand, Category>()
                .Map(dest => dest.IsActive, _ => true)
                .Ignore(dest => dest.Id)
                .Ignore(dest => dest.Tests!);

            config.NewConfig<UpdateCategoryCommand, Category>()
                .Ignore(dest => dest.Id)
                .Ignore(dest => dest.Tests!);
        }
    }
}
```

**`Features/Categories/Providers/ICategoryProvider.cs`:**

```csharp
using WolfmedAPI.Models;

namespace WolfmedAPI.Features.Categories.Providers
{
    public interface ICategoryProvider
    {
        /// <summary>
        /// Gets all categories from the database.
        /// </summary>
        /// <param name="asNoTracking">Specifies whether the entities should be tracked by the context.</param>
        /// <param name="cancellationToken">A token to cancel the operation.</param>
        /// <returns>A collection of categories.</returns>
        Task<IEnumerable<Category>> GetAllCategoriesAsync(bool asNoTracking = true, CancellationToken cancellationToken = default);

        /// <summary>
        /// Retrieves a category by its unique identifier.
        /// </summary>
        /// <param name="id">The unique identifier of the category.</param>
        /// <param name="asNoTracking">Indicates whether change tracking should be disabled.</param>
        /// <param name="cancellationToken">A token to cancel the operation.</param>
        /// <returns>The category if found; otherwise throws KeyNotFoundException.</returns>
        Task<Category> GetCategoryByIdAsync(int id, bool asNoTracking = true, CancellationToken cancellationToken = default);
    }
}
```

**`Features/Categories/Providers/CategoryProvider.cs`:**

```csharp
using Microsoft.EntityFrameworkCore;
using WolfmedAPI.Data;
using WolfmedAPI.Models;

namespace WolfmedAPI.Features.Categories.Providers
{
    public class CategoryProvider : ICategoryProvider
    {
        private readonly AppDbContext _context;

        public CategoryProvider(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Category>> GetAllCategoriesAsync(bool asNoTracking = true, CancellationToken cancellationToken = default)
        {
            var query = _context.Categories
                .Include(c => c.Tests)
                .Where(c => c.IsActive);

            if (asNoTracking)
                query = query.AsNoTracking();

            return await query
                .OrderBy(c => c.Name)
                .ToListAsync(cancellationToken);
        }

        public async Task<Category> GetCategoryByIdAsync(int id, bool asNoTracking = true, CancellationToken cancellationToken = default)
        {
            var query = _context.Categories
                .Include(c => c.Tests)
                .Where(c => c.IsActive);

            if (asNoTracking)
                query = query.AsNoTracking();

            var category = await query
                .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);

            return category ?? throw new KeyNotFoundException($"Kategoria o ID {id} nie istnieje");
        }
    }
}
```

**`Features/Categories/Services/ICategoryService.cs`:**

```csharp
using WolfmedAPI.Models;

namespace WolfmedAPI.Features.Categories.Services
{
    public interface ICategoryService
    {
        Task CreateCategory(Category category, CancellationToken cancellationToken);
    }
}
```

**`Features/Categories/Services/CategoryService.cs`:**

```csharp
using WolfmedAPI.Data;
using WolfmedAPI.Models;

namespace WolfmedAPI.Features.Categories.Services
{
    public class CategoryService(AppDbContext context) : ICategoryService
    {
        public async Task CreateCategory(Category category, CancellationToken cancellationToken)
        {
            context.Categories.Add(category);
            await context.SaveChangesAsync(cancellationToken);
        }
    }
}
```

**`Features/Categories/Messages/Queries/GetAllCategoriesQuery.cs`:**

```csharp
using MediatR;
using WolfmedAPI.Features.Categories.Messages.DTOs;

namespace WolfmedAPI.Features.Categories.Messages.Queries
{
    public class GetAllCategoriesQuery : IRequest<IEnumerable<CategoryDto>> { }
}
```

**`Features/Categories/Handlers/Queries/GetAllCategoriesHandler.cs`:**

```csharp
using Mapster;
using MediatR;
using WolfmedAPI.Features.Categories.Messages.DTOs;
using WolfmedAPI.Features.Categories.Messages.Queries;
using WolfmedAPI.Features.Categories.Providers;

namespace WolfmedAPI.Features.Categories.Handlers.Queries
{
    public class GetAllCategoriesHandler : IRequestHandler<GetAllCategoriesQuery, IEnumerable<CategoryDto>>
    {
        private readonly ICategoryProvider _provider;
        private readonly ILogger<GetAllCategoriesHandler> _logger;

        public GetAllCategoriesHandler(ICategoryProvider provider, ILogger<GetAllCategoriesHandler> logger)
        {
            _provider = provider;
            _logger = logger;
        }

        public async Task<IEnumerable<CategoryDto>> Handle(GetAllCategoriesQuery request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Pobieranie wszystkich kategorii");

            var categories = await _provider.GetAllCategoriesAsync(cancellationToken: cancellationToken);
            var result = categories.Adapt<IEnumerable<CategoryDto>>();

            _logger.LogInformation("Pobrano {Count} kategorii", result.Count());
            return result;
        }
    }
}
```

**`Features/Categories/Messages/Queries/GetCategoryByIdQuery.cs`:**

```csharp
using MediatR;
using WolfmedAPI.Features.Categories.Messages.DTOs;

namespace WolfmedAPI.Features.Categories.Messages.Queries
{
    public class GetCategoryByIdQuery : IRequest<CategoryDto>
    {
        public int Id { get; set; }
        public GetCategoryByIdQuery(int id) => Id = id;
    }
}
```

**`Features/Categories/Handlers/Queries/GetCategoryByIdHandler.cs`:**

```csharp
using Mapster;
using MediatR;
using WolfmedAPI.Features.Categories.Messages.DTOs;
using WolfmedAPI.Features.Categories.Messages.Queries;
using WolfmedAPI.Features.Categories.Providers;

namespace WolfmedAPI.Features.Categories.Handlers.Queries
{
    public class GetCategoryByIdHandler : IRequestHandler<GetCategoryByIdQuery, CategoryDto>
    {
        private readonly ICategoryProvider _provider;
        private readonly ILogger<GetCategoryByIdHandler> _logger;

        public GetCategoryByIdHandler(ICategoryProvider provider, ILogger<GetCategoryByIdHandler> logger)
        {
            _provider = provider;
            _logger = logger;
        }

        public async Task<CategoryDto> Handle(GetCategoryByIdQuery request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Pobieranie kategorii ID: {Id}", request.Id);

            var category = await _provider.GetCategoryByIdAsync(request.Id, cancellationToken: cancellationToken);
            return category.Adapt<CategoryDto>();
        }
    }
}
```

**`Features/Categories/Handlers/Commands/CreateCategoryHandler.cs`:**

```csharp
using Mapster;
using MediatR;
using WolfmedAPI.Features.Categories.Messages.Commands;
using WolfmedAPI.Features.Categories.Services;
using WolfmedAPI.Models;

namespace WolfmedAPI.Features.Categories.Handlers.Commands
{
    public class CreateCategoryHandler : IRequestHandler<CreateCategoryCommand, int>
    {
        private readonly ICategoryService _service;
        private readonly ILogger<CreateCategoryHandler> _logger;

        public CreateCategoryHandler(ICategoryService service, ILogger<CreateCategoryHandler> logger)
        {
            _service = service;
            _logger = logger;
        }

        public async Task<int> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Tworzenie kategorii: {Name}", request.Name);

            var category = request.Adapt<Category>();
            await _service.CreateCategory(category, cancellationToken);

            _logger.LogInformation("Utworzono kategorię ID: {Id}", category.Id);
            return category.Id;
        }
    }
}
```

**`Features/Categories/Handlers/Commands/UpdateCategoryHandler.cs`:**

```csharp
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;
using WolfmedAPI.Data;
using WolfmedAPI.Features.Categories.Messages.Commands;

namespace WolfmedAPI.Features.Categories.Handlers.Commands
{
    public class UpdateCategoryHandler : IRequestHandler<UpdateCategoryCommand, Unit>
    {
        private readonly AppDbContext _context;
        private readonly ILogger<UpdateCategoryHandler> _logger;

        public UpdateCategoryHandler(AppDbContext context, ILogger<UpdateCategoryHandler> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<Unit> Handle(UpdateCategoryCommand request, CancellationToken cancellationToken)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

            if (category == null)
                throw new KeyNotFoundException($"Kategoria o ID {request.Id} nie istnieje");

            _logger.LogInformation("Aktualizacja kategorii ID: {Id}", request.Id);

            request.Adapt(category);

            await _context.SaveChangesAsync(cancellationToken);
            _logger.LogInformation("Zaktualizowano kategorię ID: {Id}", request.Id);

            return Unit.Value;
        }
    }
}
```

**`Features/Categories/Handlers/Commands/DeleteCategoryHandler.cs`:**

```csharp
using MediatR;
using Microsoft.EntityFrameworkCore;
using WolfmedAPI.Data;
using WolfmedAPI.Features.Categories.Messages.Commands;

namespace WolfmedAPI.Features.Categories.Handlers.Commands
{
    public class DeleteCategoryHandler : IRequestHandler<DeleteCategoryCommand, Unit>
    {
        private readonly AppDbContext _context;
        private readonly ILogger<DeleteCategoryHandler> _logger;

        public DeleteCategoryHandler(AppDbContext context, ILogger<DeleteCategoryHandler> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<Unit> Handle(DeleteCategoryCommand request, CancellationToken cancellationToken)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

            if (category == null)
                throw new KeyNotFoundException($"Kategoria o ID {request.Id} nie istnieje");

            _logger.LogInformation("Soft-delete kategorii ID: {Id}", request.Id);
            category.IsActive = false;
            await _context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}
```

**`Features/Categories/Validators/Commands/CreateCategoryValidator.cs`:**

```csharp
using FluentValidation;
using WolfmedAPI.Features.Categories.Messages.Commands;

namespace WolfmedAPI.Features.Categories.Validators.Commands
{
    public class CreateCategoryValidator : AbstractValidator<CreateCategoryCommand>
    {
        public CreateCategoryValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Nazwa kategorii jest wymagana")
                .MaximumLength(256).WithMessage("Nazwa może mieć max 256 znaków");
        }
    }
}
```

**`Features/Categories/Validators/Commands/UpdateCategoryValidator.cs`:**

```csharp
using FluentValidation;
using WolfmedAPI.Features.Categories.Messages.Commands;

namespace WolfmedAPI.Features.Categories.Validators.Commands
{
    public class UpdateCategoryValidator : AbstractValidator<UpdateCategoryCommand>
    {
        public UpdateCategoryValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Nazwa kategorii jest wymagana")
                .MaximumLength(256).WithMessage("Nazwa może mieć max 256 znaków");
        }
    }
}
```

**`Features/Categories/Validators/Commands/DeleteCategoryValidator.cs`:**

```csharp
using FluentValidation;
using WolfmedAPI.Features.Categories.Messages.Commands;

namespace WolfmedAPI.Features.Categories.Validators.Commands
{
    public class DeleteCategoryValidator : AbstractValidator<DeleteCategoryCommand>
    {
        public DeleteCategoryValidator()
        {
            RuleFor(x => x.Id)
                .GreaterThan(0).WithMessage("Nieprawidłowe ID kategorii");
        }
    }
}
```

### 5.3 — Entities to implement (9 total)

- [ ] `Features/Categories/` — **done above** (reference implementation)
- [ ] `Features/Tags/` — same pattern as Categories (`int` IDs, `IsActive` soft delete)
- [ ] `Features/Tests/` — `Guid` IDs, `CategoryId` join, no `IsActive` (hard delete)
- [ ] `Features/Procedures/` — `Guid` IDs, `ProcedureTags` include, hard delete
- [ ] `Features/CompletedTests/` — `Guid` IDs, filter by `userId` on GetAll, hard delete
- [ ] `Features/BlogPosts/` — `Guid` IDs, no `IsActive`, hard delete
- [ ] `Features/Comments/` — `Guid` IDs, filter by `blogPostId` on GetAll, hard delete
- [ ] `Features/Users/` — string `userId` (Clerk), no `IsActive`
- [ ] `Features/Messages/` — `int` IDs, hard delete

### 5.4 — Special DTO considerations

**`Features/Tests/TestDto.cs`** — include category info from join:

```csharp
using System.Text.Json;

namespace WolfmedAPI.Features.Tests
{
    public class TestDto
    {
        public Guid Id { get; set; }
        public string? Category { get; set; }
        public int? CategoryId { get; set; }
        public string? CategoryName { get; set; }    // from CategoryNav join
        public JsonElement Data { get; set; }         // question + answers
        public DateTime? CreatedAt { get; set; }
    }
}
```

**`Features/Procedures/ProcedureDto.cs`** — include tags from many-to-many:

```csharp
using System.Text.Json;

namespace WolfmedAPI.Features.Procedures
{
    public class ProcedureDto
    {
        public Guid Id { get; set; }
        public JsonElement Data { get; set; }        // name, procedure, algorithm[]
        public List<string> Tags { get; set; } = new List<string>();  // tag names
        public DateTime? CreatedAt { get; set; }
    }
}
```

**`Features/CompletedTests/CompletedTestDto.cs`:**

```csharp
using System.Text.Json;

namespace WolfmedAPI.Features.CompletedTests
{
    public class CompletedTestDto
    {
        public Guid Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public int Score { get; set; }
        public JsonElement TestResult { get; set; }
        public DateTime CompletedAt { get; set; }
    }
}
```

**GetAll handler for Procedures** — shows how to include Tags:

```csharp
// In GetAllProceduresHandler.cs
var procedures = await _context.Procedures
    .Include(p => p.ProcedureTags)
        .ThenInclude(pt => pt.Tag)
    .Select(p => new ProcedureDto
    {
        Id = p.Id,
        Data = p.Data.RootElement,
        Tags = p.ProcedureTags.Select(pt => pt.Tag.Name).ToList(),
        CreatedAt = p.CreatedAt
    })
    .ToListAsync(cancellationToken);
```

### 5.5 — Per feature checklist

For **each** of the 9 entities, create:

- [ ] `GetAll` Query + Handler — returns `List<TDto>`, filters `IsActive` where applicable
- [ ] `GetById` Query + Handler — returns `TDto?`, returns null if not found
- [ ] `Create` Command + Handler + Validator — returns new record's Id (Guid or int)
- [ ] `Update` Command + Handler + Validator — returns `Unit`, throws `KeyNotFoundException` if not found
- [ ] `Delete` Command + Handler — **soft delete** (`IsActive = false`) where field exists,
  hard delete for `CompletedTest`, `Message`, `BlogPost`, `Comment`, `Test` (no `IsActive` field)
- [ ] `TDto.cs` — DTO class in the feature folder, includes related entity names
  (e.g. `TestDto` includes `CategoryName` from the join)

- [ ] Add `ValidationBehavior<TRequest, TResponse>` to `Behaviors/`
- [ ] Add `GlobalExceptionMiddleware` to `Middleware/`
- [ ] Register in `Program.cs`: `services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>))`

---

## Part 6 — Controllers (9 total)

Create folder: `Controllers/`

### 6.1 — Complete `CategoriesController.cs` (reference implementation)

```csharp
using MediatR;
using Microsoft.AspNetCore.Mvc;
using WolfmedAPI.Features.Categories;
using WolfmedAPI.Features.Categories.Commands.CreateCategory;
using WolfmedAPI.Features.Categories.Commands.DeleteCategory;
using WolfmedAPI.Features.Categories.Commands.UpdateCategory;
using WolfmedAPI.Features.Categories.Queries.GetAllCategories;
using WolfmedAPI.Features.Categories.Queries.GetCategoryById;

namespace WolfmedAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<CategoriesController> _logger;

        public CategoriesController(IMediator mediator, ILogger<CategoriesController> logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        /// <summary>Pobiera wszystkie aktywne kategorie</summary>
        [HttpGet]
        public async Task<ActionResult<List<CategoryDto>>> GetAll(CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new GetAllCategoriesQuery(), cancellationToken);
            return Ok(result);
        }

        /// <summary>Pobiera kategorię po ID</summary>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<CategoryDto>> GetById(int id, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new GetCategoryByIdQuery(id), cancellationToken);
            if (result == null) return NotFound();
            return Ok(result);
        }

        /// <summary>Tworzy nową kategorię</summary>
        [HttpPost]
        public async Task<ActionResult<int>> Create([FromBody] CreateCategoryCommand command, CancellationToken cancellationToken)
        {
            var id = await _mediator.Send(command, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id }, id);
        }

        /// <summary>Aktualizuje kategorię</summary>
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateCategoryCommand command, CancellationToken cancellationToken)
        {
            command.Id = id;
            await _mediator.Send(command, cancellationToken);
            return NoContent();
        }

        /// <summary>Soft-delete kategorii (IsActive = false)</summary>
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            await _mediator.Send(new DeleteCategoryCommand(id), cancellationToken);
            return NoContent();
        }
    }
}
```

### 6.2 — Controller list (all follow CategoriesController pattern)

| Controller | ID type | Route constraint | Notes |
|---|---|---|---|
| `CategoriesController` | `int` | `{id:int}` | Soft delete (IsActive) |
| `TagsController` | `int` | `{id:int}` | Soft delete (IsActive) |
| `TestsController` | `Guid` | `{id:guid}` | Add `?categoryId=` on GetAll |
| `ProceduresController` | `Guid` | `{id:guid}` | Tags in DTO |
| `CompletedTestsController` | `Guid` | `{id:guid}` | Add `?userId=` on GetAll |
| `BlogPostsController` | `Guid` | `{id:guid}` | Hard delete |
| `CommentsController` | `Guid` | `{id:guid}` | Add `?blogPostId=` on GetAll |
| `UsersController` | `string` | `{userId}` | No constraint needed |
| `MessagesController` | `int` | `{id:int}` | Hard delete |

- [ ] `CategoriesController.cs` — **done above** (reference)
- [ ] `TagsController.cs`
- [ ] `TestsController.cs`
- [ ] `ProceduresController.cs`
- [ ] `CompletedTestsController.cs`
- [ ] `BlogPostsController.cs`
- [ ] `CommentsController.cs`
- [ ] `UsersController.cs`
- [ ] `MessagesController.cs`

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

### 7.1 — Complete `Program.cs`

```csharp
using System.Reflection;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using WolfmedAPI.Behaviors;
using WolfmedAPI.Data;
using WolfmedAPI.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Controllers
builder.Services.AddControllers();

// Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "WolfmedAPI", Version = "v1" });
    // JWT auth button in Swagger UI
    c.AddSecurityDefinition("Bearer", new()
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Wpisz token JWT"
    });
    c.AddSecurityRequirement(new()
    {
        {
            new() { Reference = new() { Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme, Id = "Bearer" } },
            Array.Empty<string>()
        }
    });
    // XML comments (from .csproj <GenerateDocumentationFile>true</GenerateDocumentationFile>)
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath)) c.IncludeXmlComments(xmlPath);
});

// EF Core + Npgsql (PostgreSQL — Neon)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// MediatR — auto-discovers all Handlers, Queries, Commands in the assembly
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));

// FluentValidation — auto-discovers all Validators in the assembly
builder.Services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

// FluentValidation Pipeline Behavior — validates Commands before Handler runs
builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));

// CORS — Development: allow all; Production: restrict to Azure URL
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevelopmentPolicy", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
    options.AddPolicy("ProductionPolicy", policy =>
        policy.WithOrigins(builder.Configuration["AllowedOrigins"] ?? "*")
              .AllowAnyMethod().AllowAnyHeader());
});

// Clerk JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = builder.Configuration["Clerk:Authority"];
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = false,  // Clerk doesn't set audience by default
            ValidateLifetime = true,
        };
    });

builder.Services.AddAuthorization();

// Health checks
builder.Services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>();

var app = builder.Build();

var isDevelopment = app.Environment.IsDevelopment();

// Swagger (dev only)
if (isDevelopment)
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Middleware pipeline ORDER IS CRITICAL
app.UseMiddleware<GlobalExceptionMiddleware>();
app.UseHttpsRedirection();
app.UseCors(isDevelopment ? "DevelopmentPolicy" : "ProductionPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health");

app.Run();
```

### 7.2 — Checklist

- [ ] All services registered
- [ ] `GlobalExceptionMiddleware` placed **before** everything else in pipeline
- [ ] `UseCors()` placed **before** `UseAuthentication()` (critical for RN emulator)
- [ ] Health check endpoint at `/health`
- [ ] `Behaviors/ValidationBehavior.cs` created (see Part 5.0)
- [ ] `Middleware/GlobalExceptionMiddleware.cs` created (see Part 5.0)

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
