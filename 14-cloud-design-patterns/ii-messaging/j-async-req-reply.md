# 🔁 Asynchronous Request–Reply Pattern

The **Asynchronous Request–Reply** pattern is used when a client needs a **clear HTTP response**, but the backend work is **long-running, distributed, or asynchronous**.

The key idea is to **decouple request acceptance from request completion** while still keeping the client informed in a clean, HTTP-friendly way.

---

## 1️⃣ What is Asynchronous Request–Reply?

Asynchronous Request–Reply means:

- The client sends a request
- The backend **accepts** the request but does **not block**
- The backend processes the work **in the background**
- The client later fetches the result using a **status endpoint**

In short:

> **The client gets an answer immediately,
> but not the final result immediately.**

---

## 2️⃣ Why This Pattern Exists (Problem It Solves)

### ❌ Problem with synchronous request–reply

If backend work is:

- slow
- multi-step
- distributed
- dependent on other services

Then synchronous APIs cause:

- request timeouts
- thread blocking
- retry storms
- poor user experience

```text
Client → waits 10s → timeout → retry → overload
```

---

### ✅ What Async Request–Reply Fixes

- Client never blocks
- Backend can take its time
- System scales horizontally
- Failures are handled gracefully
- HTTP semantics remain honest

> **The system admits uncertainty instead of lying with a fake 200 OK.**

---

## 3️⃣ When to Use (and When NOT to Use)

### ✅ Use When

- Long-running jobs (reports, exports, ML jobs)
- Background workflows
- Distributed processing
- Event-driven systems
- Choreography-based architectures
- User does not need instant result

Examples:

- Report generation
- Video processing
- Payment settlement
- Data imports / exports

---

### ❌ Avoid When

- Simple CRUD operations
- Very fast operations (<100ms)
- Strong immediate consistency required
- Client cannot poll or receive async updates

> **Async adds complexity — don’t use it unless time is genuinely uncertain.**

---

## 4️⃣ How the Pattern Works (End-to-End)

### Step 1️⃣ Client sends request

```http
POST /reports
```

Backend:

- validates request
- creates a job
- stores initial status
- starts background processing

### Response:

```http
HTTP/1.1 202 Accepted
Location: /reports/status/123
```

### Why **202 Accepted**?

> **202 means:
> “I accepted your request, but the work is not finished yet.”**

It avoids false success.

---

## Step 2️⃣ Client checks status

```http
GET /reports/status/123
```

Backend response (job still running):

```http
HTTP/1.1 200 OK
{
  "status": "IN_PROGRESS"
}
```

### Why **200 OK** here?

Because:

- The **GET request itself succeeded**
- The server successfully answered the question:

  > “What is the current status?”

> **HTTP status describes transport success, not business completion.**

---

## Step 3️⃣ Backend completes the work

- Background worker finishes processing
- Result is stored
- Status is updated

---

## Step 4️⃣ Client polls again

```http
GET /reports/status/123
```

Backend response:

```http
HTTP/1.1 302 Found
Location: /reports/123
```

### Why **302 Redirect**?

Because:

- The status endpoint is **not the resource**
- The final result lives at a **different URL**
- 302 cleanly separates:

  - job tracking
  - resource retrieval

> **“You were asking about status —
> now the actual resource is over there.”**

---

## Step 5️⃣ Client fetches final resource

```http
GET /reports/123
```

```http
HTTP/1.1 200 OK
{
  "report": "final generated data"
}
```

---

## 5️⃣ Where Is Status Stored? (Critical Detail)

Yes — **status must be stored somewhere**.

Without storage:

- polling is impossible
- restarts break the flow
- scaling fails

### What is stored?

```json
{
  "jobId": "123",
  "status": "IN_PROGRESS | COMPLETED | FAILED",
  "resultUrl": "/reports/123",
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

### Where to store status?

#### Option 1️⃣ Redis

- Fast
- TTL-friendly
- Best for temporary state

#### Option 2️⃣ SQL / NoSQL

- Durable
- Auditable
- Slower

#### Option 3️⃣ Hybrid (Best Practice)

- Redis → current status
- DB → final state / history

> **Async systems are state machines.
> State must live outside the process.**

---

## 6️⃣ Trade-Offs (Inherent Compromises)

### ✅ Advantages

- No client blocking
- Honest HTTP semantics
- High scalability
- Better failure handling
- Works well with event-driven backends

### ❌ Disadvantages

- Client logic more complex
- Polling overhead (or need push)
- Requires state storage
- Requires cleanup & TTL
- Harder to test end-to-end

> **You trade simplicity for scalability and resilience.**

---

## 7️⃣ Impact on System Design

### Scalability

- Excellent
- No long-lived connections
- Backend work scales independently

---

### Testing

- Need to test state transitions
- Mock background workers
- Test retries and failures

---

### Monitoring

You must monitor:

- job duration
- stuck jobs
- retry counts
- failed jobs
- cleanup failures

Without monitoring:

> **Async failures become invisible.**

---

## 8️⃣ Related Patterns

Asynchronous Request–Reply often works with:

- Choreography
- Saga Pattern
- Outbox Pattern
- Idempotent APIs
- Polling / WebSockets
- Claim Check Pattern

---

## 9️⃣ Mental Model (Most Important)

> **202 = request accepted
> 200 = request handled correctly
> 302 = result lives elsewhere**

And most importantly:

> **User sees states, not transactions.**

---

## 🔒 Final Rule (Tattoo-Level)

> **Never return 200 OK for work you haven’t finished.**

---

## 🧾 One-Line Summary

> **Asynchronous Request–Reply allows a client to start long-running work, receive immediate acknowledgment, track progress via a status endpoint, and retrieve the final result through redirection—cleanly separating transport success from business completion.**
