# Water Resources and Entities

Water Framework provides a comprehensive resource and entity system that forms the foundation for all data management and security operations. Understanding the resource hierarchy and entity types is crucial for building robust applications.

## Resource Hierarchy

Water Framework implements a hierarchical resource system where all entities inherit from the base `Resource` interface:

```
Resource (Base Interface)
├── BaseEntity (Core Entity Interface)
│   ├── ProtectedEntity (Permission-Protected Entities)
│   ├── OwnedResource (User-Owned Entities)
│   │   ├── OwnedChildResource (Child of Owned Resources)
│   │   └── SharedEntity (Shareable Owned Resources)
│   └── ExpandableEntity (Entities with Extensions)
└── ProtectedResource (Resource-Level Protection)
```

### **Resource Interface**

The `Resource` interface is the foundation of all Water Framework entities:

```java
public interface Resource {
    /**
     * Gets the resource name of the platform
     * @return resource name of the platform
     */
    default String getResourceName() {
        return this.getClass().getName();
    }
}
```

**Key Features:**
- **Resource Identification**: Every resource has a unique resource name
- **Automatic Naming**: Default implementation uses the class name
- **Framework Integration**: Enables framework-wide resource management

## Entity Types

### **BaseEntity Interface**

The `BaseEntity` interface extends `Resource` and provides core entity functionality:

```java
public interface BaseEntity extends Resource {
    /**
     * Gets the entity id
     * @return entity id
     */
    long getId();

    /**
     * @return the creation timestamp
     */
    Date getEntityCreateDate();

    /**
     * @return the entity update timestamp
     */
    Date getEntityModifyDate();

    /**
     * @return the entity version
     */
    Integer getEntityVersion();

    /**
     * @return set entity version
     */
    void setEntityVersion(Integer entityVersion);

    /**
     * Checks whether the entity is expandable
     * @return true if entity supports extensions
     */
    default boolean isExpandableEntity() {
        return ExpandableEntity.class.isAssignableFrom(this.getClass());
    }
}
```

**BaseEntity Features:**
- **Unique Identification**: Each entity has a unique ID
- **Audit Trail**: Automatic creation and modification timestamps
- **Version Control**: Optimistic locking support
- **Extension Support**: Built-in support for entity extensions

### **ProtectedEntity Interface**

Entities that implement `ProtectedEntity` require explicit permission checking:

```java
public interface ProtectedEntity extends BaseEntity {
    // Entities extending this interface can only be accessed 
    // by satisfying permission rules
}
```

**ProtectedEntity Characteristics:**
- **Permission Required**: All operations require explicit permissions
- **Security Enforcement**: Framework automatically enforces permission checks
- **Role-Based Access**: Access controlled through role-based permissions

### **OwnedResource Interface**

Entities that implement `OwnedResource` are automatically owned by the creating user:

```java
public interface OwnedResource extends BaseEntity {
    static final String OWNER_USER_ID_FIELD_NAME = "ownerUserId";
    
    /**
     * @return User who owns the entity
     */
    Long getOwnerUserId();

    void setOwnerUserId(Long userId);

    /**
     * Method returning the field name of the owner user id
     * @return field name
     */
    static String getOwnerUserIdFieldName(){
        return OWNER_USER_ID_FIELD_NAME;
    }
}
```

**OwnedResource Features:**
- **Automatic Ownership**: System automatically assigns owner on creation
- **Ownership Validation**: Prevents malicious users from creating entities with other user IDs
- **Access Control**: Owner has full control over their resources
- **Field Standardization**: Consistent owner field naming across entities

### **OwnedChildResource Interface**

Child resources that belong to owned parent resources:

```java
public interface OwnedChildResource extends OwnedResource {
    /**
     * @return Parent entity
     */
    BaseEntity getParent();
}
```

**OwnedChildResource Characteristics:**
- **Parent Relationship**: Clear parent-child relationship
- **Inherited Ownership**: Ownership derived from parent
- **Hierarchical Access**: Access control through parent ownership

### **SharedEntity Interface**

Owned resources that can be shared with other users:

```java
public interface SharedEntity extends OwnedResource {
    // A shared entity is an owned entity which can be shared between other users.
    // The owner chooses the users to share it to.
}
```

**SharedEntity Features:**
- **Ownership Retention**: Original owner maintains ownership
- **Sharing Capability**: Can be shared with multiple users
- **Permission Management**: Granular sharing permissions
- **Access Tracking**: Framework tracks sharing relationships

### **ExpandableEntity Interface**

Entities that support dynamic field extensions:

```java
public interface ExpandableEntity extends BaseEntity {
    /**
     * Used to have an extension point for entities
     * This map is used in order to receive dynamic fields eventually from outside for example web.
     * This is for "external" use
     * @return map of extra fields
     */
    Map<String, Object> getExtraFields();

    /**
     * Used to have an extension point for entities
     * @param extraFields map of extra fields
     */
    void setExtraFields(Map<String, Object> extraFields);

    /**
     * Used to convert the map in a concrete object that must be saved inside the repository.
     * This object is for internal use. In some point of the framework the Map<String,Object> is converted
     * to EntityExtension
     * @return entity extension
     */
    EntityExtension getExtension();

    /**
     * @param extension entity extension
     */
    void setExtension(EntityExtension extension);
}
```

**ExpandableEntity Features:**
- **Dynamic Fields**: Support for runtime field additions
- **External Integration**: Web-friendly field management
- **Extension System**: Structured extension support
- **Flexibility**: Adaptable to changing requirements

### **ProtectedResource Interface**

Resources that require resource-level protection:

```java
public interface ProtectedResource extends Resource {
    /**
     * Gets the resource id of the protected entity of the platform
     * @return resource id of the protected entity
     */
    String getResourceId();
}
```

**ProtectedResource Characteristics:**
- **Resource-Level Security**: Protection at the resource level
- **Unique Resource ID**: Additional resource identification
- **Security Integration**: Works with permission system

## Entity Implementation Examples

### **Basic Entity Implementation**

```java
@Entity
@Table(name = "documents")
@FrameworkComponent
public class Document extends AbstractJpaEntity implements OwnedResource, ProtectedEntity {
    
    @Column(name = "title")
    private String title;
    
    @Column(name = "content")
    private String content;
    
    @Column(name = "owner_user_id")
    private Long ownerUserId;
    
    // OwnedResource implementation
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

### **Expandable Entity Implementation**

```java
@Entity
@Table(name = "users")
@FrameworkComponent
public class User extends AbstractJpaEntity implements ExpandableEntity, ProtectedEntity {
    
    @Column(name = "username")
    private String username;
    
    @Column(name = "email")
    private String email;
    
    @Transient
    private Map<String, Object> extraFields;
    
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "extension_id")
    private UserExtension extension;
    
    // ExpandableEntity implementation
    @Override
    public Map<String, Object> getExtraFields() {
        if (extraFields == null) {
            extraFields = new HashMap<>();
        }
        return extraFields;
    }
    
    @Override
    public void setExtraFields(Map<String, Object> extraFields) {
        this.extraFields = extraFields;
    }
    
    @Override
    public EntityExtension getExtension() {
        return extension;
    }
    
    @Override
    public void setExtension(EntityExtension extension) {
        this.extension = (UserExtension) extension;
    }
    
    // Getters and setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
```

## Resource Management

### **Resource Identification**

Water Framework uses resource names for identification and permission management:

```java
// Automatic resource name generation
Document document = new Document();
String resourceName = document.getResourceName(); // Returns "com.example.Document"

// Custom resource name
public class CustomDocument extends AbstractJpaEntity implements Resource {
    @Override
    public String getResourceName() {
        return "custom.document";
    }
}
```

### **Permission Integration**

Resources automatically integrate with the permission system:

```java
@FrameworkComponent
public class DocumentService implements DocumentApi {
    
    @AllowPermission(action = CrudActions.SAVE)
    public Document createDocument(Document document) {
        // Framework automatically checks permissions for ProtectedEntity
        return documentRepository.persist(document);
    }
    
    @AllowPermission(action = CrudActions.FIND)
    public Document findDocument(long id) {
        // Permission checking is automatic for protected resources
        return documentRepository.find(id);
    }
}
```

## Best Practices

### **1. Choose Appropriate Entity Types**

```java
// For user-owned content
public class UserDocument extends AbstractJpaEntity implements OwnedResource, ProtectedEntity {
    // User owns the document, requires permissions
}

// For system-wide resources
public class SystemConfiguration extends AbstractJpaEntity implements ProtectedEntity {
    // System resource, no ownership, requires permissions
}

// For shareable content
public class SharedDocument extends AbstractJpaEntity implements SharedEntity {
    // Can be shared between users
}
```

### **2. Implement Proper Security**

```java
@FrameworkComponent
public class SecureService implements ServiceApi {
    
    @AllowPermission(action = CrudActions.SAVE)
    public OwnedResource createResource(OwnedResource resource) {
        // Set owner automatically
        resource.setOwnerUserId(getCurrentUserId());
        return repository.persist(resource);
    }
    
    @AllowPermission(action = CrudActions.FIND)
    public OwnedResource findResource(long id) {
        OwnedResource resource = repository.find(id);
        // Verify ownership
        if (!resource.getOwnerUserId().equals(getCurrentUserId())) {
            throw new UnauthorizedException("Not the owner of this resource");
        }
        return resource;
    }
}
```

### **3. Use Entity Extensions for Flexibility**

```java
@FrameworkComponent
public class ExtensionService implements EntityExtensionService {
    
    @Override
    public Class<? extends BaseEntity> relatedType() {
        return User.class;
    }
    
    @Override
    public Class<? extends BaseEntity> type() {
        return UserExtension.class;
    }
}
```

This comprehensive resource and entity system ensures that Water Framework applications have robust data management, security enforcement, and flexible entity relationships while maintaining clear ownership and permission boundaries. 