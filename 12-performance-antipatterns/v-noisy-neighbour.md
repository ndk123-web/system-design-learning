# 📘 Noisy Neighbor (System Design Antipattern)

## WHAT IS A NOISY NEIGHBOR

> **Noisy Neighbor** means
> jab **shared resources** (CPU, memory, disk, network) par
> **ek component disproportionate load** daal deta hai,
> aur baaki components suffer karte hain.

Simple words mein:

> **Ek bad actor sabko slow bana deta hai.**

---

## WHY NOISY NEIGHBOR IS DANGEROUS

Because:

- Issue kisi ek component mein hota hai
- Impact **poore system** pe padta hai
- Debug karna mushkil hota hai
- Random latency spikes aate hain

Worst part:

> **Well-behaved services bhi slow ho jaati hain.**

---

## WHERE NOISY NEIGHBOR HAPPENS (VERY COMMON)

Noisy neighbor tab hota hai jab **resources shared hote hain**:

- Shared VM
- Shared database
- Shared Kubernetes node
- Shared disk
- Shared network bandwidth

---

## HOW NOISY NEIGHBOR HAPPENS (COMMON SCENARIOS)

---

### 1️⃣ SHARED SERVER – CPU / MEMORY

One user / process:

- Heavy computation
- Infinite loop
- Memory leak

Consumes:

- 80–90% CPU
- Most RAM

Result:

- Other apps starve
- Context switching increases
- Latency spikes

---

### 2️⃣ SHARED DISK / I/O (VERY PAINFUL)

One process:

- Heavy batch job
- Full table scan
- Log writes

Consumes:

- Disk IOPS
- Disk bandwidth

Result:

- Other queries wait
- DB latency explodes
- Timeouts

---

### 3️⃣ SHARED DATABASE

One service:

- Runs expensive queries
- No index
- Large reports

Result:

- Locks
- Buffer cache eviction
- Other services slow

👉 **Most common noisy neighbor in production**

---

### 4️⃣ SHARED NETWORK

One app:

- Big file upload/download
- Streaming
- Backup job

Consumes:

- Network bandwidth

Result:

- Increased latency
- Packet loss
- Other services slow

---

### 5️⃣ KUBERNETES / CONTAINERS

Multiple pods on same node.

One pod:

- CPU spike
- Memory spike

Result:

- Node pressure
- Other pods throttled or killed

---

## REAL EXAMPLE (VERY REALISTIC)

### Scenario: Multi-tenant SaaS

- 100 customers
- Same DB
- Same app cluster

One customer:

- Runs heavy analytics query
- Full table scan

Result:

- DB CPU spikes
- Cache evicted
- All customers see slow app

👉 **One customer = noisy neighbor**

---

## SYMPTOMS OF NOISY NEIGHBOR

You’ll see:

- Random latency spikes
- Performance degradation without code deploy
- One metric spiking while others look normal
- “Works fine sometimes” complaints

---

## FIXES / SOLUTIONS (IMPORTANT)

---

### 1️⃣ RESOURCE ISOLATION (BEST FIX)

Don’t share critical resources blindly.

Examples:

- Separate DB for heavy workloads
- Separate node pool
- Separate disk
- Separate network limits

Isolation > optimization.

---

### 2️⃣ RESOURCE LIMITS & QUOTAS

In containers / K8s:

- CPU limits
- Memory limits
- I/O limits

Example:

- One pod cannot use more than X CPU

This prevents one component from starving others.

---

### 3️⃣ RATE LIMITING

Limit:

- Requests per user
- Queries per service
- Bandwidth usage

Stops abuse (intentional or accidental).

---

### 4️⃣ PRIORITIZATION & QoS

- High-priority services get resources first
- Background jobs throttled

Example:

- User traffic > analytics jobs

---

### 5️⃣ WORKLOAD SEPARATION

Split workloads:

- OLTP (transactions)
- OLAP (analytics)

Example:

- Primary DB → app traffic
- Replica / warehouse → analytics

---

### 6️⃣ MONITORING & ALERTING

You can’t fix what you can’t see.

Monitor:

- Per-tenant metrics
- Per-pod CPU/memory
- Per-query DB metrics

Detect noisy neighbors early.

---

## LOGIC (CORE IDEA)

Ask this question:

> **“Can one actor slow down everyone else?”**

If yes:

- You have a noisy neighbor risk.

---

## COMMON MISTAKE

❌ Assume fair usage
❌ Assume users behave well
❌ Assume OS will magically handle it

✔️ **Design for isolation explicitly**

---

## CONCEPTUAL MENTAL MODEL (LOCK THIS)

```
Shared resources
  + Unbounded usage
  = Noisy neighbor
```

Or simply:

> **Shared without limits = shared pain**

---

## FINAL ONE-LINE SUMMARY

> **Noisy neighbor is a system design problem where one component overuses shared resources, degrading performance for other components sharing the same infrastructure.**
