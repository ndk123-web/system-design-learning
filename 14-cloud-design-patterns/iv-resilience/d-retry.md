# 🔁 RETRY PATTERN 

_(Handling Transient Failures Safely in Distributed Systems)_

---

## 📌 PURPOSE

The Retry pattern enables an application to **handle transient (temporary) failures** by automatically retrying a failed operation instead of failing immediately.

Retry improves **stability and success rate** when failures are caused by:

- Network glitches
- Temporary service overload
- Short timeouts
- DNS hiccups

---

## 🧠 ONE-LINE IDEA (LOCK THIS)

> **Retry assumes the failure was temporary and tries again before giving up.**

Keyword: **temporary**.

---

## WHY — Why Retry exists

In distributed systems:

- Networks are unreliable
- Services are briefly overloaded
- Failures are normal, not exceptional

Example reality:

```
First call → timeout ❌
Second call → success ✅
```

Without retry:

- User sees failure
- System looks fragile

With retry:

- System heals itself
- User often never sees the failure

---

## VERY IMPORTANT DISTINCTION

> **Retry is ONLY for transient failures, not permanent failures.**

| Failure Type          | Retry? |
| --------------------- | ------ |
| Network timeout       | ✅ Yes |
| Temporary 503         | ✅ Yes |
| Connection reset      | ✅ Yes |
| Validation error      | ❌ No  |
| Auth failure          | ❌ No  |
| Business rule failure | ❌ No  |

Retrying permanent failures = **self-harm**.

---

## BASIC RETRY FLOW

![Image](https://java-design-patterns.com/assets/img/retry-flowchart.7c54b19c.png)

![Image](https://miro.medium.com/1%2AwLYCORwkAMAA3xWjC3IXDQ.gif)

![Image](https://substackcdn.com/image/fetch/%24s_%21VQTW%21%2Cf_auto%2Cq_auto%3Agood%2Cfl_progressive%3Asteep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fee73de9e-d2ee-407a-ac6e-93679bdd887d_2250x2624.png)

```
Call dependency
 ↓
Failure?
 ├─ No → Success
 └─ Yes → Retry after delay
           ↓
         Success or final failure
```

---

## YOUR DOUBTS — ANSWERED CLEARLY

---

### 1️⃣ “Do we use Retry + Circuit Breaker together?”

✅ **YES — almost always**

But **in the correct order**.

#### Correct model (LOCK THIS 🔒)

```
Retry handles bad luck
Circuit Breaker handles bad health
```

#### Correct flow

```
Call
 → Retry (2–3 times with delay)
 → Still failing?
 → Circuit Breaker opens
 → Fail fast / fallback
```

❌ Retry without Circuit Breaker → retry storm
❌ Circuit Breaker without Retry → too pessimistic

---

### 2️⃣ “Sync + Circuit Breaker? Async + Circuit Breaker?”

#### 🔹 Sync (HTTP / gRPC)

Example:

```
Order Service → Payment Service
```

User is waiting.

Use:

```
Timeout
 → Retry
 → Circuit Breaker
 → Error / fallback
```

✔ Circuit Breaker is **mandatory** for sync calls.

---

#### 🔹 Async (Kafka / Queue)

Example:

```
Kafka Consumer → Downstream Service
```

Even though flow is async:

- Consumer still does sync calls
- Consumer can block

So inside consumer:

```
Retry processing
 → Circuit Breaker
 → Backoff / DLQ
```

👉 **Circuit Breaker protects the consumer**, not Kafka.

---

## HOW — Retry Methods (with logic + examples)

---

## 🔁 Method 1: Immediate Retry (BAD)

```js
try {
  callService();
} catch {
  callService();
}
```

❌ No delay
❌ No limit
❌ Causes retry storms

Avoid this.

---

## 🔁 Method 2: Fixed Retry Count

```js
for (let i = 0; i < 3; i++) {
  try {
    return callService();
  } catch (e) {
    if (i === 2) throw e;
  }
}
```

Better, but:

- All clients retry at same time
- Can overload dependency

---

## 🔁 Method 3: Fixed Delay Retry

```js
await sleep(500);
retry();
```

Problem:

- Everyone retries after same delay
- Traffic spike risk

---

## 🔁 Method 4: Exponential Backoff (STANDARD)

```js
async function retry(fn, retries = 3) {
  let delay = 100;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      await sleep(delay);
      delay *= 2;
    }
  }
}
```

Delays:

```
100ms → 200ms → 400ms
```

This:

- Reduces pressure
- Gives service time to recover

---

## 🔁 Method 5: Exponential Backoff + Jitter (PRODUCTION-GRADE)

Why jitter?
Because thousands of clients retrying together = DDoS.

```js
delay = delay * (0.5 + Math.random());
```

This spreads retries randomly.

👉 **This is the recommended cloud pattern**.

---

## IDEMPOTENCY (CRITICAL WITH RETRY)

Retry can cause:

```
Double payment
Duplicate order
Duplicate email
```

So:

> **Retry MUST be used only with idempotent operations or idempotency keys.**

No idempotency = data corruption.

---

## RETRY vs OTHER PATTERNS

### Retry vs Circuit Breaker

| Retry                     | Circuit Breaker            |
| ------------------------- | -------------------------- |
| Short-term                | Medium/long-term           |
| Assumes transient failure | Assumes persistent failure |
| Tries again               | Stops trying               |

They are **complements**, not replacements.

---

### Retry vs Kafka

| Retry            | Kafka                |
| ---------------- | -------------------- |
| Immediate        | Deferred             |
| Synchronous      | Asynchronous         |
| Limited attempts | Long-term durability |

Kafka is **system-level retry**, not call-level retry.

---

## RETRY IN SAGA CONTEXT

- Forward steps → few retries
- Compensation steps → more retries
- Retry exhausted → DLQ

Retry helps Saga **eventually converge**.

---

## WHAT RETRY SHOULD NEVER DO

❌ Retry forever
❌ Retry without delay
❌ Retry non-retryable errors
❌ Retry without Circuit Breaker
❌ Retry non-idempotent operations blindly

---

## TRADE-OFFS (HONEST)

### Pros

- Improves success rate
- Handles transient faults
- Transparent recovery

### Cons

- Adds latency
- Increases load
- Dangerous if misused

Retry is **powerful but sharp**.

---

## FINAL MENTAL MODEL (LOCK THIS 🔒)

```
Retry asks:
“Was this just temporary?”

Circuit Breaker asks:
“Is this dependency sick?”

Bulkhead asks:
“How much damage is allowed?”
```

Each answers a **different survival question**.

---

## ONE-LINE SUMMARY

> **The Retry pattern transparently retries failed operations caused by transient faults, improving stability when used with limits, backoff, idempotency, and circuit breakers.**
