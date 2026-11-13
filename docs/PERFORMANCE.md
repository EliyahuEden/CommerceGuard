# Performance test design

Local only. The runner fixes the target to `http://127.0.0.1:9000`; the k6 script
independently rejects non-local hosts and other ports. It uses the public key from
the actual seed. There are no order/customer writes or paid/public targets.

One iteration concurrently requests a four-product region-priced catalog, a product
detail, and regions using `http.batch`, checks status and a nonempty commerce result,
then waits one second of user think time.

| Profile            | Workload                                   | Purpose                                                 |
| ------------------ | ------------------------------------------ | ------------------------------------------------------- |
| baseline (default) | 2 VUs, 20 seconds                          | Small developer-machine budget and regression reference |
| ramp               | 1→3 VUs over 15s, →5 over 20s, →0 over 10s | Observe increasing contention and recovery              |

Both profiles require p95 < 750ms, p99 < 1500ms, HTTP failure rate < 1%, all business
checks passing and zero business failures. These are **project budgets** for this
tiny seeded local dataset, not a published Medusa SLA or production capacity claim.
Threshold failure makes k6 exit nonzero, using
[k6's threshold semantics](https://grafana.com/docs/k6/latest/using-k6/thresholds/).

Commands:

```sh
npm run test:perf
# POSIX:
PERF_PROFILE=ramp npm run test:perf
# PowerShell:
$env:PERF_PROFILE='ramp'
npm run test:perf
Remove-Item Env:PERF_PROFILE
```

Install [k6 2.3.0](https://github.com/grafana/k6/releases/tag/v2.3.0), put it on PATH,
or set `K6_BINARY` to its executable. The optional Windows session download is under
`.tools/k6/`. The GitHub workflow installs k6 separately and preserves JSON results.
JSON output defaults to `test-results/performance.json`; `PERF_OUTPUT` can select
another filename. `docs/STR.md` records measured results, machine context and limits.

Run performance separately from browser suites, after readiness/route warmup. Never
compare runs without recording hardware, dataset, build and concurrency. A short
five-VU local pass demonstrates test execution and budgets, not a capacity benchmark.

The 13 November enhancement campaign used the expanded ten-product catalog while
retaining the four-item page workload. It measured 102 baseline and 330 ramp
requests, all thresholds passing. See the [current measured report](ENHANCEMENT_RESULTS.md)
and its separate JSON metrics. The original 429-request campaign remains dated in
STR; different local samples do not establish a performance improvement.
