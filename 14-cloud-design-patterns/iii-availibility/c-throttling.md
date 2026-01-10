# 🚦 THROTTLING — README

_(Availability & Load Control Pattern)_

---

## 📌 PURPOSE

Throttling is used to **protect system availability** when demand becomes higher than what the system can safely handle.

Its goal is **not speed**, **not fairness**, but **survival**.

---

## 🧠 ONE-LINE IDEA

> **Throttling intentionally limits requests so the system does not collapse under load.**

Returning `429 Too Many Requests` is **correct behavior**, not an error.

---

## WHY — Why throttling is necessary

Reality of production systems:

- Traffic is unpredictable
- Resources are finite
- Bugs cause retry storms
- One tenant or user can overload everything

Without throttling:

```
Traffic spike
 → DB overload
 → Threads exhausted
 → Timeouts
 → Retries
 → Cascading failure
 → Full outage
```

With throttling:

```
Traffic spike
 → Some requests rejected early
 → System stays responsive
 → SLA maintained
```

Core reliability rule:

> **Fail fast is better than failing slowly.**

---

## WHAT — What throttling actually does

Throttling:

- Counts incoming requests
- Compares them against limits
- Rejects or delays excess traffic

Throttling does **not**:

- Increase capacity
- Make requests faster
- Fix bad code

It only **protects capacity**.

---

## FLOW — End-to-end request flow (MOST IMPORTANT)

```
User
 ↓
Cloudflare (Edge throttling)
 ↓
API Gateway (Tenant / API throttling)
 ↓
Load Balancer
 ↓
Application Service (Last-resort throttling)
 ↓
Database
```

Key point:

> **Throttling is layered. It does not exist at only one place.**

---

## YOUR MAIN DOUBT — “Where is throttling state stored?”

### Answer: **It depends on where throttling is applied**

---

### CASE 1 — Throttling at Cloudflare (Edge)

✔ Best place
✔ Cheapest and fastest
✔ Backend is never hit

- You **do not store anything**
- Cloudflare maintains counters internally
- Distributed and highly optimized

Flow:

```
User → Cloudflare
   If limit exceeded → 429 (request stops here)
   Else → Forward to backend
```

Used for:

- IP-based limits
- Geo-based limits
- Public abuse protection

---

### CASE 2 — Throttling at API Gateway

Examples:

- NGINX
- Envoy
- Kong
- AWS API Gateway

Storage:

- In-memory counters
- Redis
- Local cache

Flow:

```
User → Cloudflare → Gateway
                  (rate limit check)
```

Used for:

- Tenant-based limits
- API/endpoint limits

---

### CASE 3 — Throttling at Application level (last defense)

Storage:

- Redis (most common)
- In-process counters

Flow:

```
User → Cloudflare → Gateway → App
                              (throttle check)
```

Used when:

- Limits depend on business logic
- Operations are very expensive

---

## KEY RULE (VERY IMPORTANT)

> **The earlier throttling happens, the better.**

Priority:

```
Edge > Gateway > Application
```

Earlier = cheaper, faster, safer.

---

## TYPES OF THROTTLING (CLASSIFIED)

---

### 1️⃣ IP-based Throttling (Edge)

**What**

- Limit requests per IP

**Flow**

```
User → Cloudflare → IP limit check
```

**Example**

```
100 requests/minute per IP
```

**Use**

- Public APIs
- Login endpoints
- DDoS protection

---

### 2️⃣ User / Tenant-based Throttling

**What**

- Limit per user or tenant

**Flow**

```
User → Gateway
       (extract tenant_id)
       (tenant limit check)
```

**Example**

```
Tenant A → 1000 req/min
Tenant B → 200 req/min
```

**Use**

- SaaS systems
- Paid plans
- Prevent noisy neighbors

---

### 3️⃣ API / Endpoint-based Throttling

**What**

- Different limits for different APIs

**Flow**

```
User → Gateway → Endpoint limit check
```

**Example**

```
/login  → 10 req/min
/export → 2 req/min
```

**Use**

- Authentication
- Reporting
- Heavy queries

---

### 4️⃣ Service-level Throttling

**What**

- Cap total traffic for a service

**Flow**

```
Gateway → Service limit check
```

**Example**

```
Order Service → max 5000 req/sec
```

**Use**

- Protect databases
- Prevent overload

---

### 5️⃣ Resource-based (Adaptive) Throttling

**What**

- Limit based on system health

**Flow**

```
Request → Check CPU / DB latency
         Healthy? → Allow
         Unhealthy? → Throttle
```

**Example**

```
DB latency > 200ms → reduce traffic
```

**Use**

- High-load systems
- Auto-protection

---

### 6️⃣ Burst Throttling

**What**

- Allow short bursts
- Limit sustained load

**Algorithm**

- Token Bucket

**Example**

```
100 req/min + 20 burst allowed
```

**Use**

- Mobile apps
- UI-driven traffic

---

### 7️⃣ Retry-aware Throttling

**What**

- Detect aggressive retries

**Flow**

```
Retry request → Check Retry-After
               Too early? → Reject
```

**Example**

```
Client retries every 100ms → blocked
```

**Use**

- Distributed systems
- Messaging consumers

---

### 8️⃣ Emergency / Brownout Throttling

**What**

- Kill switch during incidents

**Flow**

```
Emergency mode?
  Yes → Drop low-priority traffic
```

**Example**

```
Allow payments
Drop analytics
Drop exports
```

**Use**

- Incident response
- Partial outages

---

## HOW — Implementation basics

### Algorithms

- **Token Bucket** → best default (used most often)
- Leaky Bucket → smooth output
- Fixed Window → simple but rough
- Sliding Window → accurate but costly

Most systems use **Token Bucket**.

---

### Storage

- Redis is the most common
- Approximate counting is fine
- Exact precision is not required

---

## LOGIC — Why throttling improves availability

Because it:

- Protects databases
- Prevents retry storms
- Isolates bad actors
- Keeps latency predictable

System design truth:

> **Some requests rejected is better than all requests failing.**

---

## TRADE-OFFS

### Pros

- System stays alive
- SLA protection
- Predictable performance
- Fair resource usage

### Cons

- Some users get rejected
- Requires tuning
- Clients must handle `429`

Still non-negotiable.

---

## COMMON MISTAKES

❌ No throttling at all
❌ Throttling only inside app
❌ Same limits for all tenants
❌ Ignoring retries
❌ No monitoring

---

## WHEN TO USE THROTTLING

✔ Every production system
✔ Every public API
✔ Every multi-tenant system

No exceptions.

---

## FINAL MENTAL MODEL (LOCK THIS)

```
Throttling = traffic circuit breaker
```

It does not make systems faster.
It prevents them from dying.

---

## ONE-LINE SUMMARY

> **Throttling controls request rates at multiple layers (edge, gateway, service, resource) to keep systems available under extreme load.**
