# RamLink

**RamLink** is a campus club discovery and management web application built for Farmingdale State College. It connects students with campus clubs and events, and provides club officers and administrators with tools to manage their organizations.

> BCS 430 Senior Project — Team 2 · Spring/Summer 2026

---

## Features

### For Students
- Browse and search campus clubs
- View upcoming club events
- Save clubs and opportunities
- Manage notification preferences
- Track your personal profile and memberships

### For Club Officers
- Workspace dashboard for managing your club
- Create and update events and announcements
- Manage resources, member rosters, and join requests
- Respond to student inquiries

### For Administrators
- Review and approve clubs
- Manage user accounts
- Moderate and resolve reported content

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Backend / Database | Firebase + Firebase Admin |
| Forms | React Hook Form + Zod |
| Testing | Vitest + Playwright + Testing Library |
| Linting / Formatting | ESLint + Prettier |

---

## Project Structure

```
RamLink/
├── app/          # Next.js App Router pages and layouts
├── components/   # Reusable UI components
├── lib/          # Utilities, Firebase config, helpers
├── public/       # Static assets
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Firebase project (Firestore + Authentication enabled)

### Installation

```bash
git clone https://github.com/sambatrausmc/RamLink.git
cd RamLink
npm install
```

### Environment Variables

Create a `.env.local` file in the root directory and add your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
FIREBASE_ADMIN_PRIVATE_KEY=your_admin_private_key
FIREBASE_ADMIN_CLIENT_EMAIL=your_admin_client_email
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm run start
```

---

## Testing

```bash
# Unit tests
npm run test

# End-to-end tests (Playwright)
npx playwright test
```

---

## Branching Strategy

- `main` — stable production branch
- `dev` — active development branch; all feature branches are created from here
- Feature branches should be named descriptively (e.g., `feature/club-events-page`)
- Always pull the latest `dev` before starting new work
- Open a PR into `dev`; `dev` is merged into `main` for releases

---

## Team

| Name | Role |
|---|---|
| Sam | Developer |
| Nick | Developer |
| Dimitra | Developer |
| Huma | Developer |
| Daniel | Developer |

---

## Course

**BCS 430 — Senior Project**  
Farmingdale State College  
Team 2 · 2026
