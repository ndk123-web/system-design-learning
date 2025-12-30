# 📘 REST (Representational State Transfer) — System Design README

## WHY REST EXISTS

Early APIs were:

- Custom
- Verbose
- Tightly coupled
- Hard to cache
- Hard to scale

Different teams exposed APIs in different styles:

- `/createUser`
- `/getUserData`
- `/updateUserProfile`

This caused:

- Inconsistent APIs
- Client/server coupling
- Poor scalability

👉 **REST exists to bring discipline and uniformity to HTTP APIs.**

---

## WHAT IS REST

**REST (Representational State Transfer)** is:

> An **architectural style** for designing networked applications
> where clients interact with **resources** using standard HTTP semantics.

Important:

- REST is **not a protocol**
- REST is **not a framework**
- REST is a **set of design rules**

REST is built **on top of HTTP**.

---

## CORE IDEA OF REST (IN ONE LINE)

> **Client manipulates resource state by exchanging representations over HTTP.**

---

## HOW REST WORKS (BIG PICTURE)

```
Client
 → HTTP request (URI + method + headers)
 → Server
   → operates on resource
   → returns representation
 → Client
```

Key points:

- Client never calls “functions”
- Client works with **resources**
- Server owns the data
- Communication is **stateless**

---

## REST IS RESOURCE-ORIENTED (VERY IMPORTANT)

### What is a Resource?

A **resource** is a noun:

- User
- Order
- Product
- Invoice

Each resource has a **unique URI**.

Example:

```
/users
/users/1
/orders/99
```

URI identifies **what**, not **how**.

---

## ACTIONS ARE DEFINED BY HTTP VERBS

REST does **not** put actions in URLs.

Instead, actions come from **HTTP methods**.

| HTTP Verb | Meaning          |
| --------- | ---------------- |
| GET       | Read resource    |
| POST      | Create resource  |
| PUT       | Replace resource |
| PATCH     | Partially update |
| DELETE    | Remove resource  |

---

## EXAMPLE: USER RESOURCE

### Create user

```http
POST /users
```

### Get user

```http
GET /users/1
```

### Update user

```http
PUT /users/1
```

### Delete user

```http
DELETE /users/1
```

Same URI, different actions.

---

## CHANGE WITH REPRESENTATIONS

REST does **not** send raw objects.
It sends **representations**.

Example representation:

```json
{
  "id": 1,
  "name": "Ndk",
  "email": "ndk@mail.com"
}
```

Client and server exchange **state**, not commands.

---

## STATELESSNESS (CRITICAL PROPERTY)

REST is **stateless**:

- Server does NOT store client session
- Every request contains all required data
- No dependency on previous requests

### Why this matters

- Easy horizontal scaling
- Load balancers work naturally
- Failures are isolated

Statelessness = scalability.

---

## CACHEABILITY

REST responses can be cached using:

- HTTP headers
- Status codes
- Cache-Control rules

Example:

```http
Cache-Control: max-age=3600
```

Caching:

- Improves performance
- Reduces server load
- Works naturally with CDNs

---

## SELF-DESCRIPTIVE MESSAGES

REST uses **standard HTTP status codes**.

Examples:

| Status | Meaning      |
| ------ | ------------ |
| 200    | OK           |
| 201    | Created      |
| 400    | Bad request  |
| 401    | Unauthorized |
| 404    | Not found    |
| 500    | Server error |

REST does NOT reinvent error handling.

---

## HATEOAS (OFTEN MISUNDERSTOOD)

HATEOAS means:

> Responses contain links to next possible actions.

Example:

```json
{
  "id": 1,
  "name": "Ndk",
  "links": {
    "self": "/users/1",
    "orders": "/users/1/orders"
  }
}
```

Reality:

- Rarely fully implemented
- Conceptual REST principle
- Useful for hypermedia APIs

---

## WHY REST IS POPULAR FOR PUBLIC APIS

REST is good when:

- APIs are public
- Many clients exist
- Backward compatibility matters
- Browser support is required
- Caching is important

REST minimizes coupling:

- Client doesn’t care about server internals
- Server can evolve independently

---

## REST VS RPC (LOGICALLY)

| Aspect        | REST       | RPC       |
| ------------- | ---------- | --------- |
| Focus         | Resources  | Actions   |
| Mental model  | Data/state | Functions |
| URL meaning   | Nouns      | Verbs     |
| Coupling      | Loose      | Tight     |
| Public APIs   | Excellent  | Poor      |
| Internal APIs | OK         | Very good |

---

## LOGIC (CORE IDEA)

REST answers:

> “How do we expose data over HTTP in a consistent, scalable way?”

RPC answers:

> “How do we call functions remotely?”

Different problems, different tools.

---

## CONCEPTUAL MENTAL MODEL (LOCK THIS)

```
Resource
  ↕
Representation
  ↕
HTTP verbs
  ↕
Stateless interaction
```

Or simply:

> **REST exposes data, not behavior.**

---

## FINAL ONE-LINE SUMMARY

> **REST is an architectural style that exposes server-managed resources through stateless, cacheable HTTP interactions using standard verbs and representations.**
