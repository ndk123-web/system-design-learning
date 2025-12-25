# 🌐 DNS — Domain Name System (Deep & Clean)

## 🔵 WHY (Why DNS exists)

Computers **IP addresses** samajhte hain
Hum **names** yaad rakhte hain.

- Computer: `142.250.183.206`
- Human: `google.com`

👉 DNS ka kaam:

> **Human-friendly name → Machine-friendly IP**

Without DNS:

- Har website ka IP yaad rakhna padta
- IP change hua → website broken

---

## 🔵 WHAT (What DNS actually is)

> **DNS is a distributed, hierarchical system that maps domain names to IP addresses and other metadata.**

Important words:

- **Distributed** → ek jagah nahi
- **Hierarchical** → levels hote hain
- **Cached** → speed ke liye

---

## 🔵 HOW (How DNS works — full flow)

Assume user types:

```
www.example.com
```

### STEP 0 — Browser / OS Cache

- Check: “Kya ye name pehle resolve kiya hai?”
- TTL valid hai → return IP immediately

---

### STEP 1 — Recursive Resolver (ISP / Router / Public DNS)

Example:

- ISP DNS
- Google DNS (8.8.8.8)
- Cloudflare DNS (1.1.1.1)

Agar cache miss:
→ resolver aage poochta hai

---

### STEP 2 — Root DNS Servers

- Root ko sirf itna pata:

  > “`.com` ka kaun authoritative hai?”

Root ≠ actual IP deta
Root sirf **direction** deta hai

---

### STEP 3 — TLD DNS (.com)

- `.com` server batata hai:

  > “example.com ke nameservers ye hain”

---

### STEP 4 — Authoritative Name Server

- Ye final source of truth hota hai
- Yahin pe A / CNAME / MX etc stored hote hain
- IP address yahin se milta hai

---

### STEP 5 — Response back + Cache

- Resolver IP return karta
- TTL ke hisaab se cache ho jata

---

## 🔑 DNS Hierarchy (lock this)

```
Root (.)
 └── TLD (.com)
     └── Authoritative (example.com)
```

---

# 📄 DNS RECORD TYPES (WHY + WHAT + HOW + EXAMPLE)

---

## 🟢 1. A Record (Address)

### WHAT

> Domain → IPv4 address

### WHY

Server ka actual IP batane ke liye

### EXAMPLE

```
example.com → 93.184.216.34
```

### USE CASE

- Website
- API backend

---

## 🟢 2. AAAA Record

### WHAT

> Domain → IPv6 address

### WHY

IPv6 support

### EXAMPLE

```
example.com → 2606:2800:220:1:248:1893:25c8:1946
```

---

## 🟢 3. CNAME (Canonical Name)

### WHAT

> One domain → another domain

### WHY

IP directly mat do, kisi aur name pe depend karo

### EXAMPLE

```
www.example.com → example.com
```

or

```
api.example.com → api.backend.company.com
```

### IMPORTANT RULE

❌ Root domain (`example.com`) pe CNAME allowed nahi (mostly)

---

## 🟢 4. NS Record (Name Server)

### WHAT

> Batata hai **kaun DNS manage karega**

### WHY

Authority decide karne ke liye

### EXAMPLE

```
example.com → ns1.cloudflare.com
example.com → ns2.cloudflare.com
```

---

## 🟢 5. MX Record (Mail Exchange)

### WHAT

> Email receive karne wala server

### WHY

Mail delivery routing

### EXAMPLE

```
example.com → mail.google.com (priority 10)
```

Lower priority number = higher priority

---

## 🟢 6. TXT Record

### WHAT

> Free-form text data

### WHY (most important)

- Domain ownership verification
- Email security
- Integrations

### COMMON USE CASES

- SPF
- DKIM
- DMARC
- Google verification
- Cloudflare verification

### EXAMPLE

```
TXT "v=spf1 include:_spf.google.com ~all"
```

---

## 🟢 7. SRV Record

### WHAT

> Service discovery

### WHY

Service + port mapping

### EXAMPLE

```
_sip._tcp.example.com → sipserver.example.com:5060
```

---

# ⏱️ TTL (Time To Live)

### WHAT

> Cache expiry time

### WHY

Balance between:

- Fresh data
- DNS load

### LOGIC

- Low TTL → fast change, more DNS queries
- High TTL → slow change, fewer queries

---

# ☁️ Managed DNS (Cloudflare / Route53)

---

## 🔵 WHAT Managed DNS Does

- Hosts your DNS records
- High availability
- Fast global resolution
- DDoS protection
- Advanced routing

---

## 🔥 Cloudflare Nameserver — YOUR BIG CONFUSION CLEARED

### What YOU do:

1. Buy domain (GoDaddy, Namecheap, etc)
2. Cloudflare gives **nameservers**

   ```
   ns1.cloudflare.com
   ns2.cloudflare.com
   ```

3. You update **NS records at registrar**

---

### What happens NEXT (important):

❗ **DNS records are NOT auto-copied by magic**

Two cases:

### CASE 1 — Auto Scan (Cloudflare feature)

- Cloudflare scans existing DNS
- Copies records into Cloudflare DNS
- You must VERIFY them

### CASE 2 — Manual

- You manually add A / CNAME / MX / TXT
- Cloudflare becomes source of truth

After NS change:
👉 **Cloudflare becomes authoritative DNS**

Registrar DNS is no longer used.

---

## 🔵 DNS-Based Traffic Routing (Advanced)

---

### 🟡 Weighted Round Robin

### WHY

Traffic split control

### EXAMPLE

- Server A → 80%
- Server B → 20%

Use cases:

- A/B testing
- Gradual rollout
- Maintenance

---

### 🟡 Latency-Based Routing

### WHY

User ko nearest server mile

### EXAMPLE

- India user → Mumbai
- US user → Virginia

---

### 🟡 Geo-Based Routing

### WHY

Country-specific routing

### EXAMPLE

- EU traffic → EU servers
- India traffic → India servers

---

# 🧠 LOGIC (System Design Insight)

DNS is used for:

- **Load balancing**
- **Failover**
- **Multi-region availability**
- **Traffic steering**
- **Blue-green deployment**

DNS is NOT just “name → IP”.

---

# 🌍 CONCEPT (Big Picture)

> DNS is the **first load balancer of the internet**.

Before:

- CDN
- Reverse proxy
- API gateway

DNS already decides:

- WHERE traffic goes
- WHICH server gets hit

---

# ⭐ FINAL MEMORY KEYS (LOCK THESE)

- DNS = name → metadata system
- Hierarchical + distributed
- Authoritative server = source of truth
- NS decides **who controls DNS**
- Cloudflare NS = Cloudflare controls DNS
- Records live at authoritative DNS
- TTL controls cache & propagation
- DNS can route traffic intelligently

---

## 🎯 Interview-ready one-liner

> _“DNS is a hierarchical, distributed system that resolves domain names to IP addresses and other records, and is often used as the first layer of traffic routing, load balancing, and failover in large-scale systems.”_
