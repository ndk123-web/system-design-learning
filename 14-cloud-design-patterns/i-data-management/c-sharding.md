# Database Sharding — Real System Design (From Zero to Scale)

## One-Line Summary

Sharding is a scaling technique where you manually create multiple independent databases with the same schema, and the application decides which database to use for each request using a routing rule (shard key).

![Image](https://substackcdn.com/image/fetch/%24s_%21pFd9%21%2Cf_auto%2Cq_auto%3Agood%2Cfl_progressive%3Asteep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1abf2943-92a8-479a-82c2-769ec96a5513_2366x1314.png)

## 1. WHAT (What is Sharding — very clearly)

Sharding means:

> Instead of storing all rows of a table in one database, you split those rows across multiple databases.

Each shard:

- Is a **separate database**
- Has the **same tables**
- Stores **different rows**
- Runs independently

Example:
Instead of:

```

1 database → 100 million users

```

You do:

```

10 databases → 10 million users each

```

---

## 2. IMPORTANT CLARITY (Your biggest doubt)

### ❓ Is sharding database-wise or table-wise?

### ✅ Correct answer:

> **You create multiple databases.  
> Inside each database, you create the SAME tables.**

You do **NOT** create:

```

users_shard_1 table
users_shard_2 table

```

You create:

```

Database: users_db_1
└── users table

Database: users_db_2
└── users table

Database: users_db_3
└── users table

```

👉 **Shard = Database**

---

## 3. WHY (Why sharding is needed)

A single database eventually hits limits:

- CPU
- Disk I/O
- Index size
- Write contention
- Connection limits

Vertical scaling stops working.

Sharding allows:

- Horizontal write scaling
- Data isolation
- Partial failure tolerance

---

## 4. HOW SHARDING IS DESIGNED (Actual flow)

### Step 1: Choose a shard key

Shard key = value used to decide **which database** to use.

Common shard keys:

- `user_id`
- `tenant_id`
- `account_id`
- `country_code` (geo-sharding)

Rule:

> Most queries MUST include the shard key.

---

### Step 2: Create shard databases

Example (geo-sharding):

```

users_db_IN
users_db_US
users_db_EU

```

Each database has the same schema:

```sql
users
orders
sessions
```

---

### Step 3: Store DB connection URLs in app

```text
DB_IN_URL = postgres://...
DB_US_URL = postgres://...
DB_EU_URL = postgres://...
```

---

### Step 4: Routing logic (THIS IS THE CORE)

Application decides the shard.

Example:

```text
if country == IN → connect users_db_IN
if country == US → connect users_db_US
```

Database itself does NOT know about sharding.

---

## 5. READ & WRITE FLOW (Very important)

### WRITE FLOW

```
User signs up (user_id=9821, country=IN)
↓
App decides shard = IN
↓
Connect to users_db_IN
↓
INSERT INTO users ...
```

---

### READ FLOW

```
GET /users/9821
↓
App finds shard using user_id or country
↓
Connect to correct DB
↓
SELECT ...
```

Only **one database** is queried.

---

## 6. SCALING A SHARD (Your BIGGEST doubt)

### Problem:

```
users_db_IN is getting full / hot
```

### ❌ Wrong approach:

```
users_db_IN_2 and randomly route
```

This breaks predictability.

---

### ✅ Correct approach: SUB-SHARDING

You convert:

```
Shard: IN
```

Into:

```
Shard Group: IN
  ├── users_db_IN_1
  ├── users_db_IN_2
  ├── users_db_IN_3
```

Now routing becomes **two-level**:

```
country → IN group
user_id hash → specific IN DB
```

Example:

```text
shard = hash(user_id) % 3
```

This is **real production design**.

---

## 7. ROUTING LAYER (Why this matters)

The application should think:

```
"India user"
```

The routing layer decides:

```
Which exact DB?
```

Shard names should NEVER appear in business logic.

---

## 8. PRIMARY–REPLICA INSIDE EACH SHARD

Each shard database usually has:

```
Primary (writes)
Replica (reads)
Replica (reads)
```

So final structure looks like:

```
ShardGroup_IN
  ├── users_db_IN_1 (Primary + Replicas)
  ├── users_db_IN_2 (Primary + Replicas)
  └── users_db_IN_3 (Primary + Replicas)
```

- Writes → Primary
- Reads → Replicas
- Failover → promote replica

This gives **availability + read scaling**.

---

## 9. WHAT SHARDING DOES NOT GIVE YOU

❌ Cross-shard joins
❌ Global transactions
❌ Easy schema changes
❌ Simple queries

Sharding trades **simplicity for scale**.

---

## 10. COMMON MISTAKES (Production killers)

❌ Sharding too early
❌ Wrong shard key
❌ Queries without shard key
❌ Country-only sharding without sub-shards
❌ Exposing shard names in code

Rule:

> Changing shard strategy later is extremely expensive.

---

## 11. FINAL MENTAL MODEL (This must stick)

```
Shard = Database
Same schema everywhere
App decides routing
Shard key is permanent
Scale comes with complexity
```

---

## FINAL TAKEAWAY

Sharding is not a database feature.
Sharding is an **application-level architecture decision** where you manually manage multiple databases and route traffic intelligently to scale beyond a single database’s limits.

Use it only when you truly need it.

```

---

### Where you stand now (important)

You now understand:
- Shard = database (not table name)
- How routing actually works
- How geo-sharding scales further
- How replication fits inside sharding
- Why shard strategy must be future-proof

You are officially past **interview-level sharding** and into **production-level sharding**.

---

### Next *real* hard topics (pick one)

1️⃣ **Resharding existing users without downtime**
2️⃣ **Shard map vs hash routing (deep trade-offs)**
3️⃣ **Cross-shard queries (how companies avoid them)**

Just tell me which one.
```
