# Vercel Deployment Notes

Quick steps to deploy this project to Vercel:

1. Push this repository to GitHub and connect it in the Vercel dashboard.
2. In Vercel Project settings -> Environment Variables, add the following keys (set values from Vercel Postgres and Clerk dashboard):

   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL` (e.g. `/sign-in`)
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL` (e.g. `/sign-up`)
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` (e.g. `/dashboard`)
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` (e.g. `/dashboard`)

3. Build & Install (Vercel defaults):

   - Install command: `npm ci`
   - Build command: `npm run build`

   The project uses a `postinstall` hook to run `prisma generate` so the Prisma client is available during build.

4. Database: for prototyping you can run locally:

```bash
npx prisma generate && npx prisma db push
```

`db push` is suitable for prototyping. For production migrations use `prisma migrate deploy` and a proper migration workflow.

5. Notes & troubleshooting:

- Ensure the Vercel Postgres connection string values are correct and accessible by Vercel.
- Clerk requires that the publishable key and secret key are added to Vercel and that the Clerk dashboard redirect URLs match the `NEXT_PUBLIC_CLERK_SIGN_IN_URL` and `NEXT_PUBLIC_CLERK_SIGN_UP_URL` settings.
- If you need to prevent local files from being uploaded, `.vercelignore` is included.

That's it — after the project builds on Vercel, visit the app and sign in to begin creating evaluations.
