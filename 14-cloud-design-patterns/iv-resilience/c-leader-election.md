# 👑 LEADER ELECTION 

_(Distributed Coordination Pattern)_

---

## 📌 PURPOSE

Leader Election is used to **coordinate multiple instances of the same application** by selecting **exactly one instance** as the leader to perform critical or exclusive tasks.

It prevents:

- Duplicate work
- Resource contention
- Conflicting updates
- Inconsistent system behavior

---

## 🧠 ONE-LINE IDEA (LOCK THIS)

> **Leader Election ensures that out of many running instances, only one acts as the coordinator at any given time.**

---

## WHY — Why Leader Election is needed

Modern distributed systems run:

- Multiple instances of the same service
- Across machines, zones, or regions
- For availability and scaling

However, some tasks **must not be executed by everyone**.

### Problems without Leader Election

```
Instance A runs cleanup job
Instance B runs cleanup job
Instance C runs cleanup job
```

Results:

- Duplicate emails
- Multiple payments
- Data corruption
- Race conditions
- Wasted resources

Leader Election exists to answer:

> **“Who is allowed to do this work right now?”**

---

## WHAT — What Leader Election actually does

Leader Election provides:

- One **leader** instance
- Multiple **follower** instances
- Automatic **failover** if leader dies
- No manual intervention

Only the leader:

- Runs cron jobs
- Manages shared resources
- Performs coordination tasks

Followers:

- Stay idle for leader duties
- Or perform non-exclusive work

---

## CORE CONCEPT — Leader vs Followers

![Image](https://media.geeksforgeeks.org/wp-content/uploads/20241001175405/What-is-the-Leader-Follower-Pattern-image.webp)

![Image](https://media.geeksforgeeks.org/wp-content/uploads/20240805121825/What-is-Leader-Election-in-a-Distributed-System-.webp)

![Image](https://i0.wp.com/vkontech.com/wp-content/uploads/2024/10/2-1.png?ssl=1)

```
Instances:
  App-1
  App-2
  App-3

Leader:
  App-2

If App-2 fails:
  App-1 or App-3 becomes leader
```

At any moment:

> **There must be at most ONE leader.**

---

## WHAT KIND OF TASKS REQUIRE A LEADER?

### ✅ Use Leader Election for:

- Scheduled jobs (cron)
- Cleanup / compaction
- Cache rebuilds
- Schema migrations
- Partition coordination
- Master data updates

### ❌ Do NOT use for:

- Normal API request handling
- Stateless request processing
- Read-only operations

Leader Election is about **correctness**, not performance.

---

## HOW — How Leader Election works (Conceptually)

All leader election systems follow this rule:

> **The instance that holds a unique, exclusive lock is the leader.**

Key requirements for the lock:

- Only one holder at a time
- Automatically released if holder crashes
- Visible to all participants

---

## COMMON IMPLEMENTATION STRATEGIES

---

## 1️⃣ Distributed Lock–Based Leader Election (Most Common)

### How it works

- All instances try to acquire a lock
- Lock stored in a shared, reliable system
- Winner becomes leader

Common lock stores:

- ZooKeeper
- etcd
- Consul
- Redis (with TTL)

### Flow

```
Startup
 ↓
Try acquire "leader" lock
 ↓
Success → LEADER
Fail    → FOLLOWER
```

If leader crashes:

- Lock expires
- New leader elected

---

## 2️⃣ Heartbeat-Based Leader Election

- Leader sends periodic heartbeats
- Followers monitor heartbeat
- If heartbeat stops → re-election

Used internally by:

- ZooKeeper
- etcd
- Raft-based systems

---

## 3️⃣ Consensus-Based Leader Election (Advanced)

Used in:

- Raft
- Paxos
- Kubernetes control plane

Features:

- Strong correctness guarantees
- Handles network partitions
- Complex to implement (usually not DIY)

---

## BASIC FLOW — Step by Step

![Image](https://learn.microsoft.com/en-us/azure/architecture/patterns/_images/leader-election-diagram.png)

![Image](https://java-design-patterns.com/assets/img/leader-election-sequence-diagram.abffb452.png)

```
Application starts
 ↓
Attempt leader election
 ↓
If elected:
   Perform leader tasks
Else:
   Run as follower
 ↓
Continuously monitor leadership
 ↓
Re-elect if leader fails
```

---

## SIMPLE EXAMPLE — Cron Job in Distributed App

### Problem

You have 5 instances of a service, but:

- Daily billing job must run **once**

### Without Leader Election ❌

```
5 instances → billing job runs 5 times
```

### With Leader Election ✅

```
Leader instance → runs billing job
Followers → do nothing
```

If leader dies:

- Another instance takes over
- Billing job still runs once

---

## CONCEPTUAL PSEUDO-CODE

```js
if (tryAcquireLeaderLock()) {
  role = "LEADER";
  runLeaderTasks();
} else {
  role = "FOLLOWER";
  waitAndMonitor();
}
```

On failure:

```js
if (leaderLockLost()) {
  retryLeaderElection();
}
```

---

## FAILURE HANDLING (VERY IMPORTANT)

### Leader crashes

- Lock expires
- New leader elected automatically

### Network partition

- Risk of **split brain**
- Mitigated by:

  - Strong lock systems
  - Short TTLs
  - Consensus algorithms

### Split brain (danger)

- Two leaders at once
- Causes data corruption
- Avoided with proper lock semantics

---

## LEADER ELECTION vs LOAD BALANCING (COMMON CONFUSION)

| Load Balancing    | Leader Election            |
| ----------------- | -------------------------- |
| Distributes work  | Centralizes coordination   |
| Many active nodes | One active leader          |
| Performance goal  | Correctness goal           |
| User traffic      | Background / control tasks |

They solve **opposite problems**.

---

## TRADE-OFFS (HONEST)

### Pros

- Prevents duplicate work
- Avoids conflicts
- Enables safe scheduling
- Automatic failover

### Cons

- Single coordination point
- Leader overload risk
- Requires reliable lock system
- Added complexity

Leader Election trades **parallelism** for **correctness**.

---

## BEST PRACTICES

- Keep leader tasks **small and fast**
- Use short lock TTLs + heartbeats
- Make leader operations idempotent
- Monitor leader health
- Avoid long blocking work in leader

---

## WHAT LEADER ELECTION IS NOT

❌ Not load balancing
❌ Not performance optimization
❌ Not a database primary by default
❌ Not required for every service

It is a **coordination primitive**, nothing more.

---

## REAL-WORLD USE CASES

- Kubernetes controllers
- Database primary election
- Distributed schedulers
- Message partition leadership
- Background job coordination

---

## FINAL MENTAL MODEL (LOCK THIS 🔒)

```
Everyone doing everything → chaos
One coordinator → order
```

Leader Election enforces **order in distributed systems**.

---

## ONE-LINE SUMMARY

> **Leader Election coordinates distributed systems by selecting exactly one instance to perform exclusive tasks, preventing conflicts and enabling automatic failover when that leader fails.**
