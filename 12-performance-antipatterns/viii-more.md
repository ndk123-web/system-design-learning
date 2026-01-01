# Performance Antipatterns: Retry Storm, Extraneous Fetching, No Caching

## 1️⃣ Retry Storm

### ❓ What

**Retry Storm** happens when many clients retry failed requests at the same time, creating **more load on an already failing system**, making the outage worse.

### ❓ Why it happens

Retries feel safe and intuitive:

> “Request failed → retry”

But in distributed systems:

- Failures are often **systemic**
- Retrying increases traffic
- Traffic worsens the failure

---

### ❓ How it forms (step-by-step)

1. Downstream service becomes slow or unhealthy
2. Requests start timing out
3. Clients retry immediately
4. Load multiplies
5. Service slows further
6. More timeouts → more retries

This creates a **positive feedback loop**.

---

### 📌 Example

```
Frontend → Auth Service → Database
```

- Database slows down
- Auth requests start timing out
- Frontend retries login requests
- Auth service receives **2×–3× traffic**
- Database collapses

---

### 🧠 Logic

> **Retry is a local fix that causes a global failure.**

Retries **multiply load** instead of reducing it.

---

### 🧩 Core Concept

- Failure should **shed load**
- Not **amplify traffic**

---

### ✅ Fixes

- Exponential backoff
- Random jitter
- Retry limits
- Circuit breakers

Example retry pattern:

```
Retry after 100ms → 300ms → 900ms → stop
```

---

## 2️⃣ Extraneous Fetching

### ❓ What

**Extraneous fetching** means fetching **more data than actually needed**.

---

### ❓ Why it happens

- “Future-proof” thinking
- Generic APIs
- `SELECT *`
- One-size-fits-all DTOs

Developers think bandwidth is cheap — it isn’t.

---

### ❓ How it hurts

Each unnecessary field:

- Increases payload size
- Increases serialization time
- Wastes CPU, memory, bandwidth
- Reduces cache efficiency

---

### 📌 Example

Needed by UI:

```json
{ "name": "Alice" }
```

Fetched from API:

```json
{
  "id": 1,
  "name": "Alice",
  "email": "...",
  "address": "...",
  "orders": [...],
  "preferences": {...}
}
```

---

### 🧠 Logic

> **Data you don’t use still costs you.**

At scale:

- Overfetching = latency
- Latency = reduced throughput

---

### 🧩 Core Concept

- Network cost is **per byte**
- Serialization cost is **per field**
- Cache effectiveness drops with fat responses

---

### ✅ Fixes

- Fetch only required fields
- Projection queries
- Purpose-specific endpoints
- Carefully designed GraphQL queries

Example:

```sql
SELECT name, profile_pic FROM users WHERE id = ?
```

---

## 3️⃣ No Caching

### ❓ What

**No caching** means every request hits the slowest system (DB, API, disk), even when data repeats.

---

### ❓ Why it happens

- “Cache is complex”
- “Database is fast enough”
- Fear of consistency issues

Short-term thinking.

---

### ❓ How it breaks systems

- Database becomes bottleneck
- Latency increases with traffic
- Vertical scaling hits limits fast

---

### 📌 Example

Requests:

```
GET /user/1
GET /user/1
GET /user/1
```

Without cache:

- 3 DB queries

With cache:

- 1 DB query
- 2 memory reads

---

### 🧠 Logic

> **Most systems are read-heavy.**

Caching converts:

```
slow read → fast read
```

---

### 🧩 Core Concept

- Cache absorbs repeated reads
- Protects the database
- Improves latency and throughput

---

### ✅ Fixes

- Read-through cache
- TTL-based invalidation
- Write-through or write-behind strategies
- Cache only hot data

Example flow:

```
Request → Cache → DB (only on miss)
```

---

## 🔗 How These Antipatterns Connect

These failures often **cascade together**:

```
No Caching
   ↓
More DB hits
   ↓
Higher latency
   ↓
Timeouts
   ↓
Retries
   ↓
Retry Storm
```

Extraneous fetching:

- Makes every request heavier
- Accelerates the collapse

---

## 🔒 Final Mental Rules

1. **Retries multiply load**
2. **Unused data is pure waste**
3. **If data repeats, cache it**
4. **Failure should reduce traffic, not increase it**
5. **Protect the database at all costs**

---

## 🧾 One-Line Summary

> **Retry storms overload systems, extraneous fetching wastes resources, and no caching guarantees your database will become the bottleneck.**
