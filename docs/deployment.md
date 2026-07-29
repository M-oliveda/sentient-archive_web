# Deployment & operations runbook

## Environments

| Environment | GitHub Environment | GCP project                    | Cloud Run auth |
| ----------- | ------------------ | ------------------------------ | -------------- |
| development | `development`      | `moliveda-gcloudprojects-dev`  | HTTP Basic     |
| staging     | `staging`          | `moliveda-gcloudprojects-stg`  | HTTP Basic     |
| preview     | `preview`          | `moliveda-gcloudprojects-prev` | HTTP Basic     |
| production  | `production`       | `moliveda-gcloudprojects-prod` | Public         |

Auth uses **Workload Identity Federation** (no SA JSON keys). See MASTERPLAN Appendix A.

## Docker Hub

Image: `m-oliveda/sentient-archive-web`

Deploy workflows build and push tags (`dev`, `staging`, `latest`, `pr-{n}`).

Verify:

```bash
docker pull m-oliveda/sentient-archive-web:latest
```

## Deploy order (release)

1. Merge to `develop` → auto deploy **development**
2. Cut `release/*` → auto deploy **staging**
3. Run **E2E Staging** workflow (`workflow_dispatch`) with staging `E2E_BASE_URL`
   repository variable and Basic Auth + `E2E_TEST_*` secrets
4. Manual QA + local Playwright (`npm run test:e2e` with emulators)
5. Merge to `main` → manual **production** deploy workflow approval
6. Optional: custom domain on Cloud Run / load balancer
7. Monitor Cloud Run metrics, request latency, and error rates in GCP Console

## Staging E2E secrets / vars

GitHub Environment `staging`:

- Secrets: `AUTH_USERNAME`, `AUTH_PASSWORD`, `E2E_TEST_EMAIL`, `E2E_TEST_PASSWORD`
- Variable: `E2E_BASE_URL` (Cloud Run URL)

## Monitoring checklist

- [ ] Cloud Run revision healthy / traffic 100%
- [ ] Error rate and p95 latency within baseline
- [ ] Firebase Auth / Functions quotas healthy
- [ ] HTTP Basic Auth still enabled on non-prod
