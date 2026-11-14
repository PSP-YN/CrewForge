# CrewForge — project and submission guide

## Project details

- **Project name:** CrewForge
- **Theme:** Fair, reliable team formation through complementary skills
- **Challenge focus:** PS1 — Race-proof team formation at scale
- **One-line pitch:** CrewForge helps people find teammates with complementary skills and prevents duplicate memberships or teams exceeding their capacity—even when many people try to join at once.
- **Website:** https://crewforge-demo-pspyn.vercel.app/
- **Repository:** https://github.com/PSP-YN/CrewForge
- **License:** MIT

## Project description (under 280 words)

CrewForge is a team formation platform that helps people find the right teammates based on skills, interests and what a team actually needs.

Finding a team often depends on existing friendships or random selection. That can leave teams with the same skills, important gaps and people who struggle to find a place where they can contribute. CrewForge makes team needs visible so participants can discover teams that complement their strengths. Team leaders can create teams, describe required skills, manage capacity, invite contributors and review join requests.

The key challenge is keeping team membership fair and correct when many people act at the same time. A simple website check is not enough: two requests can both see the final seat as available, or one person can try to join multiple teams. CrewForge protects these rules in the database. MongoDB unique indexes prevent duplicate membership, while transactions make seat allocation, membership changes and audit records succeed or fail together.

The full application includes authentication, skill-based recommendations, team management, invitations, rate limiting, audit events and real-time board updates. It is built with Next.js, React, TypeScript and MongoDB. Docker Compose makes the full-stack application reproducible locally, and automated tests verify concurrency and transaction rollback.

CrewForge aims to make team formation clearer, more inclusive and more dependable—so people can contribute based on what they bring, not only whom they already know.

## What problem are we solving?

When a team has one place left and several people click Join at nearly the same moment, a weak system can accept both requests. The team becomes larger than its limit. A participant can also end up in two teams if separate requests are processed at the same time.

This is called a **race condition**: the result depends on which request reaches the database first. Checking capacity only in the browser does not solve it because different requests can pass the same check before either one updates the data.

## How CrewForge solves it

1. A participant asks to join a team; the request waits for the team leader's decision.
2. When the leader approves, the server starts one database transaction.
3. The transaction checks that a seat is still available, adds the membership, updates the team count and records the action.
4. All changes commit together. If any rule fails, the transaction rolls back.
5. Database unique indexes provide a second line of protection against duplicate membership.

**In simple terms:** the database—not the button on the page—has the final say on who gets a seat.

## Why these technical choices?

| Choice | Why it is used | Why not the simpler alternative? |
|---|---|---|
| MongoDB transactions | Keep membership, seat count and audit records in one all-or-nothing operation | Separate writes can leave the team count and membership list inconsistent after a failure |
| Unique database indexes | Stop duplicate membership even when requests arrive together | Frontend checks can be bypassed and can become stale |
| Idempotency keys | Make a repeated request safe when a client retries after a timeout | Without them, a retry can create duplicate work or confusing results |
| Server-Sent Events | Push board updates from the server to browsers | WebSockets are unnecessary for a board that mainly sends one-way updates |
| Explainable skill matching | Show how a person's skills fit the skills a team needs | A black-box score would be harder for participants to understand and challenge |

## What is implemented?

- Account registration, login and secure session cookies
- Team discovery, search, creation and editing
- Skill-based team recommendations
- Join requests with leader approval or decline
- Invitations with expiry, revocation and single-use acceptance
- Leader-controlled member removal and leadership transfer
- Database-enforced team capacity and one-team-per-participant rules
- Audit events, rate limits and security telemetry
- Real-time board updates using MongoDB Change Streams and Server-Sent Events
- Docker Compose environment, synthetic dataset seeding and automated verification

## Evidence reviewers can inspect

- **CI:** https://github.com/PSP-YN/CrewForge/actions/runs/43627799288 — passed
- **CodeQL:** https://github.com/PSP-YN/CrewForge/actions/runs/43627799190 — passed
- **Automated tests:** 71/71 passed, including 11 MongoDB replica-set integration tests
- **Concurrency test:** 50 approval requests compete for one final seat; exactly one succeeds
- **Fault injection:** a worker is stopped before transaction commit; the database changes roll back
- **Synthetic data:** 10,000 users, 2,000 teams, 6,000 memberships, 4,000 unassigned participants and 4,000 open seats
- **Load test:** 100 virtual users for 30 seconds; 3,000 requests, 98.02 requests/second, 19.87 ms p95, 0% HTTP failures and 6,000/6,000 board checks passed

These are automated tests on a GitHub-hosted runner with a disposable MongoDB replica set. They are not a claim of production-region performance or guaranteed production capacity.

## How to review the project

1. Open the [CrewForge website](https://crewforge-demo-pspyn.vercel.app/) to understand the product and try the sample team board.
2. Read [README.md](README.md) for the quick start and technology overview.
3. Read [architecture.md](docs/architecture.md) for the transaction and database rules.
4. Read [test-strategy.md](docs/test-strategy.md) for the concurrency, API and rollback tests.
5. Read [performance.md](docs/performance.md) for the exact load-test conditions and limits.

## Demo scope — be transparent

The public website is a product landing page with an interactive sample workspace. Changes in that preview are saved only in the visitor's browser; it is not a shared account-based service. The full-stack application is in this repository and runs locally using Docker Compose and MongoDB replica-set support.

A public multi-user backend deployment is not yet complete. It requires a production MongoDB replica-set URI, a non-empty production JWT secret, hosting configuration, deployment-specific smoke tests and backup/restore validation. Email verification and recovery also require a verified transactional email sender. Do not describe the preview as a live production database service.

## Technology stack

- **Frontend:** Next.js 16, React 19, TypeScript
- **API and validation:** Next.js App Router, Zod 4
- **Database:** MongoDB 7 replica set
- **Authentication:** bcrypt password hashing, signed JWT sessions, HttpOnly cookies
- **Realtime:** MongoDB Change Streams, Server-Sent Events
- **Infrastructure:** Docker Compose
- **Testing and security:** Vitest, GitHub Actions, CodeQL, k6, npm audit

## Run the full-stack app locally

```bash
git clone https://github.com/PSP-YN/CrewForge.git
cd CrewForge
cp .env.example .env
```

Set a unique `JWT_SECRET` with at least 32 random characters. For demo seeding, set separate `SEED_DEMO_PASSWORD` and `JUDGE_DEMO_PASSWORD` values. Then run:

```bash
docker compose up --build -d
```

Open http://localhost:3002. See [docs/docker-compose.md](docs/docker-compose.md) for seeding and verification steps. Never commit `.env` or use seeded demo data in production.

## What remains before a public production launch?

- Configure a hosted MongoDB replica set and production credentials.
- Deploy the full-stack Next.js app and verify the exact deployed commit.
- Run production smoke, authorization, security and load tests.
- Verify database backups and a restore procedure.
- Configure and test a verified email sender if email verification/recovery is enabled.
- Add production monitoring, alerting and a rollback plan.

The public preview and local full-stack environment are useful demonstrations, but they are not substitutes for those release checks.
