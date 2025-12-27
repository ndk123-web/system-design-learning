# 1️⃣ Key–Value Databases

![Image](https://www.scylladb.com/wp-content/uploads/Key-Value-Store-diagram-1-e1644958335886.png)

![Image](https://docs.cloud.sdu.dk/_images/diagram-kv-store.png)


## WHY Key–Value exists

**Problem SQL can’t solve well:**

- Ultra-low latency (microseconds)
- Massive concurrent access
- Simple access pattern: `get / set`
- Temporary or derived data

> You don’t need relations.
> You need **speed**.

---

## WHAT it is

- Data = **key → value**
- No schema
- No joins
- No queries (mostly)

Think of it as a **distributed hashmap**.

---

## HOW it works (high level)

```
Key
 → Hash function
 → Node selection
 → Memory / Disk
 → Return value
```

- Hash decides **which node**
- Value stored directly
- Reads/writes are O(1)

---

## TOOLS / PROVIDERS

- Redis (most common)
- Amazon DynamoDB
- etcd

---

## CODE EXAMPLE (Redis)

### Set + Get

```bash
SET user:123 "ndk"
GET user:123
```

### Session example

```bash
SET session:abc123 "{userId:1, role:'admin'}"
EXPIRE session:abc123 3600
```

---

## INTERNAL WORKING (Redis)

- Mostly **in-memory**
- Optional persistence (AOF / RDB)
- Single-threaded (event loop)
- Replication via master–replica
- Sharding via Redis Cluster

**Truth:**

> Redis is fast because it avoids locks and disk.

---

## WHEN TO USE

✅ Sessions
✅ Caching
✅ Rate limiting
❌ Financial records
❌ Complex queries

---

# 2️⃣ Document Databases

![Image](https://www.couchbase.com/blog/wp-content/uploads/2021/05/data-model-sql-to-json.png)

![Image](https://www.red-gate.com/simple-talk/wp-content/uploads/2023/12/word-image-100826-2.png)

![Image](https://www.scylladb.com/wp-content/uploads/document-store-database-diagram.png)

---

## WHY Document DB exists

SQL problem:

- Schema changes are painful
- Nested data is ugly
- JSON-heavy APIs mismatch tables

> Modern apps speak **JSON**, not rows.

---

## WHAT it is

- Data stored as **documents (JSON/BSON)**
- Each document is self-contained
- Schema-flexible
- Indexes supported

---

## HOW it works

```
Collection
 → Documents
 → Indexed fields
 → Query engine
```

- No joins (limited)
- Reads entire document
- Updates usually replace document

---

## TOOLS / PROVIDERS

- MongoDB
- CouchDB
- Amazon DocumentDB

---

## CODE EXAMPLE (MongoDB)

### Insert

```js
db.users.insertOne({
  name: "ndk",
  skills: ["backend", "system-design"],
  profile: { exp: 2, role: "engineer" },
});
```

### Query

```js
db.users.find({ "profile.role": "engineer" });
```

---

## INTERNAL WORKING

- Documents stored in BSON
- Indexes = B-Trees
- Sharding via shard key
- Replication via replica sets

**Hidden cost:**

> Large documents = heavy reads.

---

## WHEN TO USE

✅ User profiles
✅ Content systems
✅ Event data
❌ Strong transactions
❌ Cross-document joins

---

# 3️⃣ Wide-Column Databases

![Image](https://databasetown.com/wp-content/uploads/2023/01/Wide-Column-Database-Use-Cases-Example-Copy-2-min.jpg)

![Image](https://www.instaclustr.com/wp-content/uploads/2021/10/Cassandra-Partitions-Partition-and-Clustering-Key.png)

![Image](https://i.sstatic.net/rDWwy.png)

---

## WHY Wide-Column exists

Problem:

- Billions of writes
- Time-series data
- Global scale
- SQL can’t survive this load

> Writes must **never block**.

---

## WHAT it is

- Data stored by **partition key**
- Rows can have different columns
- Optimized for writes
- Query patterns decided upfront

---

## HOW it works

```
Partition Key → Node
Clustering Key → Sort
Write → Commit log → Memtable → SSTable
```

---

## TOOLS / PROVIDERS

- Apache Cassandra
- HBase
- Amazon DynamoDB (also wide-column style)

---

## CODE EXAMPLE (Cassandra)

```sql
CREATE TABLE events (
  user_id text,
  time timestamp,
  action text,
  PRIMARY KEY (user_id, time)
);
```

```sql
INSERT INTO events (user_id, time, action)
VALUES ('u1', now(), 'login');
```

---

## INTERNAL WORKING

- No master
- Consistent hashing
- Writes are append-only
- Tunable consistency (ONE, QUORUM, ALL)

**Truth:**

> Cassandra is optimized to **never say no**.

---

## WHEN TO USE

✅ Logs
✅ Metrics
✅ Time-series
❌ Ad-hoc queries
❌ Joins

---

# 4️⃣ Graph Databases

![Image](https://memgraph.com/images/blog/what-is-a-graph-database/nodes-and-edges.png)

![Image](https://memgraph.com/images/blog/graph-database-vs-relational-database/memgraph-graph-database-vs-relational-database.png)

![Image](https://www.yworks.com/assets/images/landing-pages/neo4j-database-visualization.c1c877444b.png)

---

## WHY Graph DB exists

Relational DB problem:

- Relationship queries are expensive
- JOIN explosion
- Social networks break SQL

> Relationships are first-class citizens.

---

## WHAT it is

- Nodes = entities
- Edges = relationships
- Traversal-optimized

---

## HOW it works

```
Node → Edge → Node → Edge
Traversal instead of joins
```

---

## TOOLS / PROVIDERS

- Neo4j
- Amazon Neptune

---

## CODE EXAMPLE (Neo4j)

```cypher
CREATE (a:User {name:'ndk'})
CREATE (b:User {name:'rahul'})
CREATE (a)-[:FRIEND]->(b);
```

```cypher
MATCH (a:User)-[:FRIEND]->(b)
RETURN b.name;
```

---

## INTERNAL WORKING

- Index-free adjacency
- Direct pointer traversal
- Graph stored as linked structures

**Strength:**

> Relationship depth doesn’t slow queries.

---

## WHEN TO USE

✅ Social networks
✅ Recommendation engines
❌ Simple CRUD
❌ High write throughput

---

# 🔥 FINAL TRUTH TABLE

| Type        | Speed  | Scale  | Consistency | Complexity |
| ----------- | ------ | ------ | ----------- | ---------- |
| Key-Value   | 🔥🔥🔥 | 🔥🔥   | ❌          | Low        |
| Document    | 🔥🔥   | 🔥     | ⚠️          | Medium     |
| Wide-Column | 🔥🔥🔥 | 🔥🔥🔥 | ❌          | High       |
| Graph       | 🔥     | ⚠️     | ⚠️          | High       |

---

## ONE REAL-WORLD ARCHITECTURE

```
PostgreSQL → truth
Redis → cache / sessions
MongoDB → flexible content
Cassandra → logs / metrics
```

No one uses **only one DB** in real systems.
