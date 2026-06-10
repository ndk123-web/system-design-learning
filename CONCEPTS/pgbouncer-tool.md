# PgBouncer — Connection Pooler for PostgreSQL

PgBouncer sits **between your app servers and PostgreSQL**. Apps open many connections to PgBouncer; PgBouncer keeps a **smaller pool** of real connections to Postgres and reuses them.

---

## The Problem

### One app server

```
FastAPI server (100 connections) → PostgreSQL (100 connections)
```

### Multiple app servers

```
FastAPI server-1 (100 connections) ─┐
FastAPI server-2 (100 connections) ─┼→ PostgreSQL (300 connections)
FastAPI server-3 (100 connections) ─┘
```

Each app instance opens its own pool (e.g. 100 each). Postgres ends up with **one TCP connection per client connection**.

**The waste:** at any moment, maybe only **5–6 queries are actually running**. The other ~295 connections are **idle** — but Postgres still keeps them open.

Each Postgres connection uses memory (roughly **~2–10 MB**, often ~2 MB as a ballpark). So:

| Connections | Memory held by Postgres |
|-------------|-------------------------|
| 10,000 idle connections | ~20 GB (10k × 2 MB) |
| 5 active connections | ~10 MB |

Most of that memory is wasted on connections doing nothing.

---

## The Solution: PgBouncer

PgBouncer is a **lightweight proxy** that multiplexes many client connections onto fewer server connections.

```
FastAPI server-1 (100 connections) ─┐
FastAPI server-2 (100 connections) ─┼→ PgBouncer (300 client connections) → PostgreSQL (100 connections)
FastAPI server-3 (100 connections) ─┘
```

- Apps still think they have 300 connections.
- Postgres only maintains **100 real connections**.
- When a query finishes, that Postgres connection goes back to the pool and serves the next waiting client.

PgBouncer itself is cheap — about **2 KB per client connection** (it does not run queries, it just forwards them).

---

## What happens when load exceeds the pool?

If **400 requests** arrive but the pool size is **100**:

1. **100** get a Postgres connection immediately and run.
2. The other **300 wait in PgBouncer's queue**.
3. As connections finish, queued requests are served.

So PgBouncer **limits and reuses** Postgres connections instead of opening one per app thread.

> Note: 100 connections does not mean 100 queries run in parallel on 100 CPU cores. Actual parallelism depends on Postgres, disk, and query type. The pool size is a **concurrency cap**, not a CPU guarantee.

---

## Pool Modes (how connections are reused)

| Mode | When Postgres connection is released | Best for |
|------|--------------------------------------|----------|
| **Session** | When client disconnects | Full PostgreSQL features (`SET`, temp tables, `LISTEN`) |
| **Transaction** (most common) | After each `COMMIT` / `ROLLBACK` | Web APIs — short transactions, high reuse |
| **Statement** | After each single query | Rare; no multi-statement transactions |

For FastAPI / Django / most ORMs: **transaction mode** is the usual choice.

---

## Key Takeaways

1. **Postgres connections are expensive** — memory per connection adds up fast at scale.
2. **Most app connections are idle** most of the time; pooling fixes that mismatch.
3. **PgBouncer multiplexes** many app connections → fewer Postgres connections.
4. **Overflow waits in a queue** — tune `default_pool_size` and `max_client_conn` for your load.
5. **Pick the right pool mode** — transaction mode gives best reuse but breaks session-level features.
