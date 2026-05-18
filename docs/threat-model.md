# Threat Model — NetSniff Cloud

## Scope
NetSniff Cloud captures network packet metadata on a user's local machine (Kali Linux) and ships it to a cloud dashboard for visualization. This document covers the security considerations and mitigations applied to v1.

## Assets
| Asset | Sensitivity | Why |
|---|---|---|
| User credentials | High | Auth bypass = total compromise |
| Packet metadata (IPs, ports, sizes) | Medium | Reveals user's network behavior |
| API keys | High | Allow agent to write to the user's data |
| User account isolation | High | A leak between tenants destroys trust |

## Threat actors
1. Anonymous internet attacker — scans for exposed endpoints, weak auth
2. Malicious authenticated user — attempts to read other users' data
3. Attacker with stolen API key — abuses ingest endpoint

## Threats and mitigations

### T1 — Cross-tenant data leakage
Risk: User A reads User B's packets via a buggy query or direct DB access.
Mitigation: Postgres Row Level Security on every table. Every row carries a user_id; every policy enforces auth.uid() = user_id. Defense in depth — even if app-layer auth is bypassed, the database refuses to return foreign rows.
Verified: Two-user isolation test, Phase 2.

### T2 — API key theft
Risk: Key leaked via GitHub, logs, or laptop compromise.
Mitigation:
- Keys hashed with SHA-256 before storage; raw key shown to user exactly once
- DB never holds the raw key — only the hash
- Keys are revocable from the dashboard
- last_used_at tracking helps detect unauthorized use

### T3 — Payload exfiltration
Risk: Capturing full payloads creates a database of user traffic that, if leaked, exposes private communications.
Mitigation: Capture only L3/L4 metadata (protocol, src/dst IP, src/dst port, size, TCP flags). Payloads are never stored or transmitted.

### T4 — Man-in-the-middle on agent → cloud traffic
Risk: Attacker on the network intercepts API key or packet stream.
Mitigation: All agent → cloud traffic over HTTPS. Vercel enforces TLS on all endpoints.

### T5 — Credential stuffing on login
Risk: Attacker tries leaked password lists against the dashboard.
Mitigation: Supabase Auth applies rate limiting by default.

### T6 — SQL injection
Risk: Crafted filter inputs return unintended rows.
Mitigation: All DB access via Supabase client / parameterized queries. No string concatenation in SQL.

### T7 — Service role key exposure
Risk: The Supabase service-role key bypasses RLS. If leaked, the entire DB is exposed.
Mitigation: Service-role key lives only in Vercel environment variables, server-side. Frontend uses the anon key, which is constrained by RLS.

### T8 — Unauthorized capture on shared machines
Risk: Agent run on a machine the user does not own captures third-party traffic.
Mitigation: Documentation states the agent is for use only on machines the user owns. Agent requires sudo, making accidental deployment unlikely.

## Out of scope for v1
- DDoS protection beyond Vercel defaults
- Anomaly-based intrusion detection (planned v1.1)
- Data retention enforcement (planned v1.1)

## Verification log
| Date | Test | Result |
|---|---|---|
| Phase 2 | RLS cross-tenant isolation | Pass — User B could not see User A's sessions |
| Phase 7 | End-to-end TLS check | TBD |
| Phase 7 | API key hash storage | TBD |