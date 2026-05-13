# COPILOT MASTER PROMPT — Radiograph Student Evaluation Web Portal

> Paste this entire document into GitHub Copilot Chat inside your Codespace.
> Do NOT modify headings or section order — Copilot uses them as navigation anchors.

---

## ROLE & OBJECTIVE

You are a Senior Full-Stack Engineer. Your task is to scaffold a complete, production-ready
**Radiograph Student Evaluation Web Portal** from scratch inside this GitHub Codespace.

You must follow every instruction in this document precisely and in the order given.
Do not skip sections. Do not invent alternative tech choices.
After generating each file, confirm the filename and its location in the project tree.

---

## TECH STACK — NON-NEGOTIABLE

| Concern            | Technology                                                      |
|--------------------|-----------------------------------------------------------------|
| Framework          | Next.js 14+ (App Router ONLY — no `pages/` directory)          |
| Language           | TypeScript (strict mode)                                        |
| Styling            | Tailwind CSS v3                                                 |
| ORM                | Prisma ORM                                                      |
| Database           | Vercel Serverless Postgres (`@vercel/postgres` + Prisma adapter)|
| Authentication     | Clerk (`@clerk/nextjs`)                                         |
| Form handling      | React Hook Form + Zod                                           |
| Component model    | React Server Components (RSC) where data-fetching occurs        |

> **Clerk note:** Use Clerk's App Router integration only.
> Import from `@clerk/nextjs/server` for server-side helpers and
> `@clerk/nextjs` for client components.

---

## SECTION 1 — COMPLETE FILE & FOLDER TREE

Generate the following directory tree exactly as shown.
Create every file listed — do not omit any file even if it will be populated in a later step.
Comment each file with a one-line description of its purpose.

```
radiograph-portal/
├── .env.local                        # All secrets (never commit)
├── .env.example                      # Safe template for teammates
├── .gitignore
├── next.config.ts                    # Next.js config — image domains, env exposure
├── tailwind.config.ts                # Tailwind config with custom color tokens
├── tsconfig.json                     # TypeScript strict mode
├── package.json
│
├── prisma/
│   └── schema.prisma                 # Database schema (see Section 2)
│
├── middleware.ts                     # Root-level Clerk auth middleware (see Section 3)
│
└── src/
    ├── app/
    │   ├── layout.tsx                # Root layout — ClerkProvider wrapper
    │   ├── page.tsx                  # Public landing/redirect page
    │   │
    │   ├── sign-in/
    │   │   └── [[...sign-in]]/
    │   │       └── page.tsx          # Clerk-hosted sign-in page
    │   │
    │   ├── sign-up/
    │   │   └── [[...sign-up]]/
    │   │       └── page.tsx          # Clerk-hosted sign-up page
    │   │
    │   ├── dashboard/
    │   │   ├── layout.tsx            # Assessor-only layout shell with nav
    │   │   └── page.tsx              # RSC dashboard: lists all evaluations
    │   │
    │   └── evaluations/
    │       ├── new/
    │       │   └── page.tsx          # New evaluation form page (Client Component)
    │       └── [id]/
    │           └── page.tsx          # RSC: single evaluation detail view
    │
    ├── components/
    │   ├── ui/
    │   │   ├── Button.tsx            # Reusable button component
    │   │   ├── Input.tsx             # Reusable input component
    │   │   ├── Select.tsx            # Reusable select/dropdown component
    │   │   ├── Slider.tsx            # Reusable range slider component
    │   │   ├── Textarea.tsx          # Reusable textarea component
    │   │   └── Badge.tsx             # Status badge (e.g. exposure rating)
    │   │
    │   ├── EvaluationForm.tsx        # 'use client' form with React Hook Form + Zod
    │   ├── EvaluationCard.tsx        # RSC-compatible card for dashboard list
    │   └── NavBar.tsx                # Top navigation bar with Clerk UserButton
    │
    ├── lib/
    │   ├── prisma.ts                 # Singleton Prisma client
    │   ├── validations.ts            # Zod schemas shared by form + server actions
    │   └── utils.ts                  # Helper functions (cn, formatDate, etc.)
    │
    └── actions/
        └── evaluations.ts            # Server Actions — create/read evaluations
```

After outputting this tree, confirm: "Tree generated. Proceeding to Section 2."

---

## SECTION 2 — PRISMA DATABASE SCHEMA

Generate the file `prisma/schema.prisma` with the exact content below.
Do not rename models or fields. Do not change field types.

### 2a. Generator and Datasource blocks

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("POSTGRES_PRISMA_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")
}
```

### 2b. Enums

```prisma
enum ExposureRating {
  UNDER_EXPOSED
  OPTIMAL
  OVER_EXPOSED
}

enum UserRole {
  ASSESSOR
  STUDENT
}
```

### 2c. Models

Generate the following three models with ALL fields and relations:

**Model: User**
- `id`             — String, `@id @default(cuid())`
- `clerkId`        — String, `@unique` — maps to Clerk's `userId`
- `email`          — String, `@unique`
- `name`           — String?
- `role`           — `UserRole`, `@default(STUDENT)`
- `createdAt`      — DateTime, `@default(now())`
- `updatedAt`      — DateTime, `@updatedAt`
- `assessments`    — relation: `Evaluation[]` where this User is the assessor
- Add `@@map("users")`

**Model: Student**
- `id`             — String, `@id @default(cuid())`
- `studentId`      — String, `@unique` — official student registration number
- `name`           — String
- `email`          — String, `@unique`
- `createdAt`      — DateTime, `@default(now())`
- `updatedAt`      — DateTime, `@updatedAt`
- `evaluations`    — relation: `Evaluation[]`
- Add `@@map("students")`

**Model: Evaluation**
- `id`               — String, `@id @default(cuid())`
- `studentId`        — String — FK to `Student.id`
- `student`          — relation to `Student`
- `assessorId`       — String — FK to `User.id`
- `assessor`         — relation to `User`
- `positioningScore` — Int — must store values 1–10
- `exposureRating`   — `ExposureRating`
- `clinicalFeedback` — String — free-text, max 2000 chars (enforce in Zod, not DB)
- `createdAt`        — DateTime, `@default(now())`
- `updatedAt`        — DateTime, `@updatedAt`
- Add `@@map("evaluations")`

After generating this file, output the terminal command to run:
```bash
npx prisma generate && npx prisma db push
```
And add a comment explaining that `db push` is used for prototyping;
for production, switch to `prisma migrate deploy`.

---

## SECTION 3 — AUTHENTICATION & SECURITY

This section is CRITICAL. Generate every file exactly as described.
Security must be layered at THREE levels: middleware, server action, and layout.

### 3a. Root Middleware — `middleware.ts`

This file lives at the project root (same level as `src/`).

Generate `middleware.ts` using Clerk's `authMiddleware` (or `clerkMiddleware` if using
Clerk SDK v5+). Configure it so that:

1. ALL routes are protected by default.
2. The following routes are explicitly PUBLIC (unauthenticated users can access):
   - `/` (landing page)
   - `/sign-in` and all its catch-all sub-paths
   - `/sign-up` and all its catch-all sub-paths
3. All other routes — especially `/dashboard` and `/evaluations/*` — require authentication.

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
])

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

### 3b. Dashboard Layout — Role Gate — `src/app/dashboard/layout.tsx`

Generate this as an **async Server Component**.

It must perform these checks in order:
1. Call `auth()` from `@clerk/nextjs/server` to get the active session.
2. If no session exists, call `redirect('/sign-in')`.
3. Query the database via the Prisma singleton to fetch the `User` record matching
   `clerkId === userId`.
4. If no User record is found, call `redirect('/sign-in')` with an error query param
   `?error=no_account`.
5. If the User's `role` is NOT `UserRole.ASSESSOR`, call `redirect('/')` with
   query param `?error=unauthorized`.
6. Only if all checks pass, render `{children}`.

Include the `NavBar` component at the top of the layout output.
Pass the authenticated user's `name` and `email` as props to `NavBar`.

### 3c. Server Action Security — `src/actions/evaluations.ts`

Generate this file with two exported Server Actions.

**Action 1: `createEvaluation(formData: EvaluationInput)`**

Steps (in order, no step may be skipped):
1. Mark file with `'use server'` directive at the top.
2. Import `auth` from `@clerk/nextjs/server`.
3. Call `auth()` and destructure `userId`. If `userId` is null, throw a
   typed error: `new Error('UNAUTHENTICATED')`.
4. Query Prisma to find the `User` where `clerkId === userId`.
5. If no user found or `user.role !== 'ASSESSOR'`, throw `new Error('UNAUTHORIZED')`.
6. Validate `formData` against the shared Zod schema imported from `src/lib/validations.ts`.
   If validation fails, return `{ success: false, errors: validationResult.error.flatten() }`.
7. Check that `positioningScore` is between 1 and 10 inclusive. Reject otherwise.
8. Verify the `studentId` in the form payload actually exists in the `Student` table.
   If not, return `{ success: false, errors: { studentId: ['Student not found'] } }`.
9. Create the `Evaluation` record in Prisma.
10. Call `revalidatePath('/dashboard')` to bust the RSC cache.
11. Return `{ success: true, id: newEvaluation.id }`.

**Action 2: `getEvaluations()`**

Steps:
1. Perform the same auth + role check as Action 1 (steps 1–5).
2. Query all `Evaluation` records, including `student` and `assessor` relations,
   ordered by `createdAt` descending.
3. Return the array.

---

## SECTION 4 — ZOD VALIDATION SCHEMA — `src/lib/validations.ts`

Generate the Zod schema that is shared between the client form and the server action.
This file must export:

```typescript
import { z } from 'zod'
import { ExposureRating } from '@prisma/client'

export const evaluationSchema = z.object({
  studentId: z
    .string()
    .min(1, 'Student ID is required')
    .max(20, 'Student ID must be 20 characters or fewer'),

  positioningScore: z
    .number({ invalid_type_error: 'Score must be a number' })
    .int('Score must be a whole number')
    .min(1, 'Minimum score is 1')
    .max(10, 'Maximum score is 10'),

  exposureRating: z.nativeEnum(ExposureRating, {
    errorMap: () => ({ message: 'Select a valid exposure rating' }),
  }),

  clinicalFeedback: z
    .string()
    .min(10, 'Feedback must be at least 10 characters')
    .max(2000, 'Feedback must not exceed 2000 characters'),
})

export type EvaluationInput = z.infer<typeof evaluationSchema>
```

---

## SECTION 5 — PRISMA CLIENT SINGLETON — `src/lib/prisma.ts`

Generate a singleton to prevent connection pool exhaustion in Next.js dev mode:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

## SECTION 6 — EVALUATION FORM PAGE — `src/app/evaluations/new/page.tsx`

This page must:
1. Be a thin RSC wrapper that confirms auth (using `auth()` from Clerk) and renders
   `<EvaluationForm />`.
2. Fetch the list of all `Student` records from Prisma and pass them as a `students`
   prop to `EvaluationForm` so the student selector is pre-populated.

### 6a. EvaluationForm Component — `src/components/EvaluationForm.tsx`

Mark this file `'use client'`.

Generate a fully functional form component that:
- Uses `useForm` from `react-hook-form` with `zodResolver` from `@hookform/resolvers/zod`.
- Connects to the `evaluationSchema` from `src/lib/validations.ts`.
- On submit, calls the `createEvaluation` Server Action imported from `src/actions/evaluations.ts`.
- Handles the Server Action response and shows inline success or error UI.

**Form fields — generate EXACTLY these, in this order:**

| Field               | UI Control                          | Notes                                         |
|---------------------|-------------------------------------|-----------------------------------------------|
| `studentId`         | `<Select>` component                | Options populated from `students` prop         |
| `positioningScore`  | `<Slider>` range input (1–10, step 1) | Show live numeric readout next to slider      |
| `exposureRating`    | `<Select>` component                | Options: Under-exposed, Optimal, Over-exposed  |
| `clinicalFeedback`  | `<Textarea>` component              | 5 rows, show remaining character count (max 2000) |

**UX requirements:**
- Show a character counter below `clinicalFeedback`: `"{count}/2000 characters"`.
- Disable the submit button while the form is submitting (use `formState.isSubmitting`).
- Show field-level validation error messages below each field.
- On success, display a green success banner with the new evaluation ID and a
  "Submit another" button that resets the form.
- On server error, display a red error banner with the error message.
- Wrap the submit button in a `<Button>` component with `type="submit"` and a
  loading spinner icon when `isSubmitting` is true.

---

## SECTION 7 — DASHBOARD PAGE — `src/app/dashboard/page.tsx`

Generate this as an **async React Server Component**.

This page must NOT use `useEffect` or `useState`.
All data fetching happens at the top of the component using `await getEvaluations()`
imported from `src/actions/evaluations.ts`.

### Dashboard layout requirements:

**Section A — Summary metric cards (horizontal row):**
Display four stat cards in a responsive grid:
1. "Total Evaluations" — count of all evaluation records
2. "Students Assessed" — count of unique student IDs across evaluations
3. "Average Positioning Score" — mean `positioningScore`, formatted to 1 decimal place
4. "Optimal Exposures" — count of evaluations with `exposureRating === 'OPTIMAL'`

**Section B — Evaluations table:**
Render a table with columns:
- Date (formatted as `DD MMM YYYY`)
- Student ID
- Student Name
- Positioning Score (render as a colored badge: 1–4 red, 5–7 amber, 8–10 green)
- Exposure Rating (render using the `<Badge>` component with semantic colors:
  Under-exposed = yellow, Optimal = green, Over-exposed = red)
- Actions column: a link to `/evaluations/[id]`

If no evaluations exist, render an empty state:
```
No evaluations recorded yet.
[Submit First Evaluation →] (link to /evaluations/new)
```

**Section C — Navigation header:**
Include a top-right button "New Evaluation" that links to `/evaluations/new`.

---

## SECTION 8 — ENVIRONMENT VARIABLES

Generate `.env.example` with the following variables (no real values):

```bash
# Vercel Postgres (from Vercel Dashboard → Storage → your DB → .env.local tab)
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=

# Clerk (from clerk.com → your app → API Keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Clerk redirect URLs (must match your Clerk dashboard config)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

Also generate `.env.local` with the same keys and a comment at the top:
```
# DO NOT COMMIT THIS FILE — it is listed in .gitignore
```

---

## SECTION 9 — ROOT LAYOUT — `src/app/layout.tsx`

Generate the root layout that:
1. Wraps all children in `<ClerkProvider>` from `@clerk/nextjs`.
2. Imports and applies the global Tailwind CSS file.
3. Sets appropriate HTML `lang="en"` and a meaningful `<title>` and `<meta>` description.
4. Uses the Inter font from `next/font/google`.

---

## SECTION 10 — NEXT.JS CONFIG — `next.config.ts`

Generate `next.config.ts` that:
1. Uses TypeScript with `NextConfig` type.
2. Enables `experimental.serverActions` (for Next.js versions below 14.1 where it was stable).
3. Adds `@clerk/nextjs` to `transpilePackages` if required by the installed version.
4. Sets `images.remotePatterns` to allow Clerk's CDN (`img.clerk.com`).

---

## SECTION 11 — PACKAGE.JSON DEPENDENCIES

Output the complete `package.json` `dependencies` and `devDependencies` sections.
Include ONLY packages actually used in this project.
Pin to specific recent stable versions (do not use `*` or `latest`).

Required packages to include:

```json
{
  "dependencies": {
    "@clerk/nextjs": "^5.x.x",
    "@hookform/resolvers": "^3.x.x",
    "@prisma/client": "^5.x.x",
    "@vercel/postgres": "^0.x.x",
    "next": "^14.x.x",
    "react": "^18.x.x",
    "react-dom": "^18.x.x",
    "react-hook-form": "^7.x.x",
    "zod": "^3.x.x"
  },
  "devDependencies": {
    "@types/node": "^20.x.x",
    "@types/react": "^18.x.x",
    "@types/react-dom": "^18.x.x",
    "autoprefixer": "^10.x.x",
    "postcss": "^8.x.x",
    "prisma": "^5.x.x",
    "tailwindcss": "^3.x.x",
    "typescript": "^5.x.x"
  }
}
```

Fill in the most recent stable patch versions for each.

---

## SECTION 12 — COMPLETION CHECKLIST

After generating all files, perform the following checks and output a checklist:

```
[ ] prisma/schema.prisma — 3 models + 2 enums present
[ ] middleware.ts — public routes allowlisted, all others protected
[ ] src/app/dashboard/layout.tsx — role check present (ASSESSOR only)
[ ] src/actions/evaluations.ts — auth check on EVERY action, Zod validation used
[ ] src/lib/validations.ts — positioningScore min(1) max(10) enforced
[ ] src/lib/prisma.ts — singleton pattern applied
[ ] src/components/EvaluationForm.tsx — 'use client' present, all 4 fields rendered
[ ] src/app/dashboard/page.tsx — RSC, no useState/useEffect, Prisma data fetched
[ ] .env.example — all 8 variables present, no real secrets
[ ] src/app/layout.tsx — ClerkProvider wraps children
[ ] next.config.ts — clerk.com image domain added
```

If any item fails the check, regenerate that file before finishing.

---

## FINAL INSTRUCTION TO COPILOT

Generate ALL files in the order of the sections above (1 through 11).
For each file:
1. Output the full file path as a heading.
2. Output the complete file content inside a code block.
3. Do NOT truncate any file with comments like `// ... rest of implementation`.
   Every file must be complete and immediately runnable.
4. After all files are generated, run the completion checklist in Section 12.

Begin now with Section 1.
