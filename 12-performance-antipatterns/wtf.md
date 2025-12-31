# 📘 Performance Antipatterns — System Design README

## WHAT ARE PERFORMANCE ANTIPATTERNS

**Performance antipatterns** are **common design mistakes** that:

- Look logically correct
- Work fine at small scale
- **Fail badly at scale**

They don’t break correctness.
They break **latency, throughput, and stability**.

In short:

> **Antipatterns are patterns that work initially but scale poorly.**

---

## WHY PERFORMANCE ANTIPATTERNS HAPPEN

They happen because of:

- Thinking locally, not system-wide
- Hidden costs (ORMs, network calls)
- Small test data
- Convenience over efficiency
- Lack of workload understanding

Most slow systems are slow due to **design**, not hardware.

---

## HOW PERFORMANCE ANTIPATTERNS APPEAR

They usually appear as:

- Extra database queries
- Too many network calls
- Fetching more data than needed
- Poor algorithm choices

Below are the **most common and dangerous ones**.

---

# 1️⃣ N+1 QUERIES

## WHAT

> One query to fetch parent data
>
> - N queries to fetch related data (one per item)

---

## HOW IT HAPPENS

Code fetches a list, then loops and queries inside the loop.

---

## EXAMPLE (BAD)

```js
users = db.getUsers(); // 1 query

for (user of users) {
  orders = db.getOrders(user.id); // N queries
}
```

If there are 1,000 users:

```
1 + 1000 = 1001 DB queries
```

---

## WHY THIS IS BAD

- Database load explodes
- Latency increases linearly
- Works in dev, breaks in prod

---

## FIX / LOGIC

Fetch related data **in bulk**.

```sql
SELECT users.*, orders.*
FROM users
LEFT JOIN orders ON users.id = orders.user_id;
```

Or:

- Joins
- Batch queries
- DataLoader (GraphQL)

---

## CONCEPT

> **If a loop contains a DB call, assume N+1 until proven otherwise.**

---

# 2️⃣ CHATTY INTERFACES

## WHAT

> Too many small and frequent network calls
> instead of fewer meaningful ones.

---

## HOW IT HAPPENS

Microservices + naive API design.

---

## EXAMPLE (BAD)

Frontend dashboard loads:

```
GET /user
GET /user/profile
GET /user/settings
GET /user/orders
GET /user/notifications
```

Each call:

- Network latency
- Serialization
- Auth
- TCP overhead

---

## WHY THIS IS BAD

- Network dominates latency
- Mobile clients suffer
- Cascading failures increase

---

## FIX / LOGIC

- Aggregate APIs
- Backend-for-Frontend (BFF)
- GraphQL
- Batch endpoints

Example:

```
GET /dashboard
```

---

## CONCEPT

> **Network calls are expensive.
> Make fewer, smarter calls.**

---

# 3️⃣ UNBOUNDED DATA

## WHAT

> Fetching or processing data without limits.

---

## HOW IT HAPPENS

Developer assumes data is “small”.

---

## EXAMPLE (BAD)

```sql
SELECT * FROM logs;
```

or

```http
GET /orders
```

(no pagination)

---

## WHY THIS IS BAD

- Memory spikes
- Slow responses
- Timeouts
- Crashes at scale

---

## FIX / LOGIC

Always bound data:

```sql
SELECT *
FROM orders
ORDER BY created_at
LIMIT 50 OFFSET 0;
```

Use:

- Pagination
- Limits
- Filters

---

## CONCEPT

> **Never trust data size.
> Always assume it will grow.**

---

# 4️⃣ INEFFICIENT ALGORITHMS

## WHAT

> Using algorithms that do not scale with data size.

---

## HOW IT HAPPENS

Naive logic works at small scale.

---

## EXAMPLE (BAD)

```js
for (user of users) {
  for (order of orders) {
    if (user.id === order.userId) {
      ...
    }
  }
}
```

Time complexity:

```
O(N × M)
```

---

## WHY THIS IS BAD

- CPU usage explodes
- Latency grows fast
- Hardware scaling doesn’t help

---

## FIX / LOGIC

Use better data structures:

```js
orderMap = new Map();

for (order of orders) {
  orderMap.set(order.userId, order);
}

for (user of users) {
  user.orders = orderMap.get(user.id);
}
```

---

## CONCEPT

> **Algorithmic inefficiency beats hardware every time.**

---

# BIG PICTURE LOGIC

All performance antipatterns share traits:

- Hidden at small scale
- Explode at large scale
- Hard to fix later
- Require redesign, not tuning

---

## HOW TO THINK TO AVOID THEM

Ask these questions:

- Is this inside a loop?
- Is this a DB or network call?
- Is data size bounded?
- How does this behave at 10× load?
- Can this be batched?

---

## FINAL CONCEPTUAL MODEL (LOCK THIS)

```
Correctness ≠ Performance
Works in dev ≠ Works at scale
Design mistakes ≠ Hardware problems
```

---

## FINAL ONE-LINE SUMMARY

> **Performance antipatterns are common design mistakes that scale poorly — they don’t break correctness, they break systems under real load.**
