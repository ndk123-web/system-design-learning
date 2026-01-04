# Cache-Aside (Lazy Loading) Pattern — Practical README

## One-Line Summary

Cache-Aside is a caching pattern where the application explicitly loads data into the cache only when needed (on cache miss), treats the database or computation as the source of truth, and invalidates the cache when data changes.

![Image](https://systemdesignschool.io/concepts/caching/cache-aside.png)

---

## WHAT (What is Cache-Aside?)

Cache-Aside means:

- Application checks cache first
- If data exists → return it
- If data does NOT exist → compute/read from DB
- Store result in cache with TTL
- Return response

Cache is **never the source of truth**.

---

## WHY (Why Cache-Aside is used)

Cache-Aside is used because:

- Reads are frequent
- Data is expensive to compute
- DB / computation must be protected
- Cache consistency must be simple

Industry truth:

> **Most production systems use Cache-Aside by default.**

---

## HOW (How Cache-Aside works)

### READ FLOW (Lazy Loading)

```

Client Request
→ Application
→ Redis GET
→ HIT → return cached data
→ MISS →
compute / DB read
Redis SET (TTL)
return response

```

---

### WRITE / UPDATE FLOW (Invalidation)

```

State Change
→ Update DB / system state
→ Redis DELETE (invalidate cache)

```

Cache is rebuilt on next read.

---

## YOUR ACTUAL IMPLEMENTATION (Mapped Exactly)

### 🔹 Service 1 — WRITE / UPDATE (Cache Invalidation)

```go
rdb := config.RedisClient
redisKey := fmt.Sprintf(
  "analytics:%s:%s:%s",
  reqBody.UserId,
  "2025",
  reqBody.WorkspaceId,
)

rdb.Del(ctx, redisKey)
```

### What this does:

- State changed (analytics-affecting action)
- Cache key explicitly deleted
- Ensures next read is fresh

✅ **Correct Cache-Aside invalidation**

---

### 🔹 Service 2 — READ (Lazy Cache Load)

```go
result, err := rdb.Get(ctx, redisKey).Result()

if err == nil {
    // Cache HIT
    return cached response
}

// Cache MISS
data := computeAnalytics()
rdb.Set(ctx, redisKey, data, 1*time.Hour)
return data
```

### What this does:

- Cache checked first
- Cache miss triggers computation
- Result cached with TTL
- Returned to client

✅ **Perfect Cache-Aside read flow**

---

## WHY YOUR DESIGN IS CORRECT

### 1️⃣ Source of truth is NOT Redis

- Truth = computation / DB
- Redis = shortcut

### 2️⃣ Cache is disposable

- Redis crash? No issue
- Cache rebuilds on next request

### 3️⃣ TTL + Invalidation = safety net

- TTL protects against missed invalidation
- Explicit delete ensures correctness

---

## CACHE-ASIDE vs MATERIALIZED VIEW (Important)

| Cache          | Materialized View   |
| -------------- | ------------------- |
| Temporary      | Persistent          |
| TTL-based      | Event/logic-based   |
| Redis / Memory | DB table            |
| Speed only     | Speed + aggregation |

Your analytics:

- Projection / aggregation → DB / compute
- Redis → **Cache-Aside on top of it**

Correct layering.

---

## CACHE-ASIDE vs OTHER CACHE PATTERNS

| Pattern       | Who updates cache | Risk    |
| ------------- | ----------------- | ------- |
| Cache-Aside   | Application       | ⭐ Safe |
| Write-Through | Cache layer       | Medium  |
| Write-Behind  | Cache async       | High    |

Cache-Aside is safest.

---

## COMMON PITFALLS (You avoided these)

### ❌ Writing directly to cache

### ❌ Treating cache as truth

### ❌ No invalidation

### ❌ Infinite TTL

You avoided all of them.

---

## WHEN TO USE CACHE-ASIDE

Use Cache-Aside when:

- Data is read-heavy
- Computation is expensive
- Slight staleness acceptable
- Cache miss cost is acceptable

Perfect for:

- Analytics
- Dashboards
- Counters
- Summaries

---

## FINAL MENTAL MODEL (LOCK THIS)

```
Truth lives elsewhere
Cache is a shortcut
Delete cache if unsure
```

Or simply:

> **If cache lies, delete it.
> Truth will rebuild it.**

---

## ONE-LINE TAKEAWAY

Cache-Aside improves performance by lazily caching data on read and invalidating the cache on writes, while keeping the database or computation as the source of truth.
