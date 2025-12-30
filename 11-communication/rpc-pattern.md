# 📘 RPC (Remote Procedure Call) — System Design README

## WHY RPC EXISTS

In distributed systems, services need to talk to each other.

Traditional HTTP communication creates friction:

- URLs
- HTTP verbs
- Serialization
- Mapping endpoints to functions
- Boilerplate everywhere

Developers wanted this experience:

> “I want to call a function on another server
> just like I call a local function.”

👉 **RPC exists to hide network complexity behind function calls.**

---

## WHAT IS RPC

**RPC (Remote Procedure Call)** is a **communication pattern** where:

> A client invokes a function on a remote server
> as if it were a local function call.

Key idea:

- Client calls a **procedure / method**
- Arguments are sent over the network
- Server executes the function
- Result is returned

The network is **invisible** to the developer.

---

## HOW RPC WORKS (UNDER THE HOOD)

RPC is an **illusion**.

Actual flow looks like this:

```
Client
 → serialize(method + arguments)
 → send over network
 → Server
    → deserialize
    → find method
    → execute function
    → serialize result
 → send back
 → Client deserializes result
```

But developer only sees:

```js
result = remoteFunction(a, b);
```

---

## SIMPLE RPC EXAMPLE

### Client side

```js
const result = await rpc.add(2, 3);
```

### What is actually sent

```json
{
  "method": "add",
  "params": [2, 3]
}
```

### Server side

```js
function add(a, b) {
  return a + b;
}
```

### Response

```json
{
  "result": 5
}
```

To the client:

- Looks like a function call
  In reality:
- It was a network request

---

## RPC IS ACTION-ORIENTED (IMPORTANT)

RPC is focused on **actions / behaviors**.

You think in terms of:

- Functions
- Procedures
- Commands

Example RPC calls:

```js
createUser(data);
sendEmail(userId);
calculateAnalytics(date);
processPayment(orderId);
```

These are **verbs / actions**.

---

# REST / HTTP APIs (FOR COMPARISON)

## WHAT REST IS (QUICK CONTEXT)

REST is an **architectural style** built on top of HTTP.

REST focuses on:

- Resources
- State
- Standard HTTP verbs

---

## REST IS RESOURCE-ORIENTED

REST thinking is:

> “What resource am I operating on?”

You model **nouns**, not actions.

Example REST endpoints:

```http
POST   /users
GET    /users/1
PUT    /users/1
DELETE /users/1
```

Here:

- `/users` is the resource
- HTTP method defines the action

---

## RESOURCE-ORIENTED vs ACTION-ORIENTED (CORE DIFFERENCE)

### REST (Resource-oriented)

```
Resource + HTTP verb
```

Example:

```http
POST /orders
```

Meaning:

> “Create a new order resource”

---

### RPC (Action-oriented)

```
Action / function
```

Example:

```js
createOrder(data);
```

Meaning:

> “Run this action on the server”

---

## SIDE-BY-SIDE COMPARISON

| Aspect        | RPC           | REST / HTTP           |
| ------------- | ------------- | --------------------- |
| Mental model  | Function call | Resource manipulation |
| Focus         | Actions       | Resources             |
| URL meaning   | Method name   | Resource name         |
| Verb location | Function name | HTTP method           |
| Style         | Imperative    | Declarative           |
| Coupling      | Tighter       | Looser                |

---

## WHY ENTERPRISE SYSTEMS USE RPC

RPC is preferred when:

- Services talk internally
- Strong contracts are needed
- Low latency matters
- Function semantics are clearer
- Developer productivity is important

That’s why:

- gRPC
- Thrift
- Internal RPC frameworks

are common in large systems.

---

## RPC IS NOT A PROTOCOL (IMPORTANT CLARIFICATION)

> **RPC is a pattern, not a protocol.**

RPC can run over:

- TCP
- HTTP
- HTTP/2
- QUIC

Examples:

- JSON-RPC → HTTP
- gRPC → HTTP/2
- Custom RPC → raw TCP

---

## LOGIC (CORE IDEA)

RPC answers this question:

> “Why should application developers care about networking
> when they just want to execute logic?”

RPC says:

> “Don’t think about URLs and verbs — think in functions.”

---

## CONCEPTUAL MENTAL MODEL (LOCK THIS)

```
Local function call
        ↓
RPC abstraction
        ↓
Network (TCP / HTTP)
        ↓
Remote execution
```

Or simply:

> **RPC makes remote calls feel like local function calls.**

---

## FINAL ONE-LINE SUMMARY

> **RPC is an action-oriented communication pattern that hides network calls behind function invocations, while REST is a resource-oriented style that models state using HTTP semantics.**
