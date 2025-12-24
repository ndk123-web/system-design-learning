# Consistency Patterns in Distributed Systems

## What is a Consistency Pattern?

A **consistency pattern** defines **when and how updated data becomes visible**
across multiple nodes (replicas) in a distributed system.

In simple words:
- When I update data, **who sees it and when?**
- Do all users see the same data immediately or after some delay?

---

## Why Consistency Patterns Exist

In a distributed system:
- Data is stored on multiple machines (replicas)
- Network delays and failures are unavoidable
- Updates cannot reach all replicas at the same time

Because of this, systems must **choose rules** for data visibility.
These rules are called **consistency patterns**.

---

## Types of Consistency Patterns

### 1. Strong Consistency

**Definition**  
After a write completes, **all subsequent reads return the latest value**.

There are no stale reads.

**How it works**
- Writes are synchronized across replicas
- Reads wait until replicas confirm the update
- System may block or fail during network issues

**Example**
- Bank balance
- Password change
- Payment systems

**Trade-off**
- High correctness
- Higher latency
- Lower availability during failures

**Memory key**
> Strong consistency = always correct, may wait or fail

---

### 2. Eventual Consistency

**Definition**  
After a write, reads **may return stale data temporarily**,  
but **eventually all replicas become consistent**.

**How it works**
- Writes succeed immediately
- Replication happens asynchronously
- Reads may hit replicas with old data

**Example**
- Social media posts
- Notifications
- Likes and comments

**Trade-off**
- High availability
- Low latency
- Temporary inconsistency allowed

**Memory key**
> Eventual consistency = correct later, fast now

---

### 3. Weak Consistency

**Definition**  
The system **does not guarantee when or if data becomes consistent**.

Reads may return old, new, or inconsistent data.

**How it works**
- Fire-and-forget updates
- Best-effort propagation
- No strict guarantees

**Example**
- Metrics counters
- Monitoring dashboards
- Analytics data
- Cache layers

**Trade-off**
- Very fast
- Very scalable
- Accuracy not guaranteed

**Memory key**
> Weak consistency = approximate is fine

---

## Comparison Table

| Pattern | Correctness | Availability | Latency | Typical Use |
|------|------------|--------------|---------|------------|
| Strong | Always correct | Lower | High | Banking, Auth |
| Eventual | Eventually correct | High | Low | Social media |
| Weak | Not guaranteed | Very high | Very low | Metrics |

---

## Key System Design Insight

A system does **not use one consistency model everywhere**.

Example:
- Login → Strong consistency
- Feed → Eventual consistency
- View count → Weak consistency

Good system design mixes consistency patterns based on business needs.
