# Entity Extensions

Water Framework provides a powerful entity extension system that allows developers to extend and customize entities without modifying the core entity classes. This approach follows the Open/Closed Principle and enables flexible entity customization through a sophisticated expansion mechanism.

## Entity Extension Architecture

### Core Interfaces

The entity extension system is built around several key interfaces:

```java
// Marker interface for entities that can be extended
public interface ExpandableEntity extends BaseEntity {
    Map<String, Object> getExtraFields();
    void setExtraFields(Map<String, Object> extraFields);
    EntityExtension getExtension();
    void setExtension(EntityExtension extension);
}

// Interface for extension entities
public interface EntityExtension extends BaseEntity {
    void setupExtensionFields(long extensionId, BaseEntity parentEntity);
    long getRelatedEntityId();
    void setRelatedEntityId(long relatedEntityId);
}

// Service interface for registering extensions
public interface EntityExtensionService extends Service {
    String RELATED_ENTITY_PROPERTY = "waterEntityExtensionType";
    Class<? extends BaseEntity> relatedType();
    Class<? extends BaseEntity> type();
}
```

### AbstractJpaExpandableEntity

Water Framework provides `AbstractJpaExpandableEntity` as the base class for expandable entities:

```java
@MappedSuperclass
@Setter
public abstract class AbstractJpaExpandableEntity extends AbstractJpaEntity implements ExpandableEntity {
    
    private Map<String, Object> extraFields = new HashMap<>();
    private EntityExtension extension;
    
    @JsonAnySetter
    public void setExtraFields(String key, Object value) {
        extraFields.put(key, value);
    }
    
    @JsonSetter(nulls = Nulls.AS_EMPTY)
    public void setExtraFields(Map<String, Object> extraFields) {
        this.extraFields = extraFields;
    }
    
    @Transient
    @JsonAnyGetter
    public Map<String, Object> getExtraFields() {
        return extraFields;
    }
    
    @JsonIgnore
    @Transient
    public EntityExtension getExtension() {
        return extension;
    }
}
```

### AbstractJpaEntityExpansion

Extension entities must extend `AbstractJpaEntityExpansion`:

```java
@MappedSuperclass
@Embeddable
public abstract class AbstractJpaEntityExpansion extends AbstractJpaEntity 
        implements BaseEntity, EntityExtension {
    
    @Getter
    @Setter
    @JsonIgnore
    private long relatedEntityId;
    
    @Override
    public void setupExtensionFields(long id, BaseEntity baseEntity) {
        this.setId(id);
        this.relatedEntityId = baseEntity.getId();
    }
    
    // All BaseEntity fields are marked with @JsonIgnore for automatic management
    @Override
    @Id
    @GeneratedValue
    @JsonIgnore
    public long getId() {
        return super.getId();
    }
    
    @Override
    @Version
    @Column(name = "entity_version", columnDefinition = "INTEGER default 1")
    @JsonIgnore
    public Integer getEntityVersion() {
        return super.getEntityVersion();
    }
    
    @Override
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "entity_create_date")
    @JsonIgnore
    public Date getEntityCreateDate() {
        return super.getEntityCreateDate();
    }
    
    @Override
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "entity_modify_date")
    @JsonIgnore
    public Date getEntityModifyDate() {
        return super.getEntityModifyDate();
    }
}
```

## How the Extension System Works

### Automatic Extension Management

Water Framework automatically manages entity extensions through the repository layer:

```java
// In BaseJpaRepositoryImpl
private void doPersistOnExpandableEntity(T entity) {
    processExpandableEntity(entity, (entityExtension, extensionRepository) -> {
        // Force extension to have same primary key as its master entity
        entityExtension.setupExtensionFields(0, entity);
        extensionRepository.persist(entityExtension);
    });
}

private void doUpdateOnExpandableEntity(T entity) {
    processExpandableEntity(entity, (entityExtension, extensionRepository) -> {
        boolean alreadyExists = true;
        long extensionId = 0;
        try {
            Query q = findByRelatedEntityId(extensionRepository, entity);
            BaseEntity extensionOnDb = extensionRepository.find(q);
            extensionId = extensionOnDb.getId();
        } catch (NoResultException e) {
            alreadyExists = false;
        }
        
        // Always force to have same entity id as its master entity
        entityExtension.setupExtensionFields(extensionId, entity);
        
        if (!alreadyExists) {
            extensionRepository.persist(entityExtension);
        } else {
            entityExtension = (EntityExtension) extensionRepository.update(entityExtension);
        }
        fillEntityWithExtension(entity, entityExtension);
    });
}

private void processExpandableEntity(T entity, BiConsumer<EntityExtension, BaseRepository<BaseEntity>> task) {
    EntityExtension extension = entity.isExpandableEntity() ? 
        ((ExpandableEntity)entity).getExtension() : null;
    
    if (extension != null) {
        @SuppressWarnings("unchecked")
        BaseRepository<BaseEntity> extensionRepository = 
            (BaseRepository<BaseEntity>) this.componentRegistry.findEntityExtensionRepository(this.type);
        
        if (extensionRepository != null) {
            task.accept(extension, extensionRepository);
        }
    }
}
```

### Extension Loading

Extensions are automatically loaded when entities are retrieved:

```java
private void fillEntityWithExtension(T entity) {
    if (entity.isExpandableEntity()) {
        BaseRepository<?> baseRepository = this.componentRegistry.findEntityExtensionRepository(this.type);
        if (baseRepository != null) {
            try {
                // Entity extension should have the same id of the master entity
                Query q = findByRelatedEntityId(baseRepository, entity);
                EntityExtension ext = (EntityExtension) baseRepository.find(q);
                fillEntityWithExtension(entity, ext);
            } catch (jakarta.persistence.NoResultException | NoResultException ex) {
                log.debug("No entity extension found for entity {} with id {}", 
                    this.type.getName(), entity.getId());
            }
        }
    }
}

private void fillEntityWithExtension(T entity, EntityExtension ext) {
    ExpandableEntity exp = (ExpandableEntity) entity;
    exp.setExtension(ext);
}
```

## Implementing Entity Extensions

### Step 1: Create the Extension Entity

```java
package it.water.user.extension.entity;

import it.water.repository.jpa.model.AbstractJpaEntityExpansion;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "water_user_extension")
@Getter
@Setter
public class WaterUserExtension extends AbstractJpaEntityExpansion {
    
    @Column(name = "phone_number")
    private String phoneNumber;
    
    @Column(name = "date_of_birth")
    private Date dateOfBirth;
    
    @Column(name = "address")
    private String address;
    
    @Column(name = "preferences")
    private String preferences;
    
    @Column(name = "profile_picture_url")
    private String profilePictureUrl;
    
    @Column(name = "social_media_links")
    private String socialMediaLinks;
}
```

### Step 2: Create the Repository Interface

```java
package it.water.user.extension.api;

import it.water.repository.jpa.api.WaterJpaRepository;
import it.water.user.extension.entity.WaterUserExtension;

public interface WaterUserExtensionRepository extends WaterJpaRepository<WaterUserExtension> {
    
    // Custom query methods can be added here
    WaterUserExtension findByPhoneNumber(String phoneNumber);
    
    List<WaterUserExtension> findByDateOfBirthBetween(Date startDate, Date endDate);
}
```

### Step 3: Create the Repository Implementation

```java
package it.water.user.extension.repository;

import it.water.core.interceptors.annotations.FrameworkComponent;
import it.water.repository.jpa.WaterJpaRepositoryImpl;
import it.water.user.extension.api.WaterUserExtensionRepository;
import it.water.user.extension.entity.WaterUserExtension;

@FrameworkComponent
public class WaterUserExtensionRepositoryImpl extends WaterJpaRepositoryImpl<WaterUserExtension> 
        implements WaterUserExtensionRepository {
    
    public WaterUserExtensionRepositoryImpl() {
        super(WaterUserExtension.class, "water-default-persistence-unit");
    }
    
    @Override
    public WaterUserExtension findByPhoneNumber(String phoneNumber) {
        Query query = getQueryBuilderInstance().field("phoneNumber").equalTo(phoneNumber);
        return find(query);
    }
    
    @Override
    public List<WaterUserExtension> findByDateOfBirthBetween(Date startDate, Date endDate) {
        Query query = getQueryBuilderInstance()
            .field("dateOfBirth").greaterOrEqualThan(startDate)
            .and(getQueryBuilderInstance().field("dateOfBirth").lowerOrEqualThan(endDate));
        
        return findAll(query, 100, 1, null).getResults();
    }
}
```

### Step 4: Create the Extension Service

```java
package it.water.user.extension;

import it.water.core.api.model.BaseEntity;
import it.water.core.api.service.EntityExtensionService;
import it.water.core.interceptors.annotations.FrameworkComponent;
import it.water.user.extension.entity.WaterUserExtension;
import it.water.user.model.WaterUser;

@FrameworkComponent(properties = EntityExtensionService.RELATED_ENTITY_PROPERTY + "=it.water.user.model.WaterUser")
public class WaterUserExtensionService implements EntityExtensionService {
    
    @Override
    public Class<? extends BaseEntity> relatedType() {
        return WaterUser.class;
    }
    
    @Override
    public Class<? extends BaseEntity> type() {
        return WaterUserExtension.class;
    }
}
```

### Step 5: Make the Main Entity Expandable

```java
@Entity
@Table(name = "w_user")
public class WaterUser extends AbstractJpaExpandableEntity implements ProtectedEntity, User {
    
    @Column(name = "username", unique = true)
    private String username;
    
    @Column(name = "email", unique = true)
    private String email;
    
    // The entity automatically inherits expandable functionality from AbstractJpaExpandableEntity
    // No additional code needed for basic expansion support
}
```

## Using Entity Extensions

### Creating Entities with Extensions

```java
@FrameworkComponent
public class UserServiceImpl extends BaseEntityServiceImpl<WaterUser> implements UserApi {
    
    @Override
    public WaterUser save(WaterUser user) {
        // Create extension data
        WaterUserExtension extension = new WaterUserExtension();
        extension.setPhoneNumber("+1234567890");
        extension.setDateOfBirth(new Date());
        extension.setAddress("123 Main St");
        extension.setPreferences("{\"theme\":\"dark\",\"notifications\":true}");
        
        // Set extension on the main entity
        user.setExtension(extension);
        
        // Save - extension will be automatically persisted
        return super.save(user);
    }
}
```

### Retrieving Entities with Extensions

```java
@FrameworkComponent
public class UserServiceImpl extends BaseEntityServiceImpl<WaterUser> implements UserApi {
    
    @Override
    public WaterUser find(long id) {
        WaterUser user = super.find(id);
        
        // Extension is automatically loaded and available
        WaterUserExtension extension = (WaterUserExtension) user.getExtension();
        if (extension != null) {
            log.info("User {} has phone number: {}", user.getUsername(), extension.getPhoneNumber());
        }
        
        return user;
    }
    
    @Override
    public PaginableResult<WaterUser> findAll(Query filter, int delta, int page, QueryOrder queryOrder) {
        PaginableResult<WaterUser> result = super.findAll(filter, delta, page, queryOrder);
        
        // Extensions are automatically loaded for all entities in the result
        for (WaterUser user : result.getResults()) {
            WaterUserExtension extension = (WaterUserExtension) user.getExtension();
            if (extension != null) {
                // Process extension data
                processUserExtension(user, extension);
            }
        }
        
        return result;
    }
}
```

### Updating Entities with Extensions

```java
@FrameworkComponent
public class UserServiceImpl extends BaseEntityServiceImpl<WaterUser> implements UserApi {
    
    @Override
    public WaterUser update(WaterUser user) {
        // Update extension data
        WaterUserExtension extension = (WaterUserExtension) user.getExtension();
        if (extension != null) {
            extension.setPhoneNumber("+0987654321");
            extension.setAddress("456 Oak Ave");
        }
        
        // Update - extension will be automatically updated
        return super.update(user);
    }
}
```

## Dynamic Field Support

### Using ExtraFields Map

Water Framework supports dynamic field addition through the `extraFields` map:

```java
@FrameworkComponent
public class UserServiceImpl extends BaseEntityServiceImpl<WaterUser> implements UserApi {
    
    @Override
    public WaterUser createUserWithDynamicFields(Map<String, Object> dynamicData) {
        WaterUser user = new WaterUser();
        user.setUsername("john.doe");
        user.setEmail("john@example.com");
        
        // Set dynamic fields
        user.setExtraFields(dynamicData);
        
        // Save - dynamic fields will be automatically converted to extension
        return super.save(user);
    }
    
    @Override
    public WaterUser updateUserWithDynamicFields(long userId, Map<String, Object> dynamicData) {
        WaterUser user = find(userId);
        
        // Update dynamic fields
        user.setExtraFields(dynamicData);
        
        // Update - dynamic fields will be automatically converted to extension
        return super.update(user);
    }
}
```

### REST API Integration

The REST module automatically converts JSON properties to extension fields:

```json
{
  "username": "john.doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "dateOfBirth": "1990-01-01",
  "address": "123 Main St",
  "preferences": {
    "theme": "dark",
    "notifications": true
  }
}
```

When this JSON is received, the framework automatically:
1. Maps standard fields to the main entity
2. Maps unknown fields to the `extraFields` map
3. Converts the `extraFields` map to the appropriate extension entity
4. Persists both the main entity and the extension in the same transaction

## Generator Support

### Automatic Entity Extension Generation

Water Framework provides a generator task for creating entity extensions:

```bash
# Generate a new entity extension
yo water:new-entity-extension
```

The generator will prompt for:
- **Project**: Select existing project or create new one
- **Entity Name**: Name for the extension entity
- **Entity to Extend**: Full package and class name of the entity to extend
- **Group ID**: Maven group ID of the entity being extended
- **Artifact ID**: Maven artifact ID of the entity model

### Generated Structure

The generator creates a complete extension structure:

```
project/
├── src/main/java/
│   └── it/water/project/
│       ├── entity/
│       │   └── MyEntityExtension.java
│       ├── api/
│       │   └── MyEntityExtensionRepository.java
│       ├── repository/
│       │   └── MyEntityExtensionRepositoryImpl.java
│       └── MyEntityExtensionService.java
└── build.gradle
```

### Generator Templates

The generator uses templates to create consistent extension code:

```java
// Generated Extension Entity
@Entity
@Table(name = "my_entity_extension")
@Getter
@Setter
public class MyEntityExtension extends AbstractJpaEntityExpansion {
    // Custom fields will be added here
}

// Generated Extension Service
@FrameworkComponent(properties = EntityExtensionService.RELATED_ENTITY_PROPERTY + "=it.water.target.EntityToExtend")
public class MyEntityExtensionService implements EntityExtensionService {
    @Override
    public Class<? extends BaseEntity> relatedType() {
        return EntityToExtend.class;
    }
    
    @Override
    public Class<? extends BaseEntity> type() {
        return MyEntityExtension.class;
    }
}
```

## Advanced Extension Patterns

### Validation Extensions

```java
@FrameworkComponent
public class UserValidationExtension extends AbstractJpaEntityExpansion<WaterUser> {
    
    @Inject
    private UserRepository userRepository;
    
    public UserValidationExtension() {
        super(WaterUser.class);
    }
    
    @Override
    public void validate(WaterUser user) {
        // Custom validation logic
        if (user.getEmail() != null) {
            User existingUser = userRepository.findByEmail(user.getEmail());
            if (existingUser != null && !existingUser.getId().equals(user.getId())) {
                throw new ValidationException("Email already exists: " + user.getEmail());
            }
        }
        
        // Validate phone number format
        WaterUserExtension extension = (WaterUserExtension) user.getExtension();
        if (extension != null && extension.getPhoneNumber() != null) {
            if (!extension.getPhoneNumber().matches("^\\+[1-9]\\d{1,14}$")) {
                throw new ValidationException("Invalid phone number format");
            }
        }
    }
}
```

### Business Logic Extensions

```java
@FrameworkComponent
public class UserBusinessExtension extends AbstractJpaEntityExpansion<WaterUser> {
    
    @Inject
    private EmailService emailService;
    
    @Inject
    private AuditService auditService;
    
    public UserBusinessExtension() {
        super(WaterUser.class);
    }
    
    @Override
    public void prePersist(WaterUser user) {
        // Set default values
        WaterUserExtension extension = (WaterUserExtension) user.getExtension();
        if (extension != null && extension.getPreferences() == null) {
            extension.setPreferences("{\"theme\":\"light\",\"notifications\":false}");
        }
    }
    
    @Override
    public void postPersist(WaterUser user) {
        // Send welcome email
        emailService.sendWelcomeEmail(user);
        
        // Create audit record
        auditService.recordUserCreated(user);
    }
    
    @Override
    public void preUpdate(WaterUser user) {
        // Update modification tracking
        WaterUserExtension extension = (WaterUserExtension) user.getExtension();
        if (extension != null) {
            extension.setLastModified(new Date());
        }
    }
}
```

### Computed Field Extensions

```java
@FrameworkComponent
public class UserComputedExtension extends AbstractJpaEntityExpansion<WaterUser> {
    
    @Inject
    private UserRepository userRepository;
    
    public UserComputedExtension() {
        super(WaterUser.class);
    }
    
    @Override
    public void expand(WaterUser user) {
        WaterUserExtension extension = (WaterUserExtension) user.getExtension();
        if (extension != null) {
            // Compute age from date of birth
            if (extension.getDateOfBirth() != null) {
                int age = Period.between(
                    extension.getDateOfBirth().toInstant().atZone(ZoneId.systemDefault()).toLocalDate(),
                    LocalDate.now()
                ).getYears();
                extension.setAge(age);
            }
            
            // Compute user status based on various factors
            String status = computeUserStatus(user, extension);
            extension.setComputedStatus(status);
        }
    }
    
    private String computeUserStatus(WaterUser user, WaterUserExtension extension) {
        // Complex business logic to determine user status
        if (extension.getDateOfBirth() != null && extension.getAge() < 18) {
            return "MINOR";
        } else if (user.getEntityCreateDate() != null && 
                   ChronoUnit.DAYS.between(
                       user.getEntityCreateDate().toInstant(), 
                       Instant.now()) < 30) {
            return "NEW_USER";
        } else {
            return "ACTIVE";
        }
    }
}
```

## Extension System Benefits

### **Modularity**
- **Open/Closed Principle**: Extend entities without modifying core code
- **Plugin Architecture**: Add functionality through separate modules
- **Independent Deployment**: Extensions can be deployed separately

### **Flexibility**
- **Dynamic Fields**: Add fields at runtime through extraFields map
- **Multiple Extensions**: Support for multiple extension types per entity
- **Type Safety**: Maintain type safety while providing flexibility

### **Automatic Management**
- **Transaction Safety**: Extensions are managed in the same transaction as main entities
- **Automatic Loading**: Extensions are automatically loaded when entities are retrieved
- **Automatic Persistence**: Extensions are automatically persisted and updated

### **Performance**
- **Lazy Loading**: Extensions are loaded only when needed
- **Batch Operations**: Support for efficient batch loading of extensions
- **Caching**: Extensions can be cached independently

### **Developer Experience**
- **Generator Support**: Automatic code generation for extensions
- **Consistent Patterns**: Standardized approach to entity extension
- **Type Safety**: Compile-time validation of extension relationships

This comprehensive entity extension system ensures that Water Framework applications can be easily extended and customized while maintaining clean architecture and excellent performance. 