# Water Framework Main Concepts

<div class="toc-wrapper">
<div class="toc">

## 📚 Table of Contents

### 🚀 Getting Started
- [Introduction](#introduction)
- [Key Features](#key-features)
- [Framework Philosophy](#framework-philosophy)

### 🏗️ Basic Concepts
- [Service Architecture](#service-architecture)
- [Entity Management](#entity-management)
- [Security and Permissions](#security-and-permissions)
- [Component Lifecycle](#component-lifecycle)
- [Interceptors and AOP](#interceptors-and-aop)
- [Data Access and Persistence](#data-access-and-persistence)
- [Clustering and Distribution](#clustering-and-distribution)
- [Event System and Notifications](#event-system-and-notifications)

### 💾 Persistence and Data Access
- [JPA Repository Framework](#jpa-repository-framework)
- [Query and Filter System](#query-and-filter-system)
- [Entity Extensions and Validation](#entity-extensions-and-validation)

### 🌐 REST API Framework
- [REST Service Layer](#rest-service-layer)
- [REST Security and Integration](#rest-security-and-integration)
- [API Documentation and Versioning](#api-documentation-and-versioning)

### 📊 Architecture Diagrams
- [System Architecture Overview](#system-architecture-overview)
- [Component Interaction Flows](#component-interaction-flows)
- [Security and Permission Flows](#security-and-permission-flows)

### 🎯 Best Practices and Guidelines
- [Development Patterns](#development-patterns)
- [Testing Strategies](#testing-strategies)
- [Performance and Scalability](#performance-and-scalability)

### 🛠️ Framework Implementations
- [Spring Integration](#spring-integration)
- [OSGi Integration](#osgi-integration)
- [Quarkus Integration](#quarkus-integration)

</div>
</div>

<style>
.toc-wrapper {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 20px;
    margin: 20px 0;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.toc {
    font-size: 0.95em;
    line-height: 1.6;
}

.toc h2 {
    color: #2c3e50;
    margin-top: 0;
    padding-bottom: 10px;
    border-bottom: 2px solid #e9ecef;
}

.toc h3 {
    color: #34495e;
    margin: 15px 0 10px 0;
}

.toc ul {
    list-style-type: none;
    padding-left: 20px;
    margin: 0;
}

.toc li {
    margin: 8px 0;
}

.toc a {
    color: #3498db;
    text-decoration: none;
    transition: color 0.2s ease;
}

.toc a:hover {
    color: #2980b9;
    text-decoration: underline;
}

.toc ul ul {
    margin-top: 5px;
}

.toc ul ul li {
    margin: 5px 0;
    font-size: 0.95em;
}
</style>

## Introduction

Water Framework is a revolutionary **cross-framework** platform that transforms how enterprise applications are built, deployed, and managed. Inspired by Bruce Lee's philosophy of adaptability - *"Be water, my friend"* - the framework seamlessly adapts to any Java runtime environment while providing a comprehensive set of ready-to-run modules and powerful customization capabilities.

### What Makes Water Framework Unique?

Water Framework represents a paradigm shift from traditional "Convention over Configuration" to **"Convention over Coding"** - a complete development standard that goes beyond simple defaults to provide a structured approach to building enterprise applications. Unlike other frameworks that lock you into specific technologies, Water Framework gives you the freedom to choose your preferred runtime while maintaining full control over your code.

### Key Features

#### 🚀 **Ready-to-Run Enterprise Modules**
Water Framework comes with a complete set of production-ready modules that eliminate the need to build common enterprise functionality from scratch:

- **🔐 Complete Security Infrastructure**
  - User management with registration, authentication, and profile management
  - Granular permission system with role-based access control
  - Resource-level security with customizable sharing policies
  - Cross-runtime security context management

- **📄 Document Management System**
  - Advanced document storage and retrieval
  - Version control and document lifecycle management
  - Integration with cloud storage providers (S3, etc.)
  - Document sharing and collaboration features

- **👥 User and Role Management**
  - Complete user lifecycle management
  - Email confirmation and password reset workflows
  - Role-based access control with fine-grained permissions
  - User impersonation and administrative tools

- **🔗 Integration Connectors**
  - Blockchain integration (Ethereum)
  - Big data processing (Hadoop)
  - Distributed coordination (Zookeeper)
  - Email automation and notification systems

#### 🔧 **100% Customizable Architecture**
Every aspect of Water Framework is designed for complete customization:

- **Modular Design**: Based on SOLID principles, every component can be extended or replaced
- **Plugin Architecture**: Add custom functionality without modifying core framework code
- **Configuration-Driven**: Customize behavior through configuration rather than code changes
- **Cross-Framework Compatibility**: Write once, run anywhere - Spring, OSGi, Quarkus, or standalone

#### 🛠️ **Powerful Development Tools**
- **Water Generator**: Automated project scaffolding and code generation
- **Dependency Analysis**: Automatic detection of circular dependencies and architectural issues
- **Stability Metrics**: Built-in code quality analysis and architectural validation
- **Multi-Runtime Support**: Generate projects for any supported Java runtime

#### 🌐 **Cross-Framework Runtime Support**
Water Framework adapts to your preferred technology stack:

- **Spring Integration**: Full Spring Boot support with auto-configuration
- **OSGi Support**: Native OSGi bundle management and Karaf integration
- **Quarkus Native**: GraalVM native image support for cloud-native applications
- **Standalone Mode**: Run without any specific framework dependencies

### Framework Philosophy

#### **"Convention over Coding" - Beyond Configuration**

Water Framework introduces a new development paradigm that goes beyond traditional "Convention over Configuration." While other frameworks provide sensible defaults, Water Framework provides a complete **development standard** that includes:

- **Structured Module Organization**: Consistent project structure across all modules
- **Standardized Component Patterns**: Common patterns for services, repositories, and APIs
- **Automated Code Generation**: Scaffolding that follows best practices automatically
- **Built-in Quality Gates**: Dependency analysis and architectural validation

#### **Adaptability as a Core Principle**

Just as water takes the shape of its container, Water Framework adapts to your environment:

- **Runtime Agnostic**: Write code once, deploy to any supported runtime
- **Technology Flexible**: Use your preferred framework while leveraging Water's features
- **Team Friendly**: Different teams can use different technologies in the same project
- **Future Proof**: Easy migration between runtimes as technology evolves

#### **Enterprise-Ready from Day One**

Water Framework is designed for enterprise-scale applications:

- **Production Features**: Security, monitoring, and scalability built-in
- **Microservices Ready**: Architecture supports both monoliths and microservices
- **Cloud Native**: Designed for modern deployment environments
- **DevOps Friendly**: Automated deployment and management capabilities

### Future Vision: Microservices Automation

Water Framework is evolving towards comprehensive microservices automation:

#### **Automated Deployment Management**
- **Service Discovery**: Automatic registration and discovery of microservices
- **Load Balancing**: Built-in load balancing and failover capabilities
- **Configuration Management**: Centralized configuration with runtime updates
- **Health Monitoring**: Comprehensive health checks and monitoring

#### **Intelligent Orchestration**
- **Auto-Scaling**: Automatic scaling based on load and performance metrics
- **Service Mesh Integration**: Native support for service mesh technologies
- **Distributed Tracing**: Built-in tracing and observability
- **Circuit Breakers**: Automatic failure handling and recovery

#### **Developer Experience**
- **Local Development**: Complete local microservices development environment
- **Testing Automation**: Automated testing for microservices interactions
- **Deployment Pipelines**: CI/CD integration with automated deployment
- **Monitoring Dashboards**: Built-in monitoring and alerting

### Who Should Use Water Framework?

Water Framework is ideal for:

- **Enterprise Development Teams** who need rapid application development with enterprise-grade features
- **Platform Developers** building extensible platforms that need to support multiple technologies
- **Microservices Architects** looking for a framework that supports both current and future deployment models
- **DevOps Teams** who want automated deployment and management capabilities
- **Organizations** with diverse technology preferences across different teams

### Getting Started

Water Framework makes it incredibly easy to get started:

```bash
# Install the Water Generator
npm install -g yo generator-water --registry https://nexus.acsoftware.it/nexus/repository/npm-acs-public-repo

# Create a new project
yo water:app

# Choose your runtime and features
# Start developing immediately with enterprise features
```

In minutes, you'll have a fully functional application with user management, security, document handling, and REST APIs - ready for production deployment.

## Service Architecture

Water Framework's service architecture is built around a clear hierarchy of service types that enable dependency injection, framework interceptors, and automatic permission management. Every service in the framework must implement the `it.water.core.api.service.Service` interface, which serves as the foundation for all framework interactions.

### Service Hierarchy and Foundation

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

### Service Types and Their Purposes

Water Framework defines three main service types, each serving specific purposes:

#### 1. **BaseApi - Public Application Services**

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

#### 2. **BaseSystemApi - Internal Framework Services**

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

#### 3. **RestApi - HTTP Endpoint Interfaces**

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

### Entity Service Hierarchy

For entity-based services, Water Framework provides specialized interfaces:

#### **BaseEntityApi vs BaseEntitySystemApi**

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

### Automatic CRUD Operations and Default Permissions

Water Framework automatically exposes and manages CRUD operations with default permissions. When you create an entity service, the framework automatically:

#### **1. Default CRUD Actions**
The framework automatically creates these actions for every entity:
- `SAVE` - Create new entities
- `UPDATE` - Modify existing entities  
- `REMOVE` - Delete entities
- `FIND` - Retrieve single entities
- `FIND_ALL` - Retrieve multiple entities

#### **2. Automatic Permission Registration**
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

**Advanced Usage:**
```java
@Entity
@AccessControl(availableActions = {CrudActions.SAVE, CrudActions.UPDATE, CrudActions.FIND, CrudActions.FIND_ALL, CrudActions.REMOVE, ShareAction.SHARE},
        rolesPermissions = {
                // Manager role with full access including sharing
                @DefaultRoleAccess(roleName = "project_manager", actions = {CrudActions.SAVE, CrudActions.UPDATE, CrudActions.FIND, CrudActions.FIND_ALL, CrudActions.REMOVE, ShareAction.SHARE}),
                // Editor role with limited access
                @DefaultRoleAccess(roleName = "project_editor", actions = {CrudActions.SAVE, CrudActions.UPDATE, CrudActions.FIND, CrudActions.FIND_ALL}),
                // Viewer role with read-only access
                @DefaultRoleAccess(roleName = "project_viewer", actions = {CrudActions.FIND, CrudActions.FIND_ALL})
        })
public class Project implements ProtectedEntity, SharedEntity {
    // Project entity with sharing capabilities
}
```

This approach ensures that Water Framework applications have secure, sensible defaults while maintaining the flexibility to customize permissions as needed for specific business requirements.

#### **3. Method-Level Permission Enforcement**
While `@AccessControl` defines default entity permissions, developers must explicitly use permission annotations in their API services to ensure that permission checking occurs before method execution. The framework provides several annotations for different permission scenarios:

**Core Permission Annotations:**

```java
@Service
public class DocumentApi extends BaseEntityApi<Document> {
    
    // Check if user has SAVE permission for Document entity
    @AllowPermission(action = CrudActions.SAVE)
    public Document createDocument(Document document) {
        return super.save(document);
    }
    
    // Check if user has UPDATE permission for Document entity
    @AllowPermission(action = CrudActions.UPDATE)
    public Document updateDocument(Document document) {
        return super.update(document);
    }
    
    // Check if user has FIND permission for Document entity
    @AllowPermission(action = CrudActions.FIND)
    public Document findDocument(String id) {
        return super.find(id);
    }
    
    // Check if user has REMOVE permission for Document entity
    @AllowPermission(action = CrudActions.REMOVE)
    public void deleteDocument(String id) {
        super.remove(id);
    }
    
    // Custom business method with specific permission check
    @AllowPermission(action = "PUBLISH")
    public Document publishDocument(String id) {
        Document doc = findDocument(id);
        doc.setStatus("PUBLISHED");
        return updateDocument(doc);
    }
    
    // Method that requires multiple permissions
    @AllowPermission(action = {CrudActions.UPDATE, "APPROVE"})
    public Document approveAndUpdate(Document document) {
        document.setApproved(true);
        return super.update(document);
    }
}
```

**How Permission Checking Works:**

1. **Pre-Execution Check**: Before any method annotated with `@AllowPermission` executes, the framework:
   - Retrieves the current user's context from the Runtime Object
   - Checks if the user has the required role/permission for the specified action and entity
   - If permission is denied, throws a `PermissionException`

2. **Runtime Context**: The framework automatically provides the current user's security context:
   ```java
   @Service
   public class DocumentApi extends BaseEntityApi<Document> {
       
       @AllowPermission(action = CrudActions.SAVE)
       public Document createDocument(Document document) {
           // Framework automatically injects current user context
           // Permission check happens before this method executes
           return super.save(document);
       }
   }
   ```

3. **Automatic CRUD Permission Mapping**: For standard CRUD operations, the framework automatically maps:
   - `save()` → `CrudActions.SAVE`
   - `update()` → `CrudActions.UPDATE`
   - `find()` → `CrudActions.FIND`
   - `findAll()` → `CrudActions.FIND_ALL`
   - `remove()` → `CrudActions.REMOVE`

**Advanced Permission Scenarios:**

```java
@Service
public class AdvancedDocumentApi extends BaseEntityApi<Document> {
    
    // Check permission for shared entity access
    @AllowPermission(action = ShareAction.SHARE)
    public void shareDocument(String documentId, String userId) {
        // Share logic implementation
    }
    
    // Check permission for custom business action
    @AllowPermission(action = "ARCHIVE")
    public Document archiveDocument(String id) {
        Document doc = findDocument(id);
        doc.setArchived(true);
        return updateDocument(doc);
    }
    
    // Method that doesn't require permission checking (use with caution)
    @NoPermissionCheck
    public List<Document> getPublicDocuments() {
        // This method bypasses permission checking
        // Use only for truly public data
        return findAll();
    }
}
```

**Permission Annotation Types:**

- **`@AllowPermissions`**: Checks specific permissions on entity instances (requires entity parameter or ID)
- **`@AllowGenericPermissions`**: Checks generic permissions on resource types (doesn't require specific entity)
- **`@AllowRoles`**: Checks if user has specific roles
- **`@AllowLoggedUser`**: Ensures method is called only by authenticated users
- **`@AllowPermissionsOnReturn`**: Checks permissions on the object returned by the method

**Best Practices:**

1. **Always Use Annotations**: Every public method in API services should have appropriate permission annotations
2. **Choose the Right Annotation**: 
   - Use `@AllowPermissions` for entity-specific operations
   - Use `@AllowGenericPermissions` for general resource operations
   - Use `@AllowRoles` for role-based access control
   - Use `@AllowLoggedUser` for basic authentication checks
3. **Be Specific with Actions**: Use the most specific action names possible
4. **Test Permissions**: Always test with different user roles to ensure proper access control
5. **Document Custom Actions**: Clearly document any custom actions defined in your entities
6. **Use Return Permissions Carefully**: `@AllowPermissionsOnReturn` should only be used when the returned object needs permission validation
7. **Avoid Generic Permissions for Sensitive Operations**: Use specific permissions for operations that modify or delete data

**Example: Complete API Service with Permissions**

```java
@Service
public class ProjectApi extends BaseEntityApi<Project> {
    
    // Standard CRUD operations with automatic permission checking
    @AllowPermission(action = CrudActions.SAVE)
    public Project createProject(Project project) {
        return super.save(project);
    }
    
    @AllowPermission(action = CrudActions.UPDATE)
    public Project updateProject(Project project) {
        return super.update(project);
    }
    
    @AllowPermission(action = CrudActions.FIND)
    public Project findProject(String id) {
        return super.find(id);
    }
    
    @AllowPermission(action = CrudActions.FIND_ALL)
    public List<Project> getAllProjects() {
        return super.findAll();
    }
    
    @AllowPermission(action = CrudActions.REMOVE)
    public void deleteProject(String id) {
        super.remove(id);
    }
    
    // Custom business methods with specific permissions
    @AllowPermission(action = "ASSIGN_TEAM")
    public Project assignTeamToProject(String projectId, List<String> teamMemberIds) {
        Project project = findProject(projectId);
        project.setTeamMembers(teamMemberIds);
        return updateProject(project);
    }
    
    @AllowPermission(action = ShareAction.SHARE)
    public void shareProjectWithUser(String projectId, String userId) {
        // Implementation for sharing project
    }
}
```

This permission enforcement system ensures that Water Framework applications maintain strict security boundaries while providing developers with clear, declarative control over access permissions.

### Integration Modules for Cross-Module Communication

Each module can define its own integration module to be invoked by other modules via REST or other technologies:

#### **Integration Client Pattern**
```java
@FrameworkComponent(priority = 2)
public class SharedEntityTestClient implements SharedEntityIntegrationClient {
    @Override
    public Collection<Long> fetchSharingUsersIds(String resourceName, long resourceId) {
        // Implementation for cross-module communication
        return List.of(1L);
    }
}
```

#### **REST Integration Examples**
Modules can expose REST APIs for integration:

```java
@ExtendWith(WaterTestExtension.class)
public class SharedEntityRestApiTest implements Service {

    @Inject
    @Setter
    private ComponentRegistry componentRegistry;

    @Inject
    @Setter
    private UserIntegrationClient userIntegrationClient;

    @Karate.Test
    Karate restInterfaceTest() {
        return Karate.run("classpath:karate")
                .systemProperty("webServerPort", TestRuntimeInitializer.getInstance().getRestServerPort())
                .systemProperty("host", "localhost")
                .systemProperty("protocol", "http");
    }
}
```

#### **Service-to-Service Integration**
Modules can directly inject and use services from other modules:

```java
@FrameworkComponent
public class TestServiceImpl extends BaseServiceImpl implements TestServiceApi {
    
    @Inject
    @Setter
    @Getter
    private TestSystemServiceApi systemService;

    @Override
    public void doSomething() {
        this.getSystemService().doSomething();
    }
}
```

### Key Architectural Principles

#### **1. Separation of Concerns**
- **Public APIs**: Handle external requests with permission checking
- **System APIs**: Handle internal operations without permission overhead
- **REST APIs**: Expose public APIs as HTTP endpoints

#### **2. Security by Design**
- **Automatic Permission Checking**: All public API calls are automatically secured
- **Role-Based Access Control**: Default roles and permissions for common operations
- **Resource-Level Security**: Fine-grained control over entity access

#### **3. Performance Optimization**
- **System APIs**: Bypass permission checking for internal operations
- **Lazy Loading**: Dependencies injected only when needed
- **Caching**: Built-in caching for frequently accessed data

#### **4. Extensibility**
- **Plugin Architecture**: Easy to extend with custom services
- **Integration Points**: Standardized interfaces for cross-module communication
- **Custom Actions**: Ability to define custom actions beyond CRUD operations

This service architecture ensures that Water Framework applications are secure, performant, and maintainable while providing the flexibility needed for complex enterprise applications.

## Framework Concepts

### Service Layer
The service layer defines different types of services in the framework:

1. **SystemApi**
   - Internal framework services
   - Not exposed to external applications
   - Used for framework core functionality
   - Example: `ComponentRegistry`, `BundleManager`

2. **Api**
   - Public application services
   - Exposed to external applications
   - Used for business logic implementation
   - Example: `UserApi`, `PermissionApi`

3. **RestApi**
   - HTTP endpoint interfaces
   - Exposed as REST services
   - Used for external communication
   - Example: `UserRestApi`, `DocumentRestApi`

Example:
```java
// System API - Internal framework service
public interface SystemComponentRegistry extends SystemApi {
    void registerComponent(Object component);
    void unregisterComponent(Object component);
}

// Public API - Application service
public interface UserApi extends Api {
    User createUser(User user);
    User findUser(long id);
    void updateUser(User user);
}

// REST API - HTTP endpoints
public interface UserRestApi extends RestApi {
    @GET
    @Path("/{id}")
    User getUser(@PathParam("id") long id);
    
    @POST
    @Path("/")
    User createUser(User user);
}
```

### Registry
The registry manages component lifecycle and discovery:

1. **ComponentRegistry**
   - Central registry for all components
   - Handles component registration and discovery
   - Manages component lifecycle
   - Supports component filtering

2. **ComponentFilter**
   - Filters components based on properties
   - Supports complex filter conditions
   - Used for component discovery

3. **ComponentConfiguration**
   - Configures component behavior
   - Defines component properties
   - Sets component priority

Example:
```java
// Create component configuration
ComponentConfiguration config = ComponentConfigurationFactory
    .createNewComponentPropertyFactory()
    .withProp("timeout", 5000)
    .withProp("retries", 3)
    .withPriority(2)
    .build();

// Create complex filter
ComponentFilter filter = componentRegistry.getComponentFilterBuilder()
    .createFilter("type", "service")
    .and("name", "userService")
    .or("type", "repository")
    .not();

// Register component
ComponentRegistration<Service, ?> registration = 
    componentRegistry.registerComponent(Service.class, new UserService(), config);

// Find components
List<Service> services = componentRegistry.findComponents(Service.class, filter);
Service service = componentRegistry.findComponent(Service.class, filter);
```

### Permission
The permission system provides fine-grained access control:

1. **Permission**
   - Defines access control rules
   - Maps to specific actions
   - Can be assigned to roles

2. **Action**
   - Represents operations that can be performed
   - Defined in action classes
   - Used in permission annotations

3. **PermissionManager**
   - Manages permission checking
   - Handles permission assignment
   - Validates permissions

Example:
```java
// Define actions
public abstract class UserActions {
    public static final String CREATE = "create";
    public static final String READ = "read";
    public static final String UPDATE = "update";
    public static final String DELETE = "delete";
}

// Use permission annotations
@Service
public class UserServiceImpl implements UserApi {
    @AllowPermissions(actions = {UserActions.CREATE})
    public User createUser(User user) {
        return userRepository.save(user);
    }
    
    @AllowPermissions(actions = {UserActions.READ})
    public User findUser(long id) {
        return userRepository.find(id);
    }
}

// Check permissions programmatically
boolean hasPermission = PermissionUtil.hasPermission(
    SecurityContext.get(),
    UserActions.READ,
    user
);
```

### Model
The model package defines core entity types:

1. **BaseEntity**
   - Base interface for all entities
   - Defines common fields (id, version, dates)
   - Supports basic entity operations

2. **ExpandableEntity**
   - Entity with dynamic properties
   - Allows property addition without modification
   - Useful for flexible data structures

3. **OwnedEntity**
   - Entity with owner information
   - Tracks ownership details
   - Supports ownership-based permissions

4. **SharedEntity**
   - Entity that can be shared
   - Manages sharing permissions
   - Tracks shared users

Example:
```java
@Entity
@AccessControl
public class User implements BaseEntity {
    @Id
    private long id;
    private String username;
    private String email;
    
    // Entity will automatically support permission checking
}

@Entity
public class Document extends AbstractEntity implements ExpandableEntity {
    private String title;
    private String content;
    
    public void addProperty(String key, Object value) {
        // Add dynamic property
    }
}

@Entity
public class UserDocument extends AbstractEntity implements OwnedEntity {
    private long ownerId;
    private String ownerUsername;
    
    @Override
    public long getOwnerId() {
        return ownerId;
    }
}
```

### Repository
The repository package defines data access interfaces:

1. **BaseRepository**
   - Base interface for data access
   - Defines CRUD operations
   - Supports query operations

2. **Query**
   - Defines search criteria
   - Supports complex conditions
   - Used for data filtering

3. **RepositoryManager**
   - Manages repository lifecycle
   - Handles repository registration
   - Provides repository discovery

Example:
```java
@Repository
public class UserRepository implements BaseRepository<User> {
    @Override
    public User find(long id) {
        // Implementation
    }
    
    @Override
    public List<User> findAll(Query filter) {
        // Implementation
    }
    
    @Override
    public User save(User entity) {
        // Implementation
    }
}
```

### Bundle
The bundle package manages component lifecycle:

1. **BundleManager**
   - Manages bundle lifecycle
   - Handles bundle activation/deactivation
   - Manages bundle dependencies

2. **BundleContext**
   - Provides bundle context
   - Manages bundle configuration
   - Handles bundle state

3. **BundleConfiguration**
   - Configures bundle behavior
   - Defines bundle properties
   - Sets bundle priority

Example:
```java
@Component
public class UserBundle implements Bundle {
    @OnActivate
    public void activate(Map<String, Object> properties) {
        // Bundle activation logic
        String configValue = (String) properties.get("config.key");
        // Initialize resources
    }
    
    @OnDeactivate
    public void deactivate() {
        // Bundle deactivation logic
        // Cleanup resources
    }
}
```

### Security
The security package provides security features:

1. **SecurityContext**
   - Manages security context
   - Handles authentication state
   - Provides user information

2. **AuthenticationManager**
   - Handles authentication
   - Validates credentials
   - Manages sessions

3. **AuthorizationManager**
   - Manages authorization
   - Checks permissions
   - Handles role assignment

Example:
```java
// Get security context
SecurityContext securityContext = SecurityContext.get();

// Check authentication
if (!securityContext.isAuthenticated()) {
    throw new SecurityException("User not authenticated");
}

// Check authorization
if (!securityContext.hasPermission("user:read")) {
    throw new SecurityException("User not authorized");
}

// Get current user
User currentUser = securityContext.getLoggedUser();
```

### Entity
The entity package provides entity management:

1. **EntityManager**
   - Manages entity lifecycle
   - Handles entity persistence
   - Manages entity state

2. **EntityValidator**
   - Validates entities
   - Checks entity constraints
   - Provides validation results

3. **EntityExtension**
   - Extends entity functionality
   - Adds dynamic behavior
   - Supports entity composition

Example:
```java
@Entity
@AccessControl
public class User implements BaseEntity {
    @Id
    private long id;
    
    @NotNull
    private String username;
    
    @Email
    private String email;
    
    // Entity will be automatically validated
}

// Use entity validator
public class UserValidator implements Validator<User> {
    @Override
    public ValidationResult validate(User user) {
        ValidationResult result = new ValidationResult();
        if (user.getEmail() == null || !user.getEmail().contains("@")) {
            result.addError("email", "Invalid email format");
        }
        return result;
    }
}
```

### Interceptors
The interceptors package provides cross-cutting concerns:

1. **MethodInterceptor**
   - Intercepts method calls
   - Provides pre/post processing
   - Supports method modification

2. **InterceptorChain**
   - Manages interceptor chain
   - Controls interceptor order
   - Handles interceptor execution

3. **InterceptorContext**
   - Provides interceptor context
   - Manages interceptor state
   - Supports interceptor communication

Example:
```java
@Interceptor
public class SecurityInterceptor implements MethodInterceptor {
    @Override
    public Object invoke(MethodInvocation invocation) throws Throwable {
        // Pre-execution security checks
        SecurityContext securityContext = SecurityContext.get();
        if (!securityContext.isAuthenticated()) {
            throw new SecurityException("User not authenticated");
        }
        
        // Execute the method
        Object result = invocation.proceed();
        
        // Post-execution processing
        return result;
    }
}

// Use interceptor
@InterceptWith(SecurityInterceptor.class)
public class SecureService {
    public void secureMethod() {
        // Method implementation
    }
}
```

### Role
The role package manages user roles:

1. **Role**
   - Defines user roles
   - Groups permissions
   - Manages role hierarchy

2. **RoleManager**
   - Manages role lifecycle
   - Handles role assignment
   - Manages role permissions

3. **RoleAssignment**
   - Assigns roles to users
   - Manages role membership
   - Handles role inheritance

Example:
```java
@Entity
public class Role implements BaseEntity {
    @Id
    private long id;
    
    private String name;
    
    @ManyToMany
    private Set<Permission> permissions;
}

@Service
public class RoleServiceImpl implements RoleApi {
    @Override
    public Role createRole(String name, Set<Permission> permissions) {
        Role role = new Role();
        role.setName(name);
        role.setPermissions(permissions);
        return roleRepository.save(role);
    }
    
    @Override
    public void assignRole(User user, Role role) {
        user.getRoles().add(role);
        userRepository.update(user);
    }
}
```

### User
The user package manages user functionality:

1. **User**
   - Represents system users
   - Manages user data
   - Handles user state

2. **UserManager**
   - Manages user lifecycle
   - Handles user operations
   - Manages user state

3. **UserContext**
   - Provides user context
   - Manages user session
   - Handles user preferences

Example:
```java
@Entity
public class User implements BaseEntity {
    @Id
    private long id;
    
    private String username;
    
    private String email;
    
    @ManyToMany
    private Set<Role> roles;
}

@Service
public class UserServiceImpl implements UserApi {
    @Override
    public User createUser(String username, String email) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        return userRepository.save(user);
    }
    
    @Override
    public User findUser(long id) {
        return userRepository.find(id);
    }
}
```

### Notification
The notification package handles system notifications:

1. **NotificationManager**
   - Manages notifications
   - Handles notification delivery
   - Manages notification state

2. **NotificationTemplate**
   - Defines notification templates
   - Manages template variables
   - Handles template rendering

3. **NotificationSender**
   - Sends notifications
   - Manages delivery channels
   - Handles delivery status

Example:
```java
@Service
public class NotificationServiceImpl implements NotificationApi {
    @Override
    public void sendWelcomeEmail(User user) {
        NotificationTemplate template = notificationManager
            .getTemplate("welcome-email");
            
        template.setParameter("username", user.getUsername());
        template.setParameter("activationLink", generateActivationLink(user));
        
        notificationManager.send(template, user.getEmail());
    }
    
    @Override
    public void sendPasswordReset(User user) {
        NotificationTemplate template = notificationManager
            .getTemplate("password-reset");
            
        template.setParameter("username", user.getUsername());
        template.setParameter("resetLink", generateResetLink(user));
        
        notificationManager.send(template, user.getEmail());
    }
}
```

### Action
The action package defines system actions:

1. **Action**
   - Defines system actions
   - Maps to permissions
   - Supports action hierarchy

2. **ActionManager**
   - Manages action lifecycle
   - Handles action registration
   - Manages action state

3. **ActionExecutor**
   - Executes actions
   - Manages action context
   - Handles action results

Example:
```java
public abstract class CrudActions {
    public static final String SAVE = "save";
    public static final String UPDATE = "update";
    public static final String FIND = "find";
    public static final String FIND_ALL = "find-all";
    public static final String REMOVE = "remove";
}

@Service
public class UserServiceImpl implements UserApi {
    @AllowPermissions(actions = {CrudActions.SAVE})
    public User createUser(User user) {
        return userRepository.save(user);
    }
    
    @AllowPermissions(actions = {CrudActions.FIND})
    public User findUser(long id) {
        return userRepository.find(id);
    }
}
```

### Validation
The validation package provides validation functionality:

1. **Validator**
   - Validates objects
   - Checks constraints
   - Provides validation results

2. **ValidationContext**
   - Provides validation context
   - Manages validation state
   - Handles validation rules

3. **ValidationResult**
   - Contains validation results
   - Manages validation errors
   - Provides error details

Example:
```java
public class UserValidator implements Validator<User> {
    @Override
    public ValidationResult validate(User user, ValidationContext context) {
        ValidationResult result = new ValidationResult();
        
        if (user.getEmail() == null || !user.getEmail().contains("@")) {
            result.addError("email", "Invalid email format");
        }
        
        if (user.getUsername() == null || user.getUsername().length() < 3) {
            result.addError("username", "Username must be at least 3 characters");
        }
        
        return result;
    }
}

// Use validator
@Service
public class UserServiceImpl implements UserApi {
    @Inject
    private Validator<User> userValidator;
    
    @Override
    public User createUser(User user) {
        ValidationResult result = userValidator.validate(user);
        if (!result.isValid()) {
            throw new ValidationException(result.getErrors());
        }
        return userRepository.save(user);
    }
}
```

## Component Lifecycle
Components in Water Framework follow a well-defined lifecycle:

#### Lifecycle Annotations
```java
@Component
public class UserService {
    @OnActivate
    public void activate(Map<String, Object> properties) {
        // Component activation logic
        String configValue = (String) properties.get("config.key");
        // Initialize component
    }
    
    @OnDeactivate
    public void deactivate() {
        // Cleanup resources
    }
}
```

#### Lifecycle Methods
- **@OnActivate**: Called when component is activated
  - Receives configuration properties
  - Initialize resources
  - Register with registry

- **@OnDeactivate**: Called when component is deactivated
  - Cleanup resources
  - Unregister from registry

## Component Registry
The Component Registry manages component discovery and lifecycle:

```java
// Register a component
componentRegistry.registerComponent(userService);

// Find components by type
List<UserService> services = componentRegistry.findComponents(UserService.class);

// Find components by filter
ComponentFilter filter = new ComponentFilter()
    .addProperty("type", "user")
    .addProperty("version", "1.0");
List<Object> components = componentRegistry.findComponents(filter);
```

## Permission System
The permission system provides fine-grained access control:

#### Action Definition
```java
public abstract class UserActions {
    public static final String CREATE = "create";
    public static final String READ = "read";
    public static final String UPDATE = "update";
    public static final String DELETE = "delete";
}
```

#### Permission Annotations
```java
@Service
public class UserServiceImpl implements UserApi {
    @AllowPermissions(actions = {UserActions.CREATE})
    public User createUser(User user) {
        // Only users with CREATE permission can access this method
        return userRepository.save(user);
    }
    
    @AllowPermissions(actions = {UserActions.READ})
    public User findUser(long id) {
        // Only users with READ permission can access this method
        return userRepository.find(id);
    }
}
```

#### Permission Checking
```java
// Check permission programmatically
boolean hasPermission = PermissionUtil.hasPermission(
    SecurityContext.get(),
    UserActions.READ,
    user
);

// Check permission with annotation
@AllowPermissions(actions = {UserActions.UPDATE})
public void updateUser(User user) {
    // Method will only execute if user has UPDATE permission
}
```

## Runtime Object
The Runtime object provides access to the framework's runtime environment:

```java
// Get runtime instance
WaterRuntime runtime = WaterRuntime.getInstance();

// Get security context
SecurityContext securityContext = runtime.getSecurityContext();

// Get component registry
ComponentRegistry registry = runtime.getComponentRegistry();
```

## Entity Permission Support
Entities can be annotated to support automatic permission checking:

```java
@Entity
@AccessControl
public class User implements BaseEntity {
    @Id
    private long id;
    
    private String username;
    
    // Entity will automatically support permission checking
    // based on the entity type and instance
}
```

## Technology Implementations
Water Framework supports multiple technologies through implementation modules:

### Spring Implementation
```java
@Configuration
public class SpringConfig {
    @Bean
    public ComponentRegistry componentRegistry() {
        return new SpringComponentRegistry();
    }
    
    @Bean
    public SecurityContext securityContext() {
        return new SpringSecurityContext();
    }
}
```

### OSGi Implementation
```java
@Component
public class OsgiUserService implements UserApi {
    @Reference
    private ComponentRegistry registry;
    
    @Reference
    private SecurityContext securityContext;
}
```

### Quarkus Implementation
```java
@ApplicationScoped
public class QuarkusUserService implements UserApi {
    @Inject
    private ComponentRegistry registry;
    
    @Inject
    private SecurityContext securityContext;
}
```

## Water Generator
The Water Generator is a powerful tool for scaffolding and generating code:

### Available Commands
```bash
# Show help
yo water:help

# Build specific projects
yo water:build --projects Project1,Project2

# Build all projects
yo water:build-all

# Set project build order
yo water:projects-order

# Show current project order
yo water:projects-order-show

# Run stability metrics
yo water:stability-metrics --projects Project1,Project2
```

### Project Generation
The generator can create:
- New projects
- Components
- Entities
- Repositories
- Services
- REST APIs

Example:
```bash
# Generate a new project
yo water:project my-project

# Generate a new component
yo water:component my-component

# Generate a new entity
yo water:entity my-entity
```

## Best Practices

1. **Component Design**
   - Use interfaces for public APIs
   - Implement SystemApi for internal components
   - Follow the component lifecycle

2. **Permission Management**
   - Define actions in separate classes
   - Use annotations for permission checking
   - Implement proper security context handling

3. **Entity Design**
   - Use @AccessControl for permission support
   - Implement proper entity lifecycle
   - Use appropriate entity types (BaseEntity, OwnedEntity, etc.)

4. **Technology Integration**
   - Use appropriate implementation module
   - Follow technology-specific best practices
   - Implement proper component registration 