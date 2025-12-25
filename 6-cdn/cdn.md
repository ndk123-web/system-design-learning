# CDN — Content Delivery Network (NDK Style)

## 1. WHY CDN EXISTS

The internet’s biggest problem is **distance and latency**.

- Users are globally distributed
- Servers are usually centralized
- Every request across continents increases latency

**Goal of CDN:**

> Bring content closer to users.

CDN reduces:

- Latency
- Origin server load
- Bandwidth cost
- Downtime during traffic spikes

---

## 2. WHAT A CDN IS

A **Content Delivery Network (CDN)** is a **globally distributed network of servers (edge servers)** that cache and deliver content from locations closer to users.

Key characteristics:

- Geographically distributed
- Cache-first
- Read-optimized
- Works before backend servers

---

## 3. WHERE CDN FITS IN SYSTEM DESIGN

```
User
 ↓
DNS
 ↓
CDN (Edge Cache)
 ↓ (cache miss only)
Load Balancer
 ↓
Backend Services
```

CDN is the **first performance and availability layer**.

---

## 4. HOW CDN WORKS (CACHE FLOW)

### First Request (Cache MISS)

1. User requests a resource
2. CDN edge checks cache → MISS
3. CDN fetches from origin server
4. CDN caches the response
5. Response returned to user

### Subsequent Requests (Cache HIT)

1. User requests same resource
2. CDN edge serves from cache
3. Origin server is not contacted

---

## 5. WHAT CDNs CACHE

Typically cached:

- Images
- CSS / JS files
- Fonts
- Videos
- Static HTML
- Public API responses

Typically not cached (by default):

- Authenticated responses
- Personalized data
- Real-time updates

Caching behavior is controlled using headers like `Cache-Control` and `TTL`.

---

## 6. PUSH vs PULL CDN (IMPORTANT)

### Pull CDN

**Definition:**
CDN fetches content from the origin **only when requested**.

**Flow:**

- User requests file
- CDN pulls from origin
- CDN caches content

**Advantages:**

- No manual uploads
- Scales automatically
- Simple configuration

**Use cases:**

- Websites
- APIs
- Dynamic content

**Memory key:**

> Pull = fetch on demand

---

### Push CDN

**Definition:**
Content is **manually uploaded** to CDN servers in advance.

**Flow:**

- Developer uploads files to CDN
- CDN serves directly
- Origin server not involved

**Advantages:**

- No origin dependency
- Predictable performance

**Use cases:**

- Video streaming
- Software downloads
- App updates

**Memory key:**

> Push = upload before requests

---

## 7. PUSH vs PULL COMPARISON

| Feature        | Pull CDN           | Push CDN           |
| -------------- | ------------------ | ------------------ |
| Content source | Origin server      | Pre-uploaded       |
| Origin load    | First request only | None               |
| Ease of use    | Easy               | Manual             |
| Scalability    | Very high          | Medium             |
| Common usage   | Web apps           | Media distribution |

---

## 8. CDN AND DNS

CDNs rely heavily on DNS:

- DNS resolves domain to CDN edge
- CDN chooses nearest location

DNS + CDN together act as the **internet front door**.

---

## 9. CDN AND AVAILABILITY

CDNs improve availability by:

- Absorbing traffic spikes
- Protecting against DDoS attacks
- Serving cached content when origin is down

This makes CDN an important **availability pattern**.

---

## 10. CDN AND CONSISTENCY

CDNs cache data, which introduces:

- Temporary staleness
- Eventual consistency

Freshness is controlled by:

- TTL values
- Cache invalidation (purge)

---

## 11. WHEN TO USE A CDN

Use a CDN when:

- Users are globally distributed
- Content is read-heavy
- Latency matters
- You want protection against spikes

Avoid CDN when:

- Data is highly personalized
- Real-time consistency is required

---

## 12. FINAL MEMORY KEYS

- CDN = cache near users
- Reduces latency and origin load
- Pull CDN = on-demand fetch
- Push CDN = pre-uploaded content
- CDN sits before backend
- CDN improves performance and availability

---

## 13. INTERVIEW ONE-LINER

> A CDN is a globally distributed network of edge servers that cache and deliver content closer to users to reduce latency, offload origin servers, and improve availability. Pull CDNs fetch content on demand, while push CDNs require pre-uploading content.
