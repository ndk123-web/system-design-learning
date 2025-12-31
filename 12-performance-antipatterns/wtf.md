# 📘 Performance Antipatterns (System Design)

## WHAT ARE PERFORMANCE ANTIPATTERNS

> **Performance antipatterns** are **common design mistakes** that look correct logically
> but cause **slow systems, high load, and poor scalability**.

They are not syntax errors.
They are **thinking errors**.

Most systems become slow **because of these**, not because of hardware.

---

## WHY THEY HAPPEN

They happen because:

- Developers think locally, not system-wide
- Initial system works fine at small scale
- Real workload is misunderstood
- Convenience > efficiency
- Abstractions hide cost (ORMs, APIs, microservices)

---

## 1️⃣ N+1 QUERIES (VERY COMMON)

### WHAT IT IS

> **One query to fetch parent data,
> then N queries to fetch child data — one per parent.**

---

### HOW IT HAPPENS

Typical flow:

1. Fetch list of users
2. For each user, fetch orders

---

### EXAMPLE (BAD)

```js
users = db.getUsers(); // 1 query

for (user of users) {
  orders = db.getOrders(user.id); // N queries
}
```

If:

- 1,000 users
  → **1 + 1000 = 1001 queries**

---

### WHY THIS IS BAD

- DB load explodes
- Latency increases linearly
- Looks fine in dev (small data)
- Kills production

---

### FIX / LOGIC

Fetch related data **in bulk**.

```sql
SELECT users.*, orders.*
FROM users
LEFT JOIN orders ON users.id = orders.user_id;
```

Or:

- Use joins
- Use batching
- Use DataLoader (GraphQL)

---

### MENTAL RULE

> **If a loop contains a DB/API call → suspect N+1**

---

## 2️⃣ CHATTY INTERFACES

### WHAT IT IS

> **Too many small network calls instead of fewer meaningful ones.**

---

### HOW IT HAPPENS

Microservices + naive design.

---

### EXAMPLE (BAD)

Frontend wants dashboard:

```
GET /user
GET /user/profile
GET /user/settings
GET /user/notifications
GET /user/orders
```

5 network calls
Each call:

- TCP
- Serialization
- Auth
- Latency

---

### WHY THIS IS BAD

- Network latency dominates
- Tail latency increases
- Mobile networks suffer
- Cascading failures

---

### FIX / LOGIC

- Aggregate APIs
- Backend-for-Frontend (BFF)
- GraphQL
- Batch requests

Example:

```
GET /dashboard
```

or GraphQL:

```graphql
query {
  user {
    profile
    settings
    orders
  }
}
```

---

### MENTAL RULE

> **Network calls are expensive.
> Make fewer of them.**

---

## 3️⃣ UNBOUNDED DATA (SILENT KILLER)

### WHAT IT IS

> **Fetching or processing data without limits.**

---

### HOW IT HAPPENS

Developer writes:

```sql
SELECT * FROM logs;
```

or:

```http
GET /orders
```

with no pagination.

---

### WHY THIS IS BAD

- Memory spikes
- Slow responses
- Timeouts
- Crashes under load

Works fine:

- With 100 rows
  Fails badly:
- With 10 million rows

---

### EXAMPLE (BAD)

```js
orders = db.getAllOrders();
```

---

### FIX / LOGIC

Always:

- Paginate
- Limit
- Filter

```sql
SELECT * FROM orders
ORDER BY created_at
LIMIT 50 OFFSET 0;
```

---

### MENTAL RULE

> **Never trust data size — always bound it.**

---

## 4️⃣ INEFFICIENT ALGORITHMS

### WHAT IT IS

> Using an algorithm whose complexity does not scale.

---

### HOW IT HAPPENS

Naive logic works at small scale.

---

### EXAMPLE (BAD)

```js
for (i in users) {
  for (j in orders) {
    if (users[i].id === orders[j].userId) {
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

### WHY THIS IS BAD

- CPU usage explodes
- Latency grows exponentially
- Hardware scaling won’t save you

---

### FIX / LOGIC

Use:

- Hash maps
- Indexes
- Better data structures

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

### MENTAL RULE

> **Algorithmic inefficiency beats hardware every time.**

---

## BIG PICTURE: WHY THESE ARE DANGEROUS

All antipatterns:

- Work fine initially
- Fail catastrophically at scale
- Are hard to debug later
- Require redesign, not tuning

---

## HOW TO THINK LIKE A SYSTEM DESIGNER

Ask these questions:

- Is this inside a loop?
- Is this a network call?
- Is data size bounded?
- Does this grow linearly or exponentially?
- What happens at 10× load?

---

## FINAL SUMMARY (LOCK THIS)

> **Performance antipatterns are design mistakes that scale poorly —
> they don’t break correctness, they break systems under load.**

Or simpler:

> **Slow systems are usually slow by design, not by hardware.**
