# 2. Use Oracle Autonomous Database (Always-Free ATP) as the single system of record

Date: 2026-05-13

## Status

Accepted

## Context

OctoTask needs to persist user accounts, task records, audit logs and notification history with strong consistency, role-based access enforcement, and the durability required to back the 99 % data-operation-success non-functional requirement stated in Sprint 1.

The MTDR program provides every team free access to Oracle Cloud Infrastructure resources — most notably the **Autonomous Database, Always-Free tier (Autonomous Transaction Processing, ATP)**, which includes 20 GB of storage, automatic patching/backup, and a managed connection wallet for mTLS.

Persistence options we considered:

| Option | Outcome |
| :--- | :--- |
| **Oracle Autonomous Database (ATP, Always-Free)** | **Chosen.** Zero cost, zero ops, sponsor-aligned, ACID, fits one-DB-per-service layered model. |
| Embedded H2 / SQLite | Rejected — no durability story; cannot be shared across pods or developers. |
| PostgreSQL on an OCI Compute VM (self-managed) | Rejected — team would own patching, backup, TLS, HA. Burns sprint time on infra, not features. |
| Managed PostgreSQL (e.g., OCI Database with PostgreSQL, AWS RDS) | Rejected — not in MTDR's free tier; introduces a second cloud account or a billing risk. |
| A NoSQL store (MongoDB / Oracle NoSQL) | Rejected — our domain (Users, Tasks, Assignments, Audit) is intrinsically relational and benefits from foreign keys + transactional updates. |

Additional drivers:

- **Team familiarity:** members have written SQL and used JDBC; they have **not** modelled data in a document store.
- **Sponsor alignment:** Oracle MTDR program rewards meaningful use of Oracle Cloud services.
- **Spring Boot integration:** the Oracle JDBC driver + Spring Data JPA + an Oracle Wallet directory is a well-trodden path.
- **Security posture:** ATP forces mTLS via the wallet by default — we get encryption-in-transit for free, no extra config.

## Decision

The OctoTask backend uses a **single Oracle Autonomous Database (ATP, Always-Free)** instance as its system of record, accessed exclusively through the `Repository Layer` component (Spring Data JPA) inside the `API Application` container.

Specifics:

- **Connection:** JDBC thin driver over mTLS using the OCI-provided Wallet (`MtdrSpring/backend/wallet/`).
- **Schema ownership:** one schema owned by the API service account; **no other service or process writes to it**. Reports/analytics read through `AnalyticsEngine`, never via direct SQL.
- **Region:** the same OCI region as the OKE cluster (Mexico Central / Querétaro) to keep round-trip latency under ~5 ms.
- **Migrations:** managed in-code via Flyway scripts checked into `MtdrSpring/backend/src/main/resources/db/migration/` (introduced Sprint 2; no manual `sqlplus` changes).
- **Backups:** rely on ADB's automatic daily backups; no app-level dump.
- **Visible in the C4 model** ([`workspace.dsl`](../../workspace.dsl)) as `octotask.db` (`Container "Database" — Oracle Autonomous DB`) inside the deployment node `Autonomous Database` under `OCI Region > Oracle Cloud Infrastructure`.

## Consequences

**Positive:**

- **Zero infrastructure operations.** No patching, no backups to schedule, no TLS certs to rotate. The team spends sprint hours on product features, not on DBA tasks.
- **Free for the duration of the program.** No billing risk for the team.
- **Strong consistency + transactions** match our domain (task state transitions, audit records, lockout counters all need ACID).
- **mTLS by default** via the Wallet — no plain-text DB credentials over the network.
- **Tooling alignment** — Spring Data JPA, the IntelliJ DB tools, and SQL Developer Web all work out of the box.

**Negative / accepted trade-offs:**

- **Vendor lock-in to Oracle Cloud.** Moving off OCI later would require a migration to another Postgres/Oracle-compatible engine. Mitigated by sticking to standard JPA/SQL (no PL/SQL stored procedures, no Oracle-specific column types beyond `NUMBER`/`VARCHAR2` defaults).
- **Wallet must be available at deploy time.** The Kubernetes Pod needs the wallet directory mounted from a Secret. Bootstrapping a new environment requires re-downloading the wallet from OCI Console.
- **Always-Free tier auto-stops** after 7 days of inactivity. Acceptable during the academic break; restart is one click.
- **20 GB storage ceiling.** Plenty for the project's lifetime, but archival / data-retention policy must keep audit logs under that limit (rolling retention: 90 days).
- **Cold-start latency** the first time the always-free instance wakes can be 30–60 s. Mitigated by a synthetic health-check pinging the DB every 6 hours from the API pod's liveness logic.

**Revisit triggers:**

- The product exits the MTDR sandbox and moves to a paid hosting environment (then re-evaluate Postgres / paid ADB).
- Sustained dataset growth beyond ~15 GB.
- Need for read replicas or geo-failover (none in scope for Sprint 1–4).
