# ⚖️ Load Balancer — Deep System Design Explanation

## 1️⃣ WHY Load Balancer exists (real problem first)

### Without Load Balancer

```
Client
 → Server (single)
```

Problems:

- Server crash = ❌ site down
- Traffic spike = ❌ slow / timeout
- Scaling = ❌ manual + risky
- Maintenance = ❌ downtime

👉 **Single point of failure**

---

### With Load Balancer

```
Client
 → Load Balancer
   → Server 1
   → Server 2
   → Server 3
```

Now:

- One server dies → traffic goes elsewhere
- Traffic spike → add more servers
- Zero downtime deploys possible

👉 **Availability + Scalability**

---

## 2️⃣ WHAT is a Load Balancer (correct definition)

> A **Load Balancer** is a component that:
>
> - Receives incoming requests
> - Selects a healthy backend
> - Forwards the request
> - Hides backend complexity from clients

Client never knows:

- How many servers exist
- Which server served the request
- Which server died

---

## 3️⃣ WHERE Load Balancer sits (very important)

### Typical modern flow

![Image](https://images.wondershare.com/edrawmax/templates/network-diagram-for-load-balancing.png)

![Image](https://learn.microsoft.com/en-us/windows-server/networking/media/dns-app-lb/dns-app-lb.jpg)

![Image](https://tetrate.io/.netlify/images?h=549&q=90&url=_astro%2Fimage-1024x549.Dst0COpw.png&w=1024)

```
Client
 → DNS
 → Load Balancer
 → Web Layer / Application Layer
```

DNS **always points to Load Balancer**, not to servers.

---

## 4️⃣ HOW Load Balancer works (step by step)

### Step 1: DNS Resolution

```
api.example.com → LB IP
```

---

### Step 2: Client hits Load Balancer

```
GET /login
```

---

### Step 3: Health-aware selection

LB checks:

- Is server alive?
- Is server overloaded?
- Is server responding fast?

---

### Step 4: Forward request

```
LB → Server X
```

---

### Step 5: Response back

```
Server → LB → Client
```

Client thinks:

> “I talked to api.example.com”

---

## 5️⃣ Load Balancing Algorithms (important)

### 🔁 Round Robin

```
Req1 → S1
Req2 → S2
Req3 → S3
```

Simple, fast
❌ ignores server load

---

### ⚖️ Least Connections

```
Pick server with least active requests
```

Best for:

- Long-running requests
- Uneven load

---

### 🧠 Weighted Round Robin

```
Big server → more traffic
Small server → less traffic
```

---

### 🧷 IP Hash

```
Client IP → same server
```

Used for:

- Session stickiness

---

## 6️⃣ Health Checks (most critical feature)

A Load Balancer **never blindly forwards traffic**.

Each backend exposes:

```
GET /health
```

If:

- 200 OK → healthy
- Timeout / 5xx → removed from rotation

👉 **Automatic failure handling**

---

## 7️⃣ Types of Load Balancers (by layer)

### 🔹 L4 Load Balancer (Transport layer)

- TCP / UDP
- Very fast
- No HTTP awareness

Example:

```
AWS NLB
```

Used when:

- Performance > logic
- gRPC, streaming, DB proxies

---

### 🔹 L7 Load Balancer (Application layer)

- HTTP / HTTPS
- Knows paths, headers, cookies

Example:

```
NGINX, ALB, Ingress
```

Can do:

- `/auth → auth-service`
- `/cert → cert-service`

---

## 8️⃣ Load Balancer vs NGINX confusion (clear it)

> “NGINX bhi load balancer hai na?”

### Truth:

- **NGINX CAN load balance**
- But **NGINX is primarily a reverse proxy**

Comparison:

| Feature              | Load Balancer | NGINX |
| -------------------- | ------------- | ----- |
| Traffic distribution | ✅            | ✅    |
| Routing              | ❌            | ✅    |
| Auth                 | ❌            | ✅    |
| Rate limiting        | ❌            | ✅    |
| Static content       | ❌            | ✅    |

👉 In real systems:

- **LB = traffic distributor**
- **NGINX = traffic controller**

---

## 9️⃣ Example: Scaling with Load Balancer

### Scenario: Login traffic spike

Without LB:

- Server CPU 100%
- Requests fail

With LB:

```
Add Server 4
Add Server 5
```

LB automatically:

- Detects new servers
- Starts routing traffic

No client change needed.

---

## 🔟 Example: Server crash

Server 2 dies.

LB:

- Health check fails
- Removes Server 2
- Routes to Server 1 & 3

Client:

- Never notices

---

## 1️⃣1️⃣ Sticky Sessions (important but dangerous)

Sometimes:

- User session stored in memory

LB pins:

```
User → same server
```

Problems:

- Uneven load
- Harder scaling

👉 Modern systems prefer:

- Stateless servers
- Redis for session storage

---

## 1️⃣2️⃣ What Load Balancer does NOT do

❌ Business logic
❌ Database queries
❌ Authentication decisions
❌ Data validation

LB should stay **dumb but fast**.

---

## 🔑 Final Mental Model (lock this)

> **Load Balancer = traffic distributor + failure shield**

- Clients talk to **one stable endpoint**
- Backends are **replaceable**
- Failures are **absorbed**

---

## One-line interview answer

> “A load balancer distributes incoming traffic across healthy backend servers, improves availability, enables horizontal scaling, and hides infrastructure changes from clients.”
