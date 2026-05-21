workspace "OctoTask" "Task management platform for the Oracle MTDR program." {

    !identifiers hierarchical

    model {

        # ---------- People ----------
        pm     = person "Project Manager"   "Creates and assigns tasks; reviews team analytics."
        dev    = person "Developer"         "Updates own task status; views personal performance."
        devops = person "DevOps Engineer"   "Maintains the build pipeline and OKE infrastructure." "External"
        coach  = person "MTDR Coach"        "Reviews sprint progress and code on behalf of Oracle." "External"

        # ---------- Software systems ----------
        group "Oracle MTDR Program" {

            octotask = softwareSystem "OctoTask" "Web-based SCRUM task manager with role-based access and analytics." {

                spa = container "Web Portal" "Single-page UI; bundled into the API JAR and served as static assets." "React + Vite + TypeScript" "WebApp"

                api = container "API Application" "REST backend; orchestrates users, tasks and statistics." "Spring Boot 3 / Java 17" {

                    userCtl    = component "UserController"        "User CRUD and authentication endpoints."        "Spring MVC"
                    taskCtl    = component "TaskController"        "Task CRUD, assignment and status endpoints."    "Spring MVC"
                    statsCtl   = component "StadisticsController"  "Team and per-user statistics endpoints."        "Spring MVC"
                    filterCtl  = component "FilterController"      "Endpoints for filtered task lists."             "Spring MVC"
                    dbCtl      = component "DatabaseController"    "Database liveness/health probe."                "Spring MVC"

                    userSvc    = component "UserService"           "User lifecycle and credential checks."          "Spring Service"
                    taskSvc    = component "TaskService"           "Task state machine and assignment rules."       "Spring Service"
                    statsSvc   = component "StadisticsService"     "Aggregates tasks per team/user for charts."     "Spring Service"
                    filterSvc  = component "FilterService"         "Query composition for filtered task lists."     "Spring Service"

                    repo       = component "Repository Layer"      "Spring Data JPA repositories for User and Task." "Spring Data JPA"
                }
            }
        }

        # External / supporting systems
        adb      = softwareSystem "Oracle Autonomous Database" "Managed Oracle ADB (OLTP, Always-Free) used by OctoTask for persistence." "Database,External"
        github   = softwareSystem "GitHub"                     "Source control and PR review for OctoTask."                              "External"
        pipeline = softwareSystem "Build & Deploy Pipeline"    "Builds the API JAR + Docker image, pushes to OCIR and rolls out a new pod revision on OKE." "External"
        ocir     = softwareSystem "OCI Container Registry"     "Hosts the Docker images of the OctoTask API."                            "External"

        # ---------- Runtime relationships (visible in Context & Container views) ----------
        pm  -> octotask.spa "Manages tasks and reviews analytics in"
        dev -> octotask.spa "Updates task status in"

        octotask.spa -> octotask.api "Calls REST endpoints on" "JSON / HTTPS"
        octotask.api -> adb          "Reads from and writes to" "JDBC over mTLS (Oracle Wallet)"

        octotask.spa -> octotask.api.userCtl   "Auth + user APIs"   "JSON/HTTPS"
        octotask.spa -> octotask.api.taskCtl   "Task APIs"          "JSON/HTTPS"
        octotask.spa -> octotask.api.statsCtl  "Statistics APIs"    "JSON/HTTPS"
        octotask.spa -> octotask.api.filterCtl "Filter APIs"        "JSON/HTTPS"
        octotask.spa -> octotask.api.dbCtl     "Health probe"       "JSON/HTTPS"

        octotask.api.userCtl   -> octotask.api.userSvc
        octotask.api.taskCtl   -> octotask.api.taskSvc
        octotask.api.statsCtl  -> octotask.api.statsSvc
        octotask.api.filterCtl -> octotask.api.filterSvc

        octotask.api.userSvc   -> octotask.api.repo
        octotask.api.taskSvc   -> octotask.api.repo
        octotask.api.statsSvc  -> octotask.api.repo
        octotask.api.filterSvc -> octotask.api.repo
        octotask.api.dbCtl     -> octotask.api.repo "Pings"

        octotask.api.repo -> adb "Executes SQL" "JDBC"

        # ---------- Program-level relationships (visible in Landscape only) ----------
        # None of these touch OctoTask at runtime, so they don't appear in the Context view.
        dev      -> github   "Pushes code to"
        devops   -> github   "Reviews PRs in"
        devops   -> pipeline "Operates"
        coach    -> github   "Reviews sprint progress via"
        github   -> pipeline "Triggers on push to main"
        pipeline -> ocir     "Pushes Docker image to"

        # ---------- Deployment: Oracle Cloud Infrastructure ----------
        # Scope = "infrastructure we own" (the SPA→API flow is shown in the Container view).
        deploymentEnvironment "Production" {
            region = deploymentNode "OCI Region — mx-queretaro-1" "" "OCI" {

                lb = infrastructureNode "Public Load Balancer" "" "OCI LB"

                pod = deploymentNode "OKE Pod (octotask-api)" "Kubernetes 1.35.2 · 2 replicas · :8080" "" "" 2 {
                    apiInstance = containerInstance octotask.api
                }

                adbNode = deploymentNode "Autonomous Database" "" "Oracle ADB" {
                    adbInstance = softwareSystemInstance adb
                }
            }

            # api→adb is inherited from the static model.
            region.lb -> region.pod.apiInstance "Forwards to" "HTTP / 8080"
        }
    }

    views {

        # ---------- 1. System Landscape (Level 0) ----------
        # Whole MTDR program: users, OctoTask, the managed DB it consumes, and the
        # delivery toolchain (GitHub → CI/CD → OCIR) plus the people who operate it.
        systemLandscape "Landscape" "OctoTask within the Oracle MTDR program (runtime users + delivery toolchain)." {
            include *
            autoLayout
        }

        # ---------- 2. System Context (Level 1) ----------
        # Only what OctoTask interacts with at runtime: the two end-user roles and
        # the external Oracle Autonomous Database it persists data to.
        systemContext octotask "Context" "OctoTask and its direct runtime dependencies." {
            include *
            autoLayout lr
        }

        # ---------- 3. Containers (Level 2) ----------
        container octotask "Containers" "High-level technology blocks of OctoTask." {
            include *
            autoLayout lr
        }

        # ---------- 4. Components (Level 3) ----------
        component octotask.api "Components" "Spring Boot API: controllers, services and persistence." {
            include *
            autoLayout
        }

        # ---------- 5. Deployment ----------
        deployment octotask "Production" "ProductionDeployment" "Runtime topology on OCI: public Load Balancer fronts a 2-replica OKE pod backed by Autonomous Database." {
            include *
            autoLayout
        }

        # ---------- 6a. Dynamic — Create & Assign Task ----------
        dynamic octotask.api "CreateAndAssignTask" "Process: a Project Manager creates a task in the backlog and assigns it to a Developer. Each numbered step flows Controller → Service → Repository → Database." {
            pm                   -> octotask.spa         "1. Fills the New Task form (title, description, assignee, due date)"
            octotask.spa         -> octotask.api.taskCtl "2. POST /api/tasks"
            octotask.api.taskCtl -> octotask.api.taskSvc "3. Validates payload and applies assignment rules"
            octotask.api.taskSvc -> octotask.api.repo    "4. save(Task)"
            octotask.api.repo    -> adb                  "5. INSERT INTO TASKS"
            autoLayout lr
        }

        # ---------- 6b. Dynamic — View Sprint Statistics ----------
        dynamic octotask.api "ViewSprintStatistics" "Process: a Project Manager opens the sprint dashboard. Team progress is aggregated live from the database and rendered in the SPA." {
            pm                    -> octotask.spa          "1. Opens the Analytics page"
            octotask.spa          -> octotask.api.statsCtl "2. GET /api/statistics/team?sprint=N"
            octotask.api.statsCtl -> octotask.api.statsSvc "3. Asks for the team progress for sprint N"
            octotask.api.statsSvc -> octotask.api.repo     "4. Queries tasks grouped by status & assignee"
            octotask.api.repo     -> adb                   "5. SELECT … GROUP BY status, user_id"
            autoLayout lr
        }

        # ---------- Styling ----------
        styles {
            element "Person" {
                shape person
                background #08427b
                color #ffffff
            }
            element "Software System" {
                background #1168bd
                color #ffffff
            }
            element "Container" {
                background #438dd5
                color #ffffff
            }
            element "Component" {
                background #85bbf0
                color #000000
            }
            element "Database" {
                shape cylinder
            }
            element "WebApp" {
                shape webBrowser
            }
            element "External" {
                background #999999
                color #ffffff
            }
            element "Infrastructure Node" {
                background #ffffff
                color #555555
            }
        }
    }
}
