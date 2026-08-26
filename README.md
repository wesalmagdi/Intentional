# Intentional

A quiet place to begin. A minimalistic journaling and learning companion built with React Native and Expo.

## Architecture

This project is a strict pnpm monorepo designed to separate concerns cleanly:

- **`packages/domain`**: Pure TypeScript. Contains the business logic, Zod schemas, and the state machine for the Learn ritual (Notice → Choose → Zoom Out). No React, no database. Fully tested with Vitest.
- **`packages/database`**: The SQLite persistence layer. Wraps `expo-sqlite` to provide a clean repository pattern for Discoveries and Journal Entries.
- **`packages/ui`**: The design system. A quiet, paper-like aesthetic containing reusable primitives (`Surface`, `Button`, `Text` variants).
- **`apps/mobile`**: The Expo Router application. A thin UI layer that wires the domain logic and design system together into screens.

## Getting Started

```bash
# Install dependencies (requires pnpm v11+)
pnpm install

# Typecheck the entire workspace
pnpm typecheck

# Run domain tests
pnpm test

# Start the mobile app
cd apps/mobile
EXPO_NO_DOCTOR=1 pnpm exec expo start --clear --lan