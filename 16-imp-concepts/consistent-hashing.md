# 📘 Consistent Hashing

![Image](https://www.researchgate.net/publication/328161011/figure/fig3/AS%3A679664318156801%401539056009124/Consistent-hash-ring-and-forwarding-process.png)

---

## 0️⃣ One-line intuition (lock this first)

> **Consistent Hashing ek stable rule hai jo batata hai
> “ye key kis shard pe jaayegi”,
> aur shard badhne/ghatne pe sirf thoda data move karta hai.**

---

## 1️⃣ WHY (ye problem kyun aayi)

Hume chahiye:

- millions of users
- multiple database shards
- load evenly distributed
- scaling ke time system na toote

Naive idea:

```text
shard = userId % N
```

![Image](https://substackcdn.com/image/fetch/%24s_%212Bh4%21%2Cf_auto%2Cq_auto%3Agood%2Cfl_progressive%3Asteep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb6a01929-75d6-4885-a400-602f588b0f69_1636x1362.png)

### Problem

- N change hua (2 → 4)
- almost **saare users ka shard change**
- data wrong shard pe
- production outage

👉 **Modulo hashing scale pe fail hota hai**

---

## 2️⃣ WHAT (Consistent Hashing kya hai)

> **Consistent Hashing ek technique hai jisme:**

- keys aur nodes dono ko ek **imaginary ring** pe map kiya jaata hai
- key apne **clockwise next node** pe jaati hai
- node add/remove hone pe **sirf nearby keys shift hoti hain**
  ![Image](https://assets.bytebytego.com/diagrams/0373-top-4-data-sharding-algorithms-explained.png)

---

## 3️⃣ CORE IDEA (sabse important)

> **Same input + same logic + same metadata
> = hamesha same shard**

Isme randomness nahi hota.
Pure deterministic math hota hai.

---

## 4️⃣ HOW (step-by-step flow)

```
Key (userId / objectId)
   |
hash(key)
   |
Ring pe position
   |
Clockwise next node
   |
That node = DB shard
```

---

## 5️⃣ HASH FUNCTION KYA KARTA HAI? (tumhara doubt #1)

### Example code

```cpp
hash<string> h;
size_t value = h("user_123");
```

### Meaning (simple)

- string → **ek bada integer number**
- deterministic:

  ```
  hash("user_123") → hamesha same number
  ```

### Range

- usually `0` to `2^64 - 1`
- exact range matter nahi karti
  **sirf ordering matter karti hai**

### Important

❌ ye shard number nahi
✅ ye **ring pe ek position** hai

---

## 6️⃣ RING KYA HAI? (visualise karo)

Imagine ek circle:

```
0 ---------------------------- MAX
```

Is circle pe:

- **DB shards** bhi points hain
- **Keys** bhi points hain

Rule:

> key apne baad wale (clockwise) shard pe jaati hai

---

## 7️⃣ REPLICAS / VIRTUAL NODES KYUN? (tumhara doubt #2)

### Pehle clear karo

❌ Node_A, Node_B services nahi
✅ Ye **DB shards / machines** hain

Example:

```
Node_A → DB shard A
Node_B → DB shard B
Node_C → DB shard C
```

---

### Replicas ka matlab

```text
Node_A → Node_A_0, Node_A_1, Node_A_2
```

Ye:

- same DB shard ko represent karte hain
- ring pe multiple jagah rakhte hain

### Kyun?

Without replicas:

- ring uneven hoti
- kuch shards pe zyada load

With replicas:

- ring evenly filled
- load balanced
- hot shards kam

👉 **Replicas = load-balancing trick**

---

## 8️⃣ REAL DATABASE SHARDING FLOW

```
Service (stateless)
   |
Shard Router (consistent hashing)
   |
DB Shards
```

Important rules:

- Service kabhi `% N` nahi karta
- Service ko shard count nahi pata
- Shard routing ek **shared library / layer** hoti hai

---

## 9️⃣ “NEXT SHARD CRASH HO GAYA TO?” (tumhara doubt #3)

### Truth (lock this)

> **Consistent hashing routing batata hai,
> fault-tolerance alag layer hoti hai**

---

### Industry Solution 1️⃣ — Replication (most common)

```
Shard A → A1 (primary), A2 (replica)
```

Flow:

```
hash(key) → Shard A
A1 down → use A2
```

---

### Industry Solution 2️⃣ — Successor nodes

Advanced systems:

- agar shard down
- to **next clockwise shard** try karo

Used in:

- Cassandra
- DynamoDB

---

## 10️⃣ “GALAT SHARD” KAB MILTA HAI?

Consistent hashing **kabhi galat shard nahi deta**
jab tak:

1. same key use ho
2. same hashing logic ho
3. same shard metadata ho

Agar issue aaya:

- ❌ read/write different logic
- ❌ config mismatch
- ❌ migration mistake

Problem system ka hota hai, hashing ka nahi.

---

## 11️⃣ MODULO vs CONSISTENT HASHING (final comparison)

| Aspect          | Modulo (`% N`)  | Consistent Hashing |
| --------------- | --------------- | ------------------ |
| Scale           | ❌ breaks       | ✅ safe            |
| Node add/remove | ❌ massive move | ✅ minimal move    |
| Used in prod    | ❌              | ✅                 |
| Stability       | ❌              | ✅                 |

---

## 🔑 FINAL LOCK (NDK-Way)

- `hash<string>`
  → deterministic number deta hai
- Ring
  → ordering space hai
- Replicas
  → load balance ke liye
- Consistent hashing
  → **stable routing**
- Replication
  → **reliability**

> **Consistent hashing = routing
> Replication = safety
> Dono saath hone chahiye**

---

## 🧠 One-line takeaway

> **Consistent hashing galat shard nahi deta —
> galat coordination deta hai.**
