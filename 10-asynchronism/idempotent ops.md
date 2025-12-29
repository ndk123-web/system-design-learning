# 📘 Idempotent Operations (System Design README)

## What is an Idempotent Operation

An **idempotent operation** is an operation that:

> Produces the **same final state** whether it is executed **once or multiple times** with the same input.

Running it again does **not** change the result.

---

## Why Idempotency Exists

In real systems, retries are unavoidable:

- Network timeouts
- Client retries
- Worker crashes
- Message re-delivery from queues
- At-least-once delivery guarantees

If retrying the same operation:

- Creates duplicate data
- Corrupts state
- Breaks business logic

👉 The system is **not safe**.

Idempotency exists to make systems **retry-safe**.

---

## How Idempotency is Achieved

Idempotency is **designed**, not automatic.

Common techniques:

- Setting state instead of modifying state
- Using unique identifiers
- Checking existing state before writing
- Using upsert instead of insert
- Guarding writes with transactions

---

## Example 1: Non-Idempotent Operation

### Problem

```sql
INSERT INTO subscriptions(user_id, start_date, end_date)
VALUES (1, '2025-01-01', '2025-02-01');
```

### Retry effect

- Duplicate row created
- Data corrupted

❌ Not idempotent

---

## Example 2: Idempotent Operation (Subscription)

### Design

- One subscription per user
- Same input always produces same state

```sql
INSERT INTO subscriptions(user_id, start_date, end_date)
VALUES (1, '2025-01-01', '2025-02-01')
ON CONFLICT (user_id)
DO UPDATE SET
  start_date = EXCLUDED.start_date,
  end_date   = EXCLUDED.end_date;
```

### Retry effect

- Same row updated
- Same values written
- Final state unchanged

✅ Idempotent

---

## Example 3: Non-Idempotent vs Idempotent Comparison

### ❌ Non-idempotent

```sql
UPDATE wallet
SET balance = balance + 100
WHERE user_id = 1;
```

Retry → balance increases again ❌

---

### ✅ Idempotent

```sql
UPDATE wallet
SET balance = 100
WHERE user_id = 1;
```

Retry → balance remains 100 ✅

---

## Idempotency in Queues (Important)

Most message/task queues guarantee:

> **At-least-once delivery**

This means:

- Same message can be processed multiple times

If handlers are not idempotent:

- Duplicate side effects occur
- System breaks

Idempotent handlers make:

- Retries safe
- Failures recoverable
- Async systems reliable

---

## Logic (Core Idea)

Idempotency focuses on:

- **Final state**, not execution count
- **Safety under retries**
- **No duplicate side effects**

If retry changes outcome → ❌
If retry does nothing → ✅

---

## Conceptual Test (Simple Rule)

Ask:

> “If this operation runs again with the same input, will the final state remain the same?”

- Yes → Idempotent
- No → Not idempotent

---

## Common Idempotent Patterns

| Pattern                  | Idempotent |
| ------------------------ | ---------- |
| SET value                | ✅         |
| UPSERT                   | ✅         |
| INSERT only              | ❌         |
| INCREMENT / ADD          | ❌         |
| CREATE new row each time | ❌         |

---

## Mental Model (Lock This)

```
Retries WILL happen
Duplicates WILL happen
Final state MUST remain correct
```

Or simply:

> **If retries break your system, your operation is not idempotent.**

---

## Final One-Line Summary

> **Idempotent operations make distributed and asynchronous systems safe by ensuring retries do not change the final outcome.**
