# 🔁 COMPENSATING TRANSACTIONS 

_(Eventual Consistency & Failure Recovery)_

---

## 📌 PURPOSE

Compensating Transactions are used to **restore business correctness** when a multi-step, distributed operation partially succeeds and then fails.

They exist because **distributed systems cannot do real rollbacks**.

---

## 🧠 ONE-LINE IDEA (LOCK THIS)

> **In distributed systems, you don’t rollback — you compensate.**

That means:

- You undo work using **new business actions**
- Not using database transactions

---

## WHY — Why Compensating Transactions exist

In a single database:

```
BEGIN
  step1
  step2
ROLLBACK
```

Easy.

In cloud / microservices:

- Different services
- Different databases
- Network failures
- Async communication

So this is **impossible**:

```
ROLLBACK Order + Inventory + Payment together
```

👉 Hence: **Eventual Consistency + Compensation**

---

## WHAT — What is a Compensating Transaction

A compensating transaction is:

> **A business operation that semantically undoes a previously completed step.**

Examples:

- Cancel order
- Release inventory
- Refund payment
- Revoke booking

⚠️ Important:

- It is **not a technical rollback**
- It is a **normal API / event / command**
- It can also fail and retry

---

## CORE SCENARIO (YOUR EXACT EXAMPLE)

Services involved:

1. Order Service
2. Inventory Service
3. Payment Service

Forward flow:

```
Create Order
Reserve Inventory
Charge Payment
```

Each step:

- Independent
- Owns its own data

---

## FAILURE SCENARIO (THIS CREATES CONFUSION)

```
Order created ✅
Inventory reserved ✅
Payment failed ❌
```

System is now **incorrect**:

- Order exists
- Inventory is blocked
- No payment

We must compensate.

---

## YOUR MAIN DOUBT (ANSWERED CLEARLY)

### ❓ “Do we cancel Inventory first, then Order?

Or both together? Or in sequence?”

### ✅ CORRECT ANSWER

> **Compensations are NOT a strict sequence.
> They usually run independently and in parallel, and complete eventually.**

There is **no global rollback order**.

---

## HOW COMPENSATION ACTUALLY HAPPENS

![Image](https://microservices.io/i/sagas/Create_Order_Saga_Orchestration.png)

![Image](https://eda-visuals.boyney.io/assets/visuals/eda/eventual-consistency.png)

![Image](https://publish-01.obsidian.md/access/2bf217ac375047a2469ed4fbf45aa041/public/saga-pattern.png)

### Payment fails → event emitted

```
PaymentFailed
 ├─ InventoryService → Release inventory
 └─ OrderService     → Cancel order
```

Key points:

- InventoryService undoes **only inventory**
- OrderService undoes **only order**
- They do NOT coordinate with each other
- They may run **in parallel**
- They may complete at different times

This is **expected behavior**.

---

## VERY IMPORTANT RULE (LOCK THIS 🔒)

> **Each service compensates ONLY what it owns.**

| Service           | Compensates       |
| ----------------- | ----------------- |
| Order Service     | Cancel order      |
| Inventory Service | Release inventory |
| Payment Service   | Refund payment    |

No service:

- Touches another service’s DB
- Waits for another compensation to finish

---

## WHAT ABOUT SEQUENCE THEN?

### Inside ONE service

✔ Sequence exists

Example (Order Service):

```
Update status → Emit event → Notify user
```

### Across services

❌ No guaranteed sequence

Across services:

- Event-driven
- Eventually consistent
- Often parallel

Trying to enforce strict order:

- Increases coupling
- Increases failure
- Breaks scalability

---

## DIFFERENT FAILURE CASES (CLEARLY)

### Case 1 — Inventory fails early

```
Order created ✅
Inventory failed ❌
```

Compensation:

```
OrderService → Cancel order
```

Payment never happened → no refund needed.

---

### Case 2 — Payment succeeds, later needs undo

```
Order created ✅
Inventory reserved ✅
Payment charged ✅
Later failure ❌
```

Compensation:

```
Refund payment
Release inventory
Cancel order
```

Again:

- Independent
- Eventual
- No strict order guarantee

---

## HOW THIS IS IMPLEMENTED (CONCEPTUAL)

### Event-driven (Choreography)

```text
OrderCreated → InventoryService
InventoryReserved → PaymentService
PaymentFailed → OrderService + InventoryService
```

Each service:

- Listens to events
- Applies its own compensation
- Emits new events

---

### Orchestrated (Central controller)

```text
Saga Orchestrator:
  → Create Order
  → Reserve Inventory
  → Charge Payment (fails)
  → Release Inventory
  → Cancel Order
```

Even here:

- Steps can fail
- Retries are independent
- Guarantees are still weak

---

## LOGIC — Why this works

Because:

- Distributed systems accept temporary inconsistency
- Each service owns its correctness
- System converges to correct state over time

Design truth:

> **You cannot prevent inconsistency.
> You design how to recover from it.**

---

## TRADE-OFFS (HONEST)

### Pros

- Scales across services
- No distributed locks
- Works in cloud systems
- Resilient to failures

### Cons

- Temporary inconsistency
- Complex logic
- Harder debugging
- Requires idempotency + retries

This is the **price of distributed systems**.

---

## COMMON MISTAKES

❌ Treating compensation like DB rollback
❌ Expecting strict rollback order
❌ One service compensating another
❌ No retries / DLQ
❌ No visibility into saga state

---

## FINAL MENTAL MODEL (LOCK THIS 🔒)

```
Database transaction:
  strict order + rollback

Distributed saga:
  independent steps + compensation + eventual consistency
```

---

## ONE-LINE SUMMARY

> **Compensating transactions undo the business effects of previously completed steps using independent, often parallel operations, allowing distributed systems to eventually converge to a correct state without global rollbacks.**
