# Changelog

All notable Kodematik changes are documented here.

The repository began as **AgentGym v0.3.0**. There are no v0.1.x or v0.2.x releases in this repository history, so this changelog starts at the actual initial commit rather than inventing earlier versions.

Benchmark notes distinguish **harness/qualification improvements** from **agent-performance evidence**. A successful GitHub Actions run means the workflow completed; it does not by itself prove that an agent improved.

## v0.6.16 — Instruction Delivery Integrity — 2026-09-13

### Added

- Explicit delivery of the active worktree's `AGENTS.md` into the OpenRouter system context.
- Bounded instruction loading that preserves the beginning and end of large instruction files.
- SHA-256 fingerprints for the exact repository-instruction context delivered to OpenRouter.
- `instructions.loaded` / `instructions.missing` evidence in agent events.
- CLI logging of instruction fingerprints and delivered character counts.
- Regression tests covering repository-instruction delivery and failure-analysis evidence.

### Fixed

- Closed a benchmark-integrity gap in v0.6.15: OpenRouter mutation candidates wrote guidance to `AGENTS.md`, but the custom OpenRouter runner did not explicitly include that file in the model context. v0.6.16 makes instruction delivery observable and testable.

### Verified benchmark evidence

Locked Real Agent Tournament #4 (`34711721197`) against `axios/axios`, using OpenRouter + `deepseek/deepseek-v4-flash`:

- Qualification reproduced the same 5/5 task set and dataset fingerprint `502f5bf177246c5900e98bc56812d0f731fa9452940d612af6ac2d1be577fa42`.
- `turn-efficient` won exploration with 67% pass rate / 83 verification versus baseline 0% / 50.
- Paired training trials: **2/3 wins**, 0 regressions, average delta **+33 percentage points pass rate / +17 verification points**.
- Held-out trials: **3/3 non-regressing**, with candidate outcomes 50/75, 50/75, and 100/100 versus baseline 0/50 in each paired trial.
- Final decision: **KEEP**.
- Baseline and candidate runs emitted different instruction fingerprints, proving the mutated repository instructions were actually delivered to the model.

This is evidence for this locked benchmark configuration, not a universal performance claim across repositories or models.

## v0.6.15 — Failure-Informed Mutations — 2026-09-12

### Added

- Baseline failure profiling from safe tool-use evidence.
- Detection of oracle reads, production edits, targeted verification, unresolved verification, test/oracle edits, and tool-turn exhaustion.
- Failure-informed mutation strategies:
  - `failure-localized`
  - `oracle-guided`
  - `turn-efficient`
- Per-task frozen candidate guidance before stochastic confirmation trials.

### Benchmark result

Locked axios tournament `34700571872` qualified a stable 5/5 dataset but finished **REJECT**: 0/3 training wins and held-out evaluation was skipped.

After v0.6.16 exposed the instruction-delivery gap, this result remains useful as a harness diagnostic but should **not** be interpreted as evidence that the v0.6.15 guidance itself was ineffective—the OpenRouter runner had not proven that the generated `AGENTS.md` guidance reached the model.

## v0.6.14 — Stochastic Evaluation — 2026-09-12

### Added

- Repeated paired stochastic trials for non-deterministic coding agents.
- Majority-win training requirement.
- Zero-regression requirement on paired training trials.
- Held-out calls only after training eligibility passes.
- Zero held-out regressions required for final KEEP.

### Benchmark result

Three paired trials produced 0/3 wins for the selected mutation and therefore **REJECT**. Held-out agent calls were correctly skipped by the fail-closed gate.

## v0.6.13 — Locked Baseline Evaluation — 2026-09-12

### Added

- Locked qualified-set baseline workflow before expensive agent calls.
- `--expected-fingerprint SHA256` support.
- Exact dataset revalidation before a real-agent baseline.
- Abort behavior when qualification fingerprint or usable task-set integrity changes.

This release strengthened the distinction between a stable benchmark dataset and an agent result.

## v0.6.12 — Cost-Aware Verification — 2026-09-12

### Added

- Cost-aware qualification reporting and verification planning.
- Better visibility into verification strategies, targeted tests, historical job scope, and rejection reasons.
- Qualification diagnostics designed to identify expensive candidates before agent tokens are spent.

## v0.6.11 — Bounded Qualification — 2026-09-11

### Added

- `--qualification-budget-min`.
- `--verification-timeout-sec`.
- `--install-timeout-sec`.
- Fail-closed bounded qualification so historical reconstruction cannot consume unbounded workflow time.
- Targeted historical test-oracle execution to reduce unnecessary full-suite work.

This release addressed the aggregate qualification-duration bottleneck observed in the previous axios runs.

## v0.6.10 — Job-Scoped CI Reconstruction — 2026-09-11

### Added

- Reconstruction of the historical CI **job** responsible for verification rather than mixing commands from unrelated jobs/toolchains.
- Job/toolchain metadata in verification plans and diagnostics.

### Benchmark diagnostic

The axios qualification run no longer showed the earlier Bun/Node toolchain contamination, but a 90-minute workflow timeout exposed qualification duration as the next bottleneck. The process was running npm/Vitest at timeout, which confirmed the job-scoping correction while motivating bounded qualification.

## v0.6.9 — Benchmark Integrity — 2026-09-10

### Added

- Stronger benchmark-integrity diagnostics around historical verification.
- More explicit task-quality reporting and ground-truth failure accounting.

### Benchmark diagnostic

An axios scan surfaced 35 strong candidate commits but qualified 0 tasks. The dominant ground-truth failures traced to mixed historical CI toolchains, including `bun test` being selected under a Node-only reconstructed environment. This was treated as a harness problem, not an agent-performance result.

## v0.6.8 — Reproducible Historical Replay — 2026-09-10

### Added

- Legacy toolchain reconstruction improvements.
- Per-task replay fingerprints.
- Qualified-set reproducibility checks.
- Fresh-worktree replay to detect task instability before agent calls.

This release responded to qualified task IDs changing across otherwise similar qualification runs.

## v0.6.7 — Date-Bounded Dependency Resolution — 2026-09-10

### Added

- Commit-date-aware dependency resolution for historical worktrees.
- Better handling of repositories whose historical dependency ranges resolve differently today.
- Dependency-resolution audit metadata.

### Qualification evidence

On p-map qualification experiments, date-bounded resolution reduced ground-truth verification failures and increased the number of qualified tasks. This was a qualification/reproducibility improvement, **not** an agent-performance claim.

## v0.6.6 — Historical Verification — 2026-09-10

### Added

- Historical verification reconstruction improvements.
- Evaluation checks aligned more closely with repository CI behavior rather than only current generic package scripts.

## v0.6.5 — Historical Runtime and Package Manager — 2026-09-10

### Added

- Historical Node runtime detection and selection.
- Historical package-manager reconstruction.
- Runtime/package-manager metadata in evaluation output.

## v0.6.4.1 — Historical Runtime Follow-up — 2026-09-10

### Changed

- Patch follow-up to the v0.6.4 historical-runtime work before the broader v0.6.5 runtime/package-manager release.
- Preserved the v0.6.4 compatibility direction while tightening implementation details and test coverage.

## v0.6.4 — Historical Runtime Compatibility — 2026-09-10

### Added

- Historical runtime compatibility layer for replaying older repository states.
- Foundation for selecting runtime/tooling based on historical repository evidence rather than always using the current environment.

## v0.6.3 — Stable Regression Guard — 2026-09-10

### Added

- Stronger pre-agent stability checks for qualified regression tasks.
- Relocking/guard behavior to prevent unstable tasks from silently entering comparisons.

### Benchmark result

A p-map run produced only one qualified task and no agent success, ending in **REJECT**. This helped expose qualification quality as the primary bottleneck at the time.

## v0.6.2 — Qualification Stability — 2026-09-10

### Added

- Additional stability guards around regression qualification.
- Safer rejection of tasks that could not be reproduced consistently.

A p-map experiment produced zero qualified tasks, reinforcing the need for better historical environment reconstruction.

## v0.6.1 — Qualification Follow-up — 2026-09-10

### Added

- Early qualification refinements following v0.6.0.
- More conservative handling of candidate historical regressions.

A p-map run surfaced a flaky qualification case that motivated the stronger stability guard in v0.6.2.

## v0.6.0 — Qualification Expansion — 2026-09-09

### Added

- A dedicated qualification direction before real-agent evaluation.
- Broader historical task discovery and filtering.
- Separation of benchmark construction problems from coding-agent performance problems.

The v0.6 line became primarily about making historical replay tasks reproducible enough to support trustworthy performance comparisons.

## v0.5.1 — Benchmark Eligibility Guards — 2026-09-09

### Added

- Stronger guards to avoid spending tokens on unusable replay tasks.
- Earlier rejection of tasks that cannot support a valid comparison.

### Efficiency evidence

A p-map OpenRouter run used 243,243 total tokens and finished in roughly 3.5 minutes, versus roughly 3.47 million tokens in the earlier v0.5 experiment—about a **93% observed token reduction** in that comparison. This was a harness/qualification efficiency result, not proof of better agent quality.

## v0.5.0 — Multi-Agent — 2026-09-09

### Added

- OpenRouter coding-agent adapter alongside Codex CLI.
- Tool-calling loop for repository-scoped file reads/writes, directory listing, and shell commands.
- `--agent codex|openrouter` selection.
- Configurable `--model` and OpenRouter default `deepseek/deepseek-v4-flash`.

### Benchmark result

The first real OpenRouter benchmark (`34380492679`) was expensive—roughly 44 minutes and 3.47 million tokens—and ended **REJECT**. It became the evidence for adding stronger eligibility and qualification guards in v0.5.1.

## v0.4.0 — Actual Evolution — 2026-09-09

### Added

- Multi-candidate mutation tournament in `evolve`.
- Training baseline followed by competing instruction candidates.
- Deterministic tournament ranking.
- Winner-only held-out validation.
- KEEP / REJECT decision flow.
- Initial mutation set including minimal, test-first, repository-map, verification-strict, and combined guidance.

This changed Kodematik from a baseline-vs-one-candidate harness into an instruction-evolution tournament.

## Rebrand — AgentGym → Kodematik — 2026-09-09

- Renamed the project and CLI identity from **AgentGym** to **Kodematik**.
- Kept the core product thesis: train/evaluate coding-agent repository instructions using executable historical tasks.

## v0.3.0 — Initial AgentGym MVP — 2026-09-09

The initial repository commit.

### Added

- JavaScript/TypeScript-focused local coding-agent evaluation harness.
- Git-history replay tasks built from non-merge commits.
- Detached disposable Git worktrees.
- Codex CLI adapter.
- Deterministic repository verification.
- Non-vacuous regression detection: tasks only count when the historical pre-fix state fails.
- Protection against passing by editing test files.
- Multi-task evaluation.
- Deterministic training / held-out split.
- Baseline-versus-candidate comparison.
- Initial generated `AGENTS.md` candidate guidance.
- Separation of repository readiness metadata from executable agent-performance results.
- `doctor`, `benchmark`, `evolve`, and `init` commands.

The initial project question was already the one Kodematik still pursues today: **which repository instructions measurably make a coding agent better, including on tasks it did not train on?**
