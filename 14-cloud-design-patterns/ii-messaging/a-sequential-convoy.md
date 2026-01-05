# 🔗 Sequential Convoy

## 1. Why Sequential Convoy Exists (Problem First)

In real systems, a **single business action** often requires **multiple dependent steps** across **different services**.

Example:

- Order creation
- Payment
- Inventory
- Shipping

Problems:

- Steps are **dependent**
- Single DB transaction **not possible**
- Partial failure causes **inconsistency**

👉 We need:

- Correct **order**
- **Failure handling**
- **No tight coupling**

That is why **Sequential Convoy** exists.

---

## 2. What Is Sequential Convoy (Plain Truth)

**Sequential Convoy is a workflow pattern where multiple steps are executed strictly one after another, and each next step is triggered only after the previous one succeeds.**

Key idea:

> **Next step = triggered by success event of previous step**

This is NOT parallel.
This is NOT pub-sub broadcast.

---

## 3. Core Mental Model (Important)

> Messaging is the **transport**
> Sequential Convoy is the **control logic**

Messaging alone does not guarantee order or dependency.
Sequential Convoy **uses messaging** to enforce order.

---

## 4. Base Example (Your Same Example)

![Image](https://www.researchgate.net/publication/336662085/figure/fig4/AS%3A826646277935105%401574099239058/Sequence-diagram-execution-of-batch-ML-workflows.png)

![Image](https://miro.medium.com/v2/resize%3Afit%3A1400/0%2AytGShMq0ZIxk1dGk.png)

```
OrderService
  │
  └─► Event: OrderCreated
           │
PaymentService
  │
  └─► Event: PaymentDone
           │
InventoryService
  │
  └─► Event: InventoryReserved
           │
ShippingService
```

---

## 5. Step-by-Step Execution (No Confusion Version)

### Step 1: OrderService

- Creates order
- Emits event: `OrderCreated`
- **Its job is DONE**

```
OrderService → OrderCreated
```

❗ OrderService does NOT:

- Call Payment directly
- Wait for anything

---

### Step 2: PaymentService

- Listens to `OrderCreated`
- Tries payment

```
if payment success:
    emit PaymentDone
else:
    emit PaymentFailed
```

👉 **PaymentService decides what happens next**

---

### Step 3: InventoryService

- Listens ONLY to `PaymentDone`
- Does NOT care about OrderCreated

```
if stock available:
    emit InventoryReserved
else:
    emit InventoryFailed
```

---

### Step 4: ShippingService

- Listens ONLY to `InventoryReserved`
- Creates shipment

---

## 6. Your Main Doubt — Explained Clearly

### ❓ “Ye pub-sub jaisa lag raha hai, but step by step kaise?”

Answer:

| Pub-Sub                    | Sequential Convoy     |
| -------------------------- | --------------------- |
| One event → many consumers | One event → next step |
| Parallel                   | Strict order          |
| No dependency              | Hard dependency       |
| Broadcast                  | Controlled chain      |

In convoy:

- Inventory **does not** listen to `OrderCreated`
- It only listens to `PaymentDone`

👉 That is how **order is enforced**

---

## 7. Why Messaging Is Used Here

Messaging provides:

- Async execution
- Retry support
- Decoupling
- Failure isolation

But messaging **alone** would look like this (WRONG for convoy):

```
OrderCreated
 ├─ Payment
 ├─ Inventory
 ├─ Shipping
```

Sequential Convoy **restricts** who listens to what.

---

## 8. Failure Handling (MOST IMPORTANT)

![Image](https://microservices.io/i/sagas/Create_Order_Saga_Orchestration.png)

![Image](https://learn.microsoft.com/en-us/azure/architecture/patterns/_images/compensating-transaction-diagram.png)

Example failure:

- Payment success
- Inventory fail

Possible actions:

1. Retry Inventory
2. Emit `PaymentRefund`
3. Emit `OrderCancelled`

This logic is **explicitly designed**, not accidental.

---

## 9. Sequential Convoy = Saga Pattern

Sequential Convoy is most commonly implemented as **Saga**.

Two styles:

### A. Choreography (event-driven)

- No central controller
- Services trigger next via events
- Harder to debug

### B. Orchestration (controller-driven)

- Central orchestrator decides next step
- Easier rollback
- Clear control

---

## 10. What Sequential Convoy Is NOT

❌ Not a queue
❌ Not pub-sub
❌ Not parallel processing
❌ Not simple async jobs

It is a **business workflow pattern**.

---

## 11. When You SHOULD Use It

Use Sequential Convoy when:

- Steps depend on each other
- Business transaction spans services
- Partial failure must be handled
- Order matters more than speed

---

## 12. When You Should NOT Use It

Do NOT use when:

- Tasks are independent
- Parallel execution acceptable
- Simple notifications needed
- Low latency required

---

## 13. One Golden Rule (Remember This)

> **Messaging delivers messages.
> Sequential Convoy decides who is allowed to act next.**

---

## 14. One-Line Summary

> Sequential Convoy is a workflow pattern built on top of messaging that enforces strict step-by-step execution and handles partial failures in distributed systems.
