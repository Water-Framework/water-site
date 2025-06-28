# Custom Permission Checking

The Water Framework's permission system is designed to be highly extensible and flexible. While the default `PermissionManagerDefault` implementation provides comprehensive permission checking, you can create custom permission managers to integrate with external systems or implement specialized permission logic.

## Understanding the Default Implementation

The `PermissionManagerDefault` is the standard implementation that provides:

- **Role-based permission checking**: Verifies permissions based on user roles
- **Entity-specific permissions**: Supports permissions on specific entity instances
- **Ownership checking**: Ensures users can only access resources they own
- **Sharing support**: Handles shared entity permissions
- **Impersonation**: Supports user impersonation capabilities

### Default Implementation Structure

```java
@FrameworkComponent(properties = {
    PermissionManagerComponentProperties.PERMISSION_MANAGER_IMPLEMENTATION_PROP + 
    "=" + PermissionManagerComponentProperties.PERMISSION_MANAGER_DEFAILT_IMPLEMENTATION
})
public class PermissionManagerDefault implements PermissionManager {
    
    @Inject
    private PermissionIntegrationClient permissionIntegrationClient;
    
    @Inject
    private UserIntegrationClient userIntegrationClient;
    
    @Inject
    private RoleIntegrationClient roleIntegrationClient;
    
    // Implementation methods...
}
```

## Creating Custom Permission Managers

### 1. Basic Custom Permission Manager

To override the default implementation, create a custom permission manager with higher priority:

```java
@FrameworkComponent(
    priority = 10, // Higher priority than default (which is 0)
    properties = {
        PermissionManagerComponentProperties.PERMISSION_MANAGER_IMPLEMENTATION_PROP + 
        "=custom"
    },
    services = {PermissionManager.class}
)
public class CustomPermissionManager implements PermissionManager {
    
    private Logger log = LoggerFactory.getLogger(CustomPermissionManager.class);
    
    @Inject
    @Setter
    private UserIntegrationClient userIntegrationClient;
    
    @Override
    public boolean userHasRoles(String username, String[] rolesNames) {
        // Custom role checking logic
        if (username == null || username.isEmpty()) {
            return false;
        }
        
        // Your custom implementation here
        return checkCustomRoles(username, rolesNames);
    }
    
    @Override
    public boolean checkPermission(String username, Resource entity, Action action) {
        log.debug("Custom permission check for user: {} on entity: {} action: {}", 
                 username, entity.getResourceName(), action.getActionName());
        
        // Custom permission logic
        return checkCustomPermission(username, entity, action);
    }
    
    // Implement other required methods...
    
    private boolean checkCustomRoles(String username, String[] rolesNames) {
        // Your custom role checking implementation
        return true; // Placeholder
    }
    
    private boolean checkCustomPermission(String username, Resource entity, Action action) {
        // Your custom permission checking implementation
        return true; // Placeholder
    }
}
```

### 2. Integration with External Permission Systems

The framework's flexible architecture allows integration with external permission systems:

#### LDAP/Active Directory Integration

```java
@FrameworkComponent(
    priority = 10,
    properties = {
        PermissionManagerComponentProperties.PERMISSION_MANAGER_IMPLEMENTATION_PROP + 
        "=ldap"
    },
    services = {PermissionManager.class}
)
public class LdapPermissionManager implements PermissionManager {
    
    @Inject
    @Setter
    private LdapClient ldapClient;
    
    @Override
    public boolean userHasRoles(String username, String[] rolesNames) {
        try {
            // Query LDAP for user groups/roles
            Set<String> userGroups = ldapClient.getUserGroups(username);
            return Arrays.stream(rolesNames)
                    .anyMatch(userGroups::contains);
        } catch (Exception e) {
            log.error("Error checking LDAP roles for user: {}", username, e);
            return false;
        }
    }
    
    @Override
    public boolean checkPermission(String username, String resourceName, Action action) {
        try {
            // Map Water Framework actions to LDAP permissions
            String ldapPermission = mapToLdapPermission(resourceName, action);
            return ldapClient.hasPermission(username, ldapPermission);
        } catch (Exception e) {
            log.error("Error checking LDAP permission for user: {}", username, e);
            return false;
        }
    }
    
    private String mapToLdapPermission(String resourceName, Action action) {
        // Map Water Framework concepts to LDAP permissions
        return resourceName + ":" + action.getActionName();
    }
    
    // Implement other required methods...
}
```

#### OAuth/OpenID Connect Integration

```java
@FrameworkComponent(
    priority = 10,
    properties = {
        PermissionManagerComponentProperties.PERMISSION_MANAGER_IMPLEMENTATION_PROP + 
        "=oauth"
    },
    services = {PermissionManager.class}
)
public class OAuthPermissionManager implements PermissionManager {
    
    @Inject
    @Setter
    private OAuthTokenValidator tokenValidator;
    
    @Inject
    @Setter
    private Runtime runtime;
    
    @Override
    public boolean checkPermission(String username, Resource entity, Action action) {
        // Get current security context
        SecurityContext context = runtime.getSecurityContext();
        
        // Extract OAuth token
        String token = context.getAuthenticationToken();
        if (token == null) {
            return false;
        }
        
        // Validate token and extract claims
        OAuthClaims claims = tokenValidator.validateAndExtractClaims(token);
        if (claims == null) {
            return false;
        }
        
        // Check permissions based on OAuth claims
        return checkOAuthPermission(claims, entity, action);
    }
    
    private boolean checkOAuthPermission(OAuthClaims claims, Resource entity, Action action) {
        // Check scopes, roles, or custom claims
        Set<String> scopes = claims.getScopes();
        String requiredScope = entity.getResourceName() + ":" + action.getActionName();
        
        return scopes.contains(requiredScope) || scopes.contains("admin");
    }
    
    // Implement other required methods...
}
```

#### Database-Driven Custom Permissions

```java
@FrameworkComponent(
    priority = 10,
    properties = {
        PermissionManagerComponentProperties.PERMISSION_MANAGER_IMPLEMENTATION_PROP + 
        "=database"
    },
    services = {PermissionManager.class}
)
public class DatabasePermissionManager implements PermissionManager {
    
    @Inject
    @Setter
    private CustomPermissionRepository customPermissionRepository;
    
    @Override
    public boolean checkPermission(String username, String resourceName, Action action) {
        // Query custom permission table
        CustomPermission permission = customPermissionRepository
            .findByUsernameAndResourceAndAction(username, resourceName, action.getActionName());
        
        return permission != null && permission.isActive();
    }
    
    @Override
    public boolean checkPermission(String username, Resource entity, Action action) {
        // Check both general and entity-specific permissions
        boolean generalPermission = checkPermission(username, entity.getResourceName(), action);
        
        if (!generalPermission) {
            return false;
        }
        
        // Check entity-specific permission
        CustomPermission entityPermission = customPermissionRepository
            .findByUsernameAndResourceAndEntityId(username, entity.getResourceName(), entity.getId());
        
        return entityPermission == null || entityPermission.isActive();
    }
    
    // Implement other required methods...
}
```

## Integration Patterns

### 1. Hybrid Approach

Combine multiple permission sources:

```java
@FrameworkComponent(
    priority = 10,
    properties = {
        PermissionManagerComponentProperties.PERMISSION_MANAGER_IMPLEMENTATION_PROP + 
        "=hybrid"
    },
    services = {PermissionManager.class}
)
public class HybridPermissionManager implements PermissionManager {
    
    @Inject
    @Setter
    private PermissionManagerDefault defaultPermissionManager;
    
    @Inject
    @Setter
    private LdapClient ldapClient;
    
    @Override
    public boolean checkPermission(String username, String resourceName, Action action) {
        // First check default Water Framework permissions
        boolean defaultPermission = defaultPermissionManager
            .checkPermission(username, resourceName, action);
        
        if (defaultPermission) {
            return true;
        }
        
        // Fallback to LDAP permissions
        try {
            String ldapPermission = mapToLdapPermission(resourceName, action);
            return ldapClient.hasPermission(username, ldapPermission);
        } catch (Exception e) {
            log.warn("LDAP permission check failed, falling back to default", e);
            return false;
        }
    }
    
    // Implement other required methods...
}
```

### 2. Caching Integration

Implement caching for external permission systems:

```java
@FrameworkComponent(
    priority = 10,
    properties = {
        PermissionManagerComponentProperties.PERMISSION_MANAGER_IMPLEMENTATION_PROP + 
        "=cached"
    },
    services = {PermissionManager.class}
)
public class CachedPermissionManager implements PermissionManager {
    
    @Inject
    @Setter
    private CacheManager cacheManager;
    
    @Inject
    @Setter
    private ExternalPermissionService externalService;
    
    @Override
    public boolean checkPermission(String username, String resourceName, Action action) {
        String cacheKey = String.format("permission:%s:%s:%s", 
                                      username, resourceName, action.getActionName());
        
        // Check cache first
        Boolean cachedResult = cacheManager.get(cacheKey, Boolean.class);
        if (cachedResult != null) {
            return cachedResult;
        }
        
        // Query external service
        boolean result = externalService.checkPermission(username, resourceName, action);
        
        // Cache result (with TTL)
        cacheManager.put(cacheKey, result, Duration.ofMinutes(5));
        
        return result;
    }
    
    // Implement other required methods...
}
```

## Configuration and Deployment

### 1. Component Priority

The framework uses component priority to determine which implementation to use:

- **Higher priority numbers** = Higher precedence
- **Default implementation** has priority 0
- **Custom implementations** should use priority > 0

### 2. Property-Based Selection

You can also use properties to select implementations:

```java
@FrameworkComponent(
    priority = 10,
    properties = {
        PermissionManagerComponentProperties.PERMISSION_MANAGER_IMPLEMENTATION_PROP + 
        "=production"
    },
    services = {PermissionManager.class}
)
public class ProductionPermissionManager implements PermissionManager {
    // Production-specific implementation
}
```

### 3. Environment-Specific Configuration

```properties
# application.properties
water.permission.manager.implementation=ldap
water.ldap.url=ldap://company.com:389
water.ldap.base.dn=dc=company,dc=com
```

## Testing Custom Permission Managers

### 1. Unit Testing

```java
@Test
void testCustomPermissionManager() {
    // Arrange
    CustomPermissionManager manager = new CustomPermissionManager();
    User testUser = createTestUser("testuser");
    Resource testResource = createTestResource();
    Action testAction = ActionFactory.createGenericAction(
        TestResource.class, "save", 1L);
    
    // Act
    boolean hasPermission = manager.checkPermission(
        testUser.getUsername(), testResource, testAction);
    
    // Assert
    assertTrue(hasPermission);
}
```

### 2. Integration Testing

```java
@ExtendWith(WaterTestExtension.class)
class CustomPermissionManagerIntegrationTest {
    
    @Inject
    private PermissionManager permissionManager;
    
    @Test
    void testCustomManagerIsActive() {
        // Verify custom manager is being used
        assertTrue(permissionManager instanceof CustomPermissionManager);
    }
    
    @Test
    void testExternalSystemIntegration() {
        // Test integration with external system
        boolean result = permissionManager.checkPermission(
            "testuser", "TestResource", testAction);
        
        assertTrue(result);
    }
}
```

## Best Practices

### 1. Error Handling

Always implement proper error handling for external system calls:

```java
@Override
public boolean checkPermission(String username, String resourceName, Action action) {
    try {
        return externalSystem.checkPermission(username, resourceName, action);
    } catch (ExternalSystemException e) {
        log.error("External permission system error", e);
        // Fallback to default behavior or deny access
        return false;
    } catch (Exception e) {
        log.error("Unexpected error in permission check", e);
        return false;
    }
}
```

### 2. Performance Considerations

- **Cache external permission results** when possible
- **Batch permission checks** for multiple resources
- **Use async operations** for external system calls
- **Implement circuit breakers** for external dependencies

### 3. Security Considerations

- **Validate all inputs** before processing
- **Sanitize external system responses**
- **Implement proper logging** for audit trails
- **Use secure communication** with external systems

### 4. Monitoring and Observability

```java
@Override
public boolean checkPermission(String username, String resourceName, Action action) {
    long startTime = System.currentTimeMillis();
    
    try {
        boolean result = performPermissionCheck(username, resourceName, action);
        
        // Log metrics
        long duration = System.currentTimeMillis() - startTime;
        log.info("Permission check completed in {}ms for user: {} resource: {} action: {} result: {}", 
                duration, username, resourceName, action.getActionName(), result);
        
        return result;
    } catch (Exception e) {
        // Log errors
        log.error("Permission check failed for user: {} resource: {} action: {}", 
                 username, resourceName, action.getActionName(), e);
        throw e;
    }
}
```

## Conclusion

The Water Framework's permission system is designed for maximum flexibility and extensibility. By creating custom permission managers, you can:

- **Integrate with existing enterprise systems** (LDAP, Active Directory, etc.)
- **Implement specialized permission logic** for your domain
- **Add caching and performance optimizations**
- **Support multiple authentication providers**
- **Maintain backward compatibility** with the default implementation

The component-based architecture ensures that custom implementations can seamlessly replace or extend the default functionality while maintaining the framework's security and performance characteristics. 