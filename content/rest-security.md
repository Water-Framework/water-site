# REST Security - JWT Authentication

The Water Framework provides a comprehensive JWT (JSON Web Token) security system for REST APIs. This system is built on top of the Nimbus JOSE+JWT library and integrates seamlessly with the framework's authentication and permission systems.

## Overview

The REST security module provides:
- JWT token generation and validation
- Multiple validation modes (local keys, JWS URLs)
- Integration with the framework's authentication system
- Automatic security context injection
- Role-based access control

## Prerequisites

To use the REST security system, you need the following modules properly configured:

1. **Authentication Module** - Provides the service to release JWT tokens
2. **User Module** - Provides the `Authenticable` implementation (WaterUser)
3. **Rest-security Module** - Provides the JWT security implementation

## Core Components

### JWT Token Service

The `JwtTokenService` interface is the central component for JWT operations:

```java
public interface JwtTokenService extends Service {
    String generateJwtToken(Authenticable authenticable);
    boolean validateToken(List<String> validIssuers, String jwt);
    Set<Principal> getPrincipals(String jwtToken);
    String getJWK();
}
```

### Default Implementation: NimbusJwtTokenService

The framework provides a default implementation using the Nimbus JOSE+JWT library:

```java
@FrameworkComponent
public class NimbusJwtTokenService implements JwtTokenService {
    // Implementation details...
}
```

#### Key Features:
- **RSA256 Signing**: Uses RSA key pairs for token signing
- **Configurable Encryption**: Optional JWT encryption for sensitive data
- **Multiple Validation Modes**: Local keys or remote JWS validation
- **Automatic Principal Extraction**: Converts JWT claims to Java Principals

#### Customization:
You can customize the JWT token service by:
1. Creating a new implementation of `JwtTokenService`
2. Registering it with higher priority in the component registry
3. The framework will automatically use your custom implementation

### JWT Security Context

The `JwtSecurityContext` extends the framework's security context and provides JWT-specific information:

```java
public class JwtSecurityContext extends WaterAbstractSecurityContext implements RsSecurityContext {
    public JwtSecurityContext(Set<Principal> loggedPrincipals) {
        super(loggedPrincipals);
    }
    
    @Override
    public boolean isSecure() {
        return true;
    }
    
    @Override
    public String getAuthenticationScheme() {
        return "JWT";
    }
}
```

#### Information Stored in JWT Tokens:

The JWT tokens contain the following claims:

- **Subject (`sub`)**: User's screen name/username
- **Expiration (`exp`)**: Token expiration time
- **Issuer (`iss`)**: Token issuer (usually the user class name)
- **Roles (`roles`)**: List of user roles
- **Logged Entity ID (`loggedEntityId`)**: User's entity ID
- **Admin Flag (`isAdmin`)**: Whether the user is an admin

### JWT Security Filter

The `GenericJWTAuthFilter` handles JWT token validation in REST requests:

```java
public class GenericJWTAuthFilter {
    public void validateToken(JwtTokenService jwtTokenService, LoggedIn annotation, 
                            String authorizationHeader, String authenticationCookie) {
        if (annotation != null) {
            String encodedToken = getTokenFromRequest(authorizationHeader, authenticationCookie);
            List<String> issuers = Arrays.asList(annotation.issuers());
            if (!jwtTokenService.validateToken(issuers, encodedToken))
                throw new UnauthorizedException("Invalid JWT token!");
        }
    }
}
```

#### Token Extraction:
- **Authorization Header**: `Bearer <token>`
- **Cookie**: `HIT-AUTH=<token>`
- **Fallback**: Cookie value if Authorization header is not present

## Configuration Options

### JWT Security Options

The `JwtSecurityOptions` interface provides configuration for JWT security:

```java
public interface JwtSecurityOptions extends Service {
    boolean validateJwt();
    boolean validateJwtWithJwsUrl();
    String jwtKeyId();
    boolean encryptJWTToken();
    String jwsURL();
    long jwtTokenDurationMillis();
}
```

### Configuration Properties

| Property | Default | Description |
|----------|---------|-------------|
| `water.rest.security.jwt.validate` | `true` | Enable/disable JWT validation |
| `water.rest.security.jwt.validate.by.jws` | `false` | Use JWS URL for validation |
| `water.rest.security.jwt.validate.by.jws.key.id` | `""` | Key ID for JWS validation |
| `water.rest.security.jwt.encrypt` | `false` | Enable JWT encryption |
| `water.rest.security.jwt.jws.url` | `""` | JWS URL for remote validation |
| `water.rest.security.jwt.duration.millis` | `3600000` | Token duration (1 hour) |

### Keystore Configuration

For local JWT signing, configure the keystore:

```properties
water.keystore.password=your-keystore-password
water.keystore.alias=server-cert
water.keystore.file=path/to/keystore
water.private.key.password=your-private-key-password
```

## Validation Modes

### 1. Local Key Validation (Default)

Uses the server's RSA key pair for token validation:

```properties
water.rest.security.jwt.validate.by.jws=false
```

### 2. JWS URL Validation

Validates tokens against a remote JWS (JSON Web Key Set) endpoint:

```properties
water.rest.security.jwt.validate.by.jws=true
water.rest.security.jwt.jws.url=https://your-domain/.well-known/jwks.json
water.rest.security.jwt.validate.by.jws.key.id=your-key-id
```

## Usage Examples

### 1. Login and Token Generation

```java
@RestController
public class AuthenticationController {
    @Inject
    private AuthenticationApi authenticationApi;
    
    @PostMapping("/login")
    public Map<String, String> login(@RequestParam String username, 
                                   @RequestParam String password) {
        Authenticable authenticable = authenticationApi.login(username, password);
        String token = authenticationApi.generateToken(authenticable);
        
        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        return response;
    }
}
```

### 2. Protected REST Endpoints

```java
@Path("/api/users")
@LoggedIn(issuers = {"it.water.core.api.model.User"})
public interface UserRestApi extends RestApi {
    
    @GET
    @Path("/profile")
    @Produces(MediaType.APPLICATION_JSON)
    User getProfile();
    
    @PUT
    @Path("/profile")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    User updateProfile(User user);
}
```

### 3. Custom JWT Token Service

```java
@FrameworkComponent(priority = 100) // Higher priority than default
public class CustomJwtTokenService implements JwtTokenService {
    
    @Override
    public String generateJwtToken(Authenticable authenticable) {
        // Custom token generation logic
        return customToken;
    }
    
    @Override
    public boolean validateToken(List<String> validIssuers, String jwt) {
        // Custom validation logic
        return isValid;
    }
    
    @Override
    public Set<Principal> getPrincipals(String jwtToken) {
        // Custom principal extraction
        return principals;
    }
    
    @Override
    public String getJWK() {
        // Return your public key in JWK format
        return jwk;
    }
}
```

### 4. Testing JWT Security

```java
@Test
void testJwtTokenService() {
    // Create test user
    TestUser user = new TestUser("testuser", Collections.emptySet());
    
    // Generate token
    String token = jwtTokenService.generateJwtToken(user);
    assertNotNull(token);
    
    // Validate token
    assertTrue(jwtTokenService.validateToken(
        Collections.singletonList(TestUser.class.getName()), token));
    
    // Extract principals
    Set<Principal> principals = jwtTokenService.getPrincipals(token);
    assertEquals(1, principals.size());
    assertEquals("testuser", principals.iterator().next().getName());
}

@Test
void testJwtSecurityContext() {
    TestUser user = new TestUser("testuser", roles);
    String token = jwtTokenService.generateJwtToken(user);
    
    JwtSecurityContext context = new JwtSecurityContext(
        jwtTokenService.getPrincipals(token));
    
    assertTrue(context.isSecure());
    assertTrue(context.isUserInRole("Role1"));
    assertEquals("JWT", context.getAuthenticationScheme());
}
```

## Integration with Authentication Module

The Authentication module provides the login service that generates JWT tokens:

```java
@FrameworkComponent
public class AuthenticationSystemServiceImpl implements AuthenticationSystemApi {
    
    @Inject
    private JwtTokenService jwtTokenService;
    
    @Override
    public String generateToken(Authenticable authenticable) {
        return jwtTokenService.generateJwtToken(authenticable);
    }
    
    @Override
    public Authenticable login(String username, String password) {
        // Find authentication provider and validate credentials
        Collection<AuthenticationProvider> providers = 
            componentRegistry.findComponents(AuthenticationProvider.class, null);
        
        Optional<AuthenticationProvider> provider = providers.stream()
            .filter(p -> p.issuersNames().contains(issuerName))
            .findFirst();
            
        if (provider.isEmpty())
            throw new UnauthorizedException("No authentication provider found");
            
        return provider.get().login(username, password);
    }
}
```

## Integration with User Module

The User module provides the `WaterUser` class that implements `Authenticable`:

```java
@Entity
@AccessControl(availableActions = {CrudActions.SAVE, CrudActions.REMOVE, ...})
public class WaterUser extends AbstractJpaExpandableEntity 
    implements ProtectedEntity, User {
    
    public static final String WATER_USER_ISSUER = "it.water.core.api.model.User";
    
    @Override
    public String getIssuer() {
        return WATER_USER_ISSUER;
    }
    
    @Override
    public String getScreenName() {
        return getUsername();
    }
    
    @Override
    public Long getLoggedEntityId() {
        return getId();
    }
    
    // Other Authenticable methods...
}
```

## Security Best Practices

1. **Use HTTPS**: Always use HTTPS in production for token transmission
2. **Token Expiration**: Set appropriate token expiration times
3. **Key Management**: Use strong RSA keys and rotate them regularly
4. **Issuer Validation**: Always validate token issuers
5. **Role-Based Access**: Use roles and permissions for fine-grained access control
6. **Token Storage**: Store tokens securely on the client side
7. **Logout**: Implement proper logout mechanisms to invalidate tokens

## Error Handling

The JWT security system throws appropriate exceptions:

- `UnauthorizedException`: Invalid or missing JWT token
- `WaterRuntimeException`: Configuration or processing errors

## Performance Considerations

1. **Token Caching**: Consider caching validated tokens for performance
2. **JWS Caching**: Cache public keys from JWS URLs
3. **Principal Caching**: Cache extracted principals when possible
4. **Async Validation**: Use async validation for high-throughput scenarios

## Troubleshooting

### Common Issues:

1. **Token Validation Fails**: Check keystore configuration and key IDs
2. **Principal Extraction Issues**: Verify JWT claims structure
3. **Authentication Provider Not Found**: Ensure proper issuer configuration
4. **Permission Denied**: Check role assignments and permission annotations

### Debug Configuration:

```properties
# Enable debug logging for JWT security
logging.level.it.water.service.rest.security.jwt=DEBUG
```

The REST security system provides a robust, configurable, and extensible JWT authentication solution that integrates seamlessly with the Water Framework's security and permission systems. 