<p align="center"><img src="assets/a_clean_modern_dark_themed_product_banner_hero_im.png" alt="Kodematik — Train your coding agent on your own codebase" width="100%"></p>
<h1 align="center">Kodematik</h1>
<p align="center"><strong>Train your coding agent on your own codebase.</strong></p>
<p align="center"><em>Benchmark → Diagnose → Mutate → Compete → Validate → Keep or Reject.</em></p>
<p align="center">
  <a href="https://github.com/puspoaditya/kodematik/actions/workflows/ci.yml"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/puspoaditya/kodematik/ci.yml?branch=main&style=for-the-badge&label=tests"></a>
  <img alt="Version" src="https://img.shields.io/badge/version-v0.6.17-7c3aed?style=for-the-badge">
  <img alt="License MIT" src="https://img.shields.io/badge/license-MIT-22c55e?style=for-the-badge">
  <img alt="GitHub stars" src="https://img.shields.io/github/stars/puspoaditya/kodematik?style=for-the-badge&logo=github">
  <img alt="GitHub forks" src="https://img.shields.io/github/forks/puspoaditya/kodematik?style=for-the-badge&logo=github">
</p>

**Kodematik** is an experimental local evaluation and evolution harness for coding agents. It converts real Git history into executable regression tasks, qualifies those tasks before spending agent tokens, benchmarks a coding agent in isolated worktrees, generates competing repository-instruction strategies, and accepts a candidate only when the evidence survives locked stochastic and held-out checks.

Kodematik does **not** fine-tune the foundation model. It asks a narrower, measurable question:

> **Which repository instructions make the same coding agent perform better on this codebase — including on tasks that were not used to select the instruction?**

## What Kodematik does

```text
Git history
    │
    ▼
Qualify reproducible regressions ── fingerprint-locked task set
    │
    ├── Training
    │     ├── baseline agent
    │     └── mutation candidates
    │              │
    │         tournament winner
    │              │
    └── Held-out ──┴── baseline vs winner
                       │
                  KEEP / REJECT
                       │
                candidate manifest
                       │
            exact independent replay
```

The current harness includes:

- historical replay tasks built from bug-fix commits;
- detached disposable Git worktrees;
- task-quality filtering and reproducibility guards;
- historical Node/package-manager reconstruction;
- lockfile and date-bounded dependency preparation;
- job-scoped historical CI reconstruction;
- targeted historical test oracles;
- qualification time and verification budgets;
- exact qualified-set SHA-256 fingerprints;
- Codex CLI and OpenRouter agent adapters;
- failure-informed `AGENTS.md` mutations;
- repeated paired stochastic trials;
- fail-closed training and held-out acceptance gates;
- explicit OpenRouter `AGENTS.md` delivery with instruction fingerprints;
- per-task stochastic evidence;
- versioned candidate replay manifests for exact cross-run treatment reuse.

## v0.6.17 — Candidate Replay Integrity

v0.6.17 separates **candidate discovery** from **candidate confirmation**.

A discovery tournament can export the winning treatment as a manifest containing:

- target repository;
- locked dataset fingerprint;
- mutation ID and title;
- exact per-task candidate rules;
- exact task IDs;
- SHA-256 manifest fingerprint.

A later tournament can replay that manifest rather than regenerating guidance from a new stochastic baseline profile. Manifest loading is fail-closed: mismatched repository, dataset, missing tasks, unsupported schema, or modified content is rejected.

This matters because “same mutation name” is not enough for a reproducibility claim. v0.6.17 can test the **same candidate treatment** across independent runs.

## Current axios evidence

The locked `axios/axios` benchmark uses OpenRouter + `deepseek/deepseek-v4-flash`, 5 qualified tasks, 30% held-out, 3 paired trials, 8 tool-call turns, and dataset fingerprint:

`502f5bf177246c5900e98bc56812d0f731fa9452940d612af6ac2d1be577fa42`

### Candidate discovery — Tournament #7

Tournament #7 (`34766235944`) selected `failure-localized`, exported a complete five-task manifest, and finished **KEEP**.

| Evidence | Result |
| --- | ---: |
| Training | **2/3 wins · 0 regressions** |
| Average training delta | **+33pp pass · +17 verification** |
| Held-out | **3/3 wins · 0 regressions** |
| Final | **KEEP ✓** |

Final candidate manifest fingerprint:

`c28515fc9b77ec05185c838df92cf54a4ddafef107dcd8a804ab2dceab1d3a28`

### Exact independent replay — Tournament #8

Tournament #8 (`34773725440`) loaded that exact committed manifest. Dataset integrity passed, manifest integrity passed, and the candidate instruction fingerprints matched the generated treatment from Tournament #7.

The performance result was different:

| Trial | Baseline | Exact replay candidate | Result |
| --- | ---: | ---: | --- |
| Training 1 | 0% / 50 | 0% / 50 | Neutral |
| Training 2 | 0% / 50 | 33% / 67 | Win |
| Training 3 | 0% / 50 | 0% / 50 | Neutral |
| Aggregate | — | **1/3 wins · 0 regressions** | **Eligibility FAIL** |
| Held-out | — | skipped by fail-closed gate | — |
| Final | — | — | **REJECT ✗** |

This is an important result rather than a failed release. It shows that the earlier KEEP/REJECT variation was not explained only by regenerating different candidate guidance. Even byte-identical instructions can produce different outcomes from a stochastic coding agent.

**Scope of the claim:** Kodematik has demonstrated exact candidate-treatment replay on one locked axios benchmark. It has **not** yet demonstrated stable performance improvement across repositories or independent confirmation runs.

## Quick start

```bash
git clone https://github.com/puspoaditya/kodematik.git
cd kodematik
npm install
npm link

kodematik doctor
kodematik qualify --tasks 5 --scan-limit 100 --install
```

Exercise the harness without invoking an agent:

```bash
kodematik baseline --tasks 5 --scan-limit 100 --install --no-agent
kodematik evolve --tasks 5 --scan-limit 100 --install --no-agent
```

### Codex CLI

```bash
kodematik evolve \
  --agent codex \
  --tasks 10 \
  --holdout 30 \
  --candidates 5 \
  --trials 3 \
  --install
```

### OpenRouter

Set your OpenRouter key in the shell; never commit it:

```bash
export OPENROUTER_API_KEY="your-key"
```

Then run:

```bash
kodematik evolve \
  --agent openrouter \
  --model deepseek/deepseek-v4-flash \
  --tasks 10 \
  --scan-limit 100 \
  --holdout 30 \
  --candidates 5 \
  --trials 3 \
  --max-turns 8 \
  --install
```

Candidate manifests can be exported/replayed through the tournament workflow. The axios evidence manifest is committed under `benchmarks/axios/candidate-manifests/`.

## Commands

| Command | Purpose |
| --- | --- |
| `kodematik doctor` | Inspect repository readiness metadata |
| `kodematik qualify` | Build a reproducible benchmark-eligible historical task set without agent API calls |
| `kodematik baseline` | Rebuild/lock the qualified set, revalidate it, then optionally run the real-agent baseline |
| `kodematik benchmark` | Replay historical tasks against a selected agent |
| `kodematik evolve` | Run mutation discovery or exact-manifest replay, stochastic confirmation, and held-out safety gates |
| `kodematik init` | Install the Kodematik skill bundle into the current repository |

Important defaults: `--agent codex`, `--tasks 10`, `--holdout 30`, `--candidates 5`, `--trials 3`, `--max-turns 8`, `--qualification-budget-min 75`, `--verification-timeout-sec 60`, and `--install-timeout-sec 120`.

## Qualification before tokens

Kodematik treats benchmark construction as part of evaluation integrity. Qualification can reject tasks for dependency failure, timeout, no reproducible regression, ground-truth verification failure, or replay instability. Qualification itself makes **zero coding-agent API calls**.

A qualified task records historical runtime, dependency resolution mode, verification job, targeted test oracle, verification commands, and replay fingerprint. A qualified set receives its own SHA-256 fingerprint so expensive tournaments can fail closed if the dataset changes.

## Failure-informed mutations

The real-agent baseline records safe behavioral evidence such as oracle reads, production edits, locked verification usage, remaining failures, turn exhaustion, and repository-instruction delivery.

Kodematik converts those misses into candidate `AGENTS.md` guidance. Current strategies include **failure-localized repair**, **oracle-guided diagnosis**, and **turn-efficient verification**.

Within a tournament, candidate guidance is frozen per task. With v0.6.17, the exact treatment can also be exported and independently replayed across tournaments.

## Fail-closed acceptance

A single lucky run is not enough. A candidate must improve a majority of paired training trials with zero training regressions. Only then are held-out agent calls allowed. A final `KEEP` additionally requires zero held-out regressions.

Tournament #8 is a concrete example of the gate working as intended: the exact candidate had one training win and two neutral trials, so it was rejected and held-out calls were skipped.

## Safety and limitations

Agent experiments run in disposable detached Git worktrees. Repository verification scripts can execute arbitrary project code, so only evaluate repositories you trust.

Kodematik remains an experimental research/developer tool. The strongest support is currently for JavaScript/TypeScript repositories with reconstructable Node CI and test history. Real-agent outcomes are stochastic and may consume substantial tokens and runtime.

Readiness metadata is not agent performance. CI success means the harness completed; it does not mean a candidate improved the agent. Only benchmark evidence and the KEEP/REJECT gate support a performance conclusion.

## Continuous integration

Every push and pull request to `main` runs syntax checks, unit tests, and CLI smoke tests. The repository also includes a locked **Real Agent Tournament** workflow for reproducible OpenRouter experiments.

```bash
npm run check
npm test
```

## Project history

Kodematik began as **AgentGym v0.3.0** and evolved through historical replay, held-out evaluation, mutation tournaments, multi-agent support, historical CI reconstruction, reproducibility fingerprints, bounded qualification, stochastic evidence, failure-informed mutations, instruction-delivery integrity, and exact candidate replay.

See **[CHANGELOG.md](CHANGELOG.md)** for the version-by-version history through v0.6.17.

## Roadmap

- [x] Multi-task historical replay and worktree isolation
- [x] Training / held-out evaluation
- [x] Mutation tournaments
- [x] Codex and OpenRouter adapters
- [x] Historical dependency/runtime/CI reconstruction
- [x] Targeted historical test oracles
- [x] Reproducible task-set fingerprints
- [x] Bounded, cost-aware qualification
- [x] Repeated paired stochastic trials
- [x] Failure-informed mutations
- [x] OpenRouter instruction-delivery fingerprints
- [x] Per-task stochastic evidence
- [x] Export and replay exact candidate manifests
- [x] Independent exact replay on `axios/axios`
- [ ] Benchmark a second repository
- [ ] Multi-repository benchmark/reporting in v0.7.0
- [ ] JSON / HTML benchmark reports
- [ ] Additional native coding-agent adapters
- [ ] npm publishing
- [ ] Broader language/runtime adapters beyond Node-centric historical reconstruction

## Contributing

Reproducible failure cases, historical-CI reconstruction improvements, mutation strategies, agent adapters, and evaluation-integrity ideas are welcome.

## License

MIT © Kodematik contributors
