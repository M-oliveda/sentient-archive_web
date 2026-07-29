import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Playwright E2E configuration.
 *
 * Projects:
 * - local-chromium / local-firefox / local-webkit: Vite + Firebase emulators
 * - staging / preview: remote Cloud Run URLs with HTTP Basic Auth
 *
 * Env (see e2e/.env.example; loaded from e2e/.env.local):
 * - E2E_TARGET=local|staging|preview
 * - E2E_BASE_URL, E2E_BASIC_AUTH_*, E2E_TEST_*
 */

const rootDir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(rootDir, "e2e/.env.local") });

const VALID_TARGETS = ["local", "staging", "preview"] as const;
type E2ETarget = (typeof VALID_TARGETS)[number];

function resolveTarget(raw: string | undefined): E2ETarget {
    const value = raw ?? "local";
    if (!VALID_TARGETS.includes(value as E2ETarget)) {
        throw new Error(
            `Invalid E2E_TARGET="${value}". Expected one of: ${VALID_TARGETS.join(", ")}`,
        );
    }
    return value as E2ETarget;
}

const target = resolveTarget(process.env.E2E_TARGET);
const isRemote = target === "staging" || target === "preview";
const localBaseURL = "http://127.0.0.1:5173";

let remoteBaseURL: string | undefined;
let httpCredentials: { username: string; password: string } | undefined;

if (isRemote) {
    if (!process.env.E2E_BASE_URL) {
        throw new Error("E2E_BASE_URL is required when E2E_TARGET is staging|preview");
    }
    if (!process.env.E2E_BASIC_AUTH_USER || !process.env.E2E_BASIC_AUTH_PASSWORD) {
        throw new Error(
            "E2E_BASIC_AUTH_USER and E2E_BASIC_AUTH_PASSWORD are required when E2E_TARGET is staging|preview",
        );
    }
    remoteBaseURL = process.env.E2E_BASE_URL;
    httpCredentials = {
        username: process.env.E2E_BASIC_AUTH_USER,
        password: process.env.E2E_BASIC_AUTH_PASSWORD,
    };
}

export default defineConfig({
    testDir: "./e2e",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
    timeout: 60_000,
    expect: { timeout: 10_000 },
    use: {
        baseURL: isRemote ? remoteBaseURL : localBaseURL,
        trace: "on-first-retry",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
        httpCredentials,
    },
    webServer: isRemote
        ? undefined
        : {
              command: "npm run dev -- --host 127.0.0.1 --port 5173",
              url: localBaseURL,
              reuseExistingServer: !process.env.CI,
              timeout: 120_000,
              env: {
                  ...process.env,
                  VITE_USE_EMULATOR: process.env.VITE_USE_EMULATOR ?? "true",
              },
          },
    projects: isRemote
        ? [
              {
                  name: target,
                  testMatch: /remote\/.*\.spec\.ts/,
                  use: { ...devices["Desktop Chrome"] },
              },
          ]
        : [
              {
                  name: "local-chromium",
                  testIgnore: /remote\//,
                  use: { ...devices["Desktop Chrome"] },
              },
              {
                  name: "local-firefox",
                  testMatch:
                      /public\/landing\.spec\.ts|auth\/protected-routes\.spec\.ts/,
                  use: { ...devices["Desktop Firefox"] },
              },
              {
                  name: "local-webkit",
                  testMatch:
                      /public\/landing\.spec\.ts|auth\/protected-routes\.spec\.ts/,
                  use: { ...devices["Desktop Safari"] },
              },
          ],
});
