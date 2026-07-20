# Changelog

All notable changes to RamLink are documented in this file. The milestones below
summarize the product from its initial scaffold through the final hosted release.

## Unreleased

### Added

- Added a repeatable migration for bringing legacy user profiles up to the
  current Firestore schema.
- Added server-side profile schema reconciliation during authentication.
- Added Firestore emulator coverage for legacy student RSVP profiles.

### Fixed

- Backfilled missing RSVP and managed-club arrays on existing user profiles
  without replacing existing profile values.
- Improved RSVP failure messages and browser error logging for permission and
  service failures.

## Final Release - 2026-07-20

### Added

- Published RamLink through Firebase App Hosting.
- Added repeatable backend provisioning for demonstration clubs, events,
  announcements, resources, workflows, and role-based accounts.
- Added protected APIs for student join requests, club inquiries, and content
  reports.
- Added a secure API for club-officer announcement publishing.
- Added synchronized membership approval, rejection, and notification
  workflows.
- Added deployed role-isolation and provisioning validation coverage.

### Changed

- Routed abuse-sensitive student writes through authenticated server APIs.
- Kept administrator role changes and managed-club assignments synchronized.
- Kept signed-in role changes synchronized with the active workspace.
- Made inquiry creation atomic and separated successful content writes from
  later refresh failures.
- Updated Firebase and application dependencies for the final release.

### Fixed

- Fixed announcement, event, and resource form reset errors.
- Fixed join requests that failed when the deterministic request document did
  not already exist.
- Fixed membership approvals so the student profile, club member total,
  notification, and audit record update together.
- Fixed App Hosting session origin validation and authenticated login redirects.
- Removed redundant profile reloads that could hide successful Firestore writes.

### Security

- Added strict runtime environment validation and production security headers.
- Added Firebase App Check support for custom APIs.
- Added CSRF validation, authenticated API clients, request throttling, and
  authentication-email cooldowns.
- Strengthened password requirements and Firestore validation for user-generated
  content.
- Protected audit records and recorded administrator and club-officer actions.
- Resolved production dependency advisories before deployment.

## Release Hardening - 2026-07-18 to 2026-07-19

### Added

- Added secure Firebase server-session cookies with client/server session
  synchronization.
- Added server-side route and workspace-role authorization.
- Added Farmingdale email validation and email-verification workflows.
- Added profile recovery for verified accounts with missing Firestore profiles.
- Added a dedicated password-reset page and account settings page.
- Added secure account deletion with recent-authentication checks and related
  Firestore data cleanup.
- Added Playwright release smoke tests and continuous release verification.
- Added structured server logging and immutable audit logs.

### Changed

- Persisted Firebase authentication during navigation and page refreshes.
- Made public navigation and calls to action aware of active sessions.
- Redirected authenticated users to the correct student, officer, or
  administrator workspace.
- Removed mock student fallbacks from authenticated profile, dashboard, and saved
  pages.
- Made club creation reject duplicate short-name identifiers.

### Fixed

- Fixed authentication redirect loops and unexpected sign-outs during public
  navigation.
- Fixed profile-state handling for loading, missing, ready, and error conditions.
- Fixed account deletion so club membership and event RSVP totals are reconciled.
- Fixed officer and administrator authorization boundaries in Firestore rules.

### Security

- Restricted report creation, club lifecycle changes, membership changes, and
  officer content updates to their intended roles and fields.
- Required verified Farmingdale accounts for protected Firestore operations.
- Added recent-authentication enforcement for destructive account actions.

## Complete Firebase Workflows - 2026-07-12 to 2026-07-17

### Added

- Connected student notifications, announcements, join requests, memberships,
  inquiries, saved items, and event RSVPs to Firestore.
- Added event RSVP count persistence and notification read-state persistence.
- Added join-request cancellation and duplicate-request prevention.
- Added student content reporting and administrator report review.
- Added administrator club creation, lifecycle controls, user roles, and officer
  club assignments.
- Added club-officer event, announcement, resource, profile, inbox, membership,
  and member-management workflows.
- Added public club, event, announcement, and resource loading from Firestore.
- Added event search, category filtering, sorting, and empty states.
- Added workspace account menus, role-aware initials, and sign-out controls.

### Changed

- Replaced mock page data with live Firestore repositories across the primary
  student, officer, administrator, and public routes.
- Made membership approval transactional and updated member totals atomically.
- Restricted officers to records belonging to clubs they manage.

### Fixed

- Fixed public club profile rendering and dynamic discovery behavior.
- Fixed event-card RSVP integration and event field normalization.
- Fixed notification filtering, read-state synchronization, and account identity
  display.
- Fixed club homepage rendering and managed-club selection.

### Testing

- Added workflow authorization, Firestore rules, public discovery, account,
  notification, event, administrator, and club-workspace regression tests.

## Authentication and Personalization - 2026-06-27 to 2026-07-10

### Added

- Added Firebase client and Admin SDK helpers using environment-based
  configuration.
- Added Firestore collections, indexes, access rules, and deterministic seed
  tooling.
- Added Firebase email/password registration and login.
- Added an application-wide authentication provider and signed-in user profile
  state.
- Added Firestore student profile creation, loading, subscription, and editing.
- Added personalized student dashboard data.
- Added saved club and saved event persistence.
- Added student join-request and club-question actions.

### Changed

- Replaced static student identity details with the signed-in user's profile.
- Connected student profile edits and dashboard information to Firestore.
- Anonymized product mock data while retaining real team credits in project
  documentation.

### Fixed

- Fixed Firebase seed identifiers, filename consistency, and environment loading.
- Fixed profile helper errors found during initial backend integration.

## Frontend Completion - 2026-06-24 to 2026-06-29

### Added

- Added the student dashboard with statistics, recommendations, announcements,
  upcoming events, and join-request status.
- Added the student profile edit interface for name, major, class year, and
  interests.
- Added public club actions for membership requests and club questions.
- Added searchable club member lists and no-results feedback.
- Added the club inbox reply, latest-reply, and resolved-state workflow.
- Added frontend completion tests for the dashboard, club actions, member search,
  and inbox workflow.

### Fixed

- Fixed student navigation and profile form integration issues.
- Fixed the club profile page JSX error that prevented compilation.

## Officer Workspace and Public Discovery - 2026-06-16 to 2026-06-22

### Added

- Added the complete club-officer workspace: homepage, inbox, join requests,
  members, events, announcements, resources, and club profile pages.
- Added the public event directory and completed public club discovery pages.
- Added workspace layouts and navigation for student, officer, and administrator
  roles.

### Changed

- Aligned public authentication, student workspace, and discovery pages with the
  shared design system.
- Standardized page formatting, route locations, and responsive navigation.

### Fixed

- Corrected the club inbox route location and removed its obsolete duplicate.
- Fixed formatting and generated Next.js environment-file handling.

## Initial Product Screens - 2026-06-08 to 2026-06-14

### Added

- Added the RamLink visual foundation, responsive shells, typography, colors,
  shared UI primitives, cards, badges, headers, and empty states.
- Added shared TypeScript types, utilities, and initial mock data.
- Added the public homepage, club directory, club profile, about page, login,
  registration, and branded not-found page.
- Added administrator homepage, club management, report review, and user
  management screens.
- Added student saved items, notifications, and profile screens.

### Changed

- Established reusable public and workspace layouts for consistent navigation
  and responsive behavior.

## Initial Scaffold - 2026-06-05

### Added

- Created the RamLink Next.js application with TypeScript, React, Tailwind CSS,
  ESLint, and the App Router.
- Established the initial source structure, package configuration, and build
  workflow.
