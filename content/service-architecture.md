# Service Architecture

Water Framework's service architecture is built around a clear hierarchy of service types that enable dependency injection, framework interceptors, and automatic permission management. Every service in the framework must implement the `it.water.core.api.service.Service` interface, which serves as the foundation for all framework interactions.

## Service Hierarchy and Foundation

The `Service` interface is the root of all Water Framework services:

```java
public interface Service {
    // Marker interface that enables framework interactions
}
```

This simple interface enables:
- **Dependency Injection**: Framework can inject dependencies into any service
- **Interceptor Support**: Method interception for cross-cutting concerns
- **Component Registration**: Automatic discovery and registration in the component registry
- **Lifecycle Management**: Framework-managed service lifecycle

## Service Types and Their Purposes

Water Framework defines three main service types, each serving specific purposes:

### 1. **BaseApi - Public Application Services**

`BaseApi` extends `Service` and represents public application services that are exposed to external applications and require permission checking:

```java
public interface BaseApi extends Service {
    // Public API services with automatic permission checking
}
```

**Key Characteristics:**
- **Permission Checking**: All methods automatically check user permissions
- **Public Interface**: Exposed to external applications and REST endpoints
- **Security Enforced**: Framework automatically validates permissions before method execution
- **CRUD Operations**: Can be associated with persistence or be stateless

**Example Implementation:**
```java
@FrameworkComponent
public class TestEntityServiceImpl extends BaseEntityServiceImpl<TestEntity> 
    implements TestEntityApi {

    @Inject
    private TestEntitySystemApi testEntitySystemApi;

    @Inject
    private ComponentRegistry waterComponentRegistry;

    public TestEntityServiceImpl() {
        super(TestEntity.class);
    }

    @Override
    protected BaseEntitySystemApi<TestEntity> getSystemService() {
        return testEntitySystemApi;
    }

    @Override
    protected ComponentRegistry getComponentRegistry() {
        return waterComponentRegistry;
    }
}
```

### 2. **BaseSystemApi - Internal Framework Services**

`BaseSystemApi` extends `Service` and represents internal framework services that bypass permission checking:

```java
public interface BaseSystemApi extends Service {
    // Internal system services without permission checking
}
```

**Key Characteristics:**
- **No Permission Checking**: Methods execute without permission validation
- **Internal Use**: Used by framework components and other services
- **Performance Optimized**: Faster execution due to no permission overhead
- **Framework Integration**: Can be associated with persistence or be stateless

**Example Implementation:**
```java
@FrameworkComponent
public class TestEntitySystemServiceImpl extends BaseEntitySystemServiceImpl<TestEntity> 
    implements TestEntitySystemApi {

    @Inject
    private TestEntityRepository testEntityRepository;

    public TestEntitySystemServiceImpl() {
        super(TestEntity.class);
    }

    @Override
    protected BaseRepository<TestEntity> getRepository() {
        return testEntityRepository;
    }

    @Override
    protected void validate(Resource resource) {
        // Custom validation logic
        super.validate(resource);
    }
}
```

### 3. **RestApi - HTTP Endpoint Interfaces**

`RestApi` extends `Service` and represents REST service interfaces that are automatically exposed as HTTP endpoints:

```java
public interface RestApi extends Service {
    // REST API interfaces for HTTP exposure
}
```

**Key Characteristics:**
- **HTTP Exposure**: Automatically exposed as REST endpoints
- **Permission Required**: Must use `BaseApi` services, never `BaseSystemApi`
- **Content Negotiation**: Automatic JSON/XML serialization
- **Security Integration**: Built-in security filters and CORS support

**Example Implementation:**
```java
@Path("/test")
@FrameworkRestApi
public interface TestEntityRestApi extends RestApi {
    
    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    TestEntity find(@PathParam("id") long id);
    
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    TestEntity save(TestEntity entity);
}
```

## Entity Service Hierarchy

For entity-based services, Water Framework provides specialized interfaces:

### **BaseEntityApi vs BaseEntitySystemApi**

Both interfaces provide the same CRUD operations but with different permission behaviors:

```java
// Public API with permission checking
public interface BaseEntityApi<T extends BaseEntity> extends BaseApi {
    T save(T entity);
    T update(T entity);
    void remove(long id);
    T find(long id);
    T find(Query filter);
    PaginableResult<T> findAll(Query filter, int delta, int page, QueryOrder queryOrder);
    long countAll(Query filter);
    Class<T> getEntityType();
}

// System API without permission checking
public interface BaseEntitySystemApi<T extends BaseEntity> extends BaseSystemApi {
    // Same methods as BaseEntityApi but no permission checking
    T save(T entity);
    T update(T entity);
    void remove(long id);
    T find(long id);
    T find(Query filter);
    PaginableResult<T> findAll(Query filter, int delta, int page, QueryOrder queryOrder);
    long countAll(Query filter);
    Class<T> getEntityType();
    QueryBuilder getQueryBuilderInstance(); // Additional method for query building
}
```

## Automatic CRUD Operations and Default Permissions

Water Framework automatically exposes and manages CRUD operations with default permissions. When you create an entity service, the framework automatically:

### **1. Default CRUD Actions**
The framework automatically creates these actions for every entity:
- `SAVE` - Create new entities
- `UPDATE` - Modify existing entities  
- `REMOVE` - Delete entities
- `FIND` - Retrieve single entities
- `FIND_ALL` - Retrieve multiple entities

### **2. Automatic Permission Registration**
The `@AccessControl` annotation defines the **default behavior** for entity permissions. The framework reads these annotations at startup and automatically sets up roles with the specified permissions, but only if those roles don't already exist in the system.

```java
@Entity
@AccessControl(availableActions = {CrudActions.SAVE, CrudActions.UPDATE, CrudActions.FIND, CrudActions.FIND_ALL, CrudActions.REMOVE},
        rolesPermissions = {
                @DefaultRoleAccess(roleName = "manager", actions = {CrudActions.SAVE, CrudActions.UPDATE, CrudActions.FIND, CrudActions.FIND_ALL, CrudActions.REMOVE}),
                @DefaultRoleAccess(roleName = "viewer", actions = {CrudActions.FIND, CrudActions.FIND_ALL}),
                @DefaultRoleAccess(roleName = "editor", actions = {CrudActions.SAVE, CrudActions.UPDATE, CrudActions.FIND, CrudActions.FIND_ALL})
        })
public class TestEntity implements ProtectedEntity {
    // Entity implementation
}
```

**How Default Permission Setup Works:**

1. **Startup Analysis**: During application startup, the framework scans all entities with `@AccessControl` annotations
2. **Role Existence Check**: For each role defined in `@DefaultRoleAccess`, the framework checks if the role already exists in the system
3. **Conditional Setup**: 
   - **If role exists**: The framework does nothing - existing permissions are preserved
   - **If role doesn't exist**: The framework automatically creates the role and assigns the specified permissions
4. **Default Behavior**: This ensures that applications have sensible default permissions while allowing administrators to customize permissions without losing their changes

**Example: Role Lifecycle**

```java
// At first startup - roles don't exist
@AccessControl(availableActions = {CrudActions.SAVE, CrudActions.UPDATE, CrudActions.FIND, CrudActions.FIND_ALL, CrudActions.REMOVE},
        rolesPermissions = {
                @DefaultRoleAccess(roleName = "document_manager", actions = {CrudActions.SAVE, CrudActions.UPDATE, CrudActions.FIND, CrudActions.FIND_ALL, CrudActions.REMOVE}),
                @DefaultRoleAccess(roleName = "document_viewer", actions = {CrudActions.FIND, CrudActions.FIND_ALL})
        })
public class Document implements ProtectedEntity {
    // Entity implementation
}
```

**First Startup Behavior:**
- Framework creates `document_manager` role with full CRUD permissions
- Framework creates `document_viewer` role with read-only permissions
- These become the default permissions for the Document entity

**Subsequent Startup Behavior:**
- If roles already exist, framework preserves existing permissions
- Administrators can modify permissions through the admin interface
- Custom permission changes are never overwritten by the annotation

**Benefits of This Approach:**

- **Safe Defaults**: Applications start with sensible security defaults
- **Non-Destructive**: Existing permission configurations are never overwritten
- **Administrative Control**: Admins can customize permissions without code changes
- **Development Friendly**: Developers can define expected permission structure in code
- **Production Safe**: Permission changes in production persist across restarts 