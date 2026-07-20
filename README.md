# RamLink

## Team

| Team member | Project role                             |
| ----------- | ---------------------------------------- |
| Sam         | Project Manager and Full-Stack Developer |
| Nick        | Backend and Firebase Developer           |
| Daniel      | Full-Stack and Testing Developer         |
| Dimitra     | Frontend Developer                       |
| Huma        | Frontend Developer                       |

## Project Overview

RamLink is a campus organization discovery and management application built for
Farmingdale State College. It gives students one place to find clubs, follow
events, communicate with club officers, and manage their involvement. Club
officers receive a dedicated workspace for running their organizations, while
administrators can supervise clubs, users, assignments, and reported content.

The application is live at:

<https://ramlink--csc325-firebase-app.us-east4.hosted.app>

RamLink uses role-based access for three authenticated account types:

- **Student:** discovers organizations and participates in campus activities.
- **Club officer:** manages assigned clubs and communicates with students.
- **Administrator:** oversees accounts, club status, assignments, and reports.

## Features

### Public Experience

Visitors can use the public application without signing in to:

- View the RamLink homepage and project information.
- Browse active campus clubs.
- Search clubs and view a no-results state when nothing matches.
- Open a club profile containing its description, interests, contact details,
  location, member total, upcoming events, announcements, and resources.
- Browse campus events.
- Search, filter by category, and sort the event directory.
- Create a Farmingdale student account.
- Sign in, request a password reset, and complete email verification.
- Reach a dedicated verification-complete screen after following an email link.

Public discovery data is read from Firestore. Public pages do not expose
officer, student, or administrator management actions.

### Student Accounts

After registering with a supported Farmingdale email address and verifying it, a
student can:

- Sign in and remain authenticated while navigating between public and protected
  pages.
- View a personalized dashboard with profile information, saved content,
  announcements, notifications, join requests, upcoming events, and suggested
  clubs.
- View and edit their display name, major, class year, and interests.
- Save or remove clubs from their saved list.
- Save or remove events from their saved list.
- RSVP to events and cancel an RSVP.
- See synchronized event RSVP totals.
- Request membership in a club with an optional note.
- Cancel an eligible pending join request.
- Track pending, approved, and rejected membership requests.
- Ask a club an official question through the club inquiry workflow.
- Read notifications and mark them as read.
- Filter notification views and see loading, empty, success, and error states.
- Report inappropriate clubs, events, announcements, or resources.
- Review account verification status.
- Permanently delete their account after password reauthentication and explicit
  confirmation.

Student actions persist in Firestore. Membership approvals update the student,
club member total, notification, and audit records together.

### Club Officer Accounts

Club officers can access only the clubs assigned to them. Their workspace
supports:

- Selecting an assigned club when the officer manages more than one.
- Viewing club statistics, recent activity, membership requests, and upcoming
  content.
- Reviewing student join requests.
- Approving or rejecting membership requests.
- Searching club members by name or major.
- Reviewing official student inquiries.
- Sending replies and marking inquiries resolved.
- Creating, editing, and deleting club events.
- Publishing, editing, and deleting announcements.
- Marking announcements as important.
- Creating, editing, and deleting club resources.
- Editing approved public club-profile fields.
- Viewing synchronized member totals and public content after updates.

Firestore rules and server APIs verify that an officer manages the affected
club before a protected operation is allowed.

### Administrator Accounts

Administrators have a separate workspace for platform oversight. They can:

- View system totals and review activity from the administrator dashboard.
- Create clubs with validated, non-duplicate identifiers.
- Review pending and existing clubs.
- Change a club between pending, active, suspended, and archived states.
- Search the user directory.
- Assign student, club-officer, and administrator roles.
- Assign managed clubs to club officers.
- Review student-submitted content reports.
- Move reports through reviewing, dismissed, and removed states.
- Review protected workflow changes through audit records.

Administrator updates keep account roles and managed-club assignments
synchronized so access changes are reflected in active sessions.

## Authentication and Account Lifecycle

RamLink uses Firebase Authentication with email and password accounts.

- Registration accepts approved `@farmingdale.edu` addresses.
- Passwords must satisfy the application minimum length policy.
- New accounts receive an email-verification link.
- Unverified users are kept outside protected workspaces.
- The original verification tab can refresh the Firebase user and create the
  secure server session after verification.
- Verification links return to a session-independent completion page so email
  clients can safely open a separate browser window.
- Password-reset and verification-email requests use browser cooldowns.
- Browser authentication uses local persistence.
- The application exchanges verified Firebase ID tokens for HTTP-only,
  same-site server session cookies.
- Signing out clears both the Firebase browser session and server session.
- Account deletion requires recent password reauthentication and removes owned
  records while reconciling membership and RSVP totals.

## Backend and Data Model

Firebase provides the hosted backend services:

- **Firebase Authentication:** email/password identity and email verification.
- **Cloud Firestore:** application data, workflows, roles, and audit records.
- **Firebase Admin SDK:** trusted server-side token validation and protected
  operations.
- **Firebase App Check:** application attestation for custom API routes.
- **Firebase App Hosting:** managed Next.js builds and production rollout.

Primary Firestore collections include:

- `users`
- `clubs`
- `events`
- `announcements`
- `resources`
- `memberships`
- `joinRequests`
- `inquiries`
- `notifications`
- `reports`
- `auditLogs`

The application uses deterministic identifiers where duplicate workflow records
must be prevented. Firestore transactions and batches keep related profile,
event, membership, count, notification, and audit changes consistent.

## Protected APIs

Next.js route handlers are used for operations that require additional server
validation:

- `POST /api/auth/session` creates a secure server session.
- `GET /api/auth/session` reads the authenticated server session.
- `DELETE /api/auth/session` clears the server session.
- `GET /api/auth/csrf` issues CSRF proof for session changes.
- `DELETE /api/account` performs authenticated account deletion.
- `POST /api/student/join-requests` creates protected membership requests.
- `POST /api/student/inquiries` creates protected club inquiries.
- `POST /api/student/reports` creates protected content reports.
- `POST /api/club/announcements` publishes managed-club announcements.

Protected endpoints verify authentication, role authorization, App Check where
configured, request shape, content length, and rate limits before writing data.

## Security Controls

RamLink includes the following security protections:

- Verified Farmingdale email enforcement.
- HTTP-only server session cookies.
- CSRF protection for session mutations.
- Role-based server route authorization.
- Firestore collection and field-level security rules.
- Officer managed-club authorization.
- Administrator-only club lifecycle and role operations.
- Firebase App Check support for custom APIs.
- Per-user and request-source rate limiting for sensitive operations.
- Verification and password-reset email cooldowns.
- Recent-authentication checks before account deletion.
- Immutable audit-log rules.
- Input validation and maximum content lengths.
- Atomic membership, RSVP, and inquiry workflows.
- Content Security Policy, HSTS, clickjacking protection, MIME-sniffing
  protection, and restrictive browser permissions headers.
- Environment-based configuration with local secret files excluded by Git.

No service-account JSON, passwords, private keys, or live environment values
belong in this repository. Demonstration credentials are stored only in approved
local environments or repository deployment secrets.

## Technology Stack

| Area                     | Technology                                         |
| ------------------------ | -------------------------------------------------- |
| Application framework    | Next.js App Router                                 |
| Language                 | TypeScript                                         |
| User interface           | React and Tailwind CSS                             |
| Forms and validation     | React Hook Form and Zod                            |
| Icons                    | Lucide React                                       |
| Authentication           | Firebase Authentication                            |
| Database                 | Cloud Firestore                                    |
| Trusted backend          | Firebase Admin SDK and Next.js route handlers      |
| Hosting                  | Firebase App Hosting                               |
| Unit and component tests | Vitest and Testing Library                         |
| Security-rule tests      | Firebase Rules Unit Testing and Firestore Emulator |
| Browser tests            | Playwright                                         |
| Continuous integration   | GitHub Actions                                     |

## Project Structure

```text
app/                 Next.js pages, layouts, and API routes
components/          Shared, public, student, officer, and admin components
lib/                 Types, helpers, Firebase clients, workflows, and security
scripts/             Safe provisioning and profile-migration scripts
tests/               Unit, component, integration, API, and Firestore tests
e2e/                 Playwright browser tests
.github/workflows/   Continuous verification and deployed browser testing
firestore.rules      Firestore authorization and validation rules
firestore.indexes.json
apphosting.yaml      Firebase App Hosting runtime configuration
```

Route groups separate public, student, club-officer, and administrator pages
without adding the group names to public URLs.

## Local Development

### Requirements

- Node.js 24
- npm
- Java 21 or newer for Firestore Emulator tests
- A Firebase project with Authentication and Firestore enabled

### Install

```bash
npm ci
```

### Configure

Copy `.env.local.example` to `.env.local` and provide values from an authorized
Firebase project. `.env.local` is ignored by Git and must not be committed.

The application recognizes these configuration names:

| Variable                                    | Purpose                                |
| ------------------------------------------- | -------------------------------------- |
| `NEXT_PUBLIC_FIREBASE_API_KEY`              | Firebase Web SDK project configuration |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`          | Firebase Authentication domain         |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`           | Browser Firebase project identifier    |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`       | Firebase storage configuration         |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`  | Firebase sender configuration          |
| `NEXT_PUBLIC_FIREBASE_APP_ID`               | Firebase web application identifier    |
| `NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY` | Optional App Check site key            |
| `FIREBASE_APP_CHECK_ENFORCED`               | Enables server App Check enforcement   |
| `FIREBASE_PROJECT_ID`                       | Server Firebase project identifier     |
| `GOOGLE_APPLICATION_CREDENTIALS`            | External local Admin credential path   |

Provisioning account variables are documented with empty placeholders in
`.env.local.example`. Never place demonstration passwords in this README.

### Start the Application

```bash
npm run dev
```

Open <http://localhost:3000>.

## Testing

RamLink has automated coverage for authentication, server sessions, profile
integrity, route authorization, Firestore rules, student workflows, officer
workflows, administrator workflows, public discovery, security controls,
provisioning, and deployed browser behavior.

### Lint

```bash
npm run lint
```

### Type Check

```bash
npx tsc --noEmit
```

### Unit, Component, and Integration Tests

```bash
npm run test -- --run
```

These Vitest and Testing Library tests cover:

- Registration, login, logout, password reset, and email verification.
- Firebase browser and server-session synchronization.
- Authentication redirects and protected route behavior.
- Profile creation, recovery, personalization, editing, and schema migration.
- Student dashboard, saved content, notifications, joins, inquiries, reports,
  and RSVPs.
- Club-officer events, announcements, resources, members, inbox, and profile
  workflows.
- Administrator user roles, managed clubs, club lifecycle, and report review.
- Protected API validation, App Check, CSRF, rate limiting, and audit logging.
- Provisioning repeatability and deterministic demonstration data.

The latest verified release run completed **249 application tests** successfully.
Tests that require optional deployed credentials are skipped when those
credentials are not supplied.

### Firestore Security Rules

```bash
npm run test:rules
```

This command starts the Firestore Emulator, loads `firestore.rules`, and runs
authorization tests for:

- Signed-out public reads.
- Student ownership and protected workflow boundaries.
- Atomic RSVP and membership writes.
- Legacy profile reconciliation.
- Officer managed-club access.
- Administrator-only operations.
- Report, inquiry, notification, resource, and audit-log validation.

The latest verified release run completed **23 Firestore rule tests**
successfully.

### Browser Tests

Install the Chromium test browser once:

```bash
npm run test:e2e:install
```

Run Playwright against a local server:

```bash
npm run test:e2e
```

To test a deployed environment, set `PLAYWRIGHT_BASE_URL` outside the repository
before running the same command. Role-based browser tests use optional
`E2E_STUDENT_*`, `E2E_OFFICER_*`, and `E2E_ADMIN_*` environment secrets. Do not
commit those values.

### Complete Local Verification

```bash
npm run lint
npx tsc --noEmit
npm run test -- --run
npm run test:rules
npm run build
```

GitHub Actions runs the same release checks for pushes and pull requests to
`dev` and `main`. A separate manually triggered workflow tests the deployed
application with credentials stored in GitHub Actions secrets.

## Demonstration Data Provisioning

Provisioning scripts create repeatable clubs, events, announcements, resources,
role-based accounts, and workflow records for an authorized Firebase project.

Always inspect the credential-free dry run first:

```bash
npm run provision:check
```

Commands that write data require an explicitly confirmed project and a local
Admin SDK credential stored outside the repository:

```bash
npm run provision:data
npm run provision:accounts
npm run provision:workflows
```

The scripts are idempotent so rerunning them updates the intended demonstration
records instead of creating uncontrolled duplicates.

Legacy user profiles can be inspected and reconciled with:

```bash
npm run migrate:profiles:check
npm run migrate:profiles
```

The migration adds only missing array fields and preserves existing profile
values.

## Deployment

Firebase App Hosting builds the Next.js application from the repository's
production branch. Production Firebase values and optional App Check settings
are configured in the hosting environment, not committed to source control.

Before a release:

1. Merge reviewed work into `dev`.
2. Run the complete verification sequence on `dev`.
3. Merge verified `dev` into `main`.
4. Confirm `origin/dev` and `origin/main` are synchronized.
5. Wait for Firebase App Hosting to report the new rollout as current.
6. Run the deployed Playwright workflow and manually verify all three roles.

## Change History

See [CHANGELOG.md](./CHANGELOG.md) for the complete project history from the
initial scaffold through the hosted final release.
