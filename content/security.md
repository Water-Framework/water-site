# Security

Water Framework provides a unified security model that works across different implementations.

## Security Context

The Security Context provides access to the current user's security information and permissions. It's implemented differently for each framework but provides a consistent API:

```java
SecurityContext securityContext = // get security context
Set<Principal> principals = securityContext.getPrincipals();
boolean isSecure = securityContext.isSecure();
```

## Permissions

Permissions are managed through a flexible system that can be extended to support different permission models:

```java
@FrameworkComponent
public class MyPermissionManager implements PermissionManager {
    @Override
    public boolean hasPermission(Principal principal, String permission) {
        // Check permission implementation
    }
}
```

## Security Configuration

Security can be configured through properties or programmatically:

```java
@FrameworkComponent
public class SecurityConfig {
    @OnActivate
    public void configure() {
        // Configure security settings
    }
}
``` 