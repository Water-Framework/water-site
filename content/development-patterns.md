# Development Patterns

This section provides comprehensive guidelines for developing applications with the Water Framework, covering architecture patterns, security practices, and development workflows.

## Table of Contents

- [Architecture Patterns](#architecture-patterns)
- [Security and Permissions](#security-and-permissions)
- [Development Workflow](#development-workflow)
- [Performance Considerations](#performance-considerations)
- [Error Handling](#error-handling)

## Architecture Patterns

### Service Layer Separation

The Water Framework follows a clear separation of concerns with distinct service layers:

#### 1. **REST API Layer** (`RestApi`)
- **Purpose**: External HTTP interface for client applications
- **Characteristics**: 
  - Exposed via HTTP endpoints
  - Handles request/response serialization
  - Implements permission checks
  - Uses `@FrameworkRestApi` annotation
- **Example**:
```java
@FrameworkRestApi
public interface UserRestApi extends RestApi {
    @POST
    @Path("/users")
    @AllowGenericPermissions(actions = {CrudActions.SAVE})
    WaterUser createUser(WaterUser user);
}
```

#### 2. **API Layer** (`BaseEntityApi`)
- **Purpose**: Business logic interface with permission enforcement
- **Characteristics**:
  - Contains business logic
  - Implements permission annotations
  - Validates input data
  - Orchestrates system operations
- **Example**:
```java
public interface UserApi extends BaseEntityApi<WaterUser> {
    @AllowGenericPermissions(actions = {CrudActions.FIND})
    WaterUser findByUsername(String username);
    
    @AllowLoggedUser
    WaterUser updateAccountInfo(WaterUser user);
}
```

#### 3. **System API Layer** (`BaseEntitySystemApi`)
- **Purpose**: Internal operations bypassing permission system
- **Characteristics**:
  - Used by other services internally
  - Bypasses permission checks
  - Handles core business logic
  - Validates entity state
- **Example**:
```java
public interface UserSystemApi extends BaseEntitySystemApi<WaterUser> {
    WaterUser register(WaterUser user);
    void activateUser(String email, String activationCode);
    WaterUser findByUsername(String username);
}
```

#### 4. **Repository Layer** (`BaseRepository`)
- **Purpose**: Data persistence operations
- **Characteristics**:
  - Handles database operations
  - Implements query building
  - Manages transactions
  - Entity-specific persistence logic
- **Example**:
```java
public interface UserRepository extends WaterJpaRepository<WaterUser> {
    WaterUser findByUsername(String username);
    WaterUser findByEmail(String email);
    void activateUser(String email, String activationCode);
}
```

### Aggregate Pattern

Each aggregate should have its complete set of layers:

```
MyEntity/
├── MyEntity-api/          # API interfaces
├── MyEntity-model/        # Entity models
├── MyEntity-service/      # Business logic implementation
├── MyEntity-service-spring/ # Spring-specific implementation
└── MyEntity-repository/   # Data persistence
```

**Key Principles**:
- One aggregate = One complete set of layers
- Each layer has a single responsibility
- Clear separation between external and internal APIs
- Repository handles only data operations
- System API handles business logic
- API handles permissions and orchestration
- REST API handles HTTP concerns

## Security and Permissions

### Permission Annotations

The Water Framework provides comprehensive permission annotations:

#### 1. **@AllowPermissions**
- **Purpose**: Entity-specific permission checks
- **Usage**: For operations on specific entities
```java
@AllowPermissions(actions = {CrudActions.FIND}, checkById = true, idParamIndex = 0)
public WaterUser findById(long userId) {
    return systemService.find(userId);
}
```

#### 2. **@AllowGenericPermissions**
- **Purpose**: Resource-level permission checks
- **Usage**: For operations on resource types
```java
@AllowGenericPermissions(actions = {CrudActions.SAVE}, resourceName = "it.water.user.model.WaterUser")
public WaterUser createUser(WaterUser user) {
    return systemService.save(user);
}
```

#### 3. **@AllowLoggedUser**
- **Purpose**: Ensures user is authenticated
- **Usage**: For operations requiring login
```java
@AllowLoggedUser
public WaterUser updateAccountInfo(WaterUser user) {
    // Only logged users can update their account
    return systemService.update(user);
}
```

#### 4. **@AllowRoles**
- **Purpose**: Role-based access control
- **Usage**: For operations requiring specific roles
```java
@AllowRoles(rolesNames = {"admin", "userManager"})
public void deleteUser(long userId) {
    systemService.remove(userId);
}
```

#### 5. **@AllowPermissionsOnReturn**
- **Purpose**: Permission checks on returned entities
- **Usage**: For operations returning protected entities
```java
@AllowPermissionsOnReturn(actions = {CrudActions.FIND})
public WaterUser findUser(long userId) {
    return systemService.find(userId);
}
```

### Resource Protection

Define protected resources using `@AccessControl`:

```java
@AccessControl(
    availableActions = {CrudActions.SAVE, CrudActions.UPDATE, CrudActions.REMOVE, CrudActions.FIND},
    rolesPermissions = {
        @DefaultRoleAccess(roleName = "userManager", actions = {CrudActions.SAVE, CrudActions.UPDATE, CrudActions.REMOVE, CrudActions.FIND}),
        @DefaultRoleAccess(roleName = "userViewer", actions = {CrudActions.FIND})
    }
)
public class WaterUser implements ProtectedResource {
    // Entity implementation
}
```

### Security Context Usage

Access security context in services:

```java
@Inject
@Setter
private Runtime waterRuntime;

public void secureOperation() {
    SecurityContext ctx = waterRuntime.getSecurityContext();
    if (ctx == null || ctx.getLoggedEntityId() == 0) {
        throw new UnauthorizedException("Authentication required");
    }
    
    // Check if user owns the resource
    if (ctx.getLoggedEntityId() != resourceOwnerId && !ctx.isAdmin()) {
        throw new UnauthorizedException("Access denied");
    }
}
```

## Development Workflow

### 1. Project Structure

Follow the standard Water Framework project structure:

```
MyModule/
├── MyModule-api/           # API interfaces
├── MyModule-model/         # Entity models
├── MyModule-service/       # Business logic
├── MyModule-service-spring/ # Spring implementation
├── MyModule-repository/    # Data persistence
└── src/
    ├── main/
    │   ├── java/
    │   └── resources/
    └── test/
        ├── java/
        ├── resources/
        │   ├── karate/     # Karate tests
        │   └── certs/      # Test certificates
        └── karate-config.js
```

### 2. Component Registration

Register components using `@FrameworkComponent`:

```java
@FrameworkComponent(services = {UserApi.class})
public class UserServiceImpl extends BaseEntityServiceImpl<WaterUser> implements UserApi {
    // Implementation
}

@FrameworkComponent(services = {UserSystemApi.class})
public class UserSystemServiceImpl extends BaseEntityServiceImpl<WaterUser> implements UserSystemApi {
    // Implementation
}
```

### 3. Dependency Injection

Use `@Inject` for dependency injection:

```java
@Inject
@Setter
private UserSystemApi systemService;

@Inject
@Setter
private ComponentRegistry componentRegistry;

@Inject
@Setter
private Runtime waterRuntime;
```

### 4. Lifecycle Management

Implement lifecycle methods when needed:

```java
@OnActivate
public void onActivate() {
    // Component activation logic
    log.info("User service activated");
}

@OnDeactivate
public void onDeactivate() {
    // Component deactivation logic
    log.info("User service deactivated");
}
```

## Performance Considerations

### 1. Query Optimization

Use query builders efficiently:

```java
// Efficient query building
Query filter = repository.getQueryBuilderInstance()
    .createQueryFilter("username = ? AND active = ?", username, true)
    .addOrderBy("entityCreateDate", QueryOrder.DESC);

PaginableResult<WaterUser> result = repository.findAll(filter, 20, 1, null);
```

### 2. Pagination

Always implement pagination for list operations:

```java
@AllowGenericPermissions(actions = {CrudActions.FIND_ALL})
public PaginableResult<WaterUser> findAll(int delta, int page, Query filter, QueryOrder queryOrder) {
    return systemService.findAll(filter, delta, page, queryOrder);
}
```

### 3. Caching

Implement caching for frequently accessed data:

```java
@Inject
@Setter
private CacheManager cacheManager;

public WaterUser findByUsername(String username) {
    String cacheKey = "user:" + username;
    WaterUser user = cacheManager.get(cacheKey, WaterUser.class);
    
    if (user == null) {
        user = systemService.findByUsername(username);
        if (user != null) {
            cacheManager.put(cacheKey, user);
        }
    }
    
    return user;
}
```

## Error Handling

### 1. Exception Hierarchy

Use Water Framework exceptions:

```java
// Entity not found
throw new EntityNotFound();

// Validation errors
throw new ValidationException("Invalid email format");

// Authorization errors
throw new UnauthorizedException("Access denied");

// Business logic errors
throw new WaterRuntimeException("User already exists");
```

### 2. Validation

Implement comprehensive validation:

```java
@Override
public WaterUser save(WaterUser user) {
    // Business validation
    if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
        throw new ValidationException("Username is required");
    }
    
    if (user.getEmail() == null || !isValidEmail(user.getEmail())) {
        throw new ValidationException("Valid email is required");
    }
    
    // Check for duplicates
    if (systemService.findByUsername(user.getUsername()) != null) {
        throw new DuplicateEntityException("Username already exists");
    }
    
    return systemService.save(user);
}
```

### 3. Logging

Use appropriate logging levels:

```java
private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);

public void sensitiveOperation() {
    log.debug("Starting sensitive operation for user: {}", userId);
    
    try {
        // Operation logic
        log.info("Sensitive operation completed successfully for user: {}", userId);
    } catch (Exception e) {
        log.error("Sensitive operation failed for user: {}", userId, e);
        throw e;
    }
}
```

## Development Patterns Summary

### ✅ Do's

1. **Always separate REST API, API, System API, and Repository layers**
2. **Define permissions for all public methods**
3. **Use one aggregate per complete set of layers**
4. **Implement proper error handling and validation**
5. **Use pagination for list operations**
6. **Follow the component registration pattern**
7. **Use dependency injection consistently**
8. **Implement comprehensive validation**
9. **Use Water Framework exceptions**
10. **Add appropriate logging**

### ❌ Don'ts

1. **Don't mix business logic in REST controllers**
2. **Don't bypass permission checks in public APIs**
3. **Don't skip validation in service methods**
4. **Don't forget to implement proper error handling**
5. **Don't use direct database access outside repositories**
6. **Don't hardcode security logic**
7. **Don't skip pagination for large datasets**
8. **Don't forget lifecycle management**
9. **Don't ignore logging and monitoring**
10. **Don't ignore performance considerations**

### 🔧 Development Checklist

- [ ] Implement all four service layers (REST, API, System API, Repository)
- [ ] Add permission annotations to all public methods
- [ ] Implement proper validation and error handling
- [ ] Use dependency injection consistently
- [ ] Add appropriate logging
- [ ] Implement pagination for list operations
- [ ] Register components with @FrameworkComponent
- [ ] Define protected resources with @AccessControl
- [ ] Use Water Framework utilities and patterns
- [ ] Implement proper lifecycle management
- [ ] Optimize queries and implement caching where needed
- [ ] Follow the aggregate pattern consistently

Following these development patterns ensures robust, maintainable, and secure applications built with the Water Framework. 