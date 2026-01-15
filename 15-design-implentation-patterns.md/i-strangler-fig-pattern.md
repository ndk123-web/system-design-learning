# 📘 Strangler Fig Pattern 

## ![Image](https://learn.microsoft.com/en-us/azure/architecture/patterns/_images/strangler.png)

## 1️⃣ WHAT (exactly kya hai)

**Strangler Fig Pattern** is a **system migration pattern**.

You **incrementally replace parts of a legacy system** by:

- keeping the legacy system running
- adding new services around it
- **rerouting traffic feature-by-feature**
- letting legacy code die only after it has **zero responsibility**

It is **not**:

- a rewrite
- a refactor
- a cleanup exercise

It is **controlled replacement via routing**.

---

## 2️⃣ WHY (ye pattern kyun bana)

Because **rewriting a running system is gambling**.

Legacy systems usually:

- run the business
- have undocumented rules
- contain edge cases learned through pain
- break when touched casually

Business reality:

- downtime is expensive
- freezes are unacceptable
- regressions kill trust

So the rule became:

> **Change systems without stopping systems**

Strangler Fig exists to **modernize without business interruption**.

---

## 3️⃣ LEGACY SYSTEM — CLEAR DEFINITION

**Legacy ≠ old**

A system is _legacy_ if:

- it is critical
- it is risky to change
- failure impact is high
- knowledge is incomplete

A 1-year-old badly written monolith can be legacy.
A 15-year-old stable system might not be.

Legacy is about **risk**, not age.

---

## 4️⃣ HOW (kaise kaam karta hai – real flow)

### Step 1: Put a routing boundary

Some component must decide:

- this request → old system
- this request → new system

Examples:

- API Gateway
- Reverse Proxy
- Edge router

Without routing control, **Strangler Fig is impossible**.

---

### Step 2: Legacy stays untouched

No rewrite.
No refactor.
No optimism.

Legacy continues serving traffic.

---

### Step 3: Pick ONE feature

Never migrate “the system”.

Pick:

- Auth
- Orders
- Reports
- Payments

Only **one responsibility**.

---

### Step 4: Build new service

- Same API contract
- Same behavior (including quirks)
- New tech stack allowed

---

### Step 5: Redirect traffic

Routing rules:

- `/auth/*` → new service
- everything else → legacy

Traffic starts small, grows gradually.

---

### Step 6: Observe like a hawk

You watch:

- error rates
- latency
- business correctness
- data consistency

If anything smells wrong → route back.

---

### Step 7: Starve legacy

Once stable:

- legacy receives **zero traffic**
- legacy stops writing data
- responsibility is gone

Only then you delete legacy code.

---

### Step 8: Repeat

Feature by feature.
Month by month.
Safely.

---

## 5️⃣ EXAMPLE (production-grade)

### Scenario

Legacy e-commerce monolith:

- Auth
- Orders
- Payments
- Inventory

### Migration plan

**Phase 1**

- New Auth Service
- `/login`, `/signup` → new
- rest → legacy

**Phase 2**

- New Order Service
- `/orders/*` → new

**Phase 3**

- New Payment Service
- `/payments/*` → new

End state:

- legacy handles nothing
- legacy server shut down
- zero downtime during entire migration

---

## 6️⃣ LOGIC (iska dimaag kaise kaam karta)

Key truths this pattern exploits:

- Users don’t care _who_ handles the request
- Interfaces matter more than implementations
- Traffic = responsibility
- Responsibility can be reassigned safely
- Dead code is code with no traffic

This turns migration into a **routing problem**, not a rewrite problem.

---

## 7️⃣ CORE CONCEPTS (yaad rakhne layak)

- Incremental replacement
- Traffic ownership
- Coexistence
- Rollback by routing
- Starvation before deletion
- Business continuity > architectural purity

---

## 8️⃣ IMPLEMENTATION DETAILS (no theory fluff)

### Routing Layer

- Must support conditional routing
- Must be fast
- Must be observable
- Must support instant rollback

### API Contracts

- Stable request/response
- Backward compatible
- No breaking changes mid-migration

### Data Strategy (hardest part)

Options:

- Legacy DB as source of truth
- Read-from-legacy, write-to-new
- Event-based sync
- Dual writes (dangerous, controlled)

No silver bullet here. This is where senior engineers earn salary.

---

## 9️⃣ YOUR DOUBTS — EXPLICIT ANSWERS

**Q: Dono systems ek saath chalte hai?**
Yes. That coexistence is intentional.

**Q: Kya pura system ek saath migrate hota hai?**
Never. Only features.

**Q: Kya old system turant remove hota hai?**
No. Only after traffic = 0.

**Q: Kya rollback possible hai?**
Always. Change routing back.

**Q: Kya ye slow process hai?**
Yes. And that’s why it’s safe.

---

## 🔟 PROS

- Zero downtime
- Low risk
- Incremental delivery
- Easy rollback
- Business continuity

---

## 1️⃣1️⃣ CONS

- Temporary complexity
- Two systems to monitor
- Routing logic grows
- Data consistency challenges

---

## 1️⃣2️⃣ TRADE-OFFS

| Benefit    | Cost             |
| ---------- | ---------------- |
| Safety     | Time             |
| Stability  | Extra infra      |
| Rollback   | Dual maintenance |
| Confidence | Discipline       |

This pattern **optimizes for survival**, not speed.

---

## 1️⃣3️⃣ WHERE IT’S USED

- Monolith → Microservices
- Legacy tech → modern stack
- On-prem → cloud
- SOAP → REST/gRPC
- Old DB → new DB (gradually)

Most long-lived companies migrate this way, quietly.

---

## 1️⃣4️⃣ ANTI-PATTERNS (danger zone)

- Big-bang rewrite
- No routing control
- Removing legacy early
- No observability
- No rollback plan

These lead to outages and post-mortems.

---

## 🧠 FINAL LINE (lock this)

> **Strangler Fig replaces responsibility, not systems.**
