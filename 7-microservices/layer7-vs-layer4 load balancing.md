# ⚖️ Layer 4 vs Layer 7 Load Balancing

## 1️⃣ WHY Load Balancing Exists

Modern systems face:

- High traffic
- Spikes (unpredictable)
- Server failures
- Horizontal scaling needs

Without load balancing:

- Single server = single point of failure
- Scaling requires downtime
- Clients must know server details (bad)

So we introduce **Load Balancers** to:

- Distribute traffic
- Hide backend servers
- Improve availability
- Enable scaling without client changes

---

## 2️⃣ WHAT “Layer” Means (Minimal Networking Context)

We care only about **two layers**:

```
Layer 4 → Transport Layer (TCP / UDP)
Layer 7 → Application Layer (HTTP / HTTPS)
```

**The layer decides:**

- What information the load balancer can see
- How intelligent routing can be
- How fast the load balancer is

---

## 3️⃣ Layer 4 Load Balancing (L4)

### WHAT is Layer 4 Load Balancing

> **Layer 4 load balancing operates at the TCP/UDP level.**
> It does NOT understand HTTP, URLs, headers, cookies, or request bodies.

It only sees:

- Source IP
- Destination IP
- Port (e.g. 443)
- Protocol (TCP / UDP)

---

### HOW Layer 4 Load Balancing Works

```
Client
 → TCP connection
 → L4 Load Balancer
 → Backend Server
```

Key points:

- Decision is made **when connection is established**
- Entire TCP connection is pinned to one backend
- No inspection of request data

---

### EXAMPLE (Layer 4)

Client connects to:

```
api.example.com:443
```

Layer 4 LB decides:

```
→ Forward TCP connection to Server A
```

From now on:

- All packets go to Server A
- L4 LB does not know:

  - Which API is called
  - What data is inside

---

### WHEN to Use Layer 4

Use L4 when you need:

- Maximum performance
- Minimal latency
- Protocol-agnostic routing

Common use cases:

- Databases
- gRPC
- TCP services
- Game servers
- L4 in front of L7 load balancers

---

### TOOLS (Layer 4)

- AWS **NLB** (Network Load Balancer)
- Azure Load Balancer (L4)
- GCP TCP Load Balancer
- HAProxy (TCP mode)
- MetalLB (TCP)

---

## 4️⃣ Layer 7 Load Balancing (L7)

### WHAT is Layer 7 Load Balancing

> **Layer 7 load balancing understands the application protocol (HTTP/HTTPS).**

It can read:

- URL path (`/login`, `/orders`)
- Headers
- Cookies
- HTTP methods
- Hostnames

---

### HOW Layer 7 Load Balancing Works

```
Client
 → HTTP request
 → L7 Load Balancer inspects request
 → Routing decision
 → Backend Service
```

Important:

- L7 **terminates HTTP**
- Makes a routing decision
- Sends a **new HTTP request** to backend

---

### EXAMPLE (Layer 7)

Incoming requests:

```
GET /auth/login
GET /certificates
```

Routing rules:

```
/auth          → Auth Service
/certificates  → Certificate Service
```

Same domain, same IP, different backend services.

---

### WHEN to Use Layer 7

Use L7 when you need:

- API-based routing
- Microservices
- Authentication
- Rate limiting
- Header-based routing
- Cookies / session logic

Almost all modern web systems need **L7 somewhere**.

---

### TOOLS (Layer 7)

- NGINX
- Kubernetes Ingress
- AWS **ALB**
- Azure Application Gateway
- Envoy
- API Gateway

---

## 5️⃣ Layer 4 vs Layer 7 — Core Differences

| Feature              | Layer 4 (L4) | Layer 7 (L7)   |
| -------------------- | ------------ | -------------- |
| Operates on          | TCP / UDP    | HTTP / HTTPS   |
| Reads URL path       | ❌           | ✅             |
| Reads headers        | ❌           | ✅             |
| Cookie-based routing | ❌           | ✅             |
| Routing intelligence | Low          | High           |
| Performance          | Very high    | Slightly lower |
| TLS termination      | Usually ❌   | ✅             |

---

## 6️⃣ HOW L4 and L7 Work Together (Very Important)

### Real Production Architecture

```
Client
 → DNS
 → Layer 4 Load Balancer
 → Layer 7 Load Balancer (NGINX / Ingress)
 → Application Services
```

### Responsibility Split

| Layer   | Decides                      |
| ------- | ---------------------------- |
| Layer 4 | Which **endpoint / machine** |
| Layer 7 | Which **API / service**      |

---

## 7️⃣ Concrete End-to-End Example (AWS-style)

### Setup

- **L4 LB**: AWS NLB
- **L7 LB**: NGINX Ingress (3 replicas)

```
NGINX #1 → 10.0.1.10
NGINX #2 → 10.0.1.11
NGINX #3 → 10.0.1.12
```

### Flow

```
Client
 → DNS (api.example.com)
 → AWS NLB (TCP :443)
   → NGINX #1
   → NGINX #2
   → NGINX #3
 → Kubernetes Services
 → Pods
```

What happens:

- L4 LB distributes **TCP connections** across NGINX instances
- Each NGINX performs **HTTP routing** to correct service

---

## 8️⃣ Common Misunderstandings (Cleared)

### ❓ Does L4 redirect to L7?

❌ No
✅ It **forwards TCP traffic transparently**

Redirect = HTTP 301/302
Forward = invisible to client

---

### ❓ Is NGINX Layer 4 or Layer 7?

👉 **Layer 7**

---

### ❓ Can Layer 4 replace Layer 7?

❌ No, if:

- You need path-based routing
- You have microservices

---

## 9️⃣ Final Mental Model (Lock This)

> **Layer 4 = fast traffic pipe** > **Layer 7 = smart traffic brain**

- Pipe handles volume
- Brain handles decisions

They are **stacked**, not competing.

---

## 10️⃣ One-Line Interview Answer

> “Layer 4 load balancing operates at the transport layer and routes traffic based on IP and port, while Layer 7 load balancing operates at the application layer and routes requests based on HTTP content such as paths, headers, and cookies.”
