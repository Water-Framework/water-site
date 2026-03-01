# AI-Powered Development with Water Framework

## Claude Code + yo water = Extreme Productivity

Water Framework is designed from the ground up to be **AI-assisted**. The combination of a well-structured architecture, consistent code patterns, and the `yo water` Yeoman generator gives Claude Code everything it needs to scaffold entire microservices in seconds.

---

## Why Water is AI-Ready

### 1. Consistent, Learnable Patterns

Every Water module follows the same structure:

```
MyModule/
├── MyModule-api/         ← interfaces (MyApi, MySystemApi, MyRestApi)
├── MyModule-model/       ← JPA entities, DTOs, constants
├── MyModule-service/     ← service impl, repository, REST controller
└── MyModule-service-spring/ ← Spring Boot variant (if needed)
```

Claude understands this layout instantly. Ask it to add a new feature and it knows exactly which file to touch.

### 2. CLAUDE.md per Module

Each module contains a `CLAUDE.md` file that gives the AI deep, focused context about:
- The module's purpose and sub-modules
- Key entity fields and lifecycle
- REST endpoints and permissions
- Code generation rules and testing patterns

This eliminates hallucinations and ensures accurate code generation.

### 3. Generator-First Workflow

The `yo water` generator covers all scaffolding tasks. Claude Code invokes the generator rather than hand-writing boilerplate, ensuring:
- Correct file structure every time
- Proper build.gradle dependencies
- Waterscriptor descriptors auto-generated
- Tests scaffolded at 80%+ coverage

---

## The AI Development Workflow

### Step 1: Scaffold the project

```bash
# Source NVM first (if using NVM)
source /path/to/nvm.sh && nvm use 18.20.8

# Create a new Spring Boot microservice
yo water:newProject \
  --inline \
  --projectName ProductCatalog \
  --applicationType service \
  --runtime spring \
  --groupId com.mycompany
```

This generates:
- `settings.gradle`, `build.gradle`, `gradle.properties`
- Module skeleton with `api`, `model`, `service` sub-projects
- Spring Boot application class
- Initial test structure

### Step 2: Add your domain entity

```bash
yo water:entity \
  --inline \
  --entityName Product \
  --entityPackage com.mycompany.product
```

This generates:
- `Product.java` entity (extends `AbstractJpaEntity`)
- `ProductRepository.java` interface
- `ProductApi.java` / `ProductSystemApi.java` interfaces
- `ProductServiceImpl.java` with full CRUD
- `ProductRestApi.java` / `ProductRestController.java`
- Karate feature files for REST testing

### Step 3: Add security with Claude Code

Tell Claude: *"Add RBAC to the Product entity with productManager and productViewer roles"*

Claude will annotate your entity:

```java
@AccessControl(
    availableActions = {CrudActions.class},
    rolesPermissions = {
        @DefaultRoleAccess(
            roleName = "productManager",
            actions = {CrudActions.class}),
        @DefaultRoleAccess(
            roleName = "productViewer",
            actions = {CrudActions.FIND, CrudActions.FIND_ALL})
    }
)
@Entity
@Table(name = "product")
public class Product extends AbstractJpaEntity implements ProtectedEntity {
    @NotNull @NoMalitiusCode
    private String name;

    @NotNull
    private double price;
}
```

### Step 4: Add REST endpoints

```bash
yo water:rest \
  --inline \
  --entityName Product
```

### Step 5: Build and verify

```bash
yo water:build --projects ProductCatalog
```

Check `build/water/water-descriptor.json` is generated and tests pass.

---

## Using Claude Code with CLAUDE.md Context

Each Water module has a `CLAUDE.md` that Claude Code loads automatically. This gives the AI:

| Context | Details |
|---------|---------|
| Module structure | Sub-module list with runtime and key classes |
| Entity fields | All `@Entity` fields with annotations and constraints |
| Permission system | Roles, actions, bitmask encoding |
| REST endpoints | All routes, HTTP methods, and required permissions |
| Code generation rules | What to do / not do (e.g., "never store private keys") |
| Testing patterns | How to write JUnit + Karate tests for this module |

### Ask Claude to do complex tasks

```
"Add a 'discount' field to Product.
 It should be optional, between 0 and 100.
 Update the REST endpoint to accept it.
 Add a Karate test for the new field."
```

Claude will:
1. Add the field to `Product.java` with `@Min(0) @Max(100)` validation
2. Update the `ProductRestController` if needed
3. Add a test scenario to the Karate feature file
4. Verify no existing tests break

---

## Key Generator Commands Reference

| Command | Purpose |
|---------|---------|
| `yo water:newProject --inline` | Scaffold a new microservice project |
| `yo water:entity --inline` | Add a new domain entity with full CRUD |
| `yo water:rest --inline` | Add REST layer to an existing entity |
| `yo water:build --projects X,Y` | Build one or more modules |
| `yo water:help --fulltext` | List all available generator commands |

> **Important:** Always use `yo water:build` — never `./gradlew` directly. The Water build plugin hooks execute descriptor generation, coverage checks, and module metadata publishing.

---

## Service Mesh Wiring with AI

When your service needs to call another Water service remotely, tell Claude:

*"This service needs to check permissions from the Permission module"*

Claude will:
1. Add the Permission integration client dependency to `build.gradle`
2. Add the `pin('it.water.integration.permission') {}` input PIN to `waterDescriptor`
3. Inject `PermissionIntegrationClient` in the service class
4. Add the permission check in the relevant service methods

No manual wiring required.

---

## Tips for Maximum Productivity

1. **Always describe the full context** — tell Claude which module you're in, what entity is involved, and what behavior you want
2. **Use generator commands via Claude** — Claude Code can run `yo water:entity` and other commands for you
3. **Keep CLAUDE.md files updated** — the richer the context file, the more accurate the generated code
4. **Iterate with test-driven prompts** — ask Claude to "add a test for scenario X" first, then implement the feature
5. **Let Claude manage waterDescriptors** — describe what your service needs and Claude handles PIN declarations
