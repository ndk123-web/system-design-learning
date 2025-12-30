# 📘 gRPC (Google Remote Procedure Call) — System Design README

## WHY gRPC EXISTS

Traditional REST/HTTP APIs create problems in large systems:

- JSON is **slow and heavy**
- No strict schema → runtime bugs
- HTTP/1.1 inefficiencies
- Hard to model **function-like behavior**
- Poor performance for service-to-service calls

Large-scale systems needed:

- Fast communication
- Strong contracts
- Low latency
- Multi-language support
- Clear function semantics

👉 **gRPC exists to make remote function calls fast, typed, and efficient.**

---

## WHAT IS gRPC

**gRPC** is:

> A **high-performance RPC framework** that allows services to call functions on other services over the network as if they were local functions.

gRPC is built on:

- **RPC pattern** (action-oriented)
- **Protocol Buffers** (binary serialization)
- **HTTP/2** (multiplexed transport)

In short:

```
gRPC = RPC + Protobuf + HTTP/2
```

---

## HOW gRPC WORKS (BIG PICTURE)

```
Client
 → calls function
 → Protobuf serializes data (binary)
 → HTTP/2 stream
 → Server
   → Protobuf deserializes
   → function executes
   → response serialized
 → Client receives response
```

Developer only sees:

```js
result = client.sayHello(req);
```

Network is hidden.

---

## CORE BUILDING BLOCKS OF gRPC

1. **.proto file** → contract
2. **Code generation** → stubs
3. **Server implementation**
4. **Client stub**
5. **HTTP/2 transport**

Everything starts with `.proto`.

---

# 🧩 EXAMPLE: HELLO WORLD gRPC

---

## STEP 1️⃣ `.proto` FILE (CONTRACT)

```proto
syntax = "proto3";

package hello;

service Greeter {
  rpc SayHello (HelloRequest) returns (HelloReply);
}

message HelloRequest {
  string name = 1;
}

message HelloReply {
  string message = 1;
}
```

### Explanation (line by line)

```proto
syntax = "proto3";
```

→ Using Protobuf version 3

```proto
package hello;
```

→ Namespace (like a module)

```proto
service Greeter
```

→ RPC service (like an interface)

```proto
rpc SayHello(...)
```

→ Remote function declaration

```proto
string name = 1;
```

→ Field number `1` = **binary ID**
(Field numbers identify data in Protobuf, not field names)

⚠️ Field numbers must **never change**.

---

## STEP 2️⃣ SERVER CODE (Node.js)

```js
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

// Load proto schema
const packageDef = protoLoader.loadSync("hello.proto");
const proto = grpc.loadPackageDefinition(packageDef).hello;

// RPC function implementation
function sayHello(call, callback) {
  const name = call.request.name;

  callback(null, {
    message: `Hello ${name}`,
  });
}

// Create gRPC server
const server = new grpc.Server();

// Bind service definition to implementation
server.addService(proto.Greeter.service, {
  SayHello: sayHello,
});

// Start server
server.bindAsync("0.0.0.0:50051", grpc.ServerCredentials.createInsecure(), () =>
  server.start()
);
```

---

### SERVER CODE EXPLANATION

```js
protoLoader.loadSync("hello.proto");
```

→ Reads `.proto` file and parses schema

```js
grpc.loadPackageDefinition(...).hello
```

→ Loads `package hello` namespace

```js
function sayHello(call, callback)
```

→ RPC handler

- `call.request` → decoded Protobuf request
- `callback` → sends response

```js
server.addService(...)
```

→ Maps RPC definitions to JS functions

```js
createInsecure();
```

→ No TLS (development only)

```js
server.start();
```

→ Starts HTTP/2 gRPC server

---

## STEP 3️⃣ CLIENT CODE

```js
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

// Load proto
const packageDef = protoLoader.loadSync("hello.proto");
const proto = grpc.loadPackageDefinition(packageDef).hello;

// Create client stub
const client = new proto.Greeter(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

// Call remote function
client.SayHello({ name: "Ndk" }, (err, response) => {
  console.log(response.message);
});
```

---

### CLIENT CODE EXPLANATION

```js
new proto.Greeter(...)
```

→ Auto-generated client stub

```js
client.SayHello(...)
```

→ Looks like local function
→ Actually sends network request

Internally:

- Serialize request (Protobuf)
- Send via HTTP/2
- Server executes
- Response returned

---

## WHY gRPC IS FAST

1. **Binary serialization (Protobuf)**

   - Smaller payloads
   - Faster parsing

2. **HTTP/2**

   - Multiplexing
   - Single TCP connection
   - Header compression

3. **Strong contracts**

   - Compile-time validation
   - No guessing

---

## gRPC vs REST (LOGIC)

| Aspect           | REST              | gRPC              |
| ---------------- | ----------------- | ----------------- |
| Style            | Resource-oriented | Action-oriented   |
| Data format      | JSON              | Protobuf (binary) |
| Transport        | HTTP/1.1          | HTTP/2            |
| Schema           | Optional          | Mandatory         |
| Performance      | Medium            | High              |
| Browser friendly | Yes               | No (mostly)       |

---

## WHEN TO USE gRPC

Use gRPC when:

- Internal microservices
- High throughput required
- Low latency critical
- Strong contracts needed
- Polyglot systems

Do NOT use gRPC when:

- Public APIs
- Browser-first apps
- Simple CRUD APIs

---

## LOGIC (CORE IDEA)

REST says:

> “Manipulate resources over HTTP”

gRPC says:

> “Call functions over the network efficiently”

---

## CONCEPTUAL MENTAL MODEL (LOCK THIS)

```
Function call
   ↓
gRPC stub
   ↓
Protobuf (binary)
   ↓
HTTP/2 stream
   ↓
Remote execution
```

---

## FINAL ONE-LINE SUMMARY

> **gRPC is a high-performance, strongly-typed RPC framework that uses Protocol Buffers and HTTP/2 to make remote function calls fast, efficient, and language-agnostic.**
