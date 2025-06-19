# Entity Management

Water Framework provides a comprehensive entity management system that leverages standard JPA/Hibernate annotations with powerful transaction management features.

## JPA/Hibernate Integration

Water Framework entities use standard JPA/Hibernate annotations for persistence mapping. All entities extend `AbstractJpaEntity`, which provides automatic field management and lifecycle hooks.

### AbstractJpaEntity Foundation

`AbstractJpaEntity` is the base class for all Water Framework entities and provides the following automatically managed fields:

- **`id`** (`@Id @GeneratedValue`): Primary key with auto-generation
- **`entityVersion`** (`@Version`): Optimistic locking version field
- **`entityCreateDate`** (`@Temporal(TemporalType.TIMESTAMP)`): Automatic creation timestamp
- **`entityModifyDate`** (`@Temporal(TemporalType.TIMESTAMP)`): Automatic modification timestamp

The class also provides automatic lifecycle management:
- **`@PrePersist`**: Automatically sets creation and modification dates
- **`@PreUpdate`**: Automatically updates modification date
- **`doPrePersist()`** and **`doPreUpdate()`**: Overridable hooks for custom logic

### Entity Example

```java
@Entity
@Table(name = "documents")
public class Document extends AbstractJpaEntity implements ProtectedEntity, OwnedResource {
    
    @Column(name = "title", nullable = false, length = 255)
    private String title;
    
    @Column(name = "content", columnDefinition = "TEXT")
    private String content;
    
    @Column(name = "file_size")
    private Long fileSize;
    
    @Column(name = "mime_type")
    private String mimeType;
    
    @Column(name = "owner_user_id")
    private Long ownerUserId;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "folder_id")
    private Folder folder;
    
    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DocumentVersion> versions = new ArrayList<>();
    
    // Getters and setters...
}
```

**Note**: The `id`, `entityVersion`, `entityCreateDate`, and `entityModifyDate` fields are automatically provided by `AbstractJpaEntity` and should not be redeclared in child entities. The framework handles their persistence, serialization, and lifecycle management automatically.

## Repository Operations and Transaction Management

Water Framework repositories provide comprehensive CRUD operations with built-in transaction management.

### Basic Repository Operations

```java
@FrameworkComponent
public class DocumentRepositoryImpl extends BaseJpaRepositoryImpl<Document> implements DocumentRepository {
    
    public DocumentRepositoryImpl() {
        super(Document.class);
    }
    
    @Override
    public Document persist(Document entity) {
        return super.persist(entity);
    }
    
    @Override
    public Document update(Document entity) {
        return super.update(entity);
    }
    
    @Override
    public void remove(long id) {
        super.remove(id);
    }
    
    @Override
    public Document find(long id) {
        return super.find(id);
    }
    
    @Override
    public PaginableResult<Document> findAll(Query filter, int delta, int page, QueryOrder queryOrder) {
        return super.findAll(filter, delta, page, queryOrder);
    }
}
```

### Transaction Management

Water Framework provides programmatic transaction management through dedicated transaction methods rather than annotations. The framework offers two main transaction methods:

```java
@FrameworkComponent
public class DocumentRepositoryImpl extends BaseJpaRepositoryImpl<Document> implements DocumentRepository {
    
    public DocumentRepositoryImpl() {
        super(Document.class);
    }
    
    @Override
    public Document persist(Document entity) {
        // Use tx method for transaction management
        return tx(Transactional.TxType.REQUIRED, entityManager -> {
            // Custom transaction logic
            Document savedEntity = entityManager.merge(entity);
            entityManager.flush();
            return savedEntity;
        });
    }
    
    @Override
    public Document update(Document entity) {
        return tx(Transactional.TxType.REQUIRED, entityManager -> {
            // Update logic within transaction
            Document existingEntity = entityManager.find(Document.class, entity.getId());
            if (existingEntity == null) {
                throw new EntityNotFound();
            }
            return entityManager.merge(entity);
        });
    }
    
    @Override
    public void remove(long id) {
        txExpr(Transactional.TxType.REQUIRED, entityManager -> {
            // Remove logic within transaction
            Document entity = entityManager.find(Document.class, id);
            if (entity != null) {
                entityManager.remove(entity);
            }
        });
    }
    
    @Override
    public Document find(long id) {
        return tx(Transactional.TxType.SUPPORTS, entityManager -> {
            // Read operation with SUPPORTS transaction type
            return entityManager.find(Document.class, id);
        });
    }
    
    public void complexOperation(Document document) {
        // Programmatic transaction control with custom logic
        tx(Transactional.TxType.REQUIRED, entityManager -> {
            // Complex business logic within transaction
            Document found = entityManager.find(Document.class, document.getId());
            found.setModifiedDate(new Date());
            
            // Additional operations in the same transaction
            entityManager.merge(found);
            entityManager.flush();
            
            return found;
        });
    }
}
```

**Transaction Method Types:**

- **`tx(TxType, Function<EntityManager, R>)`**: Executes code within a transaction and returns a result
- **`txExpr(TxType, Consumer<EntityManager>)`**: Executes code within a transaction without returning a result

**Transaction Types:**

- **`REQUIRED`**: Uses existing transaction or creates new one
- **`REQUIRES_NEW`**: Always creates a new transaction
- **`SUPPORTS`**: Uses existing transaction if available, otherwise no transaction
- **`NOT_SUPPORTED`**: Suspends current transaction if exists
- **`MANDATORY`**: Requires existing transaction, throws exception if none
- **`NEVER`**: Throws exception if transaction exists

## Entity Relationships and Mapping

Water Framework supports all standard JPA relationship mappings with additional features for complex scenarios.

### Basic Relationships

```java
@Entity
@Table(name = "users")
public class User extends AbstractJpaEntity implements ProtectedEntity {
    
    @Column(name = "username", unique = true)
    private String username;
    
    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Document> documents = new ArrayList<>();
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;
    
    @ManyToMany
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();
}
```

### Entity Extensions

Water Framework supports entity extensions through the `ExpandableEntity` interface, allowing dynamic field addition:

```java
@Entity
@Table(name = "documents")
public class Document extends AbstractJpaEntity implements ExpandableEntity, ProtectedEntity {
    
    @Column(name = "title")
    private String title;
    
    @Transient
    private Map<String, Object> extraFields = new HashMap<>();
    
    @Transient
    private EntityExtension extension;
    
    @Override
    public Map<String, Object> getExtraFields() {
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
        this.extension = extension;
    }
}
```

This entity management system ensures that Water Framework applications have robust and flexible data persistence with full transaction control. 