# Peformance vs Scalability

### ✅ **Performance**

> How fast **one request** is processed.

* Measured by: **latency**
* Example: API responds in **20 ms**

---

### ✅ **Scalability**

> How well the system handles **more load**.

* Measured by: **throughput**
* Example: handles **100 → 10,000 → 1,000,000 users**

### 🔹 Case 1: **High Performance, Low Scalability**

✔ Possible
✔ Very common

Example:

* One very powerful server
* API = 10 ms (very fast)
* Max users = 500

👉 Load increases → server crashes

So:

* Performance ✅ high
* Scalability ❌ low

But **performance didn’t cause low scalability** —
**architecture did** (single server).

---

### 🔹 Case 2: **High Performance, High Scalability**

✔ This is the **ideal system**

Example:

* Caching
* Load balancer
* Multiple servers
* Optimized DB

API = 20 ms
Users = 100,000

👉 This is what big companies aim for.

---

### 🔹 Case 3: **Low Performance, High Scalability**

✔ Also possible

Example:

* Distributed system
* Many services
* Network hops
* API = 200 ms
* Handles millions of users

👉 Slower, but **never crashes**

---

### 🔹 Case 4: **Low Performance, Low Scalability**

❌ Bad system
Avoid this.

---

## 🔵 LOGIC (The core mistake you made)

You thought:

> Scalability = medium performance

❌ Wrong

### Correct logic:

* **Performance = speed of one request**
* **Scalability = behavior when requests increase**

They answer **different questions**.

---

## 🔵 CONCEPT (System design way of thinking)

### You improve **performance** by:

* Caching
* Faster DB
* Better queries
* More RAM
* Faster SSD

### You design **scalability** by:

* Load balancing
* Horizontal scaling
* Stateless services
* Queues
* Replication
* Sharding

👉 Notice: **different tools**.

---

## ⭐ FINAL CORRECT UNDERSTANDING (memorize this)

> ❌ Performance high ≠ scalability low
> ❌ Scalability ≠ medium performance

> ✅ Performance = speed
> ✅ Scalability = growth handling

**They are independent.**

---

## 🔥 One-line interview-safe version

> *“Performance measures how fast a single request is handled, while scalability measures how the system behaves as the number of requests grows.”*
