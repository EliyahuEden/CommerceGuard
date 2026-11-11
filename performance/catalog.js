import http from "k6/http"
import { check, sleep } from "k6"
import { Rate } from "k6/metrics"

const failedChecks = new Rate("business_failures")
const url = __ENV.API_URL || "http://127.0.0.1:9000"
// Reject remote targets even if this file is invoked directly without the wrapper.
if (!/^http:\/\/(localhost|127\.0\.0\.1):9000\/?$/.test(url))
  throw new Error("Performance testing is restricted to local port 9000")
if (!__ENV.PUBLISHABLE_API_KEY || !__ENV.REGION_ID || !__ENV.PRODUCT_ID)
  throw new Error("Run npm run aut:seed and use npm run test:perf")

export const options = {
  summaryTrendStats: ["avg", "min", "med", "max", "p(90)", "p(95)", "p(99)"],
  scenarios:
    __ENV.PERF_PROFILE === "ramp"
      ? {
          ramp: {
            executor: "ramping-vus",
            startVUs: 1,
            stages: [
              { duration: "15s", target: 3 },
              { duration: "20s", target: 5 },
              { duration: "10s", target: 0 },
            ],
            gracefulRampDown: "5s",
          },
        }
      : { baseline: { executor: "constant-vus", vus: 2, duration: "20s" } },
  thresholds: {
    http_req_duration: ["p(95)<750", "p(99)<1500"],
    http_req_failed: ["rate<0.01"],
    business_failures: ["rate==0"],
    checks: ["rate==1"],
  },
}

export default function () {
  const params = {
    headers: { "x-publishable-api-key": __ENV.PUBLISHABLE_API_KEY },
    tags: { workflow: "catalog" },
    timeout: "10s",
  }
  const responses = http.batch([
    [
      "GET",
      `${url}/store/products?limit=4&region_id=${__ENV.REGION_ID}`,
      null,
      params,
    ],
    [
      "GET",
      `${url}/store/products/${__ENV.PRODUCT_ID}?region_id=${__ENV.REGION_ID}`,
      null,
      params,
    ],
    ["GET", `${url}/store/regions`, null, params],
  ])
  for (const response of responses) {
    let body
    try {
      body = response.json()
    } catch {
      body = null
    }
    const ok = check(response, {
      "status 200": (value) => value.status === 200,
      "commerce resource exists": () =>
        !!(
          body &&
          (body.products?.length || body.product?.id || body.regions?.length)
        ),
    })
    failedChecks.add(!ok)
  }
  sleep(1) // Realistic user think time, not synchronization for correctness.
}

export function handleSummary(data) {
  return {
    [__ENV.PERF_OUTPUT || "test-results/performance.json"]: JSON.stringify(
      data,
      null,
      2,
    ),
    stdout:
      JSON.stringify(
        {
          profile: __ENV.PERF_PROFILE || "baseline",
          requests: data.metrics.http_reqs.values.count,
          p95_ms: data.metrics.http_req_duration.values["p(95)"],
          p99_ms: data.metrics.http_req_duration.values["p(99)"],
          http_failure_rate: data.metrics.http_req_failed.values.rate,
          business_failure_rate: data.metrics.business_failures.values.rate,
          thresholds: Object.fromEntries(
            Object.entries(data.metrics)
              .filter(([, value]) => value.thresholds)
              .map(([name, value]) => [name, value.thresholds]),
          ),
        },
        null,
        2,
      ) + "\n",
  }
}
