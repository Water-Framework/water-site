# Testing Strategies

This section provides comprehensive guidelines for testing applications with the Water Framework, covering unit testing, integration testing, and test patterns.

## Table of Contents

- [Unit Testing with WaterTestExtension](#unit-testing-with-watertestextension)
- [Integration Testing with Karate](#integration-testing-with-karate)
- [Test Configuration](#test-configuration)
- [Test Utilities and Patterns](#test-utilities-and-patterns)
- [Testing Best Practices](#testing-best-practices)

## Unit Testing with WaterTestExtension

### Test Class Structure

Test classes should implement the `Service` interface and use `@ExtendWith(WaterTestExtension.class)`:

```java
@ExtendWith(WaterTestExtension.class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class UserApiTest implements Service {
    
    @Inject
    @Setter
    private UserApi userApi;
    
    @Inject
    @Setter
    private UserSystemApi userSystemApi;
    
    @Inject
    @Setter
    private ComponentRegistry componentRegistry;
    
    @Inject
    @Setter
    private Runtime runtime;
    
    @Inject
    @Setter
    private TestPermissionManager testPermissionManager;
    
    @BeforeAll
    void beforeAll() {
        // Initialize test data and setup
        TestRuntimeUtils.impersonateAdmin(componentRegistry);
    }
    
    @Test
    void testUserCreation() {
        WaterUser user = createTestUser();
        WaterUser savedUser = userApi.save(user);
        
        Assertions.assertNotNull(savedUser.getId());
        Assertions.assertEquals(1, savedUser.getEntityVersion());
    }
}
```

### Component Testing

Test component instantiation and registration:

```java
@Test
void componentsInstantiatedCorrectly() {
    UserApi userApi = componentRegistry.findComponent(UserApi.class, null);
    UserRepository userRepository = componentRegistry.findComponent(UserRepository.class, null);
    
    Assertions.assertNotNull(userApi);
    Assertions.assertNotNull(userSystemApi);
    Assertions.assertNotNull(userRepository);
}
```

### CRUD Operations Testing

Test basic CRUD operations:

```java
@Test
void saveShouldWork() {
    WaterUser user = createUser(0);
    user = userApi.save(user);
    
    Assertions.assertNull(userRepository.findByUsername("NotExistingUsername"));
    Assertions.assertNotNull(userIntegrationClient.fetchUserByUserId(user.getId()));
    Assertions.assertEquals(1, user.getEntityVersion());
    Assertions.assertTrue(user.getId() > 0);
}

@Test
void updateShouldWork() {
    Query q = userRepository.getQueryBuilderInstance().createQueryFilter("username=username0");
    WaterUser user = userApi.find(q);
    Assertions.assertNotNull(user);
    
    user.setActivateCode("123");
    user = userApi.update(user);
    
    Assertions.assertEquals("123", user.getActivateCode());
    Assertions.assertEquals(2, user.getEntityVersion());
}

@Test
void updateShouldFailWithWrongVersion() {
    Query q = userRepository.getQueryBuilderInstance().createQueryFilter("username=username0");
    final WaterUser errorEntity = userApi.find(q);
    
    errorEntity.setEntityVersion(1);
    Assertions.assertThrows(WaterRuntimeException.class, () -> userApi.update(errorEntity));
}
```

### Pagination Testing

Test pagination functionality:

```java
@Test
void findAllPaginatedShouldWork() {
    // Create test data
    for (int i = 2; i < 11; i++) {
        WaterUser user = createUser(i);
        userApi.save(user);
    }
    
    PaginableResult<WaterUser> paginated = userApi.findAll(null, 7, 1, null);
    Assertions.assertEquals(7, paginated.getResults().size());
    Assertions.assertEquals(1, paginated.getCurrentPage());
    Assertions.assertEquals(2, paginated.getNextPage());
    
    paginated = userApi.findAll(null, 7, 2, null);
    Assertions.assertEquals(7, paginated.getResults().size());
    Assertions.assertEquals(2, paginated.getCurrentPage());
    Assertions.assertEquals(1, paginated.getNextPage());
}
```

### Permission Testing

Test permission enforcement with different user roles:

```java
@Test
void managerCanDoEverything() {
    TestRuntimeUtils.impersonateUser(managerUser, componentRegistry);
    
    WaterUser user = createUser(100);
    Assertions.assertDoesNotThrow(() -> userApi.save(user));
    Assertions.assertDoesNotThrow(() -> userApi.update(user));
    Assertions.assertDoesNotThrow(() -> userApi.remove(user.getId()));
}

@Test
void viewerCannotSaveOrUpdateOrRemove() {
    TestRuntimeUtils.impersonateUser(viewerUser, componentRegistry);
    
    WaterUser user = createUser(101);
    Assertions.assertThrows(UnauthorizedException.class, () -> userApi.save(user));
    Assertions.assertThrows(UnauthorizedException.class, () -> userApi.update(user));
    Assertions.assertThrows(UnauthorizedException.class, () -> userApi.remove(user.getId()));
}

@Test
void editorCannotRemove() {
    TestRuntimeUtils.impersonateUser(editorUser, componentRegistry);
    
    WaterUser user = createUser(102);
    Assertions.assertDoesNotThrow(() -> userApi.save(user));
    Assertions.assertDoesNotThrow(() -> userApi.update(user));
    Assertions.assertThrows(UnauthorizedException.class, () -> userApi.remove(user.getId()));
}
```

### Business Logic Testing

Test specific business logic:

```java
@Test
void userRegistrationSuccess() {
    WaterUser user = createUser(200);
    user.setActive(false);
    
    Assertions.assertDoesNotThrow(() -> userApi.register(user));
    
    WaterUser registeredUser = userApi.findByUsername(user.getUsername());
    Assertions.assertNotNull(registeredUser);
    Assertions.assertFalse(registeredUser.isActive());
    Assertions.assertNotNull(registeredUser.getActivateCode());
}

@Test
void userActivation() {
    WaterUser user = createUser(201);
    user.setActive(false);
    user.setActivateCode("test-code");
    user = userApi.save(user);
    
    Assertions.assertDoesNotThrow(() -> userApi.activate(user.getEmail(), user.getActivateCode()));
    
    WaterUser activatedUser = userApi.find(user.getId());
    Assertions.assertTrue(activatedUser.isActive());
}

@Test
void resetPassword() {
    WaterUser user = createUser(202);
    user = userApi.save(user);
    
    Assertions.assertDoesNotThrow(() -> userApi.passwordResetRequest(user.getEmail()));
    
    WaterUser userWithResetCode = userApi.findByEmail(user.getEmail());
    Assertions.assertNotNull(userWithResetCode.getPasswordResetCode());
    
    Assertions.assertDoesNotThrow(() -> 
        userApi.resetPassword(user.getEmail(), userWithResetCode.getPasswordResetCode(), 
                           "NewPassword1.", "NewPassword1."));
}
```

## Integration Testing with Karate

### Karate Test Structure

Create Karate tests for REST API validation:

```gherkin
Feature: User REST API Integration Tests

Scenario: Create and retrieve user
    Given header Content-Type = 'application/json'
    And header Accept = 'application/json'
    And url serviceBaseUrl+'/water/users'
    And request
    """
    {
       "username": "testuser",
       "name": "Test",
       "lastname": "User",
       "password": "Password1.",
       "passwordConfirm": "Password1.",
       "email": "test@example.com"
     }
    """
    When method POST
    Then status 200
    And match response contains { id: '#number', username: 'testuser' }
    
    * def userId = response.id
    
    Given url serviceBaseUrl+'/water/users/'+userId
    When method GET
    Then status 200
    And match response.username == 'testuser'
```

### CRUD Operations Testing

Test complete CRUD operations:

```gherkin
Scenario: Water User CRUD operations
    # CREATE
    Given header Content-Type = 'application/json'
    And header Accept = 'application/json'
    Given url serviceBaseUrl+'/water/users'
    And request
    """
    {
       "username": "username1",
       "name":"name",
       "lastname":"lastName",
       "password":"Password1.",
       "passwordConfirm":"Password1.",
       "email":"user@mail.com"
     }
    """
    When method POST
    Then status 200
    And match response ==
    """
      { "id": #number,
        "entityVersion":1,
        "entityCreateDate":'#number',
        "entityModifyDate":'#number',
        "name":'name',
        "lastname":"lastName",
        "email":"user@mail.com",
        "username": "username1",
        "admin": false,
        "imagePath":null
       }
    """
    * def entityId = response.id

    # UPDATE
    Given url serviceBaseUrl+'/water/users'
    And request
    """
    {
       "id": "#(entityId)",
       "username": "usernameUpdated",
       "name":"name",
       "lastname":"lastName",
       "password":"Password1",
       "passwordConfirm":"Password1.",
       "email":"user@mail.com"
     }
    """
    When method PUT
    Then status 200
    And match response.username == "usernameUpdated"

    # FIND
    Given url serviceBaseUrl+'/water/users/'+entityId
    When method GET
    Then status 200
    And match response.username == "usernameUpdated"

    # FIND ALL
    Given url serviceBaseUrl+'/water/users'
    When method GET
    Then status 200
    And match response.results contains
    """
          {
            "id": #number,
            "entityVersion":2,
            "entityCreateDate":'#number',
            "entityModifyDate":'#number',
            "name":'name',
            "lastname":"lastName",
            "email":"user@mail.com",
            "username": "usernameUpdated",
            "admin": false,
            "imagePath":null
          }
    """

    # DELETE
    Given url serviceBaseUrl+'/water/users/'+entityId
    When method DELETE
    Then status 204
```

### Error Handling Testing

Test error scenarios:

```gherkin
Scenario: Validation error handling
    Given header Content-Type = 'application/json'
    And header Accept = 'application/json'
    Given url serviceBaseUrl+'/water/users'
    And request
    """
    {
       "username": "",
       "name":"",
       "lastname":"",
       "password":"",
       "passwordConfirm":"",
       "email":"invalid-email"
     }
    """
    When method POST
    Then status 400
    And match response contains { "errors": "#array" }
```

### Authentication Testing

Test authentication scenarios:

```gherkin
Scenario: Authentication required operations
    Given header Content-Type = 'application/json'
    And header Accept = 'application/json'
    Given url serviceBaseUrl+'/water/users/account'
    And request
    """
    {
       "name": "Updated Name",
       "lastname": "Updated Lastname",
       "email": "updated@example.com"
     }
    """
    When method PUT
    Then status 401  # Unauthorized without authentication
```

## Test Configuration

### Application Properties

Create test-specific configuration:

**`src/test/resources/it.water.application.properties`**:
```properties
# Test-specific configuration
rs.security.keystore.type=jks
rs.security.keystore.password=water
rs.security.keystore.alias=server-cert
rs.security.keystore.file=src/test/resources/certs/server.keystore
rs.security.key.password=water
rs.security.signature.algorithm=RS256

# Test database configuration
water.test.db.url=jdbc:h2:mem:testdb
water.test.db.username=sa
water.test.db.password=

# Test email configuration
water.test.email.enabled=false
water.test.email.template.path=src/test/resources/templates/
```

### Karate Configuration

Configure Karate for different environments:

**`src/test/resources/karate-config.js`**:
```javascript
function fn() {
    var env = karate.env || 'dev';
    var config = {
        serviceBaseUrl: 'http://localhost:8080'
    };
    
    if (env === 'test') {
        config.serviceBaseUrl = 'http://localhost:0';
    }
    
    if (env === 'ci') {
        config.serviceBaseUrl = 'http://localhost:8081';
    }
    
    return config;
}
```

### Test Certificates

Include test certificates for security testing:

```
src/test/resources/certs/
├── server.keystore
├── client.keystore
└── truststore.jks
```

## Test Utilities and Patterns

### Test Runtime Utilities

Use Water Framework test utilities:

```java
// Component injection
@Inject
@Setter
private TestPermissionManager testPermissionManager;

// Runtime impersonation
TestRuntimeUtils.impersonateAdmin(componentRegistry);
TestRuntimeUtils.impersonateUser(user, componentRegistry);

// Component registry access
ComponentRegistry registry = TestRuntimeInitializer.getInstance().getComponentRegistry();
```

### Test Data Creation

Create helper methods for test data:

```java
private WaterUser createUser(int seed) {
    WaterUser user = new WaterUser();
    user.setUsername("username" + seed);
    user.setName("name" + seed);
    user.setLastname("lastname" + seed);
    user.setEmail("user" + seed + "@mail.com");
    user.setPassword("Password1.");
    user.setPasswordConfirm("Password1.");
    user.setActive(true);
    return user;
}

private WaterUser createTestUser() {
    return createUser(new Random().nextInt(1000));
}
```

### Mock Services

Create mock services for testing:

```java
@Component
public class FakeMailTestNotification implements EmailNotificationService {
    private List<EmailMessage> sentEmails = new ArrayList<>();
    
    @Override
    public void sendMail(String from, List<String> recipients, List<String> ccRecipients,
                        List<String> bccRecipients, String subject, String body, List<File> attachments) {
        EmailMessage message = new EmailMessage(from, recipients, subject, body);
        sentEmails.add(message);
    }
    
    public List<EmailMessage> getSentEmails() {
        return sentEmails;
    }
    
    public void clearSentEmails() {
        sentEmails.clear();
    }
}
```

### Test Assertions

Create custom assertions for complex validations:

```java
private void assertUserCreated(WaterUser user) {
    Assertions.assertNotNull(user.getId());
    Assertions.assertEquals(1, user.getEntityVersion());
    Assertions.assertNotNull(user.getEntityCreateDate());
    Assertions.assertNotNull(user.getEntityModifyDate());
    Assertions.assertTrue(user.isActive());
}

private void assertUserUpdated(WaterUser user, int expectedVersion) {
    Assertions.assertEquals(expectedVersion, user.getEntityVersion());
    Assertions.assertNotNull(user.getEntityModifyDate());
}
```

## Testing Best Practices

### 1. Test Organization

Organize tests by functionality:

```java
@Nested
class UserCreationTests {
    @Test
    void shouldCreateUserSuccessfully() { /* ... */ }
    
    @Test
    void shouldFailWithInvalidEmail() { /* ... */ }
    
    @Test
    void shouldFailWithDuplicateUsername() { /* ... */ }
}

@Nested
class UserPermissionTests {
    @Test
    void adminCanPerformAllOperations() { /* ... */ }
    
    @Test
    void viewerCanOnlyRead() { /* ... */ }
    
    @Test
    void editorCannotDelete() { /* ... */ }
}
```

### 2. Test Data Management

Use `@BeforeEach` and `@AfterEach` for test setup:

```java
@BeforeEach
void setUp() {
    // Clean up test data
    cleanupTestData();
    
    // Setup test users
    setupTestUsers();
    
    // Impersonate admin for setup
    TestRuntimeUtils.impersonateAdmin(componentRegistry);
}

@AfterEach
void tearDown() {
    // Clean up after each test
    cleanupTestData();
}
```

### 3. Test Isolation

Ensure tests are isolated:

```java
@Test
void isolatedTest() {
    // Each test should be independent
    WaterUser user = createTestUser();
    user = userApi.save(user);
    
    // Verify the operation
    Assertions.assertNotNull(user.getId());
    
    // Clean up is handled in tearDown
}
```

### 4. Performance Testing

Test performance characteristics:

```java
@Test
void findAllPerformance() {
    // Create test data
    for (int i = 0; i < 100; i++) {
        userApi.save(createUser(i));
    }
    
    long startTime = System.currentTimeMillis();
    PaginableResult<WaterUser> result = userApi.findAll(null, 50, 1, null);
    long endTime = System.currentTimeMillis();
    
    Assertions.assertEquals(50, result.getResults().size());
    Assertions.assertTrue((endTime - startTime) < 1000); // Should complete within 1 second
}
```

### 5. Security Testing

Test security scenarios:

```java
@Test
void testUnauthorizedAccess() {
    // Test without authentication
    TestRuntimeUtils.clearSecurityContext(componentRegistry);
    
    WaterUser user = createTestUser();
    Assertions.assertThrows(UnauthorizedException.class, () -> userApi.save(user));
}

@Test
void testInsufficientPermissions() {
    // Test with insufficient permissions
    TestRuntimeUtils.impersonateUser(viewerUser, componentRegistry);
    
    WaterUser user = createTestUser();
    Assertions.assertThrows(UnauthorizedException.class, () -> userApi.save(user));
}
```

## Testing Strategies Summary

### ✅ Do's

1. **Use WaterTestExtension for unit tests**
2. **Implement Service interface in test classes**
3. **Use @Inject for component injection**
4. **Include Karate tests for REST API validation**
5. **Test with different user roles and permissions**
6. **Create comprehensive test data helpers**
7. **Use TestRuntimeUtils for impersonation**
8. **Test both positive and negative scenarios**
9. **Implement proper test isolation**
10. **Use appropriate test configuration**

### ❌ Don'ts

1. **Don't skip unit tests for business logic**
2. **Don't forget to test permission enforcement**
3. **Don't ignore integration testing**
4. **Don't use hardcoded test data**
5. **Don't skip error scenario testing**
6. **Don't forget to clean up test data**
7. **Don't ignore performance testing**
8. **Don't skip security testing**
9. **Don't use production configuration in tests**
10. **Don't forget to test edge cases**

### 🔧 Testing Checklist

- [ ] Implement unit tests with WaterTestExtension
- [ ] Create Karate integration tests
- [ ] Test all CRUD operations
- [ ] Test permission enforcement
- [ ] Test error scenarios
- [ ] Test with different user roles
- [ ] Implement proper test isolation
- [ ] Use test-specific configuration
- [ ] Create comprehensive test data helpers
- [ ] Test performance characteristics
- [ ] Test security scenarios
- [ ] Validate REST API responses
- [ ] Test business logic thoroughly
- [ ] Include edge case testing
- [ ] Implement proper cleanup

Following these testing strategies ensures comprehensive test coverage and reliable applications built with the Water Framework. 