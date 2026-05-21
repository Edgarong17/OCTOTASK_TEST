# 1. Adopt a Layered Architecture style for the OctoTask backend

Date: 2026-05-13

## Status

Accepted

## Context

OctoTask is a Spring Boot / Java task-management application built by the Team 11 student team. It serves two roles (Project Manager and Developer) and must deliver task CRUD, mandatory 2FA, role-based access control, analytics, in-app notifications, and password/lockout policies.

We had to choose **one** of the nine architecture styles surveyed in class:

> Monolithic (single-tier), **Layered**, Pipeline, Microkernel, Service-based, Event-driven, Space-based, Service-oriented (SOA), Microservices.

Constraints that drove the choice:

- **Team size & experience:** Five students, all new to distributed systems, all already familiar with Spring MVC's Controller → Service → Repository idiom from their Java course.
- **Timebox:** four 2-week sprints. There is no time to operate a service mesh, message broker, or independent deployment pipelines per component.
- **Performance budget:** ≤200 concurrent users, ≤500 ms p95 response time. A single JVM comfortably meets this.
- **Operational target:** Oracle Cloud Infrastructure, one OKE pod for the API + one Oracle Autonomous Database. No need for horizontal partitioning by domain.
- **Sprint 1 design output:** the Actions/Actors component identification already partitions the system into five cohesive components (AuthManager, SecurityAuditor, TaskManager, AnalyticsEngine, NotificationService) that map cleanly onto layers.

Styles considered and rejected:

| Style | Why rejected |
| :--- | :--- |
| **Microservices / Service-based** | Operational complexity (network, observability, transactions across services) is wasted on a system this size; team has no Kubernetes/service-mesh experience. |
| **Event-driven** | No high-throughput pub/sub need; only one event flow (task → notification) exists, which a synchronous in-process call handles. |
| **Microkernel** | We have no third-party plugin/extension requirement. |
| **SOA** | Requires an enterprise service bus and contract governance — overkill. |
| **Space-based** | Designed for very high write throughput; we have neither the load nor the team. |
| **Pipeline** | Domain is request/response, not transformation pipelines. |

## Decision

We adopt a **Layered Architecture** for the `API Application` container, with four strict layers:

1. **Presentation** — Spring MVC `*Controller` classes (`AuthController`, `TaskController`, `AnalyticsController`).
2. **Security** — Spring Security filters + `AuthManager` and `SecurityAuditor` services (2FA, lockout, session token issuance).
3. **Business / Service** — `TaskManager`, `AnalyticsEngine`, `NotificationService` Spring `@Service` beans.
4. **Persistence** — Spring Data JPA `Repository` interfaces backed by Oracle Autonomous Database.

**Where it is applied:**

- **API Application container** — the whole backend follows the layered style.
- **Web Portal container** — uses a thin layered analogue (View → Service/API client → State), but the architectural decision is concentrated on the backend, which holds all business rules.
- The five Sprint-1 components map to layers as documented in `Sprint 1 - Module 5 Design & Architecture.md §4`.

**Strict-layer rule:** higher layers may only call the layer directly beneath them. Skipping a layer (e.g., a Controller talking directly to the Repository) is a code-review block.

This decision is rendered visibly in the [C4 Component diagram](../../workspace.dsl) (view `Components`) where the three Controllers depend on Services, which depend on the shared Repository Layer.

## Consequences

**Positive:**

- Onboarding is fast: the layered pattern is the default mental model for any Spring Boot developer.
- The package structure (`controller/`, `service/`, `repository/`) reads as live documentation.
- Cross-cutting concerns (logging, transactions, security filters) live at well-known seams.
- Testing strategy is obvious: unit-test services, slice-test controllers with `@WebMvcTest`, integration-test repositories with `@DataJpaTest`.
- Aligns with the technical partitioning already documented in the Sprint 1 design.

**Negative / accepted trade-offs:**

- **Single deployable unit.** All layers ship together; a bug in `AnalyticsEngine` blocks shipping a `TaskManager` fix. Mitigated by feature-flag toggles for risky changes.
- **No independent scaling.** If analytics queries become heavy we will not be able to scale only that component. Accepted because Sprint-1 load expectations are modest; revisit if analytics latency exceeds the SLA.
- **Risk of "sinkhole anti-pattern"** (controllers that just pass data through to services without adding value). Mitigated by requiring validation, mapping, and HTTP-concern logic to live in the Controller layer.
- **Discipline required.** The compiler will not stop a developer from calling a Repository from a Controller; this is enforced through PR review and ArchUnit tests (planned, Sprint 2).

**Revisit triggers:**

- Sustained p95 latency > 500 ms after profiling shows the bottleneck is a single domain (analytics).
- Notification volume requires asynchronous fan-out at > 100 events/s.
- Team grows beyond ~8 engineers, making the monolith a coordination bottleneck.

If any of the above occurs, the most likely next step is extracting `AnalyticsEngine` and/or `NotificationService` into a **service-based** style (still a small number of coarse-grained services), not a full microservices rewrite.
