# ⭐ Availability Patterns (System Design – Core)

## 🔵 1. WHY (Why availability patterns exist)

Reality:

- Servers fail
- Disks crash
- Network breaks
- Regions go down

But users expect:

- App always working
- No downtime
- Fast recovery

👉 **Availability patterns are design techniques to keep the system UP despite failures.**

---

## 🔵 2. WHAT (What are Availability Patterns?)

> **Availability patterns are architectural strategies used to minimize downtime and keep a system operational when components fail.**

They answer:

- What happens when a server goes down?
- Who takes over?
- How fast recovery happens?
- Does user notice failure or not?

---

# 🔥 PATTERN 1 — FAILOVER

---

## 🟢 What is Failover?

> When a component fails, **another component automatically takes over**.

---

## 🔹 Active–Passive Failover

### WHAT

- One node is active
- One node is standby (idle)

### HOW

- Passive waits
- If active fails → passive becomes active

### EXAMPLE

- Primary DB + standby DB
- One API server live, backup sleeping

### PROS

- Simple
- Easy consistency
- Cheap

### CONS

- Passive resources wasted
- Small downtime during switch

### USE WHEN

- Strong consistency needed
- Low traffic
- Cost sensitive

---

## 🔹 Active–Active Failover

### WHAT

- Multiple nodes active at same time
- All serve traffic

### HOW

- Load balancer distributes traffic
- If one fails → others continue

### EXAMPLE

- Multiple API servers
- Multi-region web apps

### PROS

- No downtime
- Full resource usage
- Highly available

### CONS

- Hard consistency
- Complex conflict resolution
- Costly

### USE WHEN

- High traffic
- Zero downtime requirement

---

# 🔥 PATTERN 2 — REPLICATION

---

## 🟢 What is Replication?

> Maintaining **multiple copies of data** across nodes.

---

## 🔹 Master–Slave (Leader–Follower)

### WHAT

- One master handles writes
- Slaves handle reads

### HOW

- Writes → master
- Data replicated to slaves
- Slaves catch up

### EXAMPLE

- MySQL primary + replicas
- PostgreSQL leader + replicas

### PROS

- Simple
- Strong write consistency
- Easy recovery

### CONS

- Master is bottleneck
- Failover needed if master dies

---

## 🔹 Master–Master (Multi-Leader)

### WHAT

- Multiple nodes can accept writes

### HOW

- Each node replicates writes to others
- Conflict resolution needed

### EXAMPLE

- Multi-region databases
- Distributed NoSQL systems

### PROS

- High availability
- Writes accepted anywhere

### CONS

- Conflicts
- Complex logic
- Eventual consistency

---

# 🔥 PATTERN 3 — AVAILABILITY “NINES”

---

## 🟢 What do 99.9%, 99.99% mean?

They represent **allowed downtime per year**.

### 99.9% (3 Nines)

- Downtime ≈ **8.7 hours/year**

### 99.99% (4 Nines)

- Downtime ≈ **52 minutes/year**

### 99.999% (5 Nines)

- Downtime ≈ **5 minutes/year**

👉 Each extra 9 = **10x harder + 10x cost**

---

## 🔵 LOGIC

- 3 nines → basic redundancy
- 4 nines → active-active + monitoring
- 5 nines → multi-region + automation

---

# 🔥 PATTERN 4 — AVAILABILITY IN PARALLEL vs SEQUENCE

---

## 🟢 Sequential Availability (AND)

### WHAT

System works **only if ALL components work**

### FORMULA

```
A = A1 × A2 × A3
```

### EXAMPLE

- API → Auth → DB
- All must be up

### RESULT

- Availability decreases fast
- One failure = total failure

---

## 🟢 Parallel Availability (OR)

### WHAT

System works if **ANY ONE component works**

### FORMULA

```
A = 1 − (1−A1)(1−A2)
```

### EXAMPLE

- Multiple API servers
- Multiple DB replicas

### RESULT

- Availability increases
- Failure tolerated

---

## 🔵 REAL INSIGHT

**High availability systems maximize parallelism and minimize sequential dependencies.**

---

# ⭐ FINAL MEMORY KEYS (LOCK THESE)

- **Failover** = who takes over when one fails
- **Active–Passive** = one works, one waits
- **Active–Active** = all work together
- **Replication** = multiple data copies
- **Master–Slave** = simple, consistent
- **Master–Master** = complex, available
- **3 nines vs 4 nines** = allowed downtime
- **Parallel > Sequential** for availability

---

## 🎯 Interview one-liner (very strong)

> _“Availability patterns like failover, replication, and parallel redundancy are used to minimize downtime and achieve higher nines of availability, with trade-offs in complexity, cost, and consistency.”_
