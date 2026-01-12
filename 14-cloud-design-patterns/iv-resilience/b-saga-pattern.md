# 🔗 SAGA PATTERN

_(Distributed Transactions & Eventual Consistency)_

---

## 📌 PURPOSE

The Saga Pattern is used to **maintain business correctness in distributed systems** where a single operation spans multiple services and databases.

Because **global transactions do not exist** in distributed systems, Saga provides a way to **coordinate work and recover from failures** using compensating actions.

---

## 🧠 ONE-LINE IDEA (LOCK THIS)

> **A Saga is a long-running distributed transaction made of multiple local transactions, where failures are handled using compensating actions instead of rollbacks.**

---

## WHY — Why the Saga Pattern exists

In a single database system:

```
BEGIN
  step1
  step2
  step3
ROLLBACK / COMMIT
```

This works because:

- One database
- One transaction manager
- Strong consistency

---

### In distributed systems (cloud / microservices):

- Multiple services
- Multiple databases
- Network failures
- Async messaging
- Partial success is common

This is **impossible**:

```
ROLLBACK Order + Inventory + Payment together
```

👉 **Saga Pattern replaces distributed ACID transactions.**

---

## WHAT — What a Saga really is

A Saga consists of:

1. **A sequence of local transactions**
2. Each local transaction:

   - Belongs to **one service**
   - Updates **only its own database**

3. For each step, there is a **compensating transaction**
4. If a later step fails:

   - Previously completed steps are **undone via compensation**

5. The system becomes **eventually consistent**

---

## CORE CONCEPT — Local Transaction vs Compensation

| Forward Step      | Compensating Step |
| ----------------- | ----------------- |
| Create Order      | Cancel Order      |
| Reserve Inventory | Release Inventory |
| Charge Payment    | Refund Payment    |

⚠️ Important:

- Compensation is **business logic**
- NOT a database rollback
- NOT guaranteed to be instant
- Can also fail and retry

---

## BASIC SAGA FLOW

### Forward execution

```
T1: Create Order
T2: Reserve Inventory
T3: Charge Payment
```

### Failure → Compensation

```
Payment fails
 → Release Inventory
 → Cancel Order
```

There is **no global rollback**.

---

## VERY IMPORTANT BEHAVIOR (THIS CONFUSES MOST PEOPLE)

> **Saga compensation is NOT strictly sequential across services.**

- Each service compensates **only what it owns**
- Compensations are often:

  - Independent
  - Parallel
  - Eventually consistent

Temporary inconsistency is **expected and acceptable**.

---

## TWO TYPES OF SAGA (CRITICAL)

---

## 1️⃣ Choreography-Based Saga (Event-Driven)

### How it works

- No central coordinator
- Services communicate via events
- Each service:

  - Performs its local transaction
  - Emits success/failure events
  - Listens for events to trigger compensation

### Flow example

```
OrderCreated
 → InventoryService reserves stock
 → emits InventoryReserved

InventoryReserved
 → PaymentService charges payment
 → emits PaymentFailed

PaymentFailed
 → InventoryService releases stock
 → OrderService cancels order
```

![Image](https://cdn.ttgtmedia.com/rms/onlineimages/saga_design_pattern_with_choreography-f.png)

![Image](https://ibm-cloud-architecture.github.io/eda-saga-choreography/images/saga-flow-1.png)

### Pros

- Loose coupling
- Highly scalable
- Natural fit for Kafka / messaging
- No central bottleneck

### Cons

- Harder to understand end-to-end flow
- Debugging is complex
- Event explosion possible

---

## 2️⃣ Orchestration-Based Saga (Central Controller)

### How it works

- A **Saga Orchestrator** controls the flow
- Orchestrator:

  - Calls each service
  - Tracks state
  - Triggers compensations on failure

### Flow example

```
Saga Orchestrator
 → CreateOrder
 → ReserveInventory
 → ChargePayment (fails)
 → ReleaseInventory
 → CancelOrder
```

![Image](https://d2908q01vomqb2.cloudfront.net/1b6453892473a467d07372d45eb05abc2031647a/2021/08/26/image003-1.png)

![Image](https://microservices.io/i/sagas/Create_Order_Saga_Orchestration.png)

### Pros

- Clear control flow
- Easier to reason about
- Central visibility of saga state

### Cons

- Orchestrator is a critical component
- More coupling
- Less flexible at scale

---

## WHICH SAGA TYPE TO USE?

### Rule of thumb

| Situation                 | Prefer        |
| ------------------------- | ------------- |
| Many teams / large system | Choreography  |
| Complex business logic    | Orchestration |
| Simple workflows          | Either        |
| Need strong observability | Orchestration |

Real systems often use **both**.

---

## HOW SAGA IS IMPLEMENTED (CONCEPTUAL)

### Choreography (event-driven)

```
Service does work
 → emits event
 → next service reacts
```

Failures emit **failure events**, triggering compensation.

---

### Orchestration (state machine)

```
State: ORDER_CREATED
 → INVENTORY_RESERVED
 → PAYMENT_FAILED
 → COMPENSATING
 → CANCELLED
```

Saga is modeled as a **state machine**.

---

## HOW THIS CONNECTS TO EVENTUAL CONSISTENCY

Saga **accepts** that:

- System can be temporarily inconsistent
- Data converges to correctness over time
- Users may briefly see intermediate states

Design goal:

> **Business correctness over time, not instant consistency.**

---

## WHAT SAGA IS NOT (IMPORTANT)

❌ Not a database transaction
❌ Not ACID
❌ Not exactly-once
❌ Not immediate rollback
❌ Not failure-free

Saga assumes:

- Failures will happen
- Compensation may be delayed
- Recovery is eventual

---

## COMMON MISTAKES

❌ Treating compensation like DB rollback
❌ Expecting strict rollback order
❌ One service modifying another service’s data
❌ No idempotency in steps
❌ No visibility into saga state

---

## TRADE-OFFS (HONEST)

### Pros

- Scales across services
- No distributed locks
- Cloud-friendly
- Resilient to partial failure

### Cons

- Complex logic
- Hard debugging
- Temporary inconsistency
- Requires good observability

This is the **price of distributed systems**.

---

## FINAL MENTAL MODEL (LOCK THIS 🔒)

```
Database transaction:
  atomic + rollback

Saga:
  steps + compensation + eventual consistency
```

If you remember this, you will never misuse Saga.

---

## ONE-LINE SUMMARY

> **The Saga Pattern manages long-running distributed business transactions by coordinating a sequence of local operations and compensating actions, enabling eventual consistency without global rollbacks.**
