# 🧾 Claim Check Pattern

The **Claim Check** pattern is used to handle **large payloads** in distributed systems without overwhelming the message broker, consumers, or network.

Instead of sending the full payload through the message bus, the system sends only a **reference (claim check)** to where the payload is stored.

![Image](https://learn.microsoft.com/en-us/azure/architecture/patterns/_images/claim-check-diagram.svg)

---

## 1️⃣ What is Claim Check?

**Claim Check** means:

- Store the **large payload** in external storage
- Send only a **small reference (ID / URL / key)** in the message
- Consumer uses the reference to fetch the payload when needed

In short:

> **Messages carry references, not heavy data.**

---

## 2️⃣ Why Claim Check Exists (Problem It Solves)

### ❌ Problems with sending large messages directly

Message brokers (Kafka, RabbitMQ, SQS) are designed for:

- coordination
- ordering
- durability

They are **not designed for large payloads**.

Sending large messages causes:

- High latency
- High memory and disk usage
- Slower consumers
- Expensive retries
- Higher cloud costs
- Risk of broker instability

### ✅ What Claim Check Fixes

- Keeps messages small and fast
- Protects the message bus
- Reduces network and broker load
- Makes retries cheaper
- Lowers operational cost

> **The bus stays fast; data lives elsewhere.**

---

## 3️⃣ When to Use Claim Check (Use Cases & Anti-Patterns)

### ✅ Use Claim Check When

- Payloads are large (files, images, videos, reports)
- Events trigger heavy downstream processing
- Fan-out systems (many consumers)
- ML artifacts, exports, analytics results
- Cost of large broker messages is high

### ❌ Do NOT Use Claim Check When

- Payload is already small
- Ultra-low latency is required
- External storage access is slower than acceptable
- Simple CRUD workflows

> **If payload fits comfortably in memory, Claim Check may be overkill.**

---

## 4️⃣ How Claim Check Works (Implementation)

### 🔹 Step-by-Step Flow

#### Producer side:

1. Generate large payload
2. Store payload in external storage
   (S3, Blob Storage, DB, File Store)
3. Receive a reference (key / URL / ID)
4. Send message containing only the reference

#### Message bus:

- Carries **small event message**
- No heavy payload

#### Consumer side:

1. Consume message
2. Extract reference
3. Fetch payload from storage
4. Process payload

---

### 🔹 Example Message

```json
{
  "eventType": "ReportGenerated",
  "payloadRef": "s3://reports/2026/report-98231.json"
}
```

---

### 🔹 Typical Technologies

- Message Brokers:

  - Kafka
  - RabbitMQ
  - SQS

- Storage:

  - S3 / GCS / Azure Blob
  - Databases
  - Distributed file systems

- Patterns used together:

  - Outbox Pattern
  - Idempotent Consumers
  - Choreography

---

## 5️⃣ Trade-Offs (Inherent Compromises)

### ✅ Advantages

- Message broker stays fast and stable
- Better scalability
- Lower infrastructure cost
- Faster retries
- Cleaner separation of concerns

### ❌ Disadvantages

- Extra network hop
- Dependency on storage availability
- Payload lifecycle management required
- More moving parts
- Slightly higher consumer complexity

> **You trade simplicity for scalability and safety.**

---

## 6️⃣ Impact on System Design

### 🔹 Scalability

- Broker throughput increases significantly
- Consumers scale independently
- Large payloads don’t block event flow

---

### 🔹 Cost

- Broker costs ↓
- Network costs ↓
- Storage costs (cheap) replace broker costs (expensive)

---

### 🔹 Testing

- Need to mock external storage
- Contract testing for payload references
- Validate missing/expired payload scenarios

---

### 🔹 Monitoring & Observability

Must track:

- Payload fetch latency
- Missing payload errors
- Storage availability
- Orphaned payloads (never consumed)

Without monitoring:

> **Failures become silent and hard to debug.**

---

## 7️⃣ Failure Scenarios & Handling

### 1️⃣ Payload exists, message delivered

✅ Normal case

---

### 2️⃣ Message delivered, payload missing

Cause:

- TTL expired too early
- Manual deletion
- Bug

Fix:

- Payload TTL > message retention
- Validation before deletion
- Alerting

---

### 3️⃣ Consumer fails while fetching payload

Fix:

- Retry with backoff
- Idempotent processing

---

### 4️⃣ Payload stored but event never published

Fix:

- Use **Outbox Pattern**
- Periodic cleanup jobs

---

## 8️⃣ Related Patterns

Claim Check is rarely used alone.

Common companions:

- Outbox Pattern
- Choreography
- Idempotent Consumers
- Dead Letter Queues
- Saga Pattern
- Event-Driven Architecture

---

## 9️⃣ Mental Model (Most Important)

> **Message bus = coordination
> Storage = data
> Messages point to data, they don’t carry it**

---

## 🔒 Final Rule (Tattoo-Level)

> **If your message bus starts behaving like a file server, your design is wrong.**
