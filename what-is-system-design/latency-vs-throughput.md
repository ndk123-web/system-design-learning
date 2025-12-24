
# ⭐ **Latency vs Throughput (DEEP DIVE — System Design Core)**

![Image](https://media.geeksforgeeks.org/wp-content/uploads/20240205152604/Throughput-vs-Latency.webp)

![Image](https://www.researchgate.net/publication/3842737/figure/fig1/AS%3A654068028563464%401532953378708/Time-line-diagram-illustrating-the-various-latency-factors-of-an-HTTP-request-response.png)

---

## 🔵 WHY (Why this distinction exists)

Because **systems don’t fail because they are slow**
→ they fail because **they can’t handle load**.

And sometimes:

* latency is good but throughput is bad
* throughput is good but latency is bad

If you mix these two → wrong design decisions.

---

## 🔵 WHAT (Exact definitions — no ambiguity)

### ✅ **Latency**

> Time taken to process **one request** from start to finish.

* Unit: milliseconds (ms)
* Focus: **delay**
* Question answered:
  **“How long does one request take?”**

Example:

* API response = 40 ms
* DB query = 8 ms

---

### ✅ **Throughput**

> Number of requests processed **per unit time**.

* Unit: requests/second (RPS), QPS
* Focus: **capacity**
* Question answered:
  **“How many requests can I process per second?”**

Example:

* 100 req/sec
* 10,000 req/sec

---

## 🔵 HOW (How they are related — this is the tricky part)

### ❗ Important rule:

> **Latency and Throughput are related, but not the same.**

### Basic relation:

```
Throughput ≈ Concurrent Requests / Latency
```

This is not exact math, but **mentally very useful**.

---

## 🔵 EXAMPLE 1 — Low latency, low throughput

* Latency = **10 ms**
* Single-threaded server
* Processes **1 request at a time**

In 1 second:

* Can process ~100 requests max

👉 Fast response
👉 But limited capacity

✔ High performance
❌ Poor scalability

---

## 🔵 EXAMPLE 2 — Higher latency, higher throughput

* Latency = **100 ms**
* 100 concurrent workers
* Async / non-blocking

In 1 second:

* 100 workers × (1 req / 100 ms)
* ≈ **1000 req/sec**

👉 Individual request slower
👉 System handles huge load

❌ Medium performance
✔ High scalability

---

## 🔵 EXAMPLE 3 — Queue effect (very important)

Assume:

* System can process **100 req/sec**
* Incoming traffic = **120 req/sec**

What happens?

* Throughput capped at 100
* Extra 20 req/sec go into queue
* Queue grows
* Waiting time increases
* Latency increases
* Eventually → timeout / crash

👉 **Latency explodes even though throughput stays same**

This is why systems “suddenly feel slow”.

---

## 🔵 REAL-LIFE ANALOGY (best one)

### 🚗 Highway example

* **Latency** = how long *one car* takes to reach destination
* **Throughput** = how many cars pass the highway per hour

Cases:

* One fast lane → low latency, low throughput
* Multiple lanes → slightly slower per car, very high throughput

Traffic jam:

* Cars slow down
* Latency increases
* Throughput eventually collapses

---

## 🔵 LOGIC (Most important mental model)

### ❗ Key insight:

> **When load approaches system capacity, latency rises exponentially.**

This curve is critical in system design.

At:

* 30% load → latency stable
* 60% load → latency slightly higher
* 80% load → latency jumps
* 95% load → system unusable

That’s why production systems **never run at 100% capacity**.

---

## 🔵 CONCEPT (System design decisions)

### To improve **latency**

* Caching
* Faster DB queries
* Reduce network hops
* Use in-memory data
* Locality (CDN, edge)

### To improve **throughput**

* Horizontal scaling
* Async processing
* Queues (Kafka, SQS)
* Batch processing
* Stateless services
* Connection pooling

Different problems → different tools.

---

## 🔵 VERY COMMON MISTAKE (now avoid this)

❌ “Latency high hai, toh scale karo”
❌ “Throughput low hai, toh optimize query”

Correct thinking:

* High latency at low load → **performance problem**
* High latency at high load → **scalability problem**

---

## ⭐ FINAL NDK MEMORY KEYS

> **Latency = delay per request**
> **Throughput = requests per second**

> **Low latency ≠ high throughput**
> **High throughput ≠ low latency**

> **As load increases, latency explodes near capacity**

---

## 🔥 Interview-ready 2-liner (gold)

> *“Latency measures how long a single request takes, while throughput measures how many requests a system can handle per unit time. As throughput approaches system capacity, latency increases sharply due to queueing effects.”*
