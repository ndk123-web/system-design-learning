# How Discord Stores Trillions of Messages

A case study in evolving message storage: **MongoDB → Cassandra → ScyllaDB**, with a Rust data-services layer in between.

> Source: [Discord Engineering Blog (2023)](https://discord.com/blog/how-discord-stores-trillions-of-messages)

---

## Evolution at a Glance

| Phase | Era | Scale | Why they moved on |
|-------|-----|-------|-------------------|
| MongoDB | 2015–2016 | ~100M messages | Data + indexes exceeded RAM; latency became unpredictable |
| Cassandra | 2017–2022 | Billions → trillions | Hot partitions, GC pauses, compaction backlogs, high ops toil |
| ScyllaDB | 2022–present | Trillions | C++ / no GC, shard-per-core isolation, lower latency at smaller cluster size |

---

## Phase 1: MongoDB (2015)

Discord launched in 2015 on a **single MongoDB replica set**. The schema was intentionally kept portable so migration would be straightforward later.

By **November 2015** (~100 million messages), the working set and indexes no longer fit in RAM. Reads started hitting disk, and latency became erratic. MongoDB sharding was avoided as too complex and unstable for their needs.

**Migration to Cassandra** happened around **early 2017**.

---

## Phase 2: Cassandra (2017–2022)

Cassandra was chosen for horizontal scalability, fault tolerance, and relatively low maintenance — and it worked well for years.

| Year | Cluster size | Messages |
|------|-------------|----------|
| 2017 | 12 nodes | Billions |
| 2022 | 177 nodes | Trillions |

### Data model

Messages are partitioned by **channel ID + time bucket** (a fixed time window). All messages for a given channel and bucket live on the same partition and are replicated across nodes.

### Why Cassandra started to struggle

**1. Hot partitions**

- Cassandra uses an **LSM tree**: writes are cheap (append to memtable), reads are expensive (query memtable + multiple SSTables on disk).
- A small friend group sends far fewer messages than a server with hundreds of thousands of members.
- When many users read the same channel at once (e.g. after an `@everyone` announcement), one partition gets hammered with concurrent reads → **hot partition**.
- Latency on the affected node spikes; because reads use **quorum consistency**, the slowdown cascades to unrelated queries on those nodes.

**2. Compaction backlog**

- SSTable compaction fell behind under load.
- Ops ran a recurring **"gossip dance"**: take a node out of rotation to compact, bring it back, repeat until the backlog cleared.

**3. JVM garbage collection**

- Cassandra is written in **Java**. GC pauses caused latency spikes; in worst cases, consecutive long pauses required manual node reboots.
- Significant engineering time went into tuning GC and heap settings.

---

## Phase 3: Rust Data Services (before ScyllaDB cutover)

Discord suspected swapping the database alone would not fix hot-partition problems. They built **data services** — intermediary layers between the API monolith and the database, written in **Rust**.

### Request coalescing

When thousands of users request the **same row** at the same time (e.g. reading the same announcement in a large server):

1. The **first** request spins up a worker task that queries the database.
2. All **subsequent** identical requests subscribe to that same task instead of hitting the DB again.
3. One DB read → result **fanned out** to all subscribers.

**10,000 identical reads → 1 database read.**

### Consistent-hash routing

Requests for the same channel are routed to the **same data-service instance** (routing key = channel ID), so coalescing is effective across concurrent users.

This reduced load on Cassandra and bought time to prepare the ScyllaDB migration — but hot partitions still occurred, just less often.

---

## Phase 4: ScyllaDB (2022)

**ScyllaDB** is a Cassandra-compatible database written in **C++**:

- **No garbage collector** — manual memory management (`new` / `delete`) instead of JVM heap/GC pauses.
- **Shard-per-core architecture** — each CPU core owns a data shard and processes requests independently, limiting blast radius of a hot partition to one core.
- Same CQL API and data model → no schema rewrite required.

By 2020, Discord had migrated **all other Cassandra clusters** to ScyllaDB. The messages cluster (`cassandra-messages`) was the last holdout because of its size (~200 nodes, trillions of rows).

### Migration

| Approach | Estimated duration |
|----------|-------------------|
| ScyllaDB Spark migrator (initial plan) | ~3 months |
| Custom **Rust migrator** (extended from data-service library) | **~9 days** |

The Rust migrator:

- Reads Cassandra token ranges
- Checkpoints progress locally via SQLite
- Writes into ScyllaDB at up to **3.2 million messages/second**
- Ran with **zero downtime**; dual-writes during migration; automated read validation between both DBs

Migration completed in **May 2022**.

### Results

| Metric | Cassandra | ScyllaDB |
|--------|-----------|----------|
| Nodes | 177 | 72 |
| Disk per node | ~4 TB avg | 9 TB |
| p99 read latency (historical messages) | 40–125 ms | **15 ms** |
| p99 write latency | 5–70 ms | **5 ms** |

---

## Key Takeaways

1. **Access patterns matter as much as the database** — request coalescing turned thousands of identical reads into one DB query.
2. **Hot partitions are a data-model + traffic problem** — partitioning by channel means popular channels create hotspots regardless of node count.
3. **Language/runtime affects tail latency** — JVM GC pauses were a major source of Cassandra instability at Discord's scale.
4. **Plan for migration early** — Discord kept schemas portable across MongoDB → Cassandra → ScyllaDB, making each transition far cheaper.
5. **Custom tooling beats generic when scale demands it** — a Rust migrator cut a 3-month estimate down to ~9 days.
