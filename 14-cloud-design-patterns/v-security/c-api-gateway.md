# 🚦 API GATEWAY 

_(Single Entry Point for Backend Services)_

---

## 📌 PURPOSE

An **API Gateway** is a **single, centralized entry point** for client requests that routes them to appropriate backend services and applies cross-cutting concerns such as security, traffic control, and observability.

---

## 🧠 ONE-LINE IDEA (LOCK THIS)

> **An API Gateway sits between clients and backend services, acting as a smart traffic controller and policy enforcer.**

Clients never talk to backend services directly.

---

## WHY — Why API Gateway is needed

In modern systems (especially microservices):

- You have many backend services
- Clients (web, mobile, third-party) should not know service topology
- Each service should not re-implement common logic

Without API Gateway:

```
Client → Service A
Client → Service B
Client → Service C
```

Problems:

- Tight coupling
- Security duplicated everywhere
- Hard to change internal services
- Large attack surface

---

## WHAT — What an API Gateway actually does

An API Gateway is **not business logic**.
It handles **cross-cutting concerns**:

- Request routing
- Authentication & authorization checks
- Input validation
- Rate limiting & throttling
- Load balancing
- Protocol translation (HTTP → gRPC)
- Aggregation of responses
- Logging, metrics, tracing

---

## BASIC REQUEST FLOW (MOST IMPORTANT)

![Image](https://learn.microsoft.com/en-us/azure/architecture/microservices/images/gateway.png)

![Image](https://user-images.githubusercontent.com/6509926/55875254-2c62e480-5b84-11e9-83bb-031eaf095476.png)

![Image](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/architect-microservice-container-applications/media/direct-client-to-microservice-communication-versus-the-api-gateway-pattern/custom-service-api-gateway.png)

```
Client
 ↓
API Gateway
 ├─ Auth check
 ├─ Validation
 ├─ Rate limit
 ├─ Routing
 ↓
Backend Service(s)
```

Backend services live in a **private network**.

---

## API GATEWAY vs LOAD BALANCER (VERY IMPORTANT)

| Load Balancer            | API Gateway                  |
| ------------------------ | ---------------------------- |
| Distributes traffic      | Controls & governs traffic   |
| L4 / simple L7           | L7 (application aware)       |
| Knows nothing about APIs | Knows APIs & policies        |
| No auth logic            | Auth, validation, throttling |

Load balancer = **plumbing**
API gateway = **policy brain**

---

## API GATEWAY vs GATEKEEPER (CLEAR DISTINCTION)

- **Gatekeeper** → security _pattern / role_
- **API Gateway** → common _implementation_ of that role

👉 Most API Gateways **act as Gatekeepers** when configured securely.

---

## CORE RESPONSIBILITIES (DETAILED)

### 1️⃣ Routing

```
/users  → User Service
/orders → Order Service
```

Clients don’t know service IPs.

---

### 2️⃣ Authentication & Authorization

- Validate JWT / OAuth tokens
- Check issuer, expiry, signature
- Reject unauthenticated traffic early

---

### 3️⃣ Rate Limiting & Throttling

- Protect backend from overload
- Enforce per-user / per-tenant quotas

---

### 4️⃣ Input Validation & Sanitization

- Schema validation
- Payload size limits
- Reject malformed requests

---

### 5️⃣ Load Balancing

- Spread traffic across instances
- Health-based routing

---

### 6️⃣ Aggregation (Optional)

Gateway can combine multiple backend calls:

```
Client → Gateway
Gateway → Service A + Service B
Gateway → Combined response
```

Useful for mobile apps.

---

### 7️⃣ Observability

- Central logging
- Metrics
- Tracing correlation IDs

---

## WHERE API GATEWAY SITS IN THE ARCHITECTURE

```
Internet
 ↓
CDN / Edge (DDoS, TLS, Geo rules)
 ↓
API Gateway (policies, routing)
 ↓
Private Backend Services
```

CDN = outer shield
API Gateway = **control point**

---

## WHAT API GATEWAY SHOULD NOT DO

❌ Business logic
❌ Database access
❌ Long-running workflows
❌ Heavy data processing

If you put business logic here → **tight coupling & pain**.

---

## FAILURE & RESILIENCE CONSIDERATIONS

Because API Gateway is critical:

- Must be highly available
- Horizontally scalable
- Stateless
- Fast-fail on bad requests

Often combined with:

- Circuit Breakers (downstream)
- Timeouts
- Retries (carefully)

---

## TRADE-OFFS (HONEST)

### Pros

- Centralized control
- Strong security boundary
- Simplified clients
- Cleaner backend services

### Cons

- Extra network hop (latency)
- Single chokepoint if misconfigured
- Can become monolithic if overloaded with logic

Good gateways stay **thin and fast**.

---

## WHEN TO USE API GATEWAY

- Microservices architectures
- Multi-client systems (web, mobile, partners)
- Public APIs
- Zero-trust environments
- Multi-tenant platforms

---

## FINAL MENTAL MODEL (LOCK THIS 🔒)

```
Clients are untrusted
Backend services are fragile

API Gateway = traffic controller + rule enforcer
```

It’s the **brain at the edge**, not the muscles.

---

## ONE-LINE SUMMARY

> **An API Gateway is a centralized entry point that routes client requests to backend services while enforcing security, traffic control, and observability policies.**
