# Defining Roles and Permissions

The Water Framework provides a comprehensive system for defining roles and permissions using declarative annotations. This system allows you to automatically set up default permissions for different user roles and manage access control throughout your application.

## Understanding @AccessControl Annotation

The `@AccessControl` annotation is the cornerstone of the permission system. It defines:
- **Available Actions**: What operations can be performed on a resource
- **Default Role Permissions**: Which roles have which permissions by default

### Basic Structure

```java
@AccessControl(
    availableActions = { /* list of available actions */ },
    rolesPermissions = {
        @DefaultRoleAccess(roleName = "role1", actions = { /* actions for role1 */ }),
        @DefaultRoleAccess(roleName = "role2", actions = { /* actions for role2 */ })
    }
)
public class MyEntity implements ProtectedEntity {
    // Entity implementation
}
```

## Available Actions

The framework provides several predefined action types that you can use in your `@AccessControl` annotations:

### CRUD Actions
```java
public abstract class CrudActions {
    public static final String SAVE = "save";           // Create new entities
    public static final String UPDATE = "update";       // Modify existing entities
    public static final String FIND = "find";           // Retrieve single entities
    public static final String FIND_ALL = "find-all";   // Retrieve multiple entities
    public static final String REMOVE = "remove";       // Delete entities
}
```

### Share Actions
```java
public abstract class ShareAction {
    public static final String SHARE = "share";         // Share entities with other users
}
```

### User Actions
```java
public abstract class UserActions {
    public static final String IMPERSONATE = "impersonate"; // Impersonate other users
    public static final String ACTIVATE = "activate";       // Activate users
    public static final String DEACTIVATE = "deactivate";   // Deactivate users
}
```

## Role Definition Patterns

Based on the test examples, here are common role patterns used in Water Framework applications:

### 1. Three-Tier Role System (Most Common)

This pattern defines three standard roles: Manager, Editor, and Viewer.

```java
@AccessControl(
    availableActions = {CrudActions.SAVE, CrudActions.UPDATE, CrudActions.FIND, CrudActions.FIND_ALL, CrudActions.REMOVE},
    rolesPermissions = {
        // Manager role can do everything
        @DefaultRoleAccess(roleName = "manager", actions = {CrudActions.SAVE, CrudActions.UPDATE, CrudActions.FIND, CrudActions.FIND_ALL, CrudActions.REMOVE}),
        // Editor can do anything but remove
        @DefaultRoleAccess(roleName = "editor", actions = {CrudActions.SAVE, CrudActions.UPDATE, CrudActions.FIND, CrudActions.FIND_ALL}),
        // Viewer has read-only access
        @DefaultRoleAccess(roleName = "viewer", actions = {CrudActions.FIND, CrudActions.FIND_ALL})
    }
)
public class Document implements ProtectedEntity {
    // Entity implementation
}
```

### 2. Custom Role Names

You can define custom role names specific to your entity:

```java
@AccessControl(
    availableActions = {CrudActions.SAVE, CrudActions.UPDATE, CrudActions.FIND, CrudActions.FIND_ALL, CrudActions.REMOVE},
    rolesPermissions = {
        @DefaultRoleAccess(roleName = "document_manager", actions = {CrudActions.SAVE, CrudActions.UPDATE, CrudActions.FIND, CrudActions.FIND_ALL, CrudActions.REMOVE}),
        @DefaultRoleAccess(roleName = "document_editor", actions = {CrudActions.SAVE, CrudActions.UPDATE, CrudActions.FIND, CrudActions.FIND_ALL}),
        @DefaultRoleAccess(roleName = "document_viewer", actions = {CrudActions.FIND, CrudActions.FIND_ALL})
    }
)
public class Document implements ProtectedEntity {
    // Entity implementation
}
```

### 3. Including Share Actions

For entities that support sharing, include the SHARE action:

```java
@AccessControl(
    availableActions = {ShareAction.SHARE, CrudActions.UPDATE, CrudActions.FIND, CrudActions.FIND_ALL, CrudActions.REMOVE},
    rolesPermissions = {
        // Manager role can do everything including sharing
        @DefaultRoleAccess(roleName = "manager", actions = {ShareAction.SHARE, CrudActions.UPDATE, CrudActions.FIND, CrudActions.FIND_ALL, CrudActions.REMOVE}),
        // Editor can edit and share but not remove
        @DefaultRoleAccess(roleName = "editor", actions = {ShareAction.SHARE, CrudActions.UPDATE, CrudActions.FIND, CrudActions.FIND_ALL}),
        // Viewer can view and share
        @DefaultRoleAccess(roleName = "viewer", actions = {ShareAction.SHARE, CrudActions.FIND, CrudActions.FIND_ALL})
    }
)
public class SharedDocument implements ProtectedEntity, SharedEntity {
    // Entity implementation
}
```

## Real Examples from Test Classes

### Example 1: Basic Protected Entity

From `Core/Core-permission/src/test/java/it/water/core/permission/ProtectedEntity.java`:

```java
@AccessControl(
    availableActions = {CrudActions.SAVE, CrudActions.UPDATE, CrudActions.REMOVE, CrudActions.FIND},
    rolesPermissions = {
        @DefaultRoleAccess(roleName = "Role1", actions = {CrudActions.SAVE, CrudActions.UPDATE}),
        @DefaultRoleAccess(roleName = "Role2", actions = {CrudActions.FIND, CrudActions.REMOVE})
    }
)
public class ProtectedEntity implements it.water.core.api.permission.ProtectedEntity {
    // Simple implementation for testing
}
```

### Example 2: Comprehensive Test Resource

From `Permission/Permission-manager/src/test/java/it/water/permission/manager/TestResource.java`:

```java
@AccessControl(
    availableActions = {CrudActions.SAVE, CrudActions.UPDATE, CrudActions.FIND, CrudActions.FIND_ALL, CrudActions.REMOVE},
    rolesPermissions = {
        // Manager role can do everything
        @DefaultRoleAccess(roleName = TestResource.TEST_ROLE_MANAGER, actions = {CrudActions.SAVE, CrudActions.UPDATE, CrudActions.FIND, CrudActions.FIND_ALL, CrudActions.REMOVE}),
        // Viewer has read-only access
        @DefaultRoleAccess(roleName = TestResource.TEST_ROLE_VIEWER, actions = {CrudActions.FIND, CrudActions.FIND_ALL}),
        // Editor can do anything but remove
        @DefaultRoleAccess(roleName = TestResource.TEST_ROLE_EDITOR, actions = {CrudActions.SAVE, CrudActions.UPDATE, CrudActions.FIND, CrudActions.FIND_ALL})
    }
)
public class TestResource implements ProtectedEntity, SharedEntity {
    public static final String TEST_ROLE_MANAGER = "test_manager";
    public static final String TEST_ROLE_VIEWER = "test_viewer";
    public static final String TEST_ROLE_EDITOR = "test_editor";
    
    // Entity implementation
}
```

### Example 3: Shared Entity with Custom Actions

From `SharedEntity/SharedEntity-service/src/test/java/it/water/shared/entity/TestEntityResource.java`:

```java
@AccessControl(
    availableActions = {ShareAction.SHARE, CrudActions.UPDATE, CrudActions.FIND, CrudActions.FIND_ALL, CrudActions.REMOVE}, 
    rolesPermissions = {
        // Manager role can do everything
        @DefaultRoleAccess(roleName = WaterSharedEntity.DEFAULT_MANAGER_ROLE, actions = {ShareAction.SHARE, CrudActions.UPDATE, CrudActions.FIND, CrudActions.FIND_ALL, CrudActions.REMOVE}),
        // Viewer has read only access
        @DefaultRoleAccess(roleName = WaterSharedEntity.DEFAULT_VIEWER_ROLE, actions = {ShareAction.SHARE, CrudActions.FIND, CrudActions.FIND_ALL}),
        // Editor can do anything but remove
        @DefaultRoleAccess(roleName = WaterSharedEntity.DEFAULT_EDITOR_ROLE, actions = {ShareAction.SHARE, CrudActions.UPDATE, CrudActions.FIND, CrudActions.FIND_ALL})
    }
)
public class TestEntityResource implements SharedEntity {
    // Entity implementation
}
```

## How Default Permission Setup Works

The `@AccessControl` annotation triggers automatic permission setup during application startup:

### 1. Action Registration
The `DefaultActionsManager` scans all entities with `@AccessControl` annotations and registers the available actions.

### 2. Role Creation
For each role defined in `@DefaultRoleAccess`, the system:
- Checks if the role already exists
- Creates the role if it doesn't exist
- Assigns the specified permissions to the role

### 3. Permission Assignment
Permissions are automatically created for each role-action combination, but only if the role doesn't already exist in the system.

## Role Management in Practice

### Creating and Managing Roles

The `RoleManager` interface provides methods for role management:

```java
public interface RoleManager extends Service {
    Role createIfNotExists(String roleName);
    boolean exists(String roleName);
    boolean hasRole(long userId, String roleName);
    Set<Role> getUserRoles(long userId);
    boolean addRole(long userId, Role role);
    Role getRole(String roleName);
    boolean removeRole(long userId, Role role);
}
```

### Example: Setting Up Users with Roles

From the test examples, here's how to set up users with specific roles:

```java
@BeforeAll
void beforeAll() {
    // Get the roles defined in @AccessControl
    Role managerRole = roleManager.getRole("manager");
    Role viewerRole = roleManager.getRole("viewer");
    Role editorRole = roleManager.getRole("editor");
    
    // Create test users
    User managerUser = userManager.addUser("manager", "name", "lastname", "manager@a.com", "Password1_", "salt", false);
    User viewerUser = userManager.addUser("viewer", "name", "lastname", "viewer@a.com", "Password1_", "salt", false);
    User editorUser = userManager.addUser("editor", "name", "lastname", "editor@a.com", "Password1_", "salt", false);
    
    // Assign roles to users
    roleManager.addRole(managerUser.getId(), managerRole);
    roleManager.addRole(viewerUser.getId(), viewerRole);
    roleManager.addRole(editorUser.getId(), editorRole);
}
```

## Best Practices for Role Definition

### 1. Use Consistent Role Naming
Follow a consistent pattern for role names:
- `{entity}_manager` - Full access
- `{entity}_editor` - Create, update, read
- `{entity}_viewer` - Read-only access

### 2. Define Clear Permission Hierarchies
- **Manager**: Full CRUD access + administrative actions
- **Editor**: Create, update, read (no delete)
- **Viewer**: Read-only access

### 3. Use Constants for Role Names
Define role names as constants to avoid typos:

```java
public class Document implements ProtectedEntity {
    public static final String DOCUMENT_MANAGER_ROLE = "document_manager";
    public static final String DOCUMENT_EDITOR_ROLE = "document_editor";
    public static final String DOCUMENT_VIEWER_ROLE = "document_viewer";
    
    @AccessControl(
        availableActions = {CrudActions.SAVE, CrudActions.UPDATE, CrudActions.FIND, CrudActions.FIND_ALL, CrudActions.REMOVE},
        rolesPermissions = {
            @DefaultRoleAccess(roleName = DOCUMENT_MANAGER_ROLE, actions = {CrudActions.SAVE, CrudActions.UPDATE, CrudActions.FIND, CrudActions.FIND_ALL, CrudActions.REMOVE}),
            @DefaultRoleAccess(roleName = DOCUMENT_EDITOR_ROLE, actions = {CrudActions.SAVE, CrudActions.UPDATE, CrudActions.FIND, CrudActions.FIND_ALL}),
            @DefaultRoleAccess(roleName = DOCUMENT_VIEWER_ROLE, actions = {CrudActions.FIND, CrudActions.FIND_ALL})
        }
    )
    // Entity implementation
}
```

### 4. Consider Entity-Specific Actions
For entities with special requirements, define custom actions:

```java
@AccessControl(
    availableActions = {CrudActions.SAVE, CrudActions.UPDATE, CrudActions.FIND, CrudActions.FIND_ALL, CrudActions.REMOVE, "publish", "archive"},
    rolesPermissions = {
        @DefaultRoleAccess(roleName = "content_manager", actions = {CrudActions.SAVE, CrudActions.UPDATE, CrudActions.FIND, CrudActions.FIND_ALL, CrudActions.REMOVE, "publish", "archive"}),
        @DefaultRoleAccess(roleName = "content_editor", actions = {CrudActions.SAVE, CrudActions.UPDATE, CrudActions.FIND, CrudActions.FIND_ALL, "publish"}),
        @DefaultRoleAccess(roleName = "content_viewer", actions = {CrudActions.FIND, CrudActions.FIND_ALL})
    }
)
public class Content implements ProtectedEntity {
    // Entity implementation
}
```

## Testing Role and Permission Setup

### Verifying Role Creation
```java
@Test
void testRoleCreation() {
    // Verify roles were created
    Assertions.assertTrue(roleManager.exists("manager"));
    Assertions.assertTrue(roleManager.exists("viewer"));
    Assertions.assertTrue(roleManager.exists("editor"));
    
    // Verify role assignments
    Assertions.assertTrue(roleManager.hasRole(managerUser.getId(), "manager"));
    Assertions.assertTrue(roleManager.hasRole(viewerUser.getId(), "viewer"));
    Assertions.assertTrue(roleManager.hasRole(editorUser.getId(), "editor"));
}
```

### Testing Permission Enforcement
```java
@Test
void testPermissionEnforcement() {
    // Test manager permissions
    TestRuntimeInitializer.getInstance().impersonate(managerUser, runtime);
    Assertions.assertTrue(permissionManager.checkPermission(managerUser.getUsername(), document, saveAction));
    Assertions.assertTrue(permissionManager.checkPermission(managerUser.getUsername(), document, removeAction));
    
    // Test viewer permissions
    TestRuntimeInitializer.getInstance().impersonate(viewerUser, runtime);
    Assertions.assertTrue(permissionManager.checkPermission(viewerUser.getUsername(), document, findAction));
    Assertions.assertFalse(permissionManager.checkPermission(viewerUser.getUsername(), document, removeAction));
}
```

## Summary

The `@AccessControl` annotation provides a powerful, declarative way to define roles and permissions in Water Framework applications. By following the patterns shown in the test examples, you can:

1. **Automatically set up default permissions** for common role hierarchies
2. **Ensure consistency** across your application
3. **Reduce boilerplate code** for permission management
4. **Make permission changes** by simply updating the annotation

The system is designed to be flexible while providing sensible defaults, making it easy to implement robust access control in your applications. 