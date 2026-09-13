<p align="center"><img src="assets/a_clean_modern_dark_themed_product_banner_hero_im.png" alt="Kodematik — Train your coding agent on your own codebase" width="100%"></p>
<h1 align="center">Kodematik</h1>
<p align="center"><strong>Train your coding agent on your own codebase.</strong></p>
<p align="center"><em>Benchmark → Diagnose → Mutate → Compete → Validate → Keep or Reject.</em></p>
<p align="center">
  <a href="https://github.com/puspoaditya/kodematik/actions/workflows/ci.yml"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/puspoaditya/kodematik/ci.yml?branch=main&style=for-the-badge&label=tests"></a>
  <img alt="Version" src="https://img.shields.io/badge/version-v0.6.16-7c3aed?style=for-the-badge">
  <img alt="License MIT" src="https://img.shields.io/badge/license-MIT-22c55e?style=for-the-badge">
  <img alt="GitHub stars" src="https://img.shields.io/github/stars/puspoaditya/kodematik?style=for-the-badge&logo=github">
  <img alt="GitHub forks" src="https://img.shields.io/github/forks/puspoaditya/kodematik?style=for-the-badge&logo=github">
</p>
<p align="center">
  <img alt="Node.js 20+" src="https://img.shields.io/badge/Node.js-20%2B-339933?style=flat-square&logo=nodedotjs&logoColor=white">
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-ESM-F7DF1E?style=flat-square&logo=javascript&logoColor=000">
  <img alt="Git" src="https://img.shields.io/badge/Git-worktrees-F05032?style=flat-square&logo=git&logoColor=white">
  <img alt="Codex CLI" src="https://img.shields.io/badge/Codex-CLI-111111?style=flat-square&logo=openai&logoColor=white">
  <img alt="OpenRouter" src="https://img.shields.io/badge/OpenRouter-Multi--Model-6366F1?style=flat-square">
  <img alt="DeepSeek V4 Flash" src="https://img.shields.io/badge/DeepSeek-V4_Flash-4F46E5?style=flat-square">
  <img alt="GitHub Actions" src="https://img.shields.io/badge/GitHub_Actions-CI-2088FF?style=flat-square&logo=githubactions&logoColor=white">
</p>

**Kodematik** is an experimental local evaluation and evolution harness for coding agents. It converts real Git history into executable regression tasks, qualifies those tasks before spending agent tokens, benchmarks a coding agent in isolated worktrees, generates competing repository-instruction strategies, and accepts a candidate only when the evidence survives locked training and held-out checks.

Kodematik does **not** fine-tune the foundation model. It asks a narrower, measurable question:

> **Which repository instructions make the same coding agent perform better on this codebase — including on tasks that were not used to select the instruction?**

## What Kodematik does

```text
Git history
    │
    ▼
Qualify reproducible regressions ── fingerprint locked task set
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
- explicit OpenRouter `AGENTS.md` delivery with instruction fingerprints.

## v0.6.16 — Instruction Delivery Integrity

v0.6.16 closes a benchmark-integrity gap discovered after v0.6.15. Candidate mutations were being written to `AGENTS.md`, but the custom OpenRouter runner did not explicitly load that file into the model context. That made the v0.6.15 OpenRouter mutation tournament unable to prove that the model actually received the mutated instructions.

OpenRouter runs now:

1. load the active worktree's `AGENTS.md` into the system context;
2. bound very large instruction files while preserving both the beginning and end;
3. compute a SHA-256 fingerprint of the exact delivered instruction context;
4. record and print that fingerprint for every agent run;
5. preserve the existing fail-closed stochastic and held-out evaluation rules.

This means a tournament can now demonstrate that baseline and candidate agents actually received different repository instructions.

## Verified real-agent result

The first locked tournament after the instruction-delivery fix produced a **KEEP** decision on `axios/axios`.

| Evidence | Baseline | `turn-efficient` candidate |
| --- | ---: | ---: |
| Qualified dataset | 5 / 5 tasks | same locked task set |
| Training trial 1 | 0% pass · 50/100 | **67% · 83/100** |
| Training trial 2 | 0% pass · 50/100 | **33% · 67/100** |
| Training trial 3 | 0% pass · 50/100 | 0% · 50/100 |
| Training stochastic evidence | — | **2/3 wins · 0 regressions** |
| Held-out trial 1 | 0% · 50/100 | **50% · 75/100** |
| Held-out trial 2 | 0% · 50/100 | **50% · 75/100** |
| Held-out trial 3 | 0% · 50/100 | **100% · 100/100** |
| Held-out safety | — | **3/3 non-regressing · 0 regressions** |
| Final decision | — | **KEEP ✓** |

Benchmark configuration: OpenRouter, `deepseek/deepseek-v4-flash`, 5 qualified tasks, 30% held-out, 3 mutation candidates, 3 paired trials, 8 tool-call turns, dataset fingerprint `502f5bf177246c5900e98bc56812d0f731fa9452940d612af6ac2d1be577fa42`.

Instruction-delivery evidence also changed as expected: baseline and candidate runs emitted different `AGENTS.md` SHA-256 fingerprints.

**Scope of this claim:** this is a reproduced result on one locked `axios/axios` benchmark configuration. It is evidence that the instruction mutation helped this agent on this task set; it is **not** a claim that Kodematik universally improves every agent or repository.

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

Install and authenticate Codex CLI, then run:

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

PowerShell:

```powershell
$env:OPENROUTER_API_KEY="your-key"
```

## Commands

| Command | Purpose |
| --- | --- |
| `kodematik doctor` | Inspect repository readiness metadata |
| `kodematik qualify` | Build a reproducible benchmark-eligible historical task set without agent API calls |
| `kodematik baseline` | Rebuild/lock the qualified set, revalidate it, then optionally run the real-agent baseline |
| `kodematik benchmark` | Replay historical tasks against a selected agent |
| `kodematik evolve` | Run the mutation tournament, stochastic confirmation, and held-out safety gate |
| `kodematik init` | Install the Kodematik skill bundle into the current repository |

Important defaults: `--agent codex`, `--tasks 10`, `--holdout 30`, `--candidates 5`, `--trials 3`, `--max-turns 8`, `--qualification-budget-min 75`, `--verification-timeout-sec 60`, and `--install-timeout-sec 120`.

## Qualification before tokens

Kodematik treats benchmark construction as part of evaluation integrity. A candidate commit does not automatically become an agent task.

Qualification can reject tasks for reasons such as dependency failure, dependency timeout, verification timeout, no reproducible regression, no substantive test regression, ground-truth verification failure, or replay instability. Qualification itself makes **zero coding-agent API calls**.

A qualified task records its historical runtime, dependency resolution mode, verification job, targeted test oracle, verification command set, and replay fingerprint. A full qualified set also receives a SHA-256 fingerprint so an expensive baseline/tournament can fail closed if the dataset changes.

## Failure-informed mutations

The real-agent baseline records safe behavioral evidence such as:

- whether regression-oracle files were read;
- whether production files were edited;
- whether locked targeted verification was run;
- which verification families remained failing;
- whether the agent exhausted its tool-call budget;
- whether repository instructions were actually delivered.

Kodematik turns those observed misses into candidate `AGENTS.md` guidance. Current strategies include **failure-localized repair**, **oracle-guided diagnosis**, and **turn-efficient verification**. Candidate guidance is frozen per task before stochastic confirmation trials.

## Fail-closed acceptance

A single lucky agent run is not enough. The current stochastic gate requires a candidate to improve a majority of paired training trials with zero training regressions. Only then are held-out agent calls allowed. A final `KEEP` additionally requires zero held-out regressions on the exact locked held-out tasks.

`KEEP` is an evaluation decision. Benchmark candidates run in detached temporary worktrees; Kodematik does not silently overwrite the source repository during the tournament.

## Safety and limitations

Agent experiments run in disposable detached Git worktrees. Repository verification scripts can execute arbitrary project code, so only evaluate repositories you trust.

Kodematik is still an experimental research/developer tool. The strongest support is currently for JavaScript/TypeScript repositories with reconstructable Node CI and test history. Historical environment reconstruction is intentionally conservative but cannot perfectly reproduce every old CI environment. Real-agent stochastic tournaments can also consume substantial tokens and runtime, which is why qualification is token-free and fail-closed.

Readiness metadata is not agent performance. CI success means the harness completed successfully; it does not by itself mean a mutation improved the agent. Only benchmark evidence and the KEEP/REJECT gate support an agent-performance conclusion.

## Continuous integration

Every push and pull request to `main` runs syntax checks, unit tests, and CLI smoke tests. The repository also includes a locked **Real Agent Tournament** workflow for reproducible OpenRouter experiments.

```bash
npm run check
npm test
```

## Project history

Kodematik began as **AgentGym v0.3.0** and evolved through historical replay, held-out evaluation, mutation tournaments, multi-agent support, historical CI reconstruction, reproducibility fingerprints, bounded qualification, stochastic evidence, failure-informed mutations, and instruction-delivery integrity.

See **[CHANGELOG.md](CHANGELOG.md)** for the version-by-version history from the initial v0.3.0 prototype through v0.6.16.

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
- [x] First locked real-agent KEEP result on `axios/axios`
- [ ] Reproduce KEEP evidence across additional repositories and agent models
- [ ] Persist/export accepted instruction candidates as an explicit user-controlled artifact
- [ ] JSON / HTML benchmark reports
- [ ] Additional native coding-agent adapters
- [ ] npm publishing and release automation
- [ ] Broader language/runtime adapters beyond Node-centric historical reconstruction

## Contributing

Reproducible failure cases, historical-CI reconstruction improvements, mutation strategies, agent adapters, and evaluation-integrity ideas are welcome.

## License

MIT © Kodematik contributors
