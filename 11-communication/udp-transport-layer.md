# 📘 UDP (User Datagram Protocol) — System Design README

## WHY UDP EXISTS

TCP provides:

- Reliability
- Ordering
- Congestion control

But these guarantees add:

- Latency
- Retransmission delays
- Head-of-line blocking
- Extra CPU and memory cost

Some applications care more about:

- Speed
- Fresh data
- Real-time response

In such cases:

> **Late data is worse than lost data**

👉 UDP exists to provide **fast, low-latency communication** without heavy guarantees.

---

## WHAT UDP IS

**UDP (User Datagram Protocol)** is:

> A **connectionless**, **best-effort**, **message-oriented** transport protocol built on top of IP.

Key characteristics:

- **Connectionless** → no handshake
- **Best-effort delivery** → packets may be lost
- **No ordering guarantee**
- **No retransmission**
- **No congestion control**
- **Message-based** (datagrams)

UDP does **not** try to fix network problems — it exposes them.

---

## HOW UDP WORKS

### 1️⃣ No Connection Setup

TCP:

```
Handshake → Connection → Data
```

UDP:

```
Send → Send → Send
```

No setup, no teardown.

---

### 2️⃣ Datagram Model

UDP sends data as **datagrams**:

- Each datagram is independent
- Each has its own header and payload
- No relationship with other datagrams

As a result:

- Packets can arrive out of order
- Packets can be dropped
- Packets can be duplicated

UDP does not care.

---

### 3️⃣ No Flow or Congestion Control

UDP does not:

- Slow down for receiver
- Slow down for network congestion

Sender sends as fast as it wants.

---

## WHY UDP IS FAST

UDP avoids all TCP overhead:

- ❌ No handshake
- ❌ No acknowledgements
- ❌ No retransmission
- ❌ No flow control
- ❌ No congestion control

Result:

- Very low latency
- Low memory usage
- High throughput

> **Less guarantees = more speed**

---

## EXAMPLES (WHERE UDP IS USED)

### 🎥 Video & Voice (VoIP, Video Chat)

- Old frames are useless
- Latest frame matters

UDP drops old data instead of delaying new data.

---

### 🎮 Real-Time Multiplayer Games

- Player position updates
- Old position = irrelevant

UDP keeps gameplay smooth.

---

### 🌐 DHCP (Broadcast Use Case)

New device:

- Has no IP address

Flow:

```
Client → UDP Broadcast: “Is there a DHCP server?”
DHCP → UDP Response: “Here is your IP”
```

TCP cannot do this.

---

### 📡 Streaming & Live Feeds

- Minor loss acceptable
- Delay unacceptable

UDP fits perfectly.

---

## UDP + APPLICATION LOGIC

UDP provides **no reliability**.

Real systems build logic **on top of UDP**:

- Application-level sequence numbers
- Custom acknowledgements
- Selective retransmission
- Forward Error Correction (FEC)

Examples:

- RTP
- QUIC
- WebRTC
- Game networking protocols

> **UDP gives raw speed, applications add intelligence.**

---

## TCP vs UDP (Quick Comparison)

| Feature            | TCP        | UDP         |
| ------------------ | ---------- | ----------- |
| Connection         | Yes        | No          |
| Reliability        | Guaranteed | Best-effort |
| Ordering           | Guaranteed | No          |
| Latency            | Higher     | Very low    |
| Congestion control | Yes        | No          |
| Broadcast          | No         | Yes         |

---

## WHEN TO USE UDP

Use UDP when:

- Lowest latency is required
- Late data is worse than lost data
- Real-time systems
- You want full control over error handling

Do NOT use UDP when:

- Data correctness is critical
- Order must be preserved
- Financial or authentication data is involved

---

## LOGIC (CORE IDEA)

TCP philosophy:

> **Better late than wrong**

UDP philosophy:

> **Better fast than perfect**

---

## CONCEPTUAL MENTAL MODEL (LOCK THIS)

```
IP   → unreliable network
TCP  → reliable ordered stream
UDP  → fast best-effort messages
APP  → decides correctness
```

---

## FINAL ONE-LINE SUMMARY

> **UDP is a fast, connectionless transport protocol that sacrifices reliability and ordering to achieve the lowest possible latency for real-time applications.**
