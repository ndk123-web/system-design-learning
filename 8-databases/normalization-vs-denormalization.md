# 📘 Normalization vs Denormalization

## Why this exists

As systems grow:

- Users grow
- Orders grow
- Reads explode
- Joins become expensive

Database design is always a **trade-off between correctness and performance**.

That’s where **Normalization** and **Denormalization** come in.

---

## 1️⃣ Normalization

### What it is

**Normalization means**:

- Avoid data duplication
- Store each fact in exactly one place
- Use IDs (foreign keys) to reference related data

---

### Example (Normalized Design)

```text
users
-----
id (PK)
name
email

orders
------
id (PK)
user_id (FK)
amount
```

Order table only stores `user_id`, not user details.

---

### How data is read

To show order + user info:

```sql
SELECT o.id, o.amount, u.name, u.email
FROM orders o
JOIN users u ON o.user_id = u.id;
```

---

### Why normalization is good

- ✅ Strong consistency
- ✅ Change data in one place
- ✅ No duplication bugs
- ✅ Easy writes

If user name/email changes:

- Update **users table only**
- All joins automatically reflect the change

---

### Downside

- ❌ Joins are costly
- ❌ As users & orders grow, joins get slower
- ❌ In distributed systems, joins are painful or impossible

---

## 2️⃣ Denormalization

### What it is

**Denormalization means**:

- Duplicate data intentionally
- Optimize for read performance
- Avoid joins

---

### Example (Denormalized Design)

```text
orders
------
id
user_id
user_name
user_email
amount
```

User data is copied inside the order.

---

### How data is read

```sql
SELECT id, amount, user_name, user_email
FROM orders;
```

No join. Direct read.

---

### Why denormalization is good

- ✅ Very fast reads
- ✅ Simple queries
- ✅ Works well at scale
- ✅ Common in distributed systems

---

### Downside

If user updates name/email:

- ❌ Must update **all orders**
- ❌ Writes become heavy
- ❌ Risk of inconsistent data
- ❌ Harder to maintain correctness

In distributed systems, this cost becomes even higher.

---

## 3️⃣ Real-World Reason (Why Both Exist)

### When data is small

- Normalization is best
- Simpler
- Safer

### When scale increases

- Reads dominate writes
- Joins become bottlenecks
- Denormalization becomes necessary

---

## 4️⃣ Core Trade-off (Most Important Part)

| Aspect  | Normalization  | Denormalization |
| ------- | -------------- | --------------- |
| Goal    | Consistency    | Performance     |
| Reads   | Slower (joins) | Fast            |
| Writes  | Easy           | Expensive       |
| Storage | Efficient      | More            |
| Scale   | Harder         | Easier          |
| Risk    | Low            | Higher          |

---

## 5️⃣ Mental Model (Remember This)

> **Normalization protects correctness** > **Denormalization buys performance by paying with write complexity**

There is **no free lunch**.

---

## 6️⃣ When to Choose What

- **Choose Normalization when**:

  - Data correctness is critical
  - Writes are frequent
  - System is simple or early-stage

- **Choose Denormalization when**:

  - Reads are much higher than writes
  - Joins are hurting performance
  - System is large or distributed

---

## 7️⃣ Final Answer to the Question

> ❓ _Am I right or wrong?_

### ✅ You are RIGHT.

Your understanding is correct:

1. Normalization → consistency, single change reflects everywhere
2. Denormalization → performance, but heavy writes and sync cost
3. Both have trade-offs
4. Choice depends on scale and use-case
