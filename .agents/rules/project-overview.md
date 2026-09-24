---
trigger: always_on
---

PROJECT CONTEXT (applies to every task in this session)

We are building "Charter AI", a decision-support prototype for a Smart India Hackathon problem statement (SIH26006, Ministry of Steel): an intelligent freight forecasting model for vessel chartering and bulk cargo procurement to India's East Coast ports. The user question it answers: "Given this cargo and route, which vessel should I charter, when, and what will it cost?"

Two folders:
- charter-ai/           React 19 + Vite + Tailwind v4 dashboard. All panels read from src/data/mockData.js. Do not redesign the UI.
- charter-ai-backend/   Python 3.11+ FastAPI service (flat folder, no packages). Files: contract.json, ports.json, vessels.json, routes.json, rules.py, cost.py, forecast.py, recommend.py, main.py, rates.csv, tests.

Ground rules:
1. contract.json is the single source of truth for the request/response shape. Field names mirror src/data/mockData.js. Never rename or remove a field; additive fields are allowed. If you think the contract must change, stop and tell me.
2. Do not invent data silently. Anything not from a real source must be labelled "indicative", "assumption", or "synthetic" in code comments AND in the JSON/CSV it lives in.
3. This is a 2-day prototype: prefer simple, readable code over clever code. No databases, auth, Docker or deployment.
4. Every backend module gets a small pytest file. Run the tests and show me the output before you finish.
5. Keep diffs small and focused on the task. Do not refactor unrelated files. Do not delete files.
6. When a task is ambiguous, state your assumption in one line and continue instead of asking.