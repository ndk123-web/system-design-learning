# 📘 HTTP, REST & Idempotency (System Design README)

## WHY HTTP EXISTS

Systems need a **standard way** to:

- Send requests from client to server
- Get responses back
- Work across networks, proxies, CDNs, load balancers

HTTP exists to **encode and transport data** reliably.

---

## WHAT IS HTTP

**HTTP (Hypertext Transfer Protocol)** is:

> A **request–response protocol** used for communication between a client and a server.

Key properties:

- Stateless
- Self-contained requests
- Works through intermediaries (CDN, proxies, LBs)
- Uses methods (verbs), headers, status codes

---

## HOW HTTP WORKS (FLOW)

```
Client
 → HTTP Request (method + URL + headers + body)
 → Server
 → HTTP Response (status + headers + body)
```

Each request is independent.

---

## HTTP METHODS (CORE IDEA)

HTTP methods describe **intent**, not implementation.

| Method | Intent                  |
| ------ | ----------------------- |
| GET    | Read data               |
| POST   | Create / trigger action |
| PUT    | Replace resource        |
| PATCH  | Partial update          |
| DELETE | Remove resource         |

---

# 1️⃣ WHY POST IS **NOT IDEMPOTENT** (YOUR DOUBT #1)

### What idempotent means (quick reminder)

> Same request repeated → **final state remains same**

---

## WHAT POST DOES

> **POST = create something new or trigger an action**

Each POST usually creates a **new resource**.

---

## EXAMPLE

```http
POST /orders
{
  "item": "book",
  "price": 500
}
```

### Server action

- Creates a new order
- Assigns a new `order_id`

---

## RETRY SCENARIO (IMPORTANT)

Network timeout → client retries same POST:

```http
POST /orders
{
  "item": "book",
  "price": 500
}
```

### Result

- Order #101 created
- Order #102 created

Final state changed ❌
Duplicate created ❌

👉 **That’s why POST is NOT idempotent**

---

## LOGIC

- POST = “do this action again”
- Repeating it causes **new side effects**

---

## CONCEPT (ONE LINE)

> **POST creates new effects every time → not idempotent by default**

---

# 2️⃣ WHAT IS PATCH (YOUR DOUBT #2)

## WHY PATCH EXISTS

Sometimes:

- Resource is large
- You want to update only 1–2 fields
- Sending full object is wasteful

---

## WHAT PATCH IS

> **PATCH = partially modify a resource**

Unlike PUT, it does **not replace the full resource**.

---

## PUT vs PATCH (VERY IMPORTANT)

### PUT

- Replace entire resource
- Missing fields may be removed
- Usually idempotent

### PATCH

- Update only specified fields
- Other fields remain unchanged
- Not guaranteed idempotent

---

## EXAMPLE RESOURCE

```json
User {
  "id": 1,
  "name": "Amit",
  "email": "amit@gmail.com",
  "age": 25
}
```

---

## PUT EXAMPLE

```http
PUT /users/1
{
  "name": "Amit Sharma",
  "email": "amit@gmail.com",
  "age": 25
}
```

Entire object replaced.

---

## PATCH EXAMPLE (COMMON USE)

```http
PATCH /users/1
{
  "name": "Amit Sharma"
}
```

Only `name` changes.

---

## WHY PATCH IS NOT IDEMPOTENT

Because PATCH can be **relative**.

Example:

```http
PATCH /products/1
{
  "price": "+100"
}
```

Retry twice:

- Price increases twice ❌

So HTTP spec says:

> PATCH is **not guaranteed idempotent**

---

## CONCEPT (ONE LINE)

> **PATCH updates part of a resource, and its idempotency depends on implementation**

---

# 3️⃣ WHAT IS REST API (YOUR DOUBT #3)

## FIRST: REST ≠ HTTP

This is critical.

### HTTP

- Protocol
- Transport layer
- Methods, headers, status codes

### REST

- **Architectural style**
- Rules for designing APIs **using HTTP**

---

## WHAT REST ACTUALLY MEANS

REST = **Representational State Transfer**

Meaning:

> Client and server exchange **representations of resource state**

---

## REST CORE PRINCIPLES (IMPORTANT)

### 1️⃣ Resource-based URLs

Use **nouns**, not verbs.

❌ `/createUser`
✅ `/users`

---

### 2️⃣ HTTP methods define actions

```
GET    /users/1    → read
POST   /users      → create
PUT    /users/1    → replace
PATCH  /users/1    → partial update
DELETE /users/1    → delete
```

---

### 3️⃣ Statelessness

- Server stores no client session
- Each request is independent

Why?

- Scalability
- Load balancing
- Horizontal scaling

---

### 4️⃣ Uniform interface

- Predictable URLs
- Standard status codes
- Consistent behavior

---

## REST vs NON-REST EXAMPLE

### ❌ Non-REST

```http
POST /createUser
POST /updateUser
POST /deleteUser
```

### ✅ REST

```http
POST   /users
PUT    /users/1
DELETE /users/1
```

---

## LOGIC

REST forces:

- Clean separation of concerns
- Predictable APIs
- Proper use of HTTP semantics

---

## CONCEPT (ONE LINE)

> **HTTP is the protocol.
> REST is a disciplined way of using HTTP to model resources and state changes.**

---

# 4️⃣ FINAL MENTAL MODEL (LOCK THIS)

```
HTTP  → transport rules
REST  → API design rules
POST  → create / trigger
PUT   → replace
PATCH → partial update
Idempotent → retry-safe
```

---

## FINAL ONE-LINE SUMMARY

> **POST is not idempotent because it creates new effects, PATCH updates partial state with flexible logic, and REST is an architectural style that uses HTTP correctly to model resources.**
