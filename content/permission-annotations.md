# Permission Management System

The Water Framework provides a comprehensive permission management system that allows fine-grained control over resource access and operations. This system is built around several key concepts: authentication, authorization, actions, and permissions.

## Core Concepts

### Authentication vs Authorization

- **Authentication**: Verifies who a user is (login process)
- **Authorization**: Determines what a user can do (permission checking)

### Authenticable Interface

The `Authenticable` interface represents entities that can authenticate with the system:

```java
public interface Authenticable {
    Long getLoggedEntityId();
    String getIssuer();
    String getScreenNameFieldName();
    String getScreenName();
    String getPassword();
    String getSalt();
    boolean isAdmin();
    boolean isActive();
    Collection<Role> getRoles();
}
```

### Authentication Provider

The `AuthenticationProvider` interface defines how authentication is performed:

```java
public interface AuthenticationProvider extends Service {
    Authenticable login(String username, String password);
    Collection<String> issuersNames();
}
```

The framework supports multiple authentication providers, each identified by an issuer name. This allows for different authentication mechanisms (e.g., database users, LDAP, OAuth).

## Permission System Architecture

### Permission Interface

The core `Permission` interface represents a permission record:

```java
public interface Permission {
    long getId();
    String getName();
    String getResourceName();
    Long getResourceId();
    long getActionIds();
    long getUserId();
    long getRoleId();
}
```

### Permission Manager

The `PermissionManager` interface is the central component for permission checking:

```java
public interface PermissionManager extends Service {
    boolean userHasRoles(String username, String[] rolesNames);
    void addPermissionIfNotExists(Role r, Class<? extends Resource> resourceClass, Action action);
    boolean checkPermission(String username, Resource entity, Action action);
    boolean checkPermission(String username, Class<? extends Resource> resource, Action action);
    boolean checkPermission(String username, String resourceName, Action action);
    boolean checkPermissionAndOwnership(String username, String resourceName, Action action, Resource... entities);
    boolean checkPermissionAndOwnership(String username, Resource resource, Action action, Resource... entities);
    boolean checkUserOwnsResource(User user, Object resource);
    Map<String, Map<String, Map<String, Boolean>>> entityPermissionMap(String username, Map<String, List<Long>> entityPks);
}
```

### Security Context

The `SecurityContext` interface provides access to current user information:

```java
public interface SecurityContext extends Service {
    String getLoggedUsername();
    boolean isLoggedIn();
    boolean isAdmin();
    long getLoggedEntityId();
}
```

## Actions System

### Action Interface

Actions represent operations that can be performed on resources:

```java
public interface Action {
    String getActionName();
    String getActionType();
    long getActionId();
}
```

**Important**: Every action must have an `actionId` which is a power of 2 (1, 2, 4, 8, 16, etc.). This enables efficient bitwise operations for permission checking.

### Built-in Actions

The framework provides several predefined action types:

#### CRUD Actions
```java
public abstract class CrudActions {
    public static final String SAVE = "save";
    public static final String UPDATE = "update";
    public static final String FIND = "find";
    public static final String FIND_ALL = "find-all";
    public static final String REMOVE = "remove";
}
```

#### User Actions
```java
public abstract class UserActions {
    public static final String IMPERSONATE = "impersonate";
    public static final String ACTIVATE = "activate";
    public static final String DEACTIVATE = "deactivate";
}
```

#### Share Actions
```java
public abstract class ShareAction {
    public static final String SHARE = "share";
}
```

### Action Factory

The `ActionFactory` provides utilities for creating actions:

```java
// Create a generic action
Action action = ActionFactory.createGenericAction(MyResource.class, "custom-action", 16);

// Create base CRUD action list
DefaultActionList<MyResource> actionList = ActionFactory.createBaseCrudActionList(MyResource.class);
```

## Permission Annotations

The Water Framework provides a rich set of annotations for declarative permission management.

### @AccessControl

Defines available actions and default role permissions for a resource:

```java
@AccessControl(
    availableActions = {CrudActions.SAVE, CrudActions.UPDATE, CrudActions.REMOVE, CrudActions.FIND},
    rolesPermissions = {
        @DefaultRoleAccess(roleName = "admin", actions = {CrudActions.SAVE, CrudActions.UPDATE, CrudActions.REMOVE, CrudActions.FIND}),
        @DefaultRoleAccess(roleName = "user", actions = {CrudActions.FIND})
    }
)
public class MyProtectedEntity implements ProtectedEntity {
    // Entity implementation
}
```

### @AllowPermissions

Restricts method execution to users with specific permissions:

```java
@AllowPermissions(actions = {CrudActions.SAVE})
public void saveEntity(MyEntity entity) {
    // Only users with SAVE permission can execute this method
}

@AllowPermissions(actions = {CrudActions.UPDATE}, checkById = true, idParamIndex = 0)
public void updateEntity(Long entityId, MyEntity entity) {
    // Checks permission on specific entity by ID
}
```

### @AllowGenericPermissions

Checks generic permissions (not tied to specific entity instances):

```java
@AllowGenericPermissions(actions = {CrudActions.FIND})
public List<MyEntity> findAllEntities() {
    // Checks if user has generic FIND permission on the resource
}

@AllowGenericPermissions(actions = {CrudActions.SAVE}, resourceName = "MyCustomResource")
public void performCustomOperation() {
    // Checks permission on a specific resource name
}
```

### @AllowRoles

Restricts method execution to users with specific roles:

```java
@AllowRoles(rolesNames = {"admin", "manager"})
public void adminOnlyOperation() {
    // Only users with admin or manager role can execute this method
}
```

### @AllowLoggedUser

Ensures only authenticated users can access the method:

```java
@AllowLoggedUser
public void authenticatedUserOperation() {
    // Only logged-in users can execute this method
}
```

### @AllowPermissionsOnReturn

Checks permissions on the method's return value:

```java
@AllowPermissionsOnReturn(actions = {CrudActions.FIND})
public MyEntity getEntity() {
    // Checks if user has permission to access the returned entity
}
```

## Protected Entities

### ProtectedEntity Interface

Entities that implement `ProtectedEntity` are automatically subject to permission checking:

```java
public interface ProtectedEntity extends BaseEntity {
    // Marker interface - no additional methods required
}
```

### ProtectedResource Interface

Alternative interface for resources that need protection:

```java
public interface ProtectedResource extends Resource {
    // Marker interface - no additional methods required
}
```

## Permission Utility

The `PermissionUtil` interface provides convenient methods for permission checking:

```java
public interface PermissionUtil extends Service {
    boolean userHasRoles(String username, String[] rolesNames);
    boolean checkPermission(Object o, Action action);
    boolean checkPermission(String resourceName, Action action);
    boolean checkPermissionAndOwnership(String resourceName, Action action, Resource... entities);
    boolean checkPermissionAndOwnership(Object o, Action action, Resource... entities);
}
```

## Default Implementation

### DefaultActionsManager

The `DefaultActionsManager` automatically registers actions for protected resources:

```java
@FrameworkComponent(priority = 1)
public class DefaultActionsManager implements ActionsManager {
    
    public <T extends Resource> void registerActions(Class<T> resourceClass) {
        // Scans for @AccessControl annotation
        // Registers available actions
        // Sets up default role permissions
    }
}
```

### How It Works

1. **Action Registration**: When a protected resource is loaded, the `DefaultActionsManager` scans for `@AccessControl` annotations
2. **Action Creation**: Creates `Action` instances with power-of-2 IDs for each declared action
3. **Default Permissions**: Automatically creates permissions for default roles as specified in the annotation
4. **Permission Checking**: The permission system uses bitwise operations to efficiently check multiple permissions

## Example Usage

### Complete Protected Entity Example

```java
@AccessControl(
    availableActions = {CrudActions.SAVE, CrudActions.UPDATE, CrudActions.REMOVE, CrudActions.FIND, ShareAction.SHARE},
    rolesPermissions = {
        @DefaultRoleAccess(roleName = "admin", actions = {CrudActions.SAVE, CrudActions.UPDATE, CrudActions.REMOVE, CrudActions.FIND, ShareAction.SHARE}),
        @DefaultRoleAccess(roleName = "user", actions = {CrudActions.FIND}),
        @DefaultRoleAccess(roleName = "manager", actions = {CrudActions.SAVE, CrudActions.UPDATE, CrudActions.FIND})
    }
)
public class Document implements ProtectedEntity {
    private Long id;
    private String name;
    private String content;
    
    // Getters and setters...
    
    @Override
    public long getId() {
        return id;
    }
}
```

### Service with Permission Annotations

```java
@FrameworkComponent
public class DocumentServiceImpl implements DocumentService {
    
    @AllowPermissions(actions = {CrudActions.SAVE})
    public Document save(Document document) {
        // Only users with SAVE permission can create documents
        return repository.save(document);
    }
    
    @AllowPermissions(actions = {CrudActions.UPDATE}, checkById = true, idParamIndex = 0)
    public Document update(Long documentId, Document document) {
        // Checks permission on specific document
        return repository.update(documentId, document);
    }
    
    @AllowGenericPermissions(actions = {CrudActions.FIND})
    public List<Document> findAll() {
        // Checks generic FIND permission
        return repository.findAll();
    }
    
    @AllowRoles(rolesNames = {"admin"})
    public void deleteAll() {
        // Only admin role can delete all documents
        repository.deleteAll();
    }
    
    @AllowPermissionsOnReturn(actions = {CrudActions.FIND})
    public Document findById(Long id) {
        // Checks permission on returned document
        return repository.findById(id);
    }
}
```

## Best Practices

1. **Use Power-of-2 Action IDs**: Always use power-of-2 values for action IDs to enable efficient bitwise operations
2. **Define Default Roles**: Use `@DefaultRoleAccess` to automatically set up permissions for common roles
3. **Combine Annotations**: Use multiple annotations for complex permission scenarios
4. **Check Ownership**: Use `checkPermissionAndOwnership` when users should only access their own resources
5. **Use Generic Permissions Carefully**: Generic permissions don't check entity ownership, so use them judiciously
6. **Test Permissions**: Always test permission scenarios with different user roles and resource ownership

## Testing

The framework provides test utilities for permission testing:

```java
@Test
void testPermissionChecking() {
    // Test that protected entities are properly identified
    ProtectedEntity entity = new ProtectedEntity();
    assertTrue(PermissionManager.isProtectedEntity(entity));
    
    // Test action creation and registration
    DefaultActionsManager manager = new DefaultActionsManager();
    manager.registerActions(ProtectedEntity.class);
    
    ActionList<?> actions = manager.getActions().get(ProtectedEntity.class.getName());
    assertTrue(actions.containsActionName(CrudActions.SAVE));
    assertTrue(actions.containsActionName(CrudActions.FIND));
}
```

This permission system provides a robust, flexible, and efficient way to manage access control in Water Framework applications, supporting both role-based and fine-grained permission models. 