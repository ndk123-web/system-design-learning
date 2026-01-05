# 🧠 Scheduling Agent / Supervisor (README)

## 1. Why This Pattern Exists (Reality Check)

In distributed systems, a **single business operation** often spans **multiple services**:

- Payment
- Inventory
- Shipping
- Notifications

Problems:

- No single DB transaction
- Partial failures are common
- Services crash, timeout, retry
- You **must not leave the system half-done**

👉 We need something that:

- Coordinates steps
- Enforces order
- Handles retries
- Rolls back when needed

That “something” is the **Scheduling Agent / Supervisor**.

---

## 2. What Is a Scheduling Agent / Supervisor?

**A Scheduling Agent (Supervisor) is a central service that coordinates multiple distributed steps as one logical operation.**

Key responsibility:

> Either **all steps succeed**, or the system is **brought back to a safe state**.

It is also known as:

- Saga Orchestrator
- Workflow Engine
- Process Manager

---

## 3. Core Mental Model (Lock This)

```
Messaging = transport
Services  = workers
Supervisor = brain
Database = memory
```

Supervisor:

- Does NOT do business work
- Only **decides what to run next**
- Tracks progress in DB

---

## 4. High-Level Architecture (Visual)

![Image](https://microservices.io/i/sagas/Create_Order_Saga_Orchestration.png)

![Image](https://miro.medium.com/1%2ACbE1wnZYefMtaS5KlFM5MQ.jpeg)

```
Client
  │
  ▼
Order Service
  │
  ▼
SUPERVISOR SERVICE  ◄─── central controller
  │
  ├─► Payment Service
  ├─► Inventory Service
  └─► Shipping Service
```

Important:

- Services **do not talk to each other**
- All coordination goes through Supervisor

---

## 5. Supervisor Internals (What It Really Contains)

```
Supervisor
├── Workflow State DB
├── Step Executor
├── Retry / Timeout Logic
└── Compensation Logic
```

### Example DB table

```
workflow_state
----------------------------
workflow_id
current_step
status
retry_count
last_error
updated_at
```

This DB makes the system **crash-safe**.

---

## 6. Step-by-Step Execution (Concrete Example)

### Business flow:

```
Order → Payment → Inventory → Shipping
```

---

### STEP 1: Order created

```
OrderService → Supervisor
START_WORKFLOW(order_id=123)
```

Supervisor:

```
state = PAYMENT_PENDING
```

---

### STEP 2: Payment step

![Image](https://raw.githubusercontent.com/Gaur4vGaur/traveller/master/images/patterns/2023-03-14-orchestration-pattern/OrchestrationPatternUsecase.png)

![Image](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/architect-microservice-container-applications/media/asynchronous-message-based-communication/single-receiver-message-based-communication.png)

```
Supervisor ──► PaymentService
             Command: PAY(123)
```

PaymentService response:

- `PaymentSuccess(123)` OR
- `PaymentFailed(123)`

---

### STEP 3: Supervisor decision logic

```pseudo
on PaymentSuccess:
    state = INVENTORY_PENDING
    send InventoryCommand

on PaymentFailed:
    retry OR mark FAILED
```

👉 **Services do not decide the next step**
👉 Supervisor does.

---

### STEP 4: Inventory step

```
Supervisor ──► InventoryService
```

Inventory responses:

- Success → continue
- Fail → compensate

---

### STEP 5: Compensation (Rollback)

If Inventory fails **after payment success**:

```pseudo
send RefundPayment(order_id)
mark workflow FAILED
```

💡 This is how **distributed rollback** works.

---

### STEP 6: Shipping (Final step)

```
Supervisor ──► ShippingService
```

On success:

```
state = COMPLETED
```

Workflow ends cleanly.

---

## 7. Failure & Crash Recovery (Very Important)

### Scenario:

- Payment done
- Supervisor crashes

After restart:

```pseudo
load workflows where status != COMPLETED
resume from current_step
```

Because:

- State is persisted
- Supervisor is **restartable**

---

## 8. Messaging Role (Clear Separation)

Messaging is used for:

- Sending commands
- Receiving results
- Retrying on failure
- Buffering during downtime

Messaging does NOT:

- Decide order
- Track workflow
- Handle compensation logic

That is Supervisor’s job.

---

## 9. How This Relates to Sequential Convoy

| Sequential Convoy  | Supervisor        |
| ------------------ | ----------------- |
| Step-by-step rule  | Enforces the rule |
| Can be event-based | Always controlled |
| Decentralized      | Centralized       |
| Hard to debug      | Easier to reason  |

👉 **Supervisor = Orchestrated Sequential Convoy**

---

## 10. What This Pattern Is NOT

❌ Not a queue
❌ Not pub-sub
❌ Not parallel processing
❌ Not a simple retry system

It is a **workflow coordinator**.

---

## 11. When You SHOULD Use It

Use when:

- Business workflows are complex
- Partial failure unacceptable
- Compensation needed
- Financial / order systems
- Reliability > latency

---

## 12. When You Should NOT Use It

Avoid when:

- Simple async jobs
- Independent services
- High-throughput event streaming
- Low-latency critical paths

Overuse = overengineering.

---

## 13. One Brutally Clear Line

> **Supervisor is just a normal service that remembers state and decides what to do next.**

No magic. No mystery.

---

## 14. One-Line Summary

> Scheduling Agent / Supervisor is a central orchestrator that coordinates sequential distributed actions, retries failures, and compensates completed work so the system behaves like a single reliable operation.
