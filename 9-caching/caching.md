# CACHING

Truth:

> **Computers are fast. Disk, DB, network are slow.**

Problems without caching:

- Heavy DB queries
- Repeated calculations
- Same data requested again and again
- Latency increases
- DB becomes bottleneck

Even if:

- SQL tuned
- Indexes added
- Servers scaled

👉 **DB is still the slowest shared resource**

So we cache.

---

# 2️⃣ WHAT IS CACHING (CLEAR DEFINITION)

> **Caching = store frequently accessed or expensive-to-compute data closer to the consumer**

Key words:

- **frequently accessed**
- **expensive**
- **temporary**
- **not source of truth**

Cache ≠ database
Cache = **performance layer**

---

# 3️⃣ WHERE CACHE CAN LIVE (IMPORTANT)

Caching is not just Redis.

### Cache layers (from outer to inner):

1. **Client Cache**

   - Browser cache
   - HTTP cache headers

2. **CDN Cache**

   - Static files
   - API responses (sometimes)

3. **Web Server Cache**

   - NGINX cache
   - Reverse proxy cache

4. **Application Cache**

   - Redis
   - Memcached
   - In-memory cache

5. **Database Cache**

   - Query cache
   - Buffer cache

👉 Cache closer to user = faster
👉 Inner cache = more control

---

# 4️⃣ HOW CACHING WORKS (BASIC FLOW)

General flow:

```
Request
 → Check Cache
   → HIT → return data
   → MISS → fetch from DB / compute
             → store in cache
             → return data
```

This pattern is **Cache Aside** (most common).

---

# 5️⃣ CACHING STRATEGIES (VERY IMPORTANT)

Now the real meat.

---

## 🔹 1. Cache Aside (YOU USED THIS)

### What it is

- App controls cache
- Cache is checked first
- On miss → compute / DB → save to cache

### Flow

```
Read:
App → Cache
  → HIT → return
  → MISS → DB → Cache → return

Write:
App → DB
App → Cache invalidate/update
```

### Why it’s popular

- Simple
- Safe
- Full control

### Downside

- Cache miss penalty
- Invalidation logic is on you

👉 **Redis analytics use-case = perfect Cache Aside**

---

## 🔹 2. Write Through

### What it is

- App writes to cache
- Cache writes to DB synchronously

```
Write → Cache → DB
Read  → Cache
```

### Pros

- Cache always fresh
- No stale reads

### Cons

- Write latency increases
- Cache always involved

Used when **consistency matters more than write speed**.

---

## 🔹 3. Write Behind (Write Back)

### What it is

- App writes to cache
- Cache writes to DB **async**

```
Write → Cache → (later) DB
```

### Pros

- Very fast writes

### Cons (BIG)

- Data loss if cache crashes
- Eventual consistency

Used in:

- Analytics
- Logging
- Counters

---

## 🔹 4. Refresh Ahead

### What it is

- Cache refreshes data **before expiry**
- Predictive caching

```
Cache sees key expiring
 → refreshes in background
```

### Use-case

- Hot keys
- Dashboards
- Trending data

Hard to implement, but powerful.

---

# 6️⃣ LOGIC BEHIND CACHING (THIS IS KEY)

Caching works because of **locality**:

### Temporal locality

- Same data requested again soon

### Spatial locality

- Related data requested together

If data:

- Changes frequently ❌ bad cache candidate
- Read-heavy ✅ good cache candidate

---

# 7️⃣ CACHE INVALIDATION (THE HARDEST PART)

Truth bomb:

> **Caching is easy. Cache invalidation is hard.**

Strategies:

1. **TTL (Time-based)**

   - Auto expire

2. **Event-based**

   - Invalidate on update

3. **Manual**

   - Explicit delete/update

You already did:

- Manual invalidation → 👍 correct

---

# 8️⃣ YOUR REDIS ANALYTICS CASE (WHY IT WAS CORRECT)

You said:

- Heavy calculations
- Stored in Redis
- Invalidated when needed

That is:

- Expensive compute
- Read-heavy
- Not critical data

👉 **Perfect caching use-case**

You instinctively followed **Cache Aside** — that’s production thinking.

---

# 9️⃣ WHEN NOT TO CACHE (IMPORTANT)

Do NOT cache when:

- Data is highly volatile
- Strong consistency is required
- Writes dominate reads
- Cache miss penalty > DB cost

---

# 🔟 MENTAL MODEL (REMEMBER THIS)

Think in layers:

```
Truth → DB
Speed → Cache
```

Cache:

- Can be wrong
- Can be stale
- Can be deleted

DB:

- Must be correct
- Must be durable

---

# 1️⃣1️⃣ ONE-LINE SUMMARY

> **Caching trades consistency and complexity for speed by avoiding repeated expensive work.**
