# 📘 External Configuration Store

![Image](https://docs.microsoft.com/en-us/azure/architecture/patterns/_images/external-configuration-store-overview.png)

---

## 🔹 One-Line Intuition

> **External Configuration Store means configuration lives outside the application and is fetched at runtime from a centralized system.**

Code stays static.
Configuration stays dynamic.

---

## 1️⃣ Why This Pattern Exists

### The core problem

Traditionally, applications store configuration in:

- `.env` files
- config files inside the repo
- hardcoded constants

This causes serious production issues:

- Config change requires redeploy
- Secrets leak into source control
- Environment differences create bugs
- Infra teams must touch app code
- Scaling config across services is painful

**Configuration changes far more often than code**, yet they are coupled.

This pattern exists to **break that coupling**.

---

## 2️⃣ What Is an External Configuration Store

An **External Configuration Store** is:

- a centralized system
- that stores application configuration
- separately from application code
- and serves it to applications at runtime

Applications:

- do not own configuration
- only consume it

---

## 3️⃣ What Counts as Configuration (Important)

### ✅ Configuration

- Database host / port
- Timeouts
- Retry limits
- Feature flags
- Service endpoints
- Rate limits
- Environment-specific values

### ❌ Not Configuration

- Business rules
- Core logic
- User data
- Workflow decisions

Rule:

> **Configuration changes behavior, not meaning.**

---

## 4️⃣ High-Level Architecture

```
Client
  |
  v
Application
  |
  |  fetch / refresh
  v
External Configuration Store
```

The config store is the **single source of truth**.

---

## 5️⃣ How It Works (Step-by-Step Flow)

### Step 1 — Bootstrap configuration (minimal `.env`)

The app still uses `.env`, but **only for startup info**:

```env
CONFIG_STORE_URL=https://config.internal
CONFIG_APP_NAME=order-service
CONFIG_ENV=prod
CONFIG_TOKEN=xxxx
```

This information is:

- stable
- rarely changed
- required only to locate the config store

---

### Step 2 — Fetch configuration at runtime

On startup (or periodically), the app fetches config:

```
GET /config?app=order-service&env=prod
```

Example response:

```json
{
  "DB_HOST": "prod-db.internal",
  "DB_PORT": 5432,
  "TIMEOUT": 30,
  "FEATURE_X_ENABLED": true
}
```

---

### Step 3 — Load into memory

The application:

- loads config into memory
- does not read files anymore
- uses config as normal variables

To the code, it looks like:

```
config.DB_HOST
```

Source is external, usage is local.

---

## 6️⃣ Runtime Update Models

There are three common strategies:

### 1️⃣ Load at startup

- Config loaded once
- Restart required for changes
- Simple and safe

---

### 2️⃣ Periodic refresh (polling)

- App re-fetches config every N seconds
- Gradual updates
- Common in production

---

### 3️⃣ Watch / push-based

- Config changes push updates to app
- Near-real-time
- Complex and risky if misused

---

## 7️⃣ Handling Failures (Critical)

**Config store is a dependency. It can fail.**

Correct behavior:

- Cache last known config
- Continue running if store is unavailable
- Fail only if startup config cannot be loaded

Rule:

> **Config store must never take the system down.**

---

## 8️⃣ Security & Secrets

- Secrets should **not** live in code or Git
- External config stores often integrate with:

  - secret managers
  - encryption
  - access control
  - audit logs

Common model:

```
Config Store
   |
   +── Secret Manager
```

Apps receive secrets securely at runtime.

---

## 9️⃣ Where This Pattern Is Used

- Microservices architectures
- Multi-environment systems (dev/staging/prod)
- Feature flag platforms
- Cloud-native applications
- Large organizations with platform teams

If config differs per environment → this pattern is required.

---

## 🔟 Benefits

- No redeploy for config changes
- Centralized configuration management
- Better security for secrets
- Faster operational response
- Cleaner application code

---

## 1️⃣1️⃣ Drawbacks

- Additional runtime dependency
- Requires caching & fallback logic
- Config store must be highly available
- Operational discipline needed

Nothing is free.

---

## 1️⃣2️⃣ Trade-offs

| You Gain       | You Pay           |
| -------------- | ----------------- |
| Flexibility    | Extra dependency  |
| Faster changes | Runtime coupling  |
| Security       | Ops complexity    |
| Control        | Availability risk |

This pattern trades **deployment simplicity** for **runtime control**.

---

## 1️⃣3️⃣ Common Mistakes

❌ Putting all config in `.env` forever
❌ Storing secrets in Git
❌ Treating config store like a database
❌ No fallback when store is down
❌ Over-dynamic config changes

---

## 1️⃣4️⃣ Relationship to Other Patterns

- **Sidecar** → can fetch config on behalf of app
- **Gateway Offloading** → uses centralized config
- **Feature Flags** → implemented via config store
- **12-Factor App** → config outside code

This is a **foundational pattern**, not an optimization.

---

## 🧠 Final Lock

> **External Configuration Store exists because changing configuration should never require changing or redeploying application code.**
