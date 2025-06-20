# Shared Entities

Water Framework provides a powerful shared entity system that allows users to share their owned resources with other users while maintaining ownership and control. The shared entity system is built on top of the `OwnedResource` concept and provides granular sharing capabilities.

## Overview

Shared entities are owned resources that can be shared with multiple users. The original owner retains full ownership and control while granting access to specific users. This system is particularly useful for collaborative applications where users need to share documents, projects, or other resources.

### **Key Concepts**

- **Ownership Retention**: The original owner maintains full ownership
- **Granular Sharing**: Share with specific users by ID, email, or username
- **Permission Integration**: Works seamlessly with the permission system
- **Audit Trail**: Complete tracking of sharing relationships
- **Security Enforcement**: Automatic permission and ownership validation

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
    
    /**
     * Find shared entity by primary key
     */
    WaterSharedEntity findByPK(String entityResourceName, long entityId, long userId);
    
    /**
     * Remove shared entity by primary key
     */
    void removeByPK(WaterSharedEntity entity);
    
    /**
     * Find all shared entities for a specific entity
     */
    List<WaterSharedEntity> findByEntity(String entityResourceName, long entityId);
    
    /**
     * Find all entities shared with a specific user
     */
    List<WaterSharedEntity> findByUser(long userId);
    
    /**
     * Get list of user IDs who have access to a specific entity
     */
    List<Long> getSharingUsers(String entityResourceName, long entityId);
    
    /**
     * Get list of entity IDs shared with a specific user
     */
    List<Long> getEntityIdsSharedWithUser(String entityResourceName, long userId);
}
```

## Implementation Examples

### **1. Creating a Shareable Entity**

```java
@Entity
@Table(name = "documents")
@FrameworkComponent
public class Document extends AbstractJpaEntity implements SharedEntity {
    
    @Column(name = "title")
    private String title;
    
    @Column(name = "content")
    private String content;
    
    @Column(name = "owner_user_id")
    private Long ownerUserId;
    
    // SharedEntity implementation (inherits from OwnedResource)
    @Override
    public Long getOwnerUserId() {
        return ownerUserId;
    }
    
    @Override
    public void setOwnerUserId(Long userId) {
        this.ownerUserId = userId;
    }
    
    // Getters and setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
```

### **2. Sharing an Entity**

```java
@FrameworkComponent
public class DocumentService implements DocumentApi {
    
    @Inject
    private SharedEntityApi sharedEntityApi;
    
    @AllowPermission(action = CrudActions.SAVE)
    public Document createDocument(Document document) {
        // Set owner automatically
        document.setOwnerUserId(getCurrentUserId());
        return documentRepository.persist(document);
    }
    
    @AllowPermission(action = ShareAction.SHARE)
    public void shareDocument(long documentId, long userId) {
        Document document = documentRepository.find(documentId);
        
        // Verify ownership
        if (!document.getOwnerUserId().equals(getCurrentUserId())) {
            throw new UnauthorizedException("Not the owner of this document");
        }
        
        // Create sharing relationship
        WaterSharedEntity sharedEntity = new WaterSharedEntity(
            Document.class.getName(), 
            documentId, 
            userId
        );
        
        sharedEntityApi.save(sharedEntity);
    }
    
    @AllowPermission(action = ShareAction.SHARE)
    public void shareDocumentByEmail(long documentId, String userEmail) {
        Document document = documentRepository.find(documentId);
        
        // Verify ownership
        if (!document.getOwnerUserId().equals(getCurrentUserId())) {
            throw new UnauthorizedException("Not the owner of this document");
        }
        
        // Create sharing relationship using email
        WaterSharedEntity sharedEntity = new WaterSharedEntity(
            Document.class.getName(), 
            documentId, 
            0L // Will be resolved by email
        );
        sharedEntity.setUserEmail(userEmail);
        
        sharedEntityApi.save(sharedEntity);
    }
}
```

### **3. Finding Shared Entities**

```java
@FrameworkComponent
public class DocumentService implements DocumentApi {
    
    @Inject
    private SharedEntityApi sharedEntityApi;
    
    @AllowPermission(action = CrudActions.FIND)
    public List<Document> findSharedDocuments() {
        // Find all documents shared with current user
        List<WaterSharedEntity> sharedEntities = sharedEntityApi.findByUser(getCurrentUserId());
        
        List<Document> documents = new ArrayList<>();
        for (WaterSharedEntity sharedEntity : sharedEntities) {
            if (Document.class.getName().equals(sharedEntity.getEntityResourceName())) {
                Document document = documentRepository.find(sharedEntity.getEntityId());
                if (document != null) {
                    documents.add(document);
                }
            }
        }
        
        return documents;
    }
    
    @AllowPermission(action = CrudActions.FIND)
    public List<Long> getDocumentSharingUsers(long documentId) {
        // Get all users who have access to this document
        return sharedEntityApi.getSharingUsers(Document.class.getName(), documentId);
    }
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

### **REST API Usage Examples**

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

### **Permission Requirements**

The shared entity system enforces strict permission requirements:

```java
@FrameworkComponent
public class SharedEntityServiceImpl extends BaseEntityServiceImpl<WaterSharedEntity> {
    
    @Override
    public WaterSharedEntity save(WaterSharedEntity entity) {
        Class<?> entityClass = getEntityClass(entity.getEntityResourceName());
        
        // Verify entity is a SharedEntity
        if (entityClass == null || !SharedEntity.class.isAssignableFrom(entityClass)) {
            throw new UnauthorizedException("Entity is not a Shared Entity!");
        }
        
        User user = userIntegrationClient.fetchUserByUserId(getCurrentUserId());
        
        // Check share permission
        if (!user.isAdmin() && !permissionManager.checkPermission(
            getCurrentUserId(), 
            entity.getEntityResourceName(), 
            ShareAction.SHARE
        )) {
            throw new UnauthorizedException("No share permission");
        }
        
        // Verify ownership of the entity being shared
        BaseEntitySystemApi<?> entitySystemService = componentRegistry.findEntitySystemApi(entity.getEntityResourceName());
        Resource resource = entitySystemService.find(entity.getEntityId());
        
        if (!permissionManager.checkUserOwnsResource(user, resource)) {
            throw new UnauthorizedException("Not the owner of this resource");
        }
        
        return doSave(entity);
    }
}
```

### **Permission Annotations**

Use permission annotations to control access:

```java
@FrameworkComponent
public class DocumentService implements DocumentApi {
    
    @AllowPermission(action = ShareAction.SHARE)
    public void shareDocument(long documentId, long userId) {
        // Implementation
    }
    
    @AllowPermission(action = CrudActions.FIND)
    public List<Document> findSharedDocuments() {
        // Implementation
    }
    
    @AllowPermission(action = ShareAction.SHARE)
    public void unshareDocument(long documentId, long userId) {
        // Implementation
    }
}
```

## Integration with Other Services

### **User Integration**

The shared entity system integrates with the user system for user resolution:

```java
@FrameworkComponent
public class SharedEntityServiceImpl extends BaseEntityServiceImpl<WaterSharedEntity> {
    
    @Inject
    private UserIntegrationClient userIntegrationClient;
    
    private void setSharedEntityUserId(WaterSharedEntity entity) {
        if (entity.getUserId() <= 0) {
            User foundUser = null;
            
            // Try to find user by email
            if (entity.getUserEmail() != null && !entity.getUserEmail().isBlank()) {
                foundUser = userIntegrationClient.fetchUserByEmailAddress(entity.getUserEmail());
            } 
            // Try to find user by username
            else if (entity.getUsername() != null && !entity.getUsername().isBlank()) {
                foundUser = userIntegrationClient.fetchUserByUsername(entity.getUsername());
            }
            
            if (foundUser != null) {
                entity.setUserId(foundUser.getId());
            } else {
                throw new EntityNotFound("User not found");
            }
        } else {
            // Verify user exists
            try {
                userIntegrationClient.fetchUserByUserId(entity.getUserId());
            } catch (NoResultException ex) {
                throw new WaterRuntimeException("User not found");
            }
        }
    }
}
```

### **Component Registry Integration**

The system uses the component registry to find entity services:

```java
@FrameworkComponent
public class SharedEntityServiceImpl extends BaseEntityServiceImpl<WaterSharedEntity> {
    
    @Inject
    private ComponentRegistry componentRegistry;
    
    private void verifyEntityOwnership(String entityResourceName, long entityId) {
        BaseEntitySystemApi<?> entitySystemService = componentRegistry.findEntitySystemApi(entityResourceName);
        Resource resource = entitySystemService.find(entityId);
        
        if (!permissionManager.checkUserOwnsResource(getCurrentUser(), resource)) {
            throw new UnauthorizedException("Not the owner of this resource");
        }
    }
}
```

## Best Practices

### **1. Always Verify Ownership**

```java
@AllowPermission(action = ShareAction.SHARE)
public void shareResource(long resourceId, long userId) {
    OwnedResource resource = resourceRepository.find(resourceId);
    
    // Always verify ownership before sharing
    if (!resource.getOwnerUserId().equals(getCurrentUserId())) {
        throw new UnauthorizedException("Not the owner of this resource");
    }
    
    // Proceed with sharing
    WaterSharedEntity sharedEntity = new WaterSharedEntity(
        resource.getClass().getName(), 
        resourceId, 
        userId
    );
    sharedEntityApi.save(sharedEntity);
}
```

### **2. Use Appropriate User Identification**

```java
// Prefer user ID when available
public void shareByUserId(long resourceId, long userId) {
    WaterSharedEntity sharedEntity = new WaterSharedEntity(
        Resource.class.getName(), 
        resourceId, 
        userId
    );
    sharedEntityApi.save(sharedEntity);
}

// Use email for user-friendly sharing
public void shareByEmail(long resourceId, String email) {
    WaterSharedEntity sharedEntity = new WaterSharedEntity(
        Resource.class.getName(), 
        resourceId, 
        0L
    );
    sharedEntity.setUserEmail(email);
    sharedEntityApi.save(sharedEntity);
}
```

### **3. Handle Sharing Errors Gracefully**

```java
@AllowPermission(action = ShareAction.SHARE)
public void shareResource(long resourceId, long userId) {
    try {
        WaterSharedEntity sharedEntity = new WaterSharedEntity(
            Resource.class.getName(), 
            resourceId, 
            userId
        );
        sharedEntityApi.save(sharedEntity);
    } catch (UnauthorizedException e) {
        throw new BusinessException("You don't have permission to share this resource");
    } catch (EntityNotFound e) {
        throw new BusinessException("User not found");
    }
}
```

### **4. Implement Proper Cleanup**

```java
@AllowPermission(action = ShareAction.SHARE)
public void unshareResource(long resourceId, long userId) {
    WaterSharedEntity sharedEntity = new WaterSharedEntity(
        Resource.class.getName(), 
        resourceId, 
        userId
    );
    
    try {
        sharedEntityApi.removeByPK(sharedEntity);
    } catch (UnauthorizedException e) {
        throw new BusinessException("You don't have permission to unshare this resource");
    }
}
```

The shared entity system provides a robust foundation for collaborative applications while maintaining strict security boundaries and ownership controls. It seamlessly integrates with Water Framework's permission system and provides flexible user identification options. 