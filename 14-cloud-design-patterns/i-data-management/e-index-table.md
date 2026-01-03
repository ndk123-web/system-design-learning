## 📘 Database Index — Deep & Practical README

![Image](https://builtin.com/sites/www.builtin.com/files/styles/ckeditor_optimize/public/inline-images/1_b-tree-indexing.jpg)

---

## 🔹 One-Line Summary

> **An index is a separate, sorted data structure (usually a B-Tree) built on a table column that helps the database find rows in O(log N) time instead of scanning the entire table.**

---

## 1️⃣ WHAT is an Index?

An index is **NOT the table itself**.

- Table → stores actual rows (unordered)
- Index → stores **keys in sorted order + pointer to rows**

Think like this:

- **Table = unsorted pile of files**
- **Index = sorted register telling where each file is**

---

## 2️⃣ YOUR FIRST DOUBT (VERY IMPORTANT)

### ❓ “Jo index hum banate hain, kya us index pe B-Tree banta hai?”

### ✅ YES — EXACTLY

When you run:

```sql
CREATE INDEX idx_users_email ON users(email);
```

Internally DB creates:

```
users table           → raw rows
idx_users_email       → separate B-Tree
```

👉 **Index is a separate structure**, not inside the table.

---

## 3️⃣ SECOND DOUBT

### ❓ “Har index ke liye alag B-Tree hota hai?”

### ✅ YES. 100%.

Example:

```sql
CREATE INDEX idx_a  ON t(a);
CREATE INDEX idx_b  ON t(b);
CREATE INDEX idx_ab ON t(a, b);
```

Internally:

```
B-Tree #1 → idx_a
B-Tree #2 → idx_b
B-Tree #3 → idx_ab
```

Each one:

- Stored separately
- Maintained separately
- Updated separately on INSERT / UPDATE / DELETE

⚠️ **More indexes = slower writes**

---

## 4️⃣ HOW Index Lookup Actually Works

Index lookup is **NOT** direct O(1).

### Real flow:

```
Query
 ↓
Search inside B-Tree (log N)
 ↓
Reach leaf node
 ↓
Get pointer (row_id / page_id)
 ↓
Jump to table row (O(1))
```

So total time:

```
O(log N) + O(1) ≈ O(log N)
```

👉 **Search dominates**, not the jump.

---

## 5️⃣ BIG DOUBT CLEARED

### ❓ “Index directly row ko point karta hai, to O(1) kyun nahi?”

Because:

- Pointer is found **after searching the tree**
- Tree is sorted & balanced
- Searching sorted structure = **logarithmic**

If it were:

```
array[key] → row
```

Then yes, O(1).

But DB uses **B-Tree**, not arrays.

---

## 6️⃣ WHY DATABASE USES B-TREE (NOT HASH)

| Reason                   | B-Tree |
| ------------------------ | ------ |
| Disk-friendly            | ✅     |
| Range queries (`>`, `<`) | ✅     |
| Sorted order             | ✅     |
| Predictable performance  | ✅     |

Hash index:

- O(1) average
- ❌ No range queries
- ❌ Bad for disk
- ❌ Rarely default

That’s why **B-Tree is default**.

---

## 7️⃣ SINGLE-COLUMN INDEX

```sql
CREATE INDEX idx_users_email ON users(email);
```

Query:

```sql
SELECT * FROM users WHERE email = 'a@x.com';
```

✅ Index used
✅ Fast lookup

---

## 8️⃣ MULTI-COLUMN (COMPOSITE) INDEX

_(Your major confusion area)_

```sql
CREATE INDEX idx_users_country_age ON users(country, age);
```

Index is sorted like:

```
(country → age)
```

---

## 9️⃣ YOUR MAIN DOUBT ANSWERED

### ❓ “2 fields pe index hai, aur main 1 field se read karun — index lagega?”

### CASE 1️⃣ Query uses **leftmost column**

```sql
SELECT * FROM users WHERE country = 'IN';
```

✅ **YES — index is used**

---

### CASE 2️⃣ Query uses **both columns**

```sql
SELECT * FROM users WHERE country = 'IN' AND age = 25;
```

✅ **YES — best usage**

---

### CASE 3️⃣ Query uses **only second column**

```sql
SELECT * FROM users WHERE age = 25;
```

❌ **NO — index not used**

---

## 🔥 LEFTMOST PREFIX RULE (BURN THIS)

For index:

```
(a, b, c)
```

Index works for:

- `a`
- `a + b`
- `a + b + c`

Index does NOT work for:

- `b`
- `c`
- `b + c`

---

## 10️⃣ WHY LEFTMOST RULE EXISTS (LOGIC)

Composite index is stored like:

```
IN → 20
IN → 21
IN → 22
US → 18
US → 19
```

If you search only `age = 21`:

- DB doesn’t know where to start
- Must scan entire index
- So DB ignores it

---

## 11️⃣ INDEX COST (VERY IMPORTANT)

Indexes are **not free**.

Every write must:

- Update table
- Update ALL indexes

So:

```
Read speed ↑
Write speed ↓
```

That’s why:

> **Over-indexing kills write performance**

---

## 12️⃣ WHEN TO USE INDEX (REAL RULES)

Create index if:

- Column used in `WHERE`
- Column used in `JOIN`
- Column used in `ORDER BY`
- Table is read-heavy

Avoid index if:

- Table is write-heavy
- Column rarely queried
- Column has very low cardinality (boolean)

---

## 13️⃣ FINAL MENTAL MODEL (LOCK THIS)

```
Table = unordered data
Index = separate sorted B-Tree
Each index = its own B-Tree
Search tree (log N) → jump to row (O(1))
```

Or simply:

> **Index doesn’t remove searching.
> It makes searching cheap.**

---

## ✅ ONE-LINE TAKEAWAY

> Every index you create is stored as a separate B-Tree structure; the database must search this tree (O(log N)) to find the pointer to a row, which is why indexed lookups are fast but not O(1).
