# Shared Entities

Water Framework provides a powerful shared entity system that allows users to share their owned resources with other users while maintaining ownership and control. The shared entity system is built on top of the `OwnedResource` concept and provides granular sharing capabilities.

## Quick Start & Key Points

- **To make an entity shareable, simply implement the `SharedEntity` interface** (`it.water.core.api.entity.shared.SharedEntity`).
- **No need to manually check ownership or sharing**: The framework (via `BaseEntityService` and `BaseEntitySystemService`) automatically enforces ownership and sharing rules for you.
- **Owner is set automatically**: When you save a shared entity, the system detects the current logged-in user and sets the owner field automatically.
- **Just import the SharedEntity module and mark your entities as shared**: The system will take care of all sharing logic, including permission checks and ownership enforcement.
- **REST APIs are available** for managing shared resources (see below).

## Overview

Shared entities are owned resources that can be shared with multiple users. The original owner retains full ownership and control while granting access to specific users. This system is particularly useful for collaborative applications where users need to share documents, projects, or other resources.

### **Key Concepts**

- **Ownership Retention**: The original owner maintains full ownership
- **Granular Sharing**: Share with specific users by ID, email, or username
- **Permission Integration**: Works seamlessly with the permission system
- **Audit Trail**: Complete tracking of sharing relationships
- **Security Enforcement**: Automatic permission and ownership validation

## How to Make Your Entity Shareable

To make your entity shareable, simply implement the `SharedEntity` interface:

```java
import it.water.core.api.entity.shared.SharedEntity;

@Entity
public class Document implements SharedEntity {
    private Long ownerUserId;
    // ... other fields ...

    @Override
    public Long getOwnerUserId() { return ownerUserId; }
    @Override
    public void setOwnerUserId(Long userId) { this.ownerUserId = userId; }
    // ...
}
```

**That's it!** The Water Framework will now manage sharing, ownership, and permission checks for this entity.

## Shared Entity Model

The `WaterSharedEntity` model represents the sharing relationship:

```java
@Entity
@Table(uniqueConstraints = {@UniqueConstraint(columnNames = {"entityResourceName", "entityId", "userId"})})
@IdClass(SharedEntityPK.class)
public class WaterSharedEntity extends AbstractJpaEntity implements ProtectedEntity {
    @Id
    @NotNullOnPersist
    @NotEmpty
    @NoMalitiusCode
    @NonNull
    private String entityResourceName;
    @Id
    @NotNullOnPersist
    @NonNull
    private Long entityId;
    @Id
    @NotNullOnPersist
    @NonNull
    private Long userId;
    // Optional fields for user identification
    @Transient
    private String userEmail;
    @Transient
    private String username;
}
```

**Model Components:**
- **entityResourceName**: The class name of the shared entity
- **entityId**: The ID of the specific entity being shared
- **userId**: The ID of the user with whom the entity is shared
- **userEmail**: Alternative way to identify the user (transient)
- **username**: Alternative way to identify the user (transient)

## Shared Entity API

The `SharedEntityApi` provides the main interface for managing shared entities:

```java
public interface SharedEntityApi extends BaseEntityApi<WaterSharedEntity> {
    WaterSharedEntity findByPK(String entityResourceName, long entityId, long userId);
    void removeByPK(WaterSharedEntity entity);
    List<WaterSharedEntity> findByEntity(String entityResourceName, long entityId);
    List<WaterSharedEntity> findByUser(long userId);
    List<Long> getSharingUsers(String entityResourceName, long entityId);
    List<Long> getEntityIdsSharedWithUser(String entityResourceName, long userId);
}
```

## Implementation Example

### 1. Creating a Shareable Entity

```java
import it.water.core.api.entity.shared.SharedEntity;

@Entity
public class Document implements SharedEntity {
    private Long ownerUserId;
    // ... other fields ...

    @Override
    public Long getOwnerUserId() { return ownerUserId; }
    @Override
    public void setOwnerUserId(Long userId) { this.ownerUserId = userId; }
    // ...
}
```

### 2. Sharing an Entity

```java
@Inject
private SharedEntityApi sharedEntityApi;

public void shareDocument(long documentId, long userId) {
    WaterSharedEntity sharedEntity = new WaterSharedEntity(
        Document.class.getName(),
        documentId,
        userId
    );
    sharedEntityApi.save(sharedEntity);
}
```

**Note:** You do not need to check ownership or sharing manually. The framework will enforce all rules and set the owner automatically.

### 3. Finding Shared Entities

```java
@Inject
private SharedEntityApi sharedEntityApi;

public List<Document> findSharedDocuments() {
    List<WaterSharedEntity> sharedEntities = sharedEntityApi.findByUser(getCurrentUserId());
    // ... map to your domain objects ...
}
```

## REST API Integration

The shared entity system provides comprehensive REST API support:

```java
@Path("/entities/shared")
@FrameworkRestApi
public interface SharedEntityRestApi extends RestApi {
    @LoggedIn
    @PostMapping
    WaterSharedEntity save(@RequestBody WaterSharedEntity sharedEntity);
    @LoggedIn
    @DeleteMapping
    void removeSharedEntityByPK(@RequestBody WaterSharedEntity sharedEntity);
    @LoggedIn
    @GetMapping("/findByPK")
    WaterSharedEntity findByPK(@RequestBody WaterSharedEntity sharedEntity);
    @LoggedIn
    @GetMapping("/findByEntity")
    Collection<WaterSharedEntity> findByEntity(
        @RequestParam("entityResourceName") String entityResourceName,
        @RequestParam("entityId") long entityId
    );
    @LoggedIn
    @GetMapping("/findByUser/{userId}")
    Collection<WaterSharedEntity> findByUser(@RequestParam("userId") long userId);
    @LoggedIn
    @GetMapping("/sharingUsers")
    Set<Long> getUsers(
        @RequestParam("entityResourceName") String entityResourceName,
        @RequestParam("entityId") long entityId
    );
}
```

### REST API Usage Examples

```bash
# Share a document with a user
POST /entities/shared
{
    "entityResourceName": "com.example.Document",
    "entityId": 123,
    "userId": 456
}

# Share a document using email
POST /entities/shared
{
    "entityResourceName": "com.example.Document",
    "entityId": 123,
    "userEmail": "user@example.com"
}

# Find all entities shared with a user
GET /entities/shared/findByUser/456

# Find all users who have access to a document
GET /entities/shared/sharingUsers?entityResourceName=com.example.Document&entityId=123

# Remove sharing relationship
DELETE /entities/shared
{
    "entityResourceName": "com.example.Document",
    "entityId": 123,
    "userId": 456
}
```

## Security and Permissions

The shared entity system enforces strict permission requirements and integrates with the Water Framework permission system. You do not need to manually check ownership or sharing; the system will enforce all rules for you.

## Best Practices

- **Just implement the `SharedEntity` interface** for your entity and let the framework handle the rest.
- **Do not manually check ownership or sharing**; the system will do it for you.
- **Use the provided REST APIs or the `SharedEntityApi` for all sharing operations.**

The shared entity system provides a robust foundation for collaborative applications while maintaining strict security boundaries and ownership controls. It seamlessly integrates with Water Framework's permission system and provides flexible user identification options. 