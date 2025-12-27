# Database Sharding — Clear Mental Model (Why → What → How)

## 1. Why Sharding Exists

### The real problem

Replication **copies** data. It does not reduce data size or write pressure.

If you have:

* 10M users
* 1 database

Then replication gives:

* 10M × N replicas
* more storage
* more sync cost
* **same write bottleneck**

This is why replication alone feels **wasteful and slow** at scale — that instinct is correct.

### Core truth

> **Replication is for safety.**
> **Sharding is for growth.**

When data or write volume outgrows a single database machine, sharding becomes mandatory.

---

## 2. What Sharding Actually Is

Sharding = **horizontal partitioning of data**.

Instead of one big database:

```
Users DB
  └── 10M users
```

You split it:

```
Shard A → 0–5M users
Shard B → 5M–10M users
```

Each shard:

* is an independent database
* owns only a subset of rows
* has smaller indexes
* handles its own reads and writes

Important:

* Shards do **not** contain the same data
* This is not replication

---

## 3. Sharding vs Replication (Do NOT mix these)

| Concept     | Purpose                    | Effect           |
| ----------- | -------------------------- | ---------------- |
| Replication | Availability, read scaling | Copies same data |
| Sharding    | Data & write scaling       | Splits data      |

Correct production systems **always combine both**.

---

## 4. How Sharding Works (The Only Thing That Matters)

### Shard Key

A **shard key** decides:

> Which row goes to which shard

Everything depends on this.

Bad shard key = dead system.

---

## 5. Common Sharding Strategies

### 1) Range-based sharding

```
user_id 1–1M   → Shard A
user_id 1M–2M  → Shard B
```

**Pros**

* Simple
* Range queries fast

**Cons**

* Hot shards (new users pile up)

---

### 2) Hash-based sharding (most common)

```
shard = hash(user_id) % N
```

Example:

```
hash(123) % 2 = shard 1
```

**Pros**

* Even data distribution
* No hot shard

**Cons**

* Range queries impossible

---

### 3) Directory-based sharding

```
user_id → lookup service → shard
```

**Pros**

* Flexible

**Cons**

* Extra hop
* Extra failure point

---

## 6. Request Flow in a Sharded System

### Read / Write example

```
Client
 → Application
 → Shard Router (uses shard key)
 → Correct Shard DB
 → Response
```

The database **never scans all shards**.
Routing happens **before** the query.

---

## 7. Inserts, Reads, Updates (Important Rules)

### Insert

```sql
INSERT INTO users (id, name) VALUES (123, 'ndk');
```

Flow:

```
hash(123) → shard 1 → write
```

---

### Read

```sql
SELECT * FROM users WHERE id = 123;
```

Flow:

```
hash(123) → shard 1 → read
```

Fast and direct.

---

### Update (must include shard key)

```sql
UPDATE users SET name='NDK' WHERE id=123;
```

❌ Dangerous:

```sql
UPDATE users SET status='active';
```

This would require **scatter-gather across all shards** and is usually forbidden.

---

## 8. Replication Inside Shards (This Is the Missing Click)

Sharding increases **failure surface** (more machines).
So **each shard must be replicated**.

```
Shard A:
  Primary
  Replica 1
  Replica 2

Shard B:
  Primary
  Replica 1
  Replica 2
```

### Why replication is used with sharding

* If shard primary fails → replica promoted
* Shard stays available
* No data loss

Replication here is **not for scaling users** — it is for **survival**.

---

## 9. Why Your Insight Is Correct

> "10M users × N replicas feels wasteful and slow"

Correct.

That is why:

* Big systems **never rely on replication alone**
* Sharding reduces base data size
* Replication protects each shard

Correct formula:

```
(total users / shards) × replicas
```

Not:

```
total users × replicas × replicas
```

---

## 10. Failure Scenarios

### One shard down

* Only users on that shard affected
* Other shards continue working

### With replication

* Replica promoted
* Shard recovers
* No global outage

---

## 11. When Sharding Is Required

✅ Data doesn’t fit on one DB
✅ Writes exceed single-node capacity
✅ Indexes too large

### When NOT to shard

❌ Early-stage apps
❌ Low write volume
❌ Complex joins required

---

## Final Lock-in Mental Model

```
Replication → safety & availability
Sharding     → data & write scale

Shard key decides everything
```

> **Shard to grow. Replicate to survive.**