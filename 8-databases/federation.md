# Database Federation (Functional Partitioning)

## 1. WHY Federation Exists

### The real problem Federation solves

Federation does **not** exist to handle “too much data”.
It exists to handle **too many unrelated responsibilities fighting each other**.

Consider a single database handling:

- user login
- product browsing
- order creation
- reviews

Problems that appear:

- Heavy writes in `orders` slow down `users`
- Shared indexes pollute cache
- One connection pool becomes a choke point
- One schema change risks everything
- One DB outage takes down the whole app

This is **not a scale problem**.
This is a **coupling and contention problem**.

> Federation answers one question:
> **Why should unrelated features block each other?**

---

## 2. WHAT Federation Is

### Simple definition

**Federation = splitting databases by function / domain.**

Instead of one monolithic database:

```

Monolithic DB
├── users
├── products
├── orders
└── reviews

```

You create multiple databases:

```

Users DB
Products DB
Orders DB
Reviews DB

```

Key points:

- Each database owns **one business domain**
- Data is NOT split by rows
- Data is split by **meaning**

This is also called:

- Functional partitioning
- Database-per-domain

---

## 3. WHAT Federation Is NOT

Very important to avoid confusion:

- ❌ Federation is NOT sharding
- ❌ Federation is NOT replication
- ❌ Federation is NOT primarily about scale

Federation does **not** reduce table size.
Federation does **not** split users by ID.
Federation does **not** copy data.

Federation splits **responsibility**, not volume.

---

## 4. HOW Federation Works (Actual Mechanics)

### Routing happens in the application

There is no shard router.
There is no DB-level magic.

The **application decides** which database to use.

Example request flows:

```

POST /login
→ Auth Service
→ Users DB

```

```

GET /products
→ Catalog Service
→ Products DB

```

```

POST /order
→ Order Service
→ Orders DB

```

Each request touches **only one database**.

---

## 5. Connection Pools — The Core Enabler (IMPORTANT)

Federation works because **each database has its own independent connection pool**.

### Without federation

```

One App
└── One DB
└── One Connection Pool
└── All features compete here

```

All writes are serialized through:

- the same pool
- the same DB locks
- the same indexes

---

### With federation

```

Users Service
└── Pool (Users DB)

Orders Service
└── Pool (Orders DB)

Products Service
└── Pool (Products DB)

```

Each pool is:

- independent
- not shared
- not competing

This is what enables **true parallel writes**.

> Federation splits **serialization**, not just data.

---

## 6. SQL and MongoDB Clarification

### SQL databases

- Connection pool lives in the application
- Pool is tied to **one DB endpoint**
- Each database = separate pool

### MongoDB

- Pool lives in the application driver
- Pool connects to a **MongoDB cluster**
- Each cluster = separate pool

So yes:

> Each federated database (SQL or MongoDB) has its **own connection pool**.

This is why writes can proceed in parallel.

---

## 7. Example (Concrete and Real)

### E-commerce system

Databases:

```

Users DB     → login, profiles
Orders DB    → purchases, payments
Products DB  → catalog

```

Traffic scenario:

- 100 logins/sec
- 200 order writes/sec
- 500 product reads/sec

With federation:

- Users DB handles logins only
- Orders DB handles writes only
- Products DB handles reads only

No single database serializes all writes.

---

## 8. Why Federation Improves Performance (Indirectly)

Federation improves performance because:

- Smaller databases → smaller indexes
- Better cache locality
- Independent locks
- Independent pools
- Parallel writes across domains

It is **not raw speed**.
It is **isolation**.

---

## 9. Federation vs Sharding (Lock This)

```

Federation → split by WHAT the data represents
Sharding   → split by WHICH data it is

```

Examples:

- Users DB vs Orders DB → Federation
- Users split by user_id → Sharding

They solve **different problems**.

---

## 10. When Federation Is the Right Choice

Use federation when:

- Domains are logically separate
- Traffic patterns differ
- Teams own different features
- One DB is becoming a coordination bottleneck
- You want parallelism without sharding yet

Federation often comes **before sharding** in real systems.

---

## 11. When Federation Is a Bad Idea

Avoid federation if:

- You need heavy cross-table joins
- You need strong cross-domain transactions
- The system is very small

Cross-DB joins are not allowed.
Joins must happen at the application level.

---

## 12. Final Mental Model (NDK Lock-in)

```

Replication → safety
Federation → isolation & parallelism
Sharding   → scale

```

Or even simpler:

> **Federation splits responsibility.  
> Sharding splits volume.**

---

## One-line Summary

> Federation separates databases by business function so that unrelated workloads do not block each other, enabling independent connection pools and true parallel writes.
