# 📘 Backends for Frontend (BFF)

![Image](https://substackcdn.com/image/fetch/%24s_%21gIdn%21%2Cw_1200%2Ch_600%2Cc_fill%2Cf_jpg%2Cq_auto%3Agood%2Cfl_progressive%3Asteep%2Cg_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F47750941-93ca-4160-a6c3-eedd4e5e36ff_2646x1644.png)

---

## 🔹 One-Line Intuition (lock this first)

> **BFF = each frontend gets its own backend that speaks exactly the language that frontend needs.**

No more “one API to please everyone”.

---

## 1️⃣ WHY (why this pattern exists)

### The real problem

Different frontends want **different things**:

- Web app → rich data, many fields
- Mobile app → minimal data, low latency
- Admin panel → powerful operations
- Public API → stable, versioned contracts

If you force **one backend** to serve all:

- APIs become bloated
- Endless `if (client == mobile)`
- Breaking changes everywhere
- Frontend teams blocked by backend changes

Classic anti-pattern:

> **“One backend, infinite conditionals.”**

---

## 2️⃣ WHAT (definition)

**Backends for Frontend (BFF)** means:

- You create **separate backend services**
- Each backend is **owned by a specific frontend**
- Each BFF:

  - aggregates data
  - shapes responses
  - handles auth/session needs

- Core services remain clean and reusable

This pattern was popularized by **Sam Newman**.

---

## 3️⃣ HOW (high-level architecture)

```
Web App ──► Web BFF ──► Core Services
Mobile App ─► Mobile BFF ─► Core Services
Admin UI ──► Admin BFF ──► Core Services
```

Each frontend talks to **its own backend**.
Core services never care about UI quirks.

---

## 4️⃣ WHAT A BFF DOES (and does NOT)

### ✅ BFF DOES

- Aggregation (call multiple services)
- Response shaping (exact fields needed)
- Client-specific auth/session handling
- Caching tuned to that client
- API composition for screens/pages

### ❌ BFF DOES NOT

- Core business logic
- Data ownership
- Cross-client policies
- Heavy workflows

Rule:

> **BFF adapts data; core services decide truth.**

---

## 5️⃣ EXAMPLE (clear and real)

### Scenario: User Profile Screen

#### Web needs:

- user info
- recent orders
- recommendations
- full history

#### Mobile needs:

- user name
- last order
- quick actions

### With BFFs

```
Web App → Web BFF → User + Orders + Reco
Mobile App → Mobile BFF → User + Last Order
```

Same core services.
Different shapes.
No conditional mess.

---

## 6️⃣ LOGIC (why this works)

BFF works because:

- Frontends evolve fast
- Core services must stay stable
- Aggregation near the client reduces latency
- Teams move independently
- Contracts are smaller and clearer

It separates:

> **UI needs** from **domain truth**.

---

## 7️⃣ VISUAL MENTAL MODEL

![Image](https://miro.medium.com/v2/resize%3Afit%3A1400/1%2A2BaGJecjJNBk0gGCUQJO2w.png)

![Image](https://images.contentstack.io/v3/assets/bltb1a38d5d52a9d1a1/blt81b156a73f85da1b/6686997efda3925b7e663e96/Backend_for_Frontend_%28BFF%29_What_You_Need_to_Know-1_Contextual_1.png)

Think:

```
Frontend: “I need THIS screen”
BFF: “I’ll assemble exactly that”
Core services: “Here’s the raw truth”
```

---

## 8️⃣ BFF vs API Gateway (common confusion)

| Aspect           | API Gateway               | BFF                  |
| ---------------- | ------------------------- | -------------------- |
| Scope            | System-wide               | Frontend-specific    |
| Responsibility   | Routing, security, policy | Aggregation, shaping |
| Business logic   | ❌                        | ❌                   |
| Client awareness | ❌                        | ✅                   |
| Count            | Usually 1                 | Usually many         |

> **Gateway protects the system.
> BFF serves a client.**

They often **co-exist**.

---

## 9️⃣ IMPLEMENTATION (practical)

### Typical stack

- Lightweight service (Node/Go/Java)
- REST or GraphQL
- Owned by frontend team

### Patterns inside a BFF

- Gateway Aggregation
- Caching (screen-level)
- Timeout/fallback per client
- Simple mapping logic

### Auth

- Often handled at gateway
- BFF may manage sessions/tokens per client

---

## 🔟 WHEN TO USE BFF

Use BFF when:

- Multiple frontends exist
- Frontends diverge in needs
- Teams want independence
- Aggregation logic grows
- Mobile/web differences hurt

---

## 1️⃣1️⃣ WHEN NOT TO USE

Avoid BFF when:

- Single frontend
- Very small system
- Simple CRUD
- No aggregation needs

BFF adds services — don’t add it prematurely.

---

## 1️⃣2️⃣ PROS

- Clean, focused APIs
- Faster frontend development
- Independent team ownership
- Less backend coupling
- Better UX performance

---

## 1️⃣3️⃣ CONS

- More services to manage
- Duplication of aggregation logic
- Operational overhead
- Requires discipline

BFF trades **backend simplicity** for **frontend velocity**.

---

## 1️⃣4️⃣ TRADE-OFFS

| You Gain        | You Pay           |
| --------------- | ----------------- |
| Frontend speed  | More services     |
| Clean contracts | Duplication       |
| Team autonomy   | Ops overhead      |
| Better UX       | More moving parts |

---

## 1️⃣5️⃣ RELATION TO OTHER PATTERNS

- **Gateway Aggregation** → what BFF often does
- **API Gateway** → sits in front of BFFs
- **CQRS (read side)** → BFF consumes read models
- **GraphQL** → often implemented _as_ a BFF

BFF is a **composition layer**, not a core system.

---

## 🧠 Final Lock (NDK-way)

> **BFF exists because different frontends should never fight over one backend contract.**
