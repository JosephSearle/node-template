# node-template

The approved starting point for NestJS HTTP services. A repo created from it builds, tests, releases and deploys to Azure Container Apps through the shared [workflow-catalog](https://github.com/JosephSearle/workflow-catalog) workflows, with no CI to write.

## What you get

- **NestJS 12 on Node 24**, TypeScript, Biome for lint and format, Jest for tests.
- **Probes:** `GET /healthz` (liveness) and `GET /readyz` (readiness), described below.
- **Example route:** `GET /v1/hello?name=Ada`, with a unit test and an HTTP test. Copy its shape for your own modules.
- **Config** from environment variables, validated at startup in [src/config/config.schema.ts](src/config/config.schema.ts). A bad value stops the process with a list of every problem.
- **JSON logs** through pino, with a request ID per request (an incoming `x-request-id` is reused). Probe requests aren't logged.
- **Container:** a multi-stage [Dockerfile](Dockerfile) with a pinned base image. It runs as a non-root user with no npm in the runtime image.
- **CI** ([ci.yml](.github/workflows/ci.yml)): node-ci (lint, typecheck, test, build), shell-lint (shellcheck and gitleaks), a production dependency audit, and an image smoke test. A single `ci-ok` check sums them up.
- **Release and deploy** ([release.yml](.github/workflows/release.yml)): release-please keeps a release PR open. Merging it tags `vX.Y.Z`, and that tag is deployed to Azure Container Apps.

## Start a new service

1. Create a repo from this template (**Use this template** on GitHub, or `gh repo create <org>/<name> --template <org>/node-template --private --clone`).
2. Run the one-time setup, then commit what it changed:

   ```sh
   scripts/init.sh --team @<org>/<team>
   git add -A && git commit -m "chore: initialise from node-template"
   ```

   It renames the project, records the template version in `.template-version`, sets your team as code owner, and creates the `production` environment. Pass `--dry-run` first to see what it'll do. Deploy settings can be passed now or later; see [docs/setup.md](docs/setup.md).
3. Replace the `hello` module with your own, and register a readiness check for each dependency.

Until the release app and Azure are set up, the release and deploy jobs are skipped and CI stays green.

## Develop

```sh
npm ci
npm run dev        # watch mode on http://localhost:8080
npm run lint       # Biome; npm run format fixes
npm run typecheck
npm test
npm run build && npm start
```

Copy [.env.example](.env.example) to `.env` to change settings locally.

## Health probes

| Endpoint   | Meaning                                                                                                | Returns                                  |
| ---------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| `/healthz` | The process is up. It never checks dependencies, so a slow database can't get the container restarted. | `200 {"status":"ok"}`                    |
| `/readyz`  | Every readiness check passed and the service isn't shutting down.                                      | `200`, or `503` with each check's status |

Register a check for each dependency the service can't serve without:

```ts
@Injectable()
export class DatabaseService implements OnModuleInit {
	constructor(private readonly readiness: ReadinessRegistry) {}

	onModuleInit() {
		this.readiness.register("database", () => this.ping());
	}
}
```

Checks time out after 2 s. The response gives only `ok`, `error` or `timeout` per check. Error details go to the logs, because they can name internal hosts.

On SIGTERM, `/readyz` returns 503 for `SHUTDOWN_DRAIN_MS` (5000 in the image) before the server closes, so the platform stops routing new requests to it first. Point the Container App's liveness probe at `/healthz` and its readiness probe at `/readyz`.

## Configuration

| Variable            | Default       |                                                                |
| ------------------- | ------------- | -------------------------------------------------------------- |
| `PORT`              | `8080`        |                                                                |
| `LOG_LEVEL`         | `info`        | `fatal`, `error`, `warn`, `info`, `debug`, `trace` or `silent` |
| `NODE_ENV`          | `development` | `production` in the image                                      |
| `SHUTDOWN_DRAIN_MS` | `0`           | `5000` in the image                                            |

Add new variables to the schema in [src/config/config.schema.ts](src/config/config.schema.ts). Only `src/config/` may read `process.env`, and Biome enforces that.

## Not included

There's no auth, database, OpenTelemetry or rate limiting, because those choices differ per service. For production patterns covering OAuth, OpenTelemetry and rate limiting on NestJS, see [nestjs-mcp-server-template](https://github.com/JosephSearle/nestjs-mcp-server-template).

## Keeping up with the template

A repo created from a template has no link back to it. Dependabot keeps dependencies, the base image and the workflow-catalog pins current. For anything else, compare `.template-version` against the template's [CHANGELOG](CHANGELOG.md) and copy what you need.

## Docs

- [docs/setup.md](docs/setup.md): org prerequisites and per-repo setup
- [docs/adr/](docs/adr/): decisions behind this template
- [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md)
