# ⚡ CIRCUIT BREAKER

_(Resilience Pattern for Synchronous Service-to-Service Calls)_

---

## 📌 PURPOSE

Circuit Breaker is used to **protect a service from repeatedly calling a slow or failing dependency**.

It prevents:

- Thread blocking
- Retry storms
- Cascading failures
- Self-inflicted outages

---

![Image](https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Circuit_Breaker_-Closed_state.png/500px-Circuit_Breaker_-Closed_state.png)

![Image](https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Circuit_Breaker_-Openstate.png/500px-Circuit_Breaker_-Openstate.png)

![Image](https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Circuit_Breaker_-Half_Open_state.png/500px-Circuit_Breaker_-Half_Open_state.png)

## 🧠 ONE-LINE IDEA

> **Circuit Breaker decides whether a synchronous call should be attempted or failed fast based on recent failures.**

---

## CORE CLARITY (lock this 🔒)

- ✅ **Circuit Breaker = synchronous**
- ✅ **Kafka / Queue = asynchronous**
- ❌ Kafka does **not** replace Circuit Breaker
- ❌ Circuit Breaker does **not** queue work

They solve **different problems**.

---

## WHY — Why Circuit Breaker is needed

Real failure story (very common):

```
Service A → calls → Service B
Service B becomes slow / down
 ↓
Requests wait
Threads block
Retries pile up
Service A also crashes
```

Key truth:

> **Retries + slow dependency = cascading failure**

Circuit Breaker exists to answer:

> **“Should I even try calling this dependency right now?”**

---

## WHAT — What Circuit Breaker actually does

A Circuit Breaker:

- Wraps a **synchronous remote call**
- Tracks failures and latency
- Temporarily **blocks calls** when failure rate is high
- Periodically **tests recovery**

It does **not**:

- Fix the dependency
- Retry endlessly
- Buffer requests

It **protects the caller**.

---

## CORE CONCEPT — THE 3 STATES

![Image](https://miro.medium.com/v2/resize%3Afit%3A630/1%2AVqp5A2zcMQ9AjIX3_4_pRg.jpeg)

![Image](https://docs.firstdecode.com/wp-content/uploads/2020/04/CircuitBreaker.png)

![Image](https://miro.medium.com/0%2ARwQ1gn_I0imGKmiY.png)

### 1️⃣ CLOSED (Normal)

- Calls are allowed
- Failures are counted

```
Request → Call dependency → Response
```

If failures cross threshold → **OPEN**

---

### 2️⃣ OPEN (Protection mode)

- Calls are blocked
- Fail fast (no waiting)

```
Request → Circuit OPEN → Immediate error / fallback
```

After cooldown time → **HALF-OPEN**

---

### 3️⃣ HALF-OPEN (Test mode)

- Allow limited test calls

```
Request → Test call
  Success → CLOSED
  Failure → OPEN again
```

This prevents “retry stampede”.

---

## WHERE — Where Circuit Breaker lives

> **Circuit Breaker lives in the CALLING SERVICE**

```
Service A
 ├─ Circuit Breaker
 └─ HTTP / gRPC call → Service B
```

Not in:

- DNS
- Cloudflare
- Load balancer

---

## HOW — Simple JavaScript-style implementation

### 1️⃣ Circuit Breaker logic

```js
class CircuitBreaker {
  constructor() {
    this.state = "CLOSED";
    this.failures = 0;
    this.failureThreshold = 3;
    this.openTimeout = 5000; // ms
    this.lastFailureTime = null;
  }

  canCall() {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime > this.openTimeout) {
        this.state = "HALF_OPEN";
        return true;
      }
      return false;
    }
    return true;
  }

  success() {
    this.failures = 0;
    this.state = "CLOSED";
  }

  failure() {
    this.failures++;
    if (this.failures >= this.failureThreshold) {
      this.state = "OPEN";
      this.lastFailureTime = Date.now();
    }
  }
}
```

---

### 2️⃣ Dependency call (Service B)

```js
async function callServiceB() {
  if (Math.random() < 0.6) {
    throw new Error("Service B failed");
  }
  return "Success from Service B";
}
```

---

### 3️⃣ Using Circuit Breaker in Service A

```js
const breaker = new CircuitBreaker();

async function handleRequest() {
  if (!breaker.canCall()) {
    return {
      status: 503,
      message: "Service unavailable (circuit open)",
    };
  }

  try {
    const result = await callServiceB();
    breaker.success();
    return { status: 200, message: result };
  } catch (err) {
    breaker.failure();
    return { status: 500, message: "Dependency failed" };
  }
}
```

---

## FLOW — What actually happens

### CLOSED

```
Request → Circuit CLOSED → Service B → Response
```

### OPEN

```
Request → Circuit OPEN → Fail fast (no call)
```

### HALF-OPEN

```
Request → Test call
  ✓ success → CLOSED
  ✗ fail    → OPEN
```

Exactly like you said:

> “OPEN hua to req nahi jaayega, direct error ya fallback aayega.”

---

## FALLBACK (VERY IMPORTANT)

When circuit is OPEN, you usually:

- Return cached data
- Return default response
- Skip optional feature
- Save work for later

Example:

```
Payment down → Order marked as PENDING
```

Circuit Breaker **forces graceful degradation**.

---

## CIRCUIT BREAKER vs KAFKA (FINAL CLARITY)

| Aspect              | Circuit Breaker | Kafka        |
| ------------------- | --------------- | ------------ |
| Call type           | Synchronous     | Asynchronous |
| Response needed now | ✅ Yes          | ❌ No        |
| Blocks threads      | ❌ Prevents     | ❌ No        |
| Buffers work        | ❌ No           | ✅ Yes       |
| Protects caller     | ✅ Yes          | ❌ No        |

---

## CIRCUIT BREAKER vs THROTTLING

- **Throttling** → controls incoming traffic
- **Circuit Breaker** → controls outgoing calls

Both are needed.

---

## CIRCUIT BREAKER vs BULKHEAD

- **Bulkhead** → limits capacity usage
- **Circuit Breaker** → stops calling failure

Best practice:

```
Bulkhead + Timeout + Circuit Breaker
```

---

## WHEN TO USE CIRCUIT BREAKER

Use when:

- Calling another service
- Calling DB over network
- Calling third-party APIs
- Latency / failures are unpredictable

Do NOT use for:

- In-memory calls
- Pure CPU logic

---

## COMMON MISTAKES

❌ Retrying without circuit breaker
❌ Very long timeouts
❌ One global circuit for all dependencies
❌ No fallback
❌ Treating OPEN as error instead of protection

---

## FINAL MENTAL MODEL (LOCK THIS 🔒)

```
Kafka says: “I’ll do it later.”
Circuit Breaker says: “I won’t even try now.”
Bulkhead says: “You can only use this much.”
Throttling says: “I won’t accept more.”
```

Each answers a **different survival question**.

---

## ONE-LINE SUMMARY

> **Circuit Breaker protects a service from cascading failures by stopping synchronous calls to unhealthy dependencies and failing fast until recovery is detected.**
