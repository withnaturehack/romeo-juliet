# Romeo & Juliet — Matchmaking App

## Overview
High-end matchmaking app built on Next.js 16 (App Router), Supabase, and ElevenLabs. Users speak with an AI agent named Juliet (5-minute timed session), complete their profile, then receive curated human-admin introductions — one at a time. Both parties must accept before messaging opens.

## User Flow
1. Landing `/` → Login (magic link)
2. `/auth/callback` → checks membership status + profile completeness → routes accordingly
3. `/onboarding` → Juliet intro screen → `/voice` (5-min ElevenLabs voice chat)
4. Voice ends → transcript saved → `/onboarding/step-2` (profile form, multiple steps)
5. Profile complete → `/home` (match pipeline: waiting state or active introduction)
6. Accept introduction → mutual accept → `/chat/[matchId]` (real-time messaging)

## Admin API (protected by `ADMIN_SECRET` header `x-admin-secret`)
- `POST /api/admin/approve-member` — approve/reject membership + sends email
- `POST /api/admin/create-match` — create introduction between two approved members + sends emails

## Tech Stack
- **Framework**: Next.js 16.1.6 (App Router, Turbopack)
- **Language**: TypeScript (strict)
- **Database/Auth**: Supabase (PostgreSQL, RLS, Realtime)
- **Voice AI**: ElevenLabs Conversational AI (`@elevenlabs/react`)
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Email**: Resend
- **3D**: React Three Fiber / Drei

## Environment Variables
Set via Replit secrets:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (also `SUPABASE_KEY`)
- `ELEVENLABS_API_KEY`
- `GROQ_API_KEY`
- `NEXT_PUBLIC_APP_URL`

## User Flow
1. **Landing** (`/`) → Google OAuth login
2. **Auth callback** (`/auth/callback`) → checks membership status in Supabase, routes accordingly
3. **Membership gate** (`/membership-access`) → enter referral code or apply
4. **Apply** (`/membership-access/apply`) → manual application form
5. **Onboarding** (`/onboarding`) → intro to Juliet
6. **Onboarding Step 2** (`/onboarding/step-2`) → detailed profile sections
7. **Onboarding Step 3** (`/onboarding/step-3`) → photo upload
8. **Voice** (`/voice`) → live ElevenLabs conversation with Juliet
9. **Home** (`/home`) → "Reviewing your profile" waiting state
10. **Chat** (`/chat/juliet`) → conversation with match

## Database Tables
- `profiles` — user profile data, keyed by `user_id`
- `membership` — membership status: `pending`, `applied`, `approved`, `rejected`
- `matches` — curated match pairs
- `messages` — real-time messages between matched pairs
- `notifications` — user notifications
- `reports` — user reports/flags

## Key Architecture Decisions
- All DB queries use `user_id` (references `auth.users.id`) — never `id`
- No critical state in localStorage — all state in Supabase
- Membership check via `membership` table (not legacy `members` table)
- `saveProfileSection` uses upsert with `onConflict: 'user_id'`
- Email failures never break app flow (Resend is optional)

## Core Libraries (`src/lib/`)
- `supabaseClient.ts` — browser Supabase client
- `supabaseAdmin.ts` — server-only admin client (service role)
- `auth-helpers.ts` — auth utilities
- `saveProfileSection.ts` — upsert profile data
- `email.ts` + `email-templates.ts` — Resend email helpers
- `notifications.ts` — create notification records
- `photo-validation.ts` — file type/size validation
- `onboarding-validation.ts` — step-by-step form validation
- `useToast.ts` + `useSubmit.ts` — UI hooks

## UI Components (`src/components/ui/`)
- Button, Input, Select, Text, Section, Divider
- LoadingSpinner, Skeleton, ProgressBar
- ErrorState, EmptyState, ToastProvider
- RadioSection, PageContainer, FoundationsNav, Navbar, Orb

## Dev Server
Runs on port 5000: `npm run dev -- -p 5000`
