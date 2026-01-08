# 🕺 Choreography Pattern (Event-Driven Workflow)


## 1️⃣ What is Choreography?

**Choreography** is a distributed workflow pattern where:

- **There is no central controller**
- Each service:

  - performs its own work
  - emits events when something happens
  - listens to events it cares about

- The overall business flow **emerges from event interactions**

## ![Image](https://learn.microsoft.com/en-us/azure/architecture/patterns/_images/choreography-pattern.png)

In simple words:

> **Services don’t tell each other what to do.
> They announce what happened, and others react if they care.**

---

## 2️⃣ Why Choreography Exists (Problem It Solves)

### ❌ Problem with Centralized Control (Orchestration)

In orchestration:

- One service controls the entire workflow
- It calls multiple services in sequence
- It knows too much about everyone

This causes:

- Tight coupling
- God services
- Hard scaling
- High blast radius on failure

### ✅ What Choreography Fixes

Choreography solves:

- Tight coupling between services
- Central bottlenecks
- Single point of failure
- Difficulty adding new steps to workflows

**Key idea**:

> _Control is distributed, not centralized._

---

## 3️⃣ When to Use Choreography (Use Cases + Anti-Patterns)

### ✅ Use Choreography When

- You have **event-driven systems**
- Services are **independently owned**
- Workflow steps can run **in parallel**
- You need **loose coupling**
- You accept **eventual consistency**
- Long-running business processes (orders, onboarding, payments)

**Typical domains**:

- E-commerce (orders, payments, inventory)
- Logistics
- Notifications
- Financial workflows
- Microservices with independent teams

---

### ❌ Do NOT Use Choreography When

- Workflow is very simple (CRUD)
- Strong ordering is mandatory
- You need strict transactional guarantees
- Debugging simplicity is critical
- Team is small and system is early-stage

> **Choreography too early = unnecessary complexity**

---

## 4️⃣ How Choreography Works (Implementation)

### 🔹 Core Components

1. **Event Producer**

   - A service that emits events

2. **Event Broker**

   - Kafka, RabbitMQ, SQS, etc.

3. **Event Consumers**

   - Services that subscribe and react

4. **Events**

   - Immutable facts: `OrderCreated`, `PaymentCompleted`

---

### 🔹 Basic Flow

```text
User Action
   ↓
Service A handles request
   ↓
Service A emits Event
   ↓
Event Broker
   ↓
Multiple services consume event (parallel)
```

---

### 🔹 Example: Order Processing

```text
Order Service:
  emits OrderCreated
```

Then **independently**:

```text
Payment Service:
  listens OrderCreated
  → payment
  → emits PaymentCompleted / PaymentFailed
```

```text
Inventory Service:
  listens OrderCreated
  → reserve stock
  → emits InventoryReserved / InventoryFailed
```

```text
Shipping Service:
  listens PaymentCompleted + InventoryReserved
  → create shipment
```

**No service coordinates this flow explicitly.**

---

### 🔹 Technologies Commonly Used

- Message Brokers:

  - Kafka
  - RabbitMQ
  - AWS SQS / SNS

- Patterns:

  - Event sourcing
  - Saga (choreography-based)

- Infrastructure:

  - Async consumers
  - Idempotent handlers

---

## 5️⃣ Trade-Offs (Inherent Compromises)

### ✅ Advantages

- Loose coupling
- Independent scalability
- Fault isolation
- Easy to add new consumers
- Parallel execution by default

---

### ❌ Disadvantages

- Harder to understand full workflow
- Debugging is non-trivial
- Business logic scattered
- Requires strong observability
- Event ordering issues
- Eventual consistency only

> **You trade simplicity for scalability and autonomy**

---

## 6️⃣ Impact on System Design

### 🔹 Scalability

- Excellent horizontal scalability
- Each service scales independently
- No central bottleneck

---

### 🔹 Testing

- Unit tests are easy
- Integration tests are harder
- Requires contract testing
- Event schema stability is critical

---

### 🔹 Monitoring & Debugging

Choreography **demands observability**:

- Distributed tracing
- Correlation IDs
- Event logs
- Dead letter queues

Without observability:

> **System becomes a black box**

---

### 🔹 Failure Handling

- Partial failures are normal
- Retries must be controlled
- Idempotency is mandatory
- Compensation (Saga) required

---

## 7️⃣ Related Patterns

Choreography almost never stands alone.

Common companions:

- **Saga Pattern** (choreography-based rollback)
- Eventual Consistency
- Competing Consumers
- Dead Letter Queues
- Retry + Backoff
- Idempotent Consumers

---

## 8️⃣ Mental Model (Most Important)

> **Choreography is not about “who calls whom”
> It’s about “what happened” and “who cares”.**

---

## 9️⃣ One-Line Summary

> **Choreography is a decentralized, event-driven workflow pattern where services emit events and independently react to events, enabling loose coupling, parallelism, and scalable system evolution—at the cost of increased complexity and debugging difficulty.**

---

## 🔒 Final Rule (Tattoo-Level)

> **If a service needs to know too much about others, you don’t have choreography — you have hidden orchestration.**
