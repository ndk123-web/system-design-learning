# 1️⃣ WHY sharding exists (problem first)

### Single database limits (even with replicas)

Even if you add:

- read replicas
- stronger machines
- better indexes

You still hit **hard limits**:

❌ Disk size limit
❌ Index too big
❌ Writes bottleneck
❌ Cache misses increase
❌ One machine = one failure domain

> Replication **duplicates** data
> Sharding **divides** data

---

## Core truth

> **Replication scales reads.
> Sharding scales data + writes.**

---

# 2️⃣ WHAT sharding actually is

### Simple definition

> Sharding = **splitting data horizontally** across multiple databases

Each database stores **only a subset** of rows.

---

### Example (users table)

Instead of:

```
Users DB
1 → 1 million users
```

You do:

```
Shard 1 → users 1 – 1M
Shard 2 → users 1M – 2M
Shard 3 → users 2M – 3M
```

Each shard:

- independent DB
- smaller indexes
- faster queries

---

# 3️⃣ WHAT sharding is NOT (important)

❌ Not replication
❌ Not backup
❌ Not read scaling

Replication = **same data copied**
Sharding = **different data split**

---

# 4️⃣ HOW sharding works (core mechanics)

Everything depends on **SHARD KEY**.

## Shard Key = rule that decides:

> “Which row goes to which shard?”

---

## 3 common sharding strategies

---

### 🔹 1. Range-based sharding

```text
user_id 1–1M     → Shard A
user_id 1M–2M    → Shard B
```

**Pros**

- Simple
- Range queries fast

**Cons**

- Hot shards (new users always hit last shard)

---

### 🔹 2. Hash-based sharding (most common)

```text
shard = hash(user_id) % N
```

Example:

```text
hash(101) % 4 = shard 1
hash(202) % 4 = shard 2
```

**Pros**

- Even distribution
- No hot shard

**Cons**

- Range queries impossible

---

### 🔹 3. Directory-based sharding

```
User → Lookup service → Shard
```

Flexible but adds:

- extra network hop
- extra failure point

---

# 5️⃣ HOW a request flows (step-by-step)

### Example: fetch user 123

```
Client
 → App
 → Shard Router
 → Shard DB
 → Result
```

Key point:

> **Shard routing happens BEFORE query**

DB never scans all shards.

---

# 6️⃣ EXAMPLE (users database)

### Shard rule

```text
hash(user_id) % 2
```

### Inserts

```sql
INSERT INTO users (id, name) VALUES (123, 'ndk');
```

Flow:

```
hash(123) → shard 1
write → shard 1 DB
```

Shard 0 never sees this row.

---

### Reads

```sql
SELECT * FROM users WHERE id = 123;
```

Flow:

```
hash(123) → shard 1
read → shard 1 DB
```

Fast. Direct. No scan.

---

# 7️⃣ HOW updates work in sharding

Updates **must include shard key**.

✅ Valid:

```sql
UPDATE users SET name='NDK' WHERE id=123;
```

❌ Dangerous:

```sql
UPDATE users SET status='active';
```

Why?

> That would require hitting **ALL shards**

Sharded systems **forbid scatter-gather writes**.

---

# 8️⃣ WHAT happens if one shard goes down

### Without replication

```
Shard B down → users in shard B unavailable
```

### With replication (real systems)

```
Shard B:
  Primary
  Replica 1
  Replica 2
```

If primary dies → replica promoted
Other shards unaffected

> Sharding + replication is mandatory in production

---

# 9️⃣ WHY sharding improves performance

| Area          | Before     | After        |
| ------------- | ---------- | ------------ |
| Index size    | Huge       | Small        |
| Cache         | Low hit    | High hit     |
| Writes        | Bottleneck | Parallel     |
| Reads         | Slow       | Fast         |
| Failure blast | Whole DB   | Single shard |

---

# 🔟 HARD PROBLEMS sharding introduces (no sugar)

❌ Cross-shard joins
❌ Transactions across shards
❌ Resharding pain
❌ Operational complexity

That’s why:

> **You shard only when forced**

---

# 1️⃣1️⃣ REAL SYSTEMS using sharding

- User databases (by user_id)
- Orders (by customer_id)
- Logs (by time bucket)
- Metrics (by time + service)

---

# 1️⃣2️⃣ FINAL MENTAL MODEL (LOCK THIS)

```
Replication → safety + read scale
Sharding     → data + write scale

Shard Key decides everything
Bad shard key = dead system
```

---

## ONE-LINE RULE (IMPORTANT)

> **If one DB can’t hold your data or writes → shard.
> If one DB is just slow → replicate or cache.**
