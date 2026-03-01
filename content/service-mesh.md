# Service Mesh Wiring

## Overview

Water Framework uses a declarative **service mesh** model to wire microservices together. Each module declares its dependencies and contracts via the `waterDescriptor {}` Gradle DSL block. The framework generates a machine-readable `water-descriptor.json` artifact and uses it to wire the service mesh at deployment time.

---

## The waterDescriptor DSL

Every Water module that participates in the platform declares its descriptor in `build.gradle`:

```groovy
waterDescriptor {
    moduleId    = 'com.myapp.product'           // unique module identifier
    displayName = 'Product Service'              // human-readable name
    description = 'Product catalog management'  // description

    output {
        // What this module PROVIDES to the platform
        pin('com.myapp.integration.product') {}
    }

    input {
        // What this module NEEDS from the platform
        standardPin 'jdbc'               // database connection
        standardPin 'service-discovery' // register in service registry
        pin('it.water.integration.permission') {}  // permission checks
    }

    properties {
        // Optional: configurable properties with defaults
        property('product.maxItems') {
            defaultValue = '100'
            description  = 'Maximum items per page'
        }
    }
}
```

---

## Standard PINs

Standard PINs are predefined shorthand aliases for common Water integration contracts:

| Standard PIN | Full ID | Provider |
|---|---|---|
| `jdbc` | `it.water.persistence.jdbc` | Any JDBC DataSource |
| `service-discovery` | `it.water.service-discovery` | ServiceDiscovery module |
| `authentication-issuer` | `it.water.integration.authentication-issuer` | Authentication module |
| `api-gateway` | `it.water.api-gateway` | ApiGateway module |
| `cluster-coordinator` | `it.water.cluster.coordinator` | ZookeeperConnector module |

---

## The service-discovery Convention

**Every module that exposes REST endpoints MUST declare the `service-discovery` input PIN.**

This allows the module to register itself in the Water service registry at startup, making it discoverable by the API Gateway and other integration clients.

```groovy
// Required for ALL REST-exposing services
input {
    standardPin 'service-discovery'
}
```

### Modules with this PIN declared

| Module | Module ID | Notes |
|---|---|---|
| User-service | `it.water.user` | User management REST API |
| Authentication-service | `it.water.authentication` | JWT authentication |
| Role-service | `it.water.role` | Role management |
| Permission-service | `it.water.permission` | Permission management |
| SharedEntity-service | `it.water.shared.entity` | Entity sharing |
| Company-service | `it.water.company` | Multi-tenancy |
| DocumentsManager-service | `it.water.documents.manager` | Document management |
| EthereumConnector-service | `it.water.ethereum` | Blockchain integration |
| ApiGateway-service | `it.water.api.gateway` | The gateway itself |
| EMail-service | `it.water.email` | Email service |

---

## Integration Clients

Integration clients are **standalone modules** that expose a remote REST client for calling another Water service. They declare an **output PIN** (the integration contract) and the `service-discovery` input PIN (to resolve the remote service URL).

### Available Integration Clients

| Module | Output PIN | Usage |
|---|---|---|
| `User-service-integration` | `it.water.integration.user` | Resolve users by username/email across services |
| `Permission-integration` | `it.water.integration.permission` | Check permissions from a remote Permission service |
| `SharedEntity-service-integration` | `it.water.integration.shared-entity` | Check sharing relationships remotely |

### Adding an Integration Client

To make your service use the remote Permission service:

**1. Add the dependency in `build.gradle`:**
```groovy
dependencies {
    implementation 'it.water.permission:Permission-integration:' + project.waterVersion
}
```

**2. Declare the input PIN in `waterDescriptor`:**
```groovy
waterDescriptor {
    input {
        standardPin 'service-discovery'
        pin('it.water.integration.permission') {}
    }
}
```

**3. Inject in your service:**
```java
@FrameworkComponent
public class MyServiceImpl implements MyApi {

    @Inject
    private PermissionIntegrationClient permissionClient;

    public MyEntity find(long id) {
        // Check permission before returning
        permissionClient.checkPermission(
            MyEntity.class.getName(), id, CrudActions.FIND);
        return repository.find(id);
    }
}
```

---

## In-Process vs. Remote

The same integration client interface works both **in-process** (same JVM) and **remote** (HTTP). Switch the deployment model without changing business code:

| Scenario | Client Used | How it Works |
|---|---|---|
| Monolith / same JVM | `*LocalIntegrationClient` | Calls the service bean directly via `@Inject` |
| Microservice / remote | `*RestIntegrationClient` | Makes HTTP calls via the service URL resolved from Service Discovery |

The framework selects the appropriate implementation based on what's available in the `ComponentRegistry` at startup.

---

## Descriptor Generation

The `generateWaterDescriptor` Gradle task (runs automatically during build) produces:

```
build/water/water-descriptor.json
```

Example output:
```json
{
  "moduleId": "it.water.permission.integration",
  "displayName": "Permission Service Integration Client",
  "description": "Remote REST integration client for permission checks",
  "outputs": [
    { "name": "it.water.integration.permission" }
  ],
  "inputs": [
    { "name": "it.water.service-discovery" }
  ]
}
```

This JSON is also published as a Maven artifact with classifier `@water.json`, allowing the Water platform to build a complete dependency graph of all deployed modules.

---

## Service Mesh Wiring Graph

```
ApiGateway ──────────────────────────────► All REST Services
      │                                        │
      ▼                                        ▼
ServiceDiscovery ◄──── [service-discovery PIN] ──── All Services

User-service ──► it.water.integration.user ──► User-integration-client
Permission-service ──► it.water.integration.permission ──► Permission-integration-client
SharedEntity-service ──► it.water.integration.shared-entity ──► SharedEntity-integration-client

Company-service ──────────────────────────────────────────────────────────────────────────────────────────────┐
    │ uses SharedEntity-integration-client (in-process or remote)                                              │
    │ uses User-integration-client (in-process or remote)                                                      ▼
    └──────────────────────────────────────────────────────────────────────────────────► Business Logic
```

---

## Coming Soon — Microservice Designer

> **Roadmap preview**

We are working on a **visual Microservice Designer** — a web-based interface where you can design your entire microservice architecture by drawing it, without writing a single line of configuration manually.

### What the designer will allow you to do

- **Drag & drop modules** onto a canvas (services, databases, gateways, connectors)
- **Draw connections** between modules to define input/output PIN relationships visually
- **Auto-generate** `waterDescriptor {}` blocks for every module directly from the diagram
- **Visualize the service mesh** in real time as you add or remove components
- **Export** the architecture as a Gradle multi-project workspace ready to build with `yo water:build`
- **Import** an existing workspace and reverse-engineer the mesh graph from existing `water-descriptor.json` artifacts

### Why it matters

Today, service mesh wiring is already simple — just a few lines in `build.gradle`. With the Microservice Designer it becomes **zero-configuration**: design visually, export, build. Combined with Claude Code, you'll be able to describe your architecture in natural language, let the AI lay it out on the canvas, then generate the full project structure in one click.

---

## Best Practices

1. **Always declare `service-discovery` input** for any module with REST endpoints
2. **Prefer integration clients** over direct service injection for cross-module calls
3. **Use standard PINs** whenever possible — they're shorter and guaranteed to match
4. **Keep `waterDescriptor` lean** — only declare what you actually use
5. **Verify descriptors after build** — check `build/water/water-descriptor.json` to confirm inputs and outputs are correct
