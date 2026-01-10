# 📦 Deployment Stamps 

## 📌 What problem does this solve?

**Availability & scalability in multi-user systems**

Real systems fail because:

- One server dies
- One deploy goes wrong
- One heavy user overloads DB
- One region goes down

If **everything runs on one system**, failure affects **everyone**.

Deployment Stamps reduce **blast radius**.

![Image](https://learn.microsoft.com/en-us/azure/architecture/patterns/_images/deployment-stamp/deployment-stamp-traffic-routing.png)
---

## 🧠 Core Definitions (clear once, no confusion later)

### Tenant

A **tenant is the owner of data**.

Depending on product:

- SaaS → 1 company = 1 tenant
- ERP → 1 college = 1 tenant
- Consumer app → 1 user = 1 tenant

> Tenant = **WHO**

---

### Deployment Stamp

A **deployment stamp is a full, isolated copy of your system**.

Includes:

- Application servers
- Databases
- Caches
- Queues
- Configs
- Monitoring

> Stamp = **WHERE**

Yes — **full copy**. Intentionally duplicated.

---

## ❓ WHY — Why Deployment Stamps exist

Tenant_ID alone only gives **logical separation**.

Example (no stamps):

```
users table
-----------
user_id | tenant_id | data
```

Problem:

- Same DB
- Same backend
- Same infra

So:

- Heavy tenant hurts others
- Deploy breaks everyone
- DB outage = total outage

👉 **Tenant_ID does NOT protect infra**

Stamps exist to:

- Isolate failures
- Bound impact
- Improve availability

---

## 🧱 WHAT — What Deployment Stamps are (plain words)

Instead of:

> One big system serving everyone

You build:

> Many small identical systems, each serving some users

Each stamp:

- Handles **limited number of tenants**
- Has **its own infra**
- Can fail independently

---

## 🔧 HOW — How Deployment Stamps work

### Key rule

> **Tenant identity and stamp routing are separate**

Never mix them.

### Two concepts:

```
tenant_id → identity
stamp_id  → infra location
```

Mapping exists:

```
tenant_id → stamp_id
```

Stored in:

- Metadata DB
- Config service
- Cache

---

## 🔁 REQUEST FLOW (MOST IMPORTANT)

![Image](https://miro.medium.com/0%2AVQqNNC5BcoORG6BY.png)

![Image](https://substackcdn.com/image/fetch/%24s_%21VrbG%21%2Cf_auto%2Cq_auto%3Agood%2Cfl_progressive%3Asteep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd2490fa0-671a-4248-81d9-7106dd8411eb_1600x1031.png)

### End-to-end flow:

```
Client Request
 ↓
API Gateway
 ↓ (extract tenant_id / user_id)
Tenant → Stamp Lookup
 ↓
Route to Correct Stamp
 ↓
Stamp Backend
 ↓
Stamp Database
```

### Key point:

- Business services **do not know about stamps**
- Routing happens at **entry point only**

---

## 👤 CASE 1 — tenant_id = USER (consumer app)

Example: Social media app

- 1 user = 1 tenant
- tenant_id = user_id

Stamp capacity:

```
1 stamp = 100,000 users
```

Deployment:

```
Stamp-A → users 1–100k
Stamp-B → users 100k–200k
Stamp-C → users 200k–300k
```

If Stamp-B crashes:

- Only users 100k–200k affected
- Others continue using app

---

## 🏢 CASE 2 — tenant_id = COMPANY (SaaS)

Example: CRM

- 1 company = 1 tenant

Stamp assignment:

```
Company_A → Stamp-A
Company_B → Stamp-A
Company_C → Stamp-B
```

If Company_C runs heavy reports:

- Only Stamp-B impacted
- Other companies safe

---

## 🧩 MONOLITH vs MICROSERVICES

### Monolith

Each stamp contains:

- Full monolith app
- Its own DB
- Its own cache

```
Stamp-A → monolith + DB
Stamp-B → monolith + DB
```

---

### Microservices

Each stamp contains:

- Full set of services
- Each service’s DB
- Messaging infra

```
Stamp-A:
  auth, orders, payments, DBs

Stamp-B:
  auth, orders, payments, DBs
```

Same architecture. Different copies.

---

## 🧠 LOGIC — Why this actually works

Deployment stamps reduce:

- **Failure domain**
- **Deployment risk**
- **Resource contention**

Instead of:

```
Failure → everyone affected
```

You get:

```
Failure → some users affected
```

Availability improves because:

- All stamps rarely fail together
- You trade **duplication** for **resilience**

Old engineering truth:

> Duplication is cheaper than coordination.

---

## ⚖️ TRADE-OFFS (be honest)

### Costs

- More infra
- More DBs
- More monitoring
- More operational complexity

### Complexity

- Tenant routing logic
- Tenant migrations
- Cross-stamp communication

Stamps are **not free**.

---

## ✅ PROS

- High availability
- Predictable scaling
- Safe deployments
- Failure isolation
- Region independence

---

## ❌ CONS

- Infra duplication
- Higher cloud cost
- Operational overhead
- Harder analytics across stamps

---

## 🚦 WHEN TO USE DEPLOYMENT STAMPS

Use when:

- Many users / tenants
- SLA matters (99.9%+)
- Heavy tenants exist
- Downtime is expensive
- Global scale required

---

## 🚫 WHEN NOT TO USE

Do NOT use when:

- Early startup
- Low traffic
- No SLA pressure
- Small team
- Simple ops needed

Premature stamping = pain.

---

## 🚨 COMMON MISTAKES (avoid these)

❌ Encoding stamp into tenant_id
❌ Hardcoding routing
❌ Shared DB across stamps
❌ Cross-stamp DB queries
❌ Treating stamps as “just scaling”

---

## 🧠 FINAL MENTAL MODEL (lock this)

```
Tenant = identity (WHO)
Stamp  = infra location (WHERE)

Tenant never changes
Stamp can change
```

---

## 🧾 ONE-LINE SUMMARY

> **Deployment Stamps are multiple isolated copies of your system, used to limit failure impact, scale predictably, and maintain high availability by routing tenants to specific system copies.**
