# 📘 Improper Instantiation (Performance Antipattern)

## WHAT IS IMPROPER INSTANTIATION

> **Improper instantiation** means
> creating **objects / services / connections repeatedly and unnecessarily**,
> instead of **reusing them**.

In simple words:

> **“Jo cheez ek baar ban sakti thi, usko baar-baar banana.”**

---

## WHY THIS IS A PROBLEM

Object / service creation is **not free**.

It may involve:

- Memory allocation
- CPU work
- Network calls
- Thread creation
- TCP handshakes
- Initialization logic

Repeated instantiation causes:

- High latency
- High memory usage
- GC pressure
- Poor scalability

---

## HOW THIS ANTIPATTERN HAPPENS

Usually happens because:

- Poor lifecycle management
- Not understanding request vs application scope
- Naive code inside loops / handlers
- “It works” mindset

---

## 1️⃣ EXAMPLE: DATABASE CLIENT (VERY COMMON)

### ❌ BAD (Improper Instantiation)

```js
app.get("/users", async (req, res) => {
  const db = new DatabaseClient(); // ❌ created per request
  const users = await db.getUsers();
  res.json(users);
});
```

### What’s wrong?

- New DB client per request
- New TCP connection
- New auth handshake
- No reuse

At 1,000 RPS:

- 1,000 DB connections ❌
- DB crashes

---

### ✅ GOOD (Proper Instantiation)

```js
const db = new DatabaseClient(); // created once

app.get("/users", async (req, res) => {
  const users = await db.getUsers();
  res.json(users);
});
```

Now:

- One client
- Connection pooling
- Reuse
- Stable performance

---

## 2️⃣ EXAMPLE: HTTP CLIENT / RPC CLIENT

### ❌ BAD

```js
function callService() {
  const client = new RpcClient(); // ❌ every call
  return client.fetchData();
}
```

### Why bad?

- Recreates client
- Recreates connection
- Wastes CPU & memory

---

### ✅ GOOD

```js
const client = new RpcClient(); // once

function callService() {
  return client.fetchData();
}
```

---

## 3️⃣ EXAMPLE: OBJECT CREATION INSIDE LOOPS

### ❌ BAD

```js
for (let i = 0; i < users.length; i++) {
  const formatter = new Formatter(); // ❌ inside loop
  formatter.format(users[i]);
}
```

If `users.length = 10,000`:

- 10,000 objects created
- Heavy GC pressure

---

### ✅ GOOD

```js
const formatter = new Formatter();

for (let i = 0; i < users.length; i++) {
  formatter.format(users[i]);
}
```

---

## 4️⃣ EXAMPLE: THREADS / WORKERS

### ❌ BAD

- New thread per request
- New worker per task

This kills:

- OS scheduler
- Memory
- Context switching

---

### ✅ GOOD

- Thread pool
- Worker pool
- Reuse workers

---

## WHY THIS KILLS SCALABILITY

Improper instantiation causes **non-linear scaling**.

Example:

| Load        | Objects created |
| ----------- | --------------- |
| 10 req      | 10 objects      |
| 1,000 req   | 1,000 objects   |
| 100,000 req | 💀 system       |

GC + CPU + memory collapse.

---

## LOGIC (CORE IDEA)

Ask this question:

> **“Does this thing REALLY need to be created again?”**

If:

- Stateless
- Thread-safe
- Reusable

👉 **Create once, reuse many times**

---

## COMMON PLACES WHERE THIS ANTIPATTERN HIDES

- Database clients
- Redis clients
- HTTP / RPC clients
- Loggers
- Config loaders
- Regex compilers
- JSON parsers
- SDK clients (AWS, GCP)

---

## CONCEPTUAL RULES (LOCK THESE)

1️⃣ **Heavy objects should be long-lived**
2️⃣ **Light objects can be short-lived**
3️⃣ **Network-related objects must be reused**
4️⃣ **Never instantiate inside hot paths blindly**

---

## ONE-SCREEN MENTAL MODEL

```
Instantiation cost × Frequency = Performance impact
```

High cost + high frequency = ❌ disaster

---

## FINAL ONE-LINE SUMMARY

> **Improper instantiation is a performance antipattern where expensive objects or services are repeatedly created instead of being reused, leading to high latency and poor scalability.**
