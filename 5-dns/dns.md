# DNS — Domain Name System (Complete Guide, NDK Style)

## 1. WHY DNS EXISTS

Computers understand **IP addresses**.
Humans remember **names**.

DNS exists to translate:

```
www.example.com → 93.184.216.34
```

Without DNS:

- You would need to remember IP addresses
- IP changes would break websites

---

## 2. WHAT DNS IS

DNS is a **distributed, hierarchical naming system** that maps domain names to:

- IP addresses
- Mail servers
- Verification data
- Service metadata

DNS is:

- Distributed (not one server)
- Hierarchical (layers)
- Cached (for performance)

---

## 3. DNS HIERARCHY (VERY IMPORTANT)

```
Root (.)
 └── TLD (.com, .in, .org)
     └── Authoritative DNS (Cloudflare / Route53)
```

- Root and TLD **do not store A records**
- They only store **nameserver delegation**

---

## 4. WHO CONTROLS WHAT (ROLES CLEARLY SEPARATED)

### ICANN

- Global governing body
- Assigns TLDs to registry operators
- Accredits registrars

### TLD Registry (Registry Operator)

A registry operator **runs and maintains a TLD**.

Examples:

- .com → Verisign
- .in → INRegistry
- .org → Public Interest Registry

Registry stores:

```
example.com → ns1.cloudflare.com, ns2.cloudflare.com
```

Registry **does NOT store A/CNAME/MX records**.

---

### Registrar (Namecheap)

Registrar:

- Sells domains
- Manages renewals
- Updates the TLD registry on your behalf

When you change nameservers in Namecheap:

```
ns1.cloudflare.com
ns2.cloudflare.com
```

Namecheap tells the TLD registry:

> "example.com ke nameservers Cloudflare hain"

After this, Namecheap **no longer participates in DNS resolution**.

---

### Authoritative DNS (Cloudflare)

Authoritative DNS is the **single source of truth**.

Cloudflare stores:

- A records
- CNAME records
- MX records
- TXT records

Only this layer answers:

> "example.com ka IP kya hai?"

---

## 5. NAMESERVER vs DNS RECORDS (KEY CONFUSION SOLVED)

### Nameserver (WHO)

Nameserver answers:

> "Is domain ke DNS records kaun control karta hai?"

Example:

```
example.com → ns1.cloudflare.com
```

---

### A / CNAME / MX Records (WHAT)

These answer:

> "Domain ka mapping kya hai?"

Example:

```
example.com → 1.2.3.4
```

**Nameserver decides WHO controls DNS.**
**Records define WHAT the mapping is.**

---

## 6. COMPLETE DNS FLOW (USER → SERVER)

1. User types `www.example.com`
2. Browser/OS cache checked
3. Recursive DNS (ISP / 8.8.8.8)
4. Root server → directs to TLD
5. TLD registry → returns nameservers
6. Cloudflare (authoritative) → returns A record
7. Browser connects to IP

Namecheap is only involved at step 5 (indirectly).

---

## 7. DNS RECORD TYPES (WHY / WHAT / EXAMPLES)

### A Record

Maps domain to IPv4 address.

```
example.com → 1.2.3.4
```

---

### AAAA Record

Maps domain to IPv6 address.

---

### CNAME

Maps one name to another name.

```
www.example.com → example.com
```

---

### MX Record

Defines mail servers.

```
example.com → mail.google.com
```

---

### TXT Record

Stores verification and security data.

Use cases:

- SPF
- DKIM
- DMARC
- Domain ownership verification

---

### NS Record

Specifies authoritative DNS servers.

```
example.com → ns1.cloudflare.com
```

---

## 8. TTL (TIME TO LIVE)

TTL controls caching duration.

- Low TTL → faster changes, more DNS traffic
- High TTL → slower changes, better performance

---

## 9. CLOUDFARE NAMESERVER — WHAT REALLY HAPPENS

When you set Cloudflare nameservers in Namecheap:

- TLD registry points to Cloudflare
- Cloudflare becomes authoritative DNS
- Namecheap DNS records are ignored

DNS records are **not copied everywhere**.
Only **one authoritative source exists**.

---

## 10. SINGLE SOURCE OF TRUTH (VERY IMPORTANT)

| Layer              | Role                |
| ------------------ | ------------------- |
| Root               | Direction only      |
| TLD Registry       | Nameserver pointer  |
| Registrar          | Updates registry    |
| **Cloudflare DNS** | **Actual DNS data** |
| Recursive DNS      | Cache               |

---

## 11. DNS ROUTING (ADVANCED)

DNS can route traffic using:

- Weighted round robin
- Latency-based routing
- Geo-based routing

DNS acts as the **first load balancer of the internet**.

---

## 12. FINAL MEMORY KEYS

- DNS is hierarchical and distributed
- Nameservers decide WHO controls DNS
- Records define WHAT the mapping is
- Only authoritative DNS is source of truth
- Registrars do not answer DNS queries
- Registry stores delegation, not records

---

## 13. INTERVIEW ONE-LINER

> DNS is a hierarchical, distributed system where registrars update TLD registries with nameserver delegations, and authoritative DNS providers store and serve the actual DNS records.
