# 📘 Monolithic Persistence (System Design)

## WHAT IS MONOLITHIC PERSISTENCE

> **Monolithic Persistence** means
> **ek hi database** (usually one big SQL DB)
> jisme **poore system ka saara data** store hota hai.

Example:

- Users
- Orders
- Payments
- Inventory
- Logs
- Analytics
  ➡️ **All in one database**

At start, this feels:

- Simple
- Clean
- Easy to manage

---

## WHY PEOPLE START WITH IT

Because initially:

- Single codebase
- Single team
- Low traffic
- Simple requirements

Benefits early on:

- Easy joins
- Strong consistency
- Simple transactions
- Less operational overhead

👉 For **small systems**, monolithic persistence is **not wrong**.

---

## HOW IT BECOMES A PROBLEM (AS SYSTEM GROWS)

As system grows:

- More features
- More teams
- More traffic
- More services

That **one database** becomes:

- Shared by everything
- Tightly coupled to everything
- Single point of contention

👉 **Database becomes the bottleneck and coordination point.**

---

## CORE PROBLEMS WITH MONOLITHIC PERSISTENCE

### 1️⃣ SCALABILITY BOTTLENECK

- All reads/writes hit same DB
- Hard to scale independently
- Vertical scaling hits limit

```
More services → More DB load → DB collapses
```

---

### 2️⃣ TIGHT COUPLING BETWEEN SERVICES

Multiple services depend on same tables.

Example:

- User Service
- Order Service
- Payment Service
  All touching `users` table.

Result:

- Schema changes become dangerous
- One team breaks another team
- Deployments get risky

---

### 3️⃣ LOCKING & CONTENTION

- Many writes on same tables
- Transactions overlap
- Locks increase
- Deadlocks appear

Especially bad with:

- Counters
- Status updates
- Shared reference tables

---

### 4️⃣ LIMITED FLEXIBILITY

One DB forces:

- One schema style
- One scaling strategy
- One storage type

But different workloads want different DBs:

- Orders → relational
- Logs → time-series
- Analytics → columnar
- Sessions → key-value

Monolith DB can’t satisfy all well.

---

## REAL EXAMPLE (VERY COMMON)

### Early stage e-commerce

Single DB:

- users
- orders
- payments
- inventory
- reviews

Works fine at:

- 1k users
- 100 orders/day

---

### Growth phase

Now:

- 1M users
- 10k orders/min
- Analytics jobs running
- Recommendation engine added

Result:

- DB CPU 90%
- Slow queries
- Lock contention
- Teams blocking each other

👉 **Monolithic persistence becomes the choke point.**

---

## HOW TO FIX / EVOLVE FROM MONOLITHIC PERSISTENCE

Important:
👉 **You don’t break it in one shot.**

---

### 1️⃣ DATABASE PER SERVICE (MICROSERVICES STYLE)

Each service owns its own data.

```
User Service      → User DB
Order Service     → Order DB
Payment Service   → Payment DB
```

Benefits:

- Independent scaling
- Independent schema changes
- Clear ownership

Tradeoff:

- No cross-DB joins
- Eventual consistency

---

### 2️⃣ SHARDING (WHEN DB IS TOO BIG)

Split data horizontally.

Example:

- Users 1–1M → Shard A
- Users 1M–2M → Shard B

Benefits:

- Smaller datasets
- Parallel load
- Better performance

Tradeoff:

- Complex queries
- Cross-shard operations hard

---

### 3️⃣ POLYGLOT PERSISTENCE

Use different databases for different needs.

Example:

- PostgreSQL → transactions
- Redis → cache / sessions
- Elasticsearch → search
- ClickHouse → analytics

Benefits:

- Right tool for right job

Tradeoff:

- Operational complexity

---

### 4️⃣ READ REPLICAS + CACHING (SHORT-TERM RELIEF)

Before big refactors:

- Add read replicas
- Add Redis
- Reduce load

This:

- Buys time
- Does not solve core coupling issue

---

## LOGIC (CORE IDEA)

Ask this question:

> **“Can this data evolve, scale, and fail independently?”**

If answer is **NO**:

- You are stuck in monolithic persistence.

---

## IMPORTANT CLARIFICATION (COMMON CONFUSION)

❌ Monolithic persistence = bad always
✔️ **No**

Correct thinking:

- Start monolithic
- Grow → observe bottlenecks
- Split when pain is real

Premature microservices = disaster.

---

## CONCEPTUAL MENTAL MODEL (LOCK THIS)

```
Small system → One DB is fine
Growing system → One DB becomes a choke point
Large system → Data ownership must be split
```

Or simply:

> **Shared database = shared pain**

---

## FINAL ONE-LINE SUMMARY

> **Monolithic persistence is the use of a single shared database for an entire system, which works at small scale but becomes a major bottleneck and coupling point as the system grows.**
