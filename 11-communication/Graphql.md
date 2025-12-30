# 📘 GraphQL — System Design Explanation

## 1️⃣ WHY GraphQL EXISTS (ROOT PROBLEM)

REST APIs mein common problems aate hain:

### ❌ Over-fetching

```http
GET /users/1
```

Server bhej deta hai:

- name
- email
- address
- orders
- preferences
  (Client ko sirf `name` chahiye tha)

---

### ❌ Under-fetching

Client ko chahiye:

- user
- user ke orders
- orders ke products

REST mein:

```
GET /users/1
GET /users/1/orders
GET /orders/99/products
```

Multiple requests → latency ↑

---

### ❌ Fixed responses

REST endpoints:

- Server decide karta hai kya data milega
- Client adjust karta rehta hai

👉 Frontend teams frustrated ho jaate hain.

---

### Core desire

> **“Client khud decide kare
> kya data chahiye, kitna chahiye, kaunsa relation chahiye.”**

👉 **GraphQL exists to give control to the client.**

---

## 2️⃣ WHAT IS GraphQL

**GraphQL** is:

> A **query language + runtime** for APIs
> where the **client specifies the exact shape of data it needs**,
> and the server returns **only that data**.

Important clarifications:

- GraphQL is **NOT a database**
- GraphQL is **NOT a protocol**
- GraphQL usually runs over **HTTP**
- One endpoint, many queries

---

## 3️⃣ HOW GraphQL WORKS (BIG PICTURE)

```
Client
 → sends query (what data it wants)
 → Server
   → validates query against schema
   → resolves fields
   → returns exact shape
 → Client
```

Key idea:

> **Client asks questions, server answers.**

---

## 4️⃣ SINGLE ENDPOINT MODEL (YOUR OBSERVATION ✔️)

Tumne jo bola:

> “Ek hi endpoint tha, jitna data chahiye utna deta tha”

✔️ Bilkul sahi.

Example:

```
POST /graphql
```

Sab queries, mutations, subscriptions — **isi endpoint pe**.

REST ke opposite:

- REST → many endpoints
- GraphQL → single endpoint

---

## 5️⃣ GRAPHQL SCHEMA (BACKBONE)

GraphQL server pe pehle **schema** define hota hai.

Example schema:

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  orders: [Order]
}

type Order {
  id: ID!
  total: Int!
}

type Query {
  user(id: ID!): User
}
```

### Meaning:

- `type` → data shape
- `Query` → read operations
- Schema = **contract**

Client schema ke bahar kuch nahi maang sakta.

---

## 6️⃣ GRAPHQL QUERY (CLIENT SIDE)

```graphql
query {
  user(id: 1) {
    name
    orders {
      total
    }
  }
}
```

### What client wants:

- user ka `name`
- user ke `orders.total`

### Server response:

```json
{
  "data": {
    "user": {
      "name": "Ndk",
      "orders": [{ "total": 500 }, { "total": 1200 }]
    }
  }
}
```

✔️ No extra fields
✔️ No missing data

---

## 7️⃣ WHY THIS IS POWERFUL

### REST:

- Server controls response shape

### GraphQL:

- Client controls response shape

Result:

- No over-fetching
- No under-fetching
- Faster frontend iteration

---

## 8️⃣ GRAPHQL OPERATIONS (3 TYPES)

### 1️⃣ Query (READ)

```graphql
query {
  user(id: 1) {
    name
  }
}
```

---

### 2️⃣ Mutation (WRITE)

```graphql
mutation {
  createUser(name: "Ndk") {
    id
  }
}
```

---

### 3️⃣ Subscription (REAL-TIME) ⭐

```graphql
subscription {
  orderPlaced {
    id
    total
  }
}
```

👉 **Subscriptions usually use WebSockets**

This matches your experience:

> “WebSocket bhi support kar raha tha”

✔️ Correct.

---

## 9️⃣ GRAPHQL RESOLVERS (SERVER SIDE LOGIC)

Each field has a **resolver**.

Example:

```js
const resolvers = {
  Query: {
    user: (_, { id }) => getUserById(id),
  },
  User: {
    orders: (user) => getOrdersByUser(user.id),
  },
};
```

Resolvers:

- Fetch data
- Can call DB
- Can call REST APIs
- Can call other services

GraphQL is an **orchestration layer**.

---

## 🔟 GRAPHQL ≠ DATABASE JOIN

Very important:

GraphQL:

- Looks like joins
- But internally:

  - Multiple function calls
  - Multiple DB queries

This can cause:

- **N+1 problem**

Which is why:

- DataLoader
- Batching
- Caching

are important.

---

## 11️⃣ GRAPHQL vs REST (LOGIC)

| Aspect         | REST     | GraphQL        |
| -------------- | -------- | -------------- |
| Endpoints      | Many     | One            |
| Data shape     | Fixed    | Client-defined |
| Over-fetching  | Common   | None           |
| Under-fetching | Common   | None           |
| Versioning     | Required | Rare           |
| Caching        | Easy     | Hard           |
| Complexity     | Low      | Higher         |

---

## 12️⃣ WHEN TO USE GRAPHQL

Use GraphQL when:

- Frontend needs flexibility
- Multiple clients (web, mobile)
- Rapid UI changes
- Complex nested data
- Real-time subscriptions

Avoid GraphQL when:

- Simple CRUD APIs
- Heavy caching via CDN
- Very high QPS public APIs

---

## 13️⃣ LOGIC (CORE IDEA)

REST says:

> “Here is the data I expose.”

GraphQL says:

> “Tell me what data you want.”

---

## 🧠 CONCEPTUAL MENTAL MODEL (LOCK THIS)

```
Schema = contract
Query  = question
Resolver = answer
```

Or:

> **GraphQL turns APIs into a queryable graph of data.**

---

## 🔚 FINAL ONE-LINE SUMMARY

> **GraphQL is a query language and runtime that lets clients request exactly the data they need from a single endpoint, giving frontend teams flexibility at the cost of increased server complexity.**
