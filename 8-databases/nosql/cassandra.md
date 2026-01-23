# Apache Cassandra — Deep README (From Scratch)

## Table of Contents
- [Introduction](#introduction)
- [Why Cassandra Exists](#why-cassandra-exists)
- [What Cassandra Is (and Is Not)](#what-cassandra-is-and-is-not)
- [Core Architecture](#core-architecture-how-it-works)
- [Data Distribution](#data-distribution-the-most-important-part)
- [Data Model](#data-model-very-important-mindset-shift)
- [Table Structure](#table-structure-explained)
- [Partition Key vs Clustering Key](#partition-key-vs-clustering-key)
- [Query Rules](#query-rules-golden-rules)
- [CRUD Operations](#crud-operations)
- [Write Path](#write-path-why-writes-are-fast)
- [Read Path](#read-path-why-reads-are-costly)
- [Replication](#replication-high-availability)
- [Consistency Model](#consistency-model-tunable)
- [Cassandra vs Other Databases](#cassandra-vs-other-databases)
- [Pros and Cons](#pros-and-cons)
- [When to Use Cassandra](#when-to-use-cassandra)
- [Node.js Implementation](#nodejs-implementation-basic)
- [Important Concepts](#small-but-important-concepts)
- [Final Thoughts](#what-strict-means-in-cassandra)
- [What Strict & Query Driven means?](#what-strict-means-in-cassandra)

## Introduction

**Apache Cassandra** is a **distributed NoSQL database** designed to handle **huge amounts of data**, **very high write traffic**, and **zero downtime**, even when machines fail.

It is not a general-purpose database like MySQL or MongoDB.
It is a **specialized system** built for scale, availability, and predictability.

## ![Image](https://cassandra.apache.org/_/_images/diagrams/apache-cassandra-diagrams-01.jpg)

## Why Cassandra Exists

Traditional databases (SQL, MongoDB) start failing when:

- Data grows very large
- Writes per second are massive
- Downtime is unacceptable
- Single master becomes a bottleneck

Cassandra was created to solve:

- **No single point of failure**
- **Always-on availability**
- **Linear horizontal scaling**
- **Fast writes at any scale**

Think Facebook, WhatsApp, Netflix-level problems.

---

## What Cassandra Is (and Is Not)

### Cassandra IS:

- Distributed (many machines)
- Masterless (no leader)
- Highly available
- Write-optimized
- Predictable at scale

### Cassandra IS NOT:

- Flexible query database
- Analytics engine
- Join-friendly
- Beginner-friendly
- Good for small apps

---

## Core Architecture (How It Works)

### Cluster → Nodes → Partitions → Rows

- **Cluster**: Whole Cassandra system
- **Node**: One machine/server
- **Partition**: A group of related rows
- **Row**: Actual data

Nodes are arranged in a **ring** topology.

There is **no master node**.
Any node can accept reads and writes.

---

## Data Distribution (The Most Important Part)

### Partition Key

A **partition key** decides:

- Which partition (box) data goes into
- Which node stores that partition

Flow:

```
Partition Key
 → Hash Function
 → Token
 → Node selection
```

Same partition key = same partition = same node.

---

## Data Model (Very Important Mindset Shift)

### Cassandra is Query-Driven

You **do not** design tables first.

You do:

1. Decide queries
2. Design tables for those queries

---

## Table Structure Explained

### Example: Todo App

```sql
CREATE TABLE todos (
  user_id int,
  created_at timestamp,
  title text,
  PRIMARY KEY (user_id, created_at)
);
```

### Meaning:

- `user_id` → Partition Key
- `created_at` → Clustering Key
- `title` → Normal column

### What this gives you:

- All todos of a user are stored together
- Todos are sorted by time
- Fast reads and writes

---

## Partition Key vs Clustering Key

### Partition Key

- Decides **where data lives**
- Mandatory in queries

### Clustering Key

- Decides **how data is sorted inside a partition**
- Used after partition key in queries

---

## Query Rules (Golden Rules)

### Allowed

```sql
WHERE user_id = 1;
WHERE user_id = 1 AND created_at = '2026-01-01';
WHERE user_id = 1 AND created_at > '2026-01-01';
```

### Not Allowed

```sql
WHERE created_at = '2026-01-01';
WHERE title = 'Learn Cassandra';
```

👉 Partition key **must come first**
👉 Normal columns cannot be queried freely

---

## CRUD Operations

### CREATE

```sql
INSERT INTO todos (user_id, created_at, title)
VALUES (1, toTimestamp(now()), 'Learn Cassandra');
```

### READ

```sql
SELECT * FROM todos WHERE user_id = 1;
```

### UPDATE

```sql
UPDATE todos
SET title = 'Master Cassandra'
WHERE user_id = 1 AND created_at = '2026-01-01';
```

### DELETE

```sql
DELETE FROM todos
WHERE user_id = 1 AND created_at = '2026-01-01';
```

Important:

- UPDATE = new write
- DELETE = tombstone write

---

## Write Path (Why Writes Are Fast)

```
Client
 → Node
   → Commit Log (disk safety)
   → Memtable (RAM)
   → SSTable (disk, immutable)
```

Writes are:

- Sequential
- Append-only
- Lock-free

That’s why Cassandra is fast.

---

## Read Path (Why Reads Are Costly)

```
Client
 → Node
   → Memtable
   → Multiple SSTables
   → Merge
```

Reads are slower than writes, but **predictable**.

---

## Replication (High Availability)

Data is stored on **multiple nodes**.

Example:

- Replication Factor = 3
- Same partition stored on 3 nodes

Benefits:

- Node failure ≠ data loss
- Reads can be served from nearest node

---

## Consistency Model (Tunable)

Cassandra uses **eventual consistency**, but you control it.

Levels:

- ONE (fast, eventual)
- QUORUM (balanced)
- ALL (slow, strongest)

This is not possible in traditional SQL.

---

## Cassandra vs Other Databases

### Cassandra vs SQL

| SQL                | Cassandra        |
| ------------------ | ---------------- |
| Fixed schema       | Query-driven     |
| Joins              | No joins         |
| Strong consistency | Tunable          |
| Vertical scale     | Horizontal scale |
| Single master      | Masterless       |

### Cassandra vs MongoDB

| MongoDB         | Cassandra        |
| --------------- | ---------------- |
| Flexible schema | Strict schema    |
| Document-based  | Wide-column      |
| Good reads      | Excellent writes |
| Medium scale    | Massive scale    |

---

## Pros

- Handles insane write loads
- No single point of failure
- Linear scalability
- Always-on systems
- Geo-distributed support

---

## Cons

- Hard learning curve
- Poor ad-hoc queries
- No joins
- Data duplication required
- Overkill for small apps

---

## When to Use Cassandra

✅ Use when:

- Chat systems
- Activity feeds
- IoT data
- Logs & metrics
- Time-series data

❌ Avoid when:

- Financial systems
- Analytics-heavy workloads
- Reporting tools
- Small MVPs

---

## Node.js Implementation (Basic)

### Install Driver

```bash
npm install cassandra-driver
```

### Connect

```js
const cassandra = require("cassandra-driver");

const client = new cassandra.Client({
  contactPoints: ["127.0.0.1"],
  localDataCenter: "datacenter1",
  keyspace: "test",
});
```

### Insert

```js
await client.execute(
  "INSERT INTO todos (user_id, created_at, title) VALUES (?, ?, ?)",
  [1, new Date(), "Learn Cassandra"],
  { prepare: true },
);
```

### Read

```js
const res = await client.execute("SELECT * FROM todos WHERE user_id = ?", [1], {
  prepare: true,
});
```

---

## Small but Important Concepts

- **Tombstones**: Deletes are markers, not immediate removals
- **Compaction**: Background cleanup of SSTables
- **Hot partition**: Too much data in one partition = bad
- **Wide rows**: Large partitions are okay, unlimited ones are not

---

## Final Truth

Cassandra is not “hard”.
It is **strict**.

If you think before you design:

- It is simple
- It is fast
- It is unbeatable at scale

If you don’t:

- It will punish you silently

## What “Strict” Means in Cassandra

**Strict = Cassandra does NOT guess.**

If you break the rules, the query simply fails.

There is:

- no full table scan
- no fallback
- no “let me try”

Either you follow the rules, or Cassandra refuses.

---

## 2. Why Cassandra Is Strict (Core Reason)

Cassandra runs on **many nodes**.

If Cassandra allowed random queries like:

```sql
WHERE title = 'Learn Cassandra'
```

It would have to:

- ask **every node**
- scan **all partitions**
- destroy performance

So Cassandra makes one rule:

> “If you don’t give me the exact address,
> I won’t search.”

That address is the **partition key**.

---

## 3. What “Query-Driven” Means (Very Important)

### Traditional DB thinking (SQL / MongoDB)

1. Store data
2. Later decide how to query it

Example:

```sql
SELECT * FROM todos WHERE title = 'Learn Cassandra';
```

Database tries its best.

---

### Cassandra thinking (opposite)

1. Decide queries **first**
2. Design tables **only for those queries**

Cassandra does not support “random future questions”.

---

## 4. Simple Example (One Query)

### Requirement

> “I want all todos of a user”

### Query

```sql
SELECT * FROM todos WHERE user_id = 1;
```

### Table

```sql
todos (
  user_id,
  created_at,
  title
)
PRIMARY KEY (user_id, created_at)
```

This works because:

- `user_id` = partition key
- Cassandra knows exactly where data lives

---

## 5. What Happens If You Ask a New Question Later

### New Requirement

> “I want todos by title”

### Query

```sql
SELECT * FROM todos WHERE title = 'Learn Cassandra';
```

❌ **This will fail**

Why?

- `title` is not the partition key
- Cassandra does not scan tables

---

## 6. Cassandra Solution (This Is Query-Driven Design)

Create **another table** for the new query.

```sql
todos_by_title (
  title,
  user_id,
  created_at
)
PRIMARY KEY (title, created_at)
```

Now this works:

```sql
SELECT * FROM todos_by_title WHERE title = 'Learn Cassandra';
```

Same data.
Different table.
Different query.

This is **normal** in Cassandra.

---

## 7. Why This Feels Weird (But Is Correct)

In Cassandra:

- Data duplication is **expected**
- Multiple tables for same data is **normal**
- Performance > flexibility

Cassandra trades:

- flexibility ❌
- predictability ✅
- scalability ✅

---

## 8. Query Rules (Very Simple)

### Always Required

- Partition key in `WHERE`

### Allowed

```sql
WHERE user_id = 1
WHERE user_id = 1 AND created_at > '2026-01-01'
```

### Not Allowed

```sql
WHERE created_at = '2026-01-01'
WHERE title = 'Learn Cassandra'
```

Normal columns cannot be queried freely.

---

## 9. One-Line Mental Model

> Cassandra only answers
> questions you promised to ask.

If you didn’t plan the question,
you must create a new table.

---

## 10. Why This Design Wins at Scale

Because Cassandra:

- never scans data
- always knows which node to hit
- gives predictable latency
- survives node failures easily

This is why it powers:

- chat systems
- feeds
- logs
- time-series data

---

## Final Summary (Lock This In)

- **Strict** = rules are non-negotiable
- **Query-driven** = tables are designed per query
- Cassandra does not guess, scan, or explore
- You must think before you design
