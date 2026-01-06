# 🧵 Pipes and Filters Pattern

## 1️⃣ WHAT is Pipes & Filters?

> **Pipes & Filters is a pattern where a complex task is broken into small, independent processing steps (filters), connected by data channels (pipes).**

- **Filter** = does one specific job
- **Pipe** = carries data to the next step
- Filters don’t know each other
- They only know **input → output**

---

## 2️⃣ WHY this pattern exists (real problem)

Imagine a single service that:

- Validates order
- Takes payment
- Handles failure
- Sends notifications
- Updates DB

Problems:

- Huge codebase
- Hard to scale
- One failure affects everything
- No reuse
- No flexibility

❌ Monolithic processing
❌ Tight coupling

👉 Solution: **Break processing into steps**

---

## 3️⃣ CORE IDEA (one line)

> **“Process ko chhote, reusable steps mein todo,
> aur unko pipeline mein jodo.”**

---

## 4️⃣ VISUAL: Core Pipes & Filters idea

![Image](https://learn.microsoft.com/en-us/azure/architecture/patterns/_images/pipes-and-filters-solution.png)

![Image](https://static.wixstatic.com/media/904900_d0d93a35f2694df7ae285ab33254e413~mv2.png/v1/fill/w_967%2Ch_308%2Cal_c%2Cq_85%2Cenc_avif%2Cquality_auto/904900_d0d93a35f2694df7ae285ab33254e413~mv2.png)

```
Input
  │
  ▼
[ Filter A ] ──► [ Filter B ] ──► [ Filter C ]
  │                │                │
 Output           Output           Output
```

- Each **Filter** = one responsibility
- **Pipes** = data flow only (no logic)

---

## 5️⃣ PERFECT EXAMPLE (Order → Payment → Refund)

Now exactly your Kafka-based example 👇
This is **100% Pipes & Filters**.

---

## 6️⃣ VISUAL PIPELINE (Kafka version)

![Image](https://estuary.dev/static/7ba0c5c3971f2b18f35438fc94246138/f693d/02_Data_Pipeline_Kafka_Kafka_Cluster_2a7192509f.png)

![Image](https://bs-uploads.toptal.io/blackfish-uploads/public-files/micro-monolitchic__1_-7f72d7a802416f0a1c716b505beab02c.png)

```
order-topic
    │
    ▼
[ Order Validation Filter ]
    │
    ▼
payment-topic
    │
    ▼
[ Payment Filter ]
    │
    ├── success ──► completed-topic ──► [ Completion Filter ]
    │
    └── failure ──► refund-topic ─────► [ Refund Filter ]
```

---

## 7️⃣ Mapping to real components

### 🔹 Pipes (Kafka Topics)

```
order-topic
payment-topic
completed-topic
refund-topic
```

### 🔹 Filters (Services)

```
OrderService
PaymentService
CompletionService
RefundService
```

---

## 8️⃣ STEP-BY-STEP FLOW (logic crystal clear)

### Step 1: Order placed

```
User → OrderService → order-topic
```

OrderService:

- Validates order
- Creates order
- Publishes event
- DONE ✅

---

### Step 2: Payment processing

```
PaymentService ← order-topic
```

PaymentService logic:

```
if payment success:
    publish to completed-topic
else:
    publish to refund-topic
```

👉 **Branching happens here**
👉 Exactly like you imagined

---

### Step 3A: Success path

```
CompletionService ← completed-topic
```

- Mark order completed
- Send confirmation
- Finish pipeline ✅

---

### Step 3B: Failure path

```
RefundService ← refund-topic
```

- Cancel order
- Initiate refund
- Notify user ❌➡️💰

---

## 9️⃣ Your doubt — answered directly

> **“related busses se jo consumers / services hai woh ek ek baar le rhe hoge eventually sab ho jayega?”**

### ✅ YES

Because:

- Kafka stores messages
- Consumers pull one by one
- If consumer crashes → retry
- Eventually pipeline completes

👉 That’s the **guarantee of the pipe**

---

## 10️⃣ IMPORTANT: What this pattern is NOT

❌ Not Sequential Convoy
❌ Not Supervisor / Orchestrator

Why?

- No central brain
- No global workflow state
- Each filter is **stateless**
- Just: _consume → process → produce_

---

## 11️⃣ Pipes & Filters vs Sequential Convoy

| Pipes & Filters   | Sequential Convoy  |
| ----------------- | ------------------ |
| Data pipeline     | Business workflow  |
| Stateless steps   | Stateful steps     |
| Event-driven      | Command-driven     |
| Branching allowed | Controlled order   |
| No rollback logic | Compensation logic |

Your example fits **Pipes & Filters perfectly**.

---

## 12️⃣ Why Kafka is perfect for this pattern

Because Kafka:

- Durable pipes
- Replayable
- Scales horizontally
- Decouples services

Think:

```bash
order | payment | completion
```

Kafka = Unix pipes for distributed systems.

---

## 13️⃣ When you SHOULD use Pipes & Filters

Use when:

- Complex processing
- Clear transformation stages
- Streaming / event processing
- Independent scaling
- Reuse of steps

---

## 14️⃣ When you should NOT use it

Avoid when:

- Strong consistency required
- Distributed transactions
- Complex rollback logic
- Tight coordination needed

That’s where **Sequential Convoy / Supervisor** fits.

---

## 15️⃣ ONE GOLDEN RULE (remember this)

> **Kafka Topic = Pipe
> Service = Filter**

Services never call each other.
They only **read → process → write**.

---

## 16️⃣ One-line summary

> Pipes & Filters decomposes complex processing into independent, reusable steps connected by data pipes, enabling scalable and flexible event-driven systems.
