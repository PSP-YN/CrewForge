# CrewForge

**Find your people. Build something real.**

[![CI](https://github.com/PSP-YN/CrewForge/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/PSP-YN/CrewForge/actions/workflows/ci.yml) [![CodeQL](https://github.com/PSP-YN/CrewForge/actions/workflows/codeql.yml/badge.svg?branch=main)](https://github.com/PSP-YN/CrewForge/actions/workflows/codeql.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

CrewForge helps people form balanced teams by making skills, interests, team needs, and available seats visible. Participants can discover teams, compare their skills with what a team needs, and join a suitable crew. Team leaders can create teams, manage capacity, review requests, and invite contributors.

> **Try the product:** [Open the CrewForge demo](https://crewforge-demo-pspyn.vercel.app/)
>
> The public link is a browser-only interactive preview. Its sample teams and changes are stored in your browser; it does not connect to the MongoDB backend. The full-stack application is available in this repository and can be run locally using the instructions below.

## The problem in plain words

A team has one place left. Two people click Join at almost the same time. If the app checks capacity only in the browser, both requests can see that last place and both may be accepted. One participant might also be added to two teams through overlapping requests. This is a race condition.

CrewForge solves this at the database layer. A unique index blocks duplicate membership, and a MongoDB transaction makes the seat check, membership change and audit record one all-or-nothing operation. If the seat is already taken or any write fails, the transaction does not partially apply.

**The core promise:** no duplicate membership and no team exceeding its configured capacity because two requests arrived together.

## Start here

1. Open the [CrewForge website](https://crewforge-demo-pspyn.vercel.app/) to understand the product and try the sample workspace.
2. Read [Architecture](docs/architecture.md) to see how the database protects team membership.
3. Read [Test strategy](docs/test-strategy.md) to inspect the 50-request final-seat race test and transaction rollback test.
4. Use [SUBMISSION.md](SUBMISSION.md) for the plain-language project explanation, demo scope and evidence links.

## What it does

- **Discover teams:** browse and filter teams by skills and requirements.
- **Find a skills fit:** see which teams need skills you can contribute.
- **Create a team:** define its goal, skills, needs, and member limit.
- **Manage membership:** handle join requests, invitations, team capacity, and member lifecycle.
- **Protect team integrity:** enforce membership and capacity rules in the database, not only in the browser.

## How it works

```text
Browser (Next.js / React)
          |
          v
Next.js API routes  ---- Authentication, validation, rate limits
          |
          v
MongoDB replica set ---- Transactions, unique indexes, audit events
          |
          +------------- Change streams / Server-Sent Events
```

The central engineering problem is concurrent team formation. MongoDB unique indexes prevent duplicate membership, while transactions make approval, seat allocation, membership changes and audit records atomic. The integration suite sends 50 leader approvals for one remaining seat and verifies that exactly one approval succeeds.

Read [Architecture](docs/architecture.md) for the data model and transaction flow, and [Engineering decisions](docs/engineering-decisions.md) for implementation trade-offs.

## Technology

| Area | Stack |
|---|---|
| Frontend and application | Next.js 16, React 19, TypeScript |
| API and validation | Next.js App Router, Zod 4 |
| Database | MongoDB 7 replica set |
| Authentication | bcrypt password hashing, signed JWT sessions, HttpOnly cookies |
| Realtime updates | MongoDB Change Streams, Server-Sent Events |
| Local infrastructure | Docker Compose |
| Quality | Vitest, TypeScript, GitHub Actions, CodeQL, k6 |

## Run locally

### Requirements

- Node.js 22 or newer and npm
- Docker Engine with the Compose plugin

### Start the full-stack application

```bash
git clone https://github.com/PSP-YN/CrewForge.git
cd CrewForge
cp .env.example .env
```

Set `JWT_SECRET` in `.env` to a unique random value of at least 32 characters. For the seeded local demo, also set separate values for `SEED_DEMO_PASSWORD` and `JUDGE_DEMO_PASSWORD`. Keep `.env` private; never commit credentials.

```bash
docker compose up --build -d
```

Open **http://localhost:3002**. The Compose setup starts the application and a MongoDB replica set. Email verification and password recovery email delivery are optional and remain disabled unless a verified email sender is configured.

See the [Docker Compose guide](docs/docker-compose.md) for seeding, health checks, smoke tests, and cleanup. See [Production readiness](docs/production-readiness.md) before deploying a public instance.

## Verify the code

```bash
npm ci
npm run typecheck
npm test
npm run build
```

The default local test command runs unit and API contract tests. MongoDB-dependent concurrency tests require a replica set; see [Test strategy](docs/test-strategy.md) for the integration-test setup and coverage. Do not interpret skipped database tests as passing integration tests.

## Project structure

```text
src/          Next.js application, API routes, authentication and data access
demo/         Standalone browser-only product preview
tests/        Unit, API contract, and MongoDB integration tests
docs/         Architecture, security, operations, and test documentation
scripts/      Database setup, seeding, and verification utilities
```

## Security and contribution

- Review the [Threat model](docs/threat-model.md) and [Security policy](SECURITY.md).
- Read [Contributing](CONTRIBUTING.md) before opening a pull request.
- CrewForge is released under the [MIT License](LICENSE).

## Current scope

The public preview is intended for product exploration, not as a live multi-user service. Full-stack local operation requires MongoDB replica-set configuration. A production launch additionally requires a hosted MongoDB replica set, secure environment variables, verified email configuration if email flows are enabled, deployment-specific smoke tests, backups, and operational monitoring. The repository's automated tests do not by themselves establish production availability or a security certification.
