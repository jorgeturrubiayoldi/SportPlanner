---
name: stack-origen
description: Tech stack and architecture standards for Origen projects (Angular, Supabase, .NET).
---

# 📚 Origen Tech Stack Standards

## 🏛️ Architecture: Clean Architecture + CQRS
- **Separation of Concerns:** Core (Entities/Interfaces), Application (Use Cases/MediatR), Infrastructure (External services/DB), API.
- **Patterns:** Use MediatR for Command/Query separation in .NET. Use FluentValidation for request validation.

## ⚙️ Backend: .NET 8+
- **Language:** C#
- **API Design:** RESTful. Use DTOs for data transfer. No entities exposed in API.
- **Dependency Injection:** Mandatory for all services and repositories.
- **Async/Await:** Use async everywhere.

## 🌍 Frontend: Angular (Latest)
- **State Management:** Use Signals for local state and RxJS for asynchronous streams.
- **Components:** Standalone components preferred.
- **Styling:** Tailwind CSS (Utility-first). Use the standards defined in [design-system.md](design-system.md) for colors and UI patterns.
- **Forms:** Reactive Forms preferred.

## ⚡ Database & Auth: Supabase
- **Row Level Security (RLS):** Mandatory for all tables. No data should be accessible without an explicit policy.
- **Auth:** Use Supabase GoTrue for authentication (integrated with Angular/ .NET).
- **Storage:** Use Supabase Storage for file management.
- **Functions:** Use PostgreSQL functions or Supabase Edge Functions for DB-intensive logic.

## ✅ Development Best Practices
- **Naming:** PascalCase for .NET, camelCase for TypeScript/JSON.
- **Comments:** XML comments in C# for public APIs. TSDoc for TypeScript.
- **Git:** Feature branch workflow. Atomic commits.
