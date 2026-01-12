# 🔁 IDEMPOTENT REQUESTS 

_(Making Retries Safe in Distributed Systems)_

---

## 📌 PURPOSE

Idempotent Requests are used to ensure that **repeating the same operation multiple times does not change the final business outcome**.

They are essential for:

- Safe retries
- Network failures
- Distributed systems
- Payment systems
- Saga workflows
- Message reprocessing

---

## 🧠 ONE-LINE IDEA (LOCK THIS)

> **An idempotent request guarantees that performing the same operation multiple times results in the same final system state.**

---

## WHY — Why Idempotency is needed

In distributed systems, this is normal:

```
Client sends request
Network times out
Client retries
```

The client **does not know**:

- Did the server process the request?
- Did it partially process it?

Without idempotency:

- Duplicate orders
- Double payments
- Multiple emails
- Corrupted data

👉 **Retry without idempotency is dangerous.**

---

## WHAT — What an Idempotent Request actually is

Formally:

> **An operation is idempotent if executing it once or multiple times produces the same final effect.**

Important clarification:

- “Same effect” ≠ identical HTTP response every time
- “Same effect” = **same business outcome**

---

## SIMPLE REAL-WORLD ANALOGY

**Light switch (ON):**

- ON → light ON
- ON again → light still ON

This is idempotent.

**Toggle switch:**

- Toggle → ON
- Toggle → OFF

Not idempotent.

---

## HTTP METHODS & IDEMPOTENCY

| Method | Idempotent?        | Reason               |
| ------ | ------------------ | -------------------- |
| GET    | ✅ Yes             | Read-only            |
| PUT    | ✅ Yes             | Sets resource state  |
| DELETE | ✅ Yes             | Deletes once         |
| POST   | ❌ No (by default) | Creates new resource |

POST becomes idempotent **only when you design it so**.

---

## CORE PROBLEM — POST + RETRY

Example:

```
POST /charge
amount = 100
```

Retry happens →
Money charged twice ❌

This is solved using **Idempotency Keys**.

---

## IDEMPOTENCY KEY — THE CORE MECHANISM

### 🧠 Idea

> **Client sends a unique key with the request.
> Server stores the key and the result.
> If the same key is seen again, the server returns the stored result instead of re-executing.**

---

## HOW IT WORKS — STEP BY STEP

### 1️⃣ Client generates a key

```
Idempotency-Key: order_123_payment_1
```

The key must:

- Represent **one logical operation**
- Be reused across retries

---

### 2️⃣ Client sends request

```
POST /charge
Headers:
  Idempotency-Key: order_123_payment_1
Body:
  amount = 100
```

---

### 3️⃣ Server processing logic

```js
BEGIN TRANSACTION

if (idempotency_key exists) {
  return stored_response;
}

mark idempotency_key as IN_PROGRESS;

result = process_business_logic();

store idempotency_key + result;

COMMIT;

return result;
```

Key points:

- The key must be **unique**
- Use DB transaction or unique constraint
- Prevents duplicate execution

---

### 4️⃣ Retry happens

Same request + same key →

```
Server sees key exists
→ DOES NOT re-run logic
→ Returns stored response
```

🎯 Final state remains unchanged.

---

## IMPORTANT CLARIFICATION (YOUR DOUBT ANSWERED)

> “If I call the request any number of times, output should not change?”

### Correct, precise version:

> **If you call the same request any number of times with the SAME idempotency key, the final business effect must not change.**

If the key changes → new operation.

---

## HANDLING CONCURRENT RETRIES (CRITICAL)

Two requests arrive **at the same time** with same key.

❌ Bad implementation:

- Both see “key not present”
- Both execute
- Duplicate effects

✅ Correct implementation:

- `idempotency_key` has a **UNIQUE constraint**
- First request wins
- Second sees key already exists or waits

This is mandatory for correctness.

---

## WHERE IDEMPOTENCY IS USED

### ✅ Payment systems

- Charge once
- Refund once

### ✅ Order creation

- Prevent duplicate orders

### ✅ Saga workflows

- Safe retries of steps & compensations

### ✅ Message consumers (Kafka, queues)

- Safe reprocessing of events

---

## IDEMPOTENCY IN ASYNC SYSTEMS

Kafka gives **at-least-once delivery**.

So consumer logic:

```js
if (eventId already processed) {
  skip;
} else {
  process;
  store eventId;
}
```

This is **idempotent consumption**.

---

## STORAGE & CLEANUP

Idempotency storage needs:

- Key
- Status (IN_PROGRESS / DONE)
- Response or reference
- TTL cleanup

Typical TTL:

- Few hours or days (not forever)

---

## WHAT IDEMPOTENCY IS NOT

❌ Not about caching
❌ Not about performance
❌ Not about preventing retries
❌ Not about identical timestamps

It is about **preventing duplicate side effects**.

---

## COMMON MISTAKES

❌ No unique constraint on key
❌ No transactional safety
❌ No TTL cleanup
❌ Retrying non-idempotent operations
❌ Assuming network won’t fail

---

## FINAL MENTAL MODEL (LOCK THIS 🔒)

```
Retry = “I will try again”
Idempotency = “Trying again is safe”
```

Together they make distributed systems reliable.

---

## ONE-LINE SUMMARY

> **An idempotent request ensures that repeating the same operation with the same idempotency key never changes the final business state, making retries safe in distributed systems.**
