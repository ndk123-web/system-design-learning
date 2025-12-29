# 📘 TCP (Transmission Control Protocol) — System Design README

## WHY TCP EXISTS

IP networks are **unreliable by default**:

- Packets can be lost
- Packets can arrive out of order
- Packets can get corrupted
- Network can get congested

But applications (web, DB, auth, payments) need:

- Correct data
- Correct order
- No corruption

👉 **TCP exists to provide reliability on top of IP.**

---

## WHAT TCP IS

**TCP (Transmission Control Protocol)** is a:

> **Connection-oriented, reliable, ordered byte-stream protocol** built on top of IP.

Key properties:

- **Connection-oriented** → connection first, data later
- **Reliable** → data loss handled automatically
- **Ordered** → same order as sent
- **Byte stream** → TCP does not know messages, only bytes

---

## HOW TCP WORKS

### 1️⃣ TCP Connection (3-Way Handshake)

Before data transfer, TCP establishes a connection:

```
Client → SYN
Server → SYN + ACK
Client → ACK
```

After this:

- Both sides agree on sequence numbers
- Connection is established

---

### 2️⃣ Data Transfer (Reliability Guarantees)

TCP ensures reliability using:

- **Sequence numbers** → ordering
- **ACKs** → confirmation of receipt
- **Retransmission** → resend on loss
- **Checksum** → corruption detection

All of this is handled by TCP automatically.

---

### 3️⃣ Flow Control

Problem:

- Sender fast
- Receiver slow

Solution:

- Receiver advertises window size
- Sender limits how much it sends

👉 Prevents receiver overload.

---

### 4️⃣ Congestion Control

Problem:

- Network itself congested

Solution:

- TCP adapts sending rate
- Packet loss → slow down
- Stable network → speed up

👉 TCP protects the **network**, not just endpoints.

---

## WHY TCP IS SLOWER THAN UDP

Because TCP adds:

- Handshake
- ACKs
- Retransmissions
- Flow control
- Congestion control

This adds **latency and memory cost**, but gives **correctness**.

---

## EXAMPLES: WHAT RUNS ON TCP

Most application protocols run **on top of TCP**:

```
Application Protocol
↓
TCP
↓
IP
```

Examples:

- HTTP / HTTPS
- GraphQL (over HTTP)
- PostgreSQL
- MongoDB
- Redis
- SMTP
- FTP
- SSH

👉 **GraphQL is NOT a transport protocol**
It is just a query language over HTTP → TCP.

---

## DOUBT #1

### “Agar server listen nahi kar raha, to 3-way handshake hoga kya?”

### Short answer

❌ **No. Handshake complete nahi hota.**

---

### Case A: Server is up, but port NOT listening

```
Client → SYN
Server → RST
```

- OS responds: “No service here”
- Connection fails immediately

---

### Case B: Server unreachable / down

```
Client → SYN
(no response)
Client → retry
timeout
```

- No SYN-ACK
- Handshake never completes

---

### Final conclusion

> **TCP handshake completes ONLY if the server is alive AND listening on that port.**

---

## DOUBT #2

### “Connection pool kaha hota hai? Server side ya DB side?”

### Important rule (LOCK THIS)

> **Connection pooling is ALWAYS client-side.**

---

## WHAT IS A TCP CONNECTION (CLARITY)

A TCP connection is between:

```
(Client IP + Port) ↔ (Server IP + Port)
```

Whoever **initiates** the connection is the **client**.

---

## WHERE CONNECTION POOLS LIVE

### Backend → Database

```
Backend app = TCP client
Database    = TCP server
```

👉 **Backend maintains connection pool**

Database:

- Accepts connections
- Enforces max connections
- Does NOT create pools for you

---

### Backend → Redis / Mongo

Same rule:

- Backend is client
- Backend maintains pool

---

### Browser → Backend

- Browser also uses connection pooling
- HTTP keep-alive
- TCP reuse

---

## COMMON MISUNDERSTANDING (FIXED)

❌ “Cloud DB already keeps pool ready”

✔️ Reality:

- Cloud DB only **listens and limits**
- Pooling logic lives in:

  - App
  - DB driver
  - ORM

---

## WHY POOLING EXISTS

Creating a TCP connection is expensive:

- 3-way handshake
- Kernel memory
- Context switching

Pooling:

- Reuses existing connections
- Avoids repeated handshakes
- Improves performance

---

## LOGIC (CORE IDEA)

```
TCP = reliable pipe
Pooling = reuse the pipe
```

TCP guarantees correctness.
Pooling reduces cost.

---

## WHEN TO USE TCP

Use TCP when:

- Data must arrive intact
- Order matters
- Correctness > latency

Examples:

- Web APIs
- Databases
- Authentication
- Payments

---

## WHEN TCP IS NOT IDEAL

Not ideal for:

- Real-time video
- Voice calls
- Gaming

Because:

- Retransmission adds delay
- Old packets are useless

---

## CONCEPTUAL MENTAL MODEL (LOCK THIS)

```
IP   → unreliable network
TCP  → reliable ordered stream
APP  → meaning of data
```

And:

```
Handshake creates connection
Connection pool reuses it
```

---

## FINAL ONE-LINE SUMMARY

> **TCP provides a reliable, ordered byte stream between two endpoints, and connection pooling is a client-side optimization to reuse expensive TCP connections.**
