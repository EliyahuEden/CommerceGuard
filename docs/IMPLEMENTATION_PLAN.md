# Implementation plan and initial inspection

Inspected 2026-11-11: empty Windows PowerShell workspace, Node 20.9, npm 10.1,
Git available; Docker, PostgreSQL and k6 absent from PATH. No parent AGENTS.md.
Upstream AGENTS.md, MIT license, lockfile, configuration, migrations, storefront
components and API calls inspected before implementation. Optional Medusa skills
and its documentation MCP are unavailable; installed package instructions and
official documentation are the API reference.

1. Pin upstream commit in `config/aut.json`; clone into ignored `.aut/`.
2. Install a workspace-local Node 22 runtime for this session. Provide PostgreSQL
   Compose and an optional real portable PostgreSQL for machines without Docker.
3. Run actual migrations, seed a small fixed catalog/promotion, export public IDs.
4. Build independent API, browser and read-only cross-layer database suites.
5. Add browser matrix, diagnostic reports, CI smoke/regression and local k6.
6. Patch five real storefront behaviors individually, require a failing assertion,
   restore in `finally`, and require the same test to pass. Preserve evidence.
7. Execute suites, repeat critical checks, document measured results and blockers.

Risks: modern Medusa dependency size; Windows path length and native modules;
Next.js first-request compilation; external demo images; no paid payment provider;
email verification may require a delivery mechanism. Use the built-in manual
payment provider and inspect actual behavior before claiming coverage. CI YAML can
be validated locally but a hosted Actions run requires a published repository.
