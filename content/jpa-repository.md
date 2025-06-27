# JPA Repository Framework

Water Framework provides a comprehensive JPA repository framework that abstracts persistence concerns and provides consistent patterns for database operations across different persistence technologies. The framework uses a sophisticated wrapper architecture that automatically adapts to different runtime environments (Spring, OSGi, Quarkus) while maintaining a unified API.

## Repository Architecture Overview

### Cross-Framework Repository Pattern

Water Framework implements a **cross-framework repository pattern** that allows the same repository code to work seamlessly across different Java runtime environments. This is achieved through a sophisticated wrapper architecture:

```java
// Framework-agnostic repository interface
public interface BaseRepository<T extends BaseEntity> {
    T persist(T entity);
    T update(T entity);
    void remove(long id);
    T find(long id);
    T find(Query filter);
    PaginableResult<T> findAll(Query filter, int delta, int page, QueryOrder queryOrder);
    long countAll(Query filter);
    Class<T> getEntityType();
}
```

### WaterJpaRepositoryImpl - The Technology Wrapper

The core of Water Framework's cross-framework capability is the `WaterJpaRepositoryImpl` class, which acts as a **technology-agnostic wrapper** that automatically adapts to the runtime environment:

```java
@FrameworkComponent
public class DocumentWaterRepository extends WaterJpaRepositoryImpl<Document> implements DocumentRepository {
    
    public DocumentWaterRepository() {
        super(Document.class, "document-persistence-unit");
    }
    
    // Custom repository methods work across all frameworks
    public List<Document> findDocumentsByOwner(Long ownerId) {
        return tx(Transactional.TxType.SUPPORTS, entityManager -> {
            return entityManager.createQuery(
                "SELECT d FROM Document d WHERE d.ownerUserId = :ownerId", Document.class)
                .setParameter("ownerId", ownerId)
                .getResultList();
        });
    }
}
```

**Key Features of WaterJpaRepositoryImpl:**
- **Lazy Technology Detection**: The concrete repository is created only when needed
- **Automatic Framework Adaptation**: Automatically detects and adapts to Spring, OSGi, or Quarkus
- **Unified Transaction Management**: Provides consistent transaction APIs across frameworks
- **Component Registry Integration**: Leverages Water Framework's component registry for dependency injection

## Automatic Technology Wrapping

### How the Wrapper Works

The `WaterJpaRepositoryImpl` uses a **delegate pattern** with automatic technology detection:

```java
public class WaterJpaRepositoryImpl<T extends BaseEntity> implements WaterJpaRepository<T> {
    private JpaRepository<T> concreteRepository;
    private JpaRepositoryManager jpaRepositoryManager;
    
    private JpaRepository<T> getConcreteRepository() {
        if (this.concreteRepository == null) {
            // Automatically creates the appropriate implementation for the current runtime
            this.concreteRepository = jpaRepositoryManager.createConcreteRepository(type, persistenceUnitName);
        }
        return this.concreteRepository;
    }
    
    @Override
    public T persist(T entity) {
        // Delegates to the technology-specific implementation
        return getConcreteRepository().persist(entity);
    }
}
```

### JpaRepositoryManager - The Technology Factory

The `JpaRepositoryManager` interface is responsible for creating technology-specific repository implementations:

```java
public interface JpaRepositoryManager extends Service {
    <T extends BaseEntity> JpaRepository<T> createConcreteRepository(Class<T> entityType, String persistenceUnit);
}
```

## Spring Integration

### Spring Implementation Details

When running in a Spring environment, Water Framework automatically creates Spring-specific repository implementations:

```java
@Service
public class SpringJpaRepositoryManager implements JpaRepositoryManager {
    @Autowired
    private EntityManagerFactory entityManagerFactory;
    @Autowired
    private PlatformTransactionManager transactionManager;
    
    @Override
    public <T extends BaseEntity> JpaRepository<T> createConcreteRepository(Class<T> entityType, String persistenceUnit) {
        // Creates Spring-specific repository with Spring transaction management
        SpringBaseJpaRepositoryImpl<T> springRepository = new SpringBaseJpaRepositoryImpl<>(
            entityType, entityManagerFactory, transactionManager);
        return springRepository;
    }
}
```

### Spring Transaction Management

The Spring implementation leverages Spring's transaction management:

```java
public class SpringBaseJpaRepositoryImpl<T extends BaseEntity> extends BaseJpaRepositoryImpl<T> {
    private TransactionTemplate transactionTemplate;
    
    @Override
    public <R> R tx(Transactional.TxType txType, Function<EntityManager, R> function) {
        transactionTemplate.setPropagationBehavior(mapTxType(txType));
        return transactionTemplate.execute(status -> {
            EntityManager entityManager = getEntityManagerAndStartTransaction();
            return function.apply(entityManager);
        });
    }
    
    private int mapTxType(Transactional.TxType txType) {
        // Maps Water Framework transaction types to Spring transaction types
        if (txType.equals(Transactional.TxType.REQUIRED))
            return TransactionDefinition.PROPAGATION_REQUIRED;
        else if (txType.equals(Transactional.TxType.REQUIRES_NEW))
            return TransactionDefinition.PROPAGATION_REQUIRES_NEW;
        // ... other mappings
    }
}
```

### Spring Data JPA Integration

Water Framework also provides seamless integration with Spring Data JPA:

```java
public class JpaRepositoryImpl<T extends AbstractJpaEntity> extends SimpleJpaRepository<T, Long> implements BaseRepository<T> {
    private BaseRepository<T> repository;
    
    public JpaRepositoryImpl(Class<T> domainClass, EntityManager em, PlatformTransactionManager transactionManager) {
        super(domainClass, em);
        // Wraps Water Framework repository with Spring Data JPA
        initWaterBaseRepository(domainClass, em, transactionManager);
    }
    
    @Override
    public <S extends T> S save(S entity) {
        // Uses Water Framework's persist method with Spring Data JPA compatibility
        return (S) repository.persist(entity);
    }
}
```

## OSGi Integration

### OSGi Implementation Details

In OSGi environments, Water Framework creates OSGi-specific repository implementations with bundle isolation:

```java
@FrameworkComponent(services = JpaRepositoryManager.class, priority = 1)
public class OsgiJpaRepositoryManager implements JpaRepositoryManager {
    
    @Override
    public <T extends BaseEntity> JpaRepository<T> createConcreteRepository(Class<T> entityType, String persistenceUnit) {
        // Creates OSGi-specific repository with bundle-scoped persistence unit
        OsgiBaseJpaRepository<T> osgiRepository = new OsgiBaseJpaRepository<T>(entityType, persistenceUnit) {};
        return osgiRepository;
    }
}
```

### OSGi Bundle Isolation

The OSGi implementation provides **bundle-scoped persistence units** for domain isolation:

```java
public abstract class OsgiBaseJpaRepository<T extends BaseEntity> extends BaseJpaRepositoryImpl<T> {
    
    @Override
    protected EntityManagerFactory createDefaultEntityManagerFactory() {
        // Gets the bundle that contains the entity class
        Bundle persistenceBundle = FrameworkUtil.getBundle(this.type);
        
        // Creates bundle-specific class loader
        ClassLoader entityClassLoader = persistenceBundle.adapt(BundleWiring.class).getClassLoader();
        
        // Creates isolated persistence unit for this bundle
        WaterPersistenceUnitInfo waterPersistenceUnitInfo = new WaterPersistenceUnitInfo(
            getPersistenceUnitName(), type, 
            "org.hibernate.jpa.HibernatePersistenceProvider", 
            PersistenceUnitTransactionType.JTA, ds, null, null);
        
        return new HibernatePersistenceProvider().createContainerEntityManagerFactory(
            waterPersistenceUnitInfo, properties);
    }
}
```

### OSGi Transaction Management

OSGi implementation uses JTA transactions with proper bundle context:

```java
@Override
public <R> R tx(Transactional.TxType txType, Function<EntityManager, R> function) {
    try {
        return manageTransaction(txType, entityManager -> function.apply(getEntityManager()));
    } catch (Exception e) {
        throw new WaterRuntimeException(e.getMessage());
    }
}

private <R> R manageTransaction(Transactional.TxType txType, Function<EntityManager, R> function) {
    jakarta.transaction.UserTransaction userTransaction = UserTransaction.userTransaction();
    TransactionManager transactionManager = com.arjuna.ats.jta.TransactionManager.transactionManager();
    
    // OSGi-specific transaction management with proper suspension/resumption
    Transaction suspendedTransaction = setupTransaction(userTransaction, txType, transactionManager);
    try {
        return runTransaction(userTransaction, txType, function);
    } finally {
        if (suspendedTransaction != null) {
            transactionManager.resume(suspendedTransaction);
        }
    }
}
```

## Automatic Framework Detection

### Component Registry Integration

Water Framework automatically detects the runtime environment through its component registry:

```java
// The framework automatically registers the appropriate JpaRepositoryManager
@FrameworkComponent(services = JpaRepositoryManager.class, priority = 1)
public class OsgiJpaRepositoryManager implements JpaRepositoryManager { }

@Service
public class SpringJpaRepositoryManager implements JpaRepositoryManager { }
```

### Priority-Based Selection

The framework uses priority-based selection to choose the appropriate implementation:

```java
// OSGi implementation has priority 1
@FrameworkComponent(services = JpaRepositoryManager.class, priority = 1)
public class OsgiJpaRepositoryManager implements JpaRepositoryManager { }

// Spring implementation uses default priority (lower)
@Service
public class SpringJpaRepositoryManager implements JpaRepositoryManager { }
```

## Repository Pattern

### Base Repository Interface

Water Framework uses the repository pattern to abstract data access logic. All repositories extend the `BaseRepository` interface:

```java
public interface BaseRepository<T extends BaseEntity> {
    T persist(T entity);
    T update(T entity);
    void remove(long id);
    T find(long id);
    T find(Query filter);
    PaginableResult<T> findAll(Query filter, int delta, int page, QueryOrder queryOrder);
    long countAll(Query filter);
    Class<T> getEntityType();
}
```

### Repository Implementation

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

## Transaction Management

### Programmatic Transaction Control

Water Framework provides programmatic transaction management through dedicated methods:

```java
@FrameworkComponent
public class DocumentRepositoryImpl extends BaseJpaRepositoryImpl<Document> implements DocumentRepository {
    
    public Document createDocumentWithMetadata(Document document, Metadata metadata) {
        return tx(Transactional.TxType.REQUIRED, entityManager -> {
            // Save document
            Document savedDocument = entityManager.merge(document);
            entityManager.flush();
            
            // Set metadata reference
            metadata.setDocumentId(savedDocument.getId());
            
            // Save metadata
            entityManager.persist(metadata);
            entityManager.flush();
            
            return savedDocument;
        });
    }
    
    public void bulkUpdateDocuments(List<Document> documents) {
        txExpr(Transactional.TxType.REQUIRED, entityManager -> {
            for (Document document : documents) {
                entityManager.merge(document);
            }
            entityManager.flush();
        });
    }
    
    public void deleteDocumentWithDependencies(long documentId) {
        txExpr(Transactional.TxType.REQUIRED, entityManager -> {
            // Delete metadata first
            Query metadataQuery = entityManager.createQuery(
                "DELETE FROM Metadata m WHERE m.documentId = :documentId");
            metadataQuery.setParameter("documentId", documentId);
            metadataQuery.executeUpdate();
            
            // Delete document
            Document document = entityManager.find(Document.class, documentId);
            if (document != null) {
                entityManager.remove(document);
            }
        });
    }
}
```

### Transaction Types

- **`REQUIRED`**: Uses existing transaction or creates new one
- **`REQUIRES_NEW`**: Always creates a new transaction
- **`SUPPORTS`**: Uses existing transaction if available, otherwise no transaction
- **`NOT_SUPPORTED`**: Suspends current transaction if exists
- **`MANDATORY`**: Requires existing transaction, throws exception if none
- **`NEVER`**: Throws exception if transaction exists

## Data Access Patterns

### Repository with Custom Queries

```java
@FrameworkComponent
public class DocumentRepositoryImpl extends BaseJpaRepositoryImpl<Document> implements DocumentRepository {
    
    public List<Document> findDocumentsByUserAndDateRange(String userId, Date startDate, Date endDate) {
        return tx(Transactional.TxType.SUPPORTS, entityManager -> {
            TypedQuery<Document> query = entityManager.createQuery(
                "SELECT d FROM Document d WHERE d.ownerUserId = :userId " +
                "AND d.entityCreateDate BETWEEN :startDate AND :endDate " +
                "ORDER BY d.entityCreateDate DESC", Document.class);
                
            query.setParameter("userId", userId);
            query.setParameter("startDate", startDate);
            query.setParameter("endDate", endDate);
            
            return query.getResultList();
        });
    }
    
    public long countDocumentsByUser(String userId) {
        return tx(Transactional.TxType.SUPPORTS, entityManager -> {
            TypedQuery<Long> query = entityManager.createQuery(
                "SELECT COUNT(d) FROM Document d WHERE d.ownerUserId = :userId", Long.class);
                
            query.setParameter("userId", userId);
            
            return query.getSingleResult();
        });
    }
    
    public List<Document> findDocumentsByTags(List<String> tags) {
        return tx(Transactional.TxType.SUPPORTS, entityManager -> {
            TypedQuery<Document> query = entityManager.createQuery(
                "SELECT DISTINCT d FROM Document d JOIN d.tags t " +
                "WHERE t IN :tags ORDER BY d.entityCreateDate DESC", Document.class);
                
            query.setParameter("tags", tags);
            
            return query.getResultList();
        });
    }
}
```

### Batch Operations

```java
@FrameworkComponent
public class DocumentRepositoryImpl extends BaseJpaRepositoryImpl<Document> implements DocumentRepository {
    
    public void batchInsertDocuments(List<Document> documents) {
        txExpr(Transactional.TxType.REQUIRED, entityManager -> {
            int batchSize = 50;
            int count = 0;
            
            for (Document document : documents) {
                entityManager.persist(document);
                count++;
                
                if (count % batchSize == 0) {
                    entityManager.flush();
                    entityManager.clear();
                }
            }
            
            if (count % batchSize != 0) {
                entityManager.flush();
            }
        });
    }
    
    public void batchUpdateDocumentStatus(List<Long> documentIds, String status) {
        txExpr(Transactional.TxType.REQUIRED, entityManager -> {
            Query query = entityManager.createQuery(
                "UPDATE Document d SET d.status = :status WHERE d.id IN :documentIds");
                
            query.setParameter("status", status);
            query.setParameter("documentIds", documentIds);
            
            int updatedCount = query.executeUpdate();
            log.info("Updated {} documents with status: {}", updatedCount, status);
        });
    }
}
```

## Performance Optimization

### Query Optimization

```java
@FrameworkComponent
public class DocumentRepositoryImpl extends BaseJpaRepositoryImpl<Document> implements DocumentRepository {
    
    public List<Document> findDocumentsOptimized() {
        return tx(Transactional.TxType.SUPPORTS, entityManager -> {
            TypedQuery<Document> query = entityManager.createQuery(
                "SELECT d FROM Document d " +
                "LEFT JOIN FETCH d.metadata " +
                "LEFT JOIN FETCH d.tags " +
                "WHERE d.status = :status " +
                "ORDER BY d.entityCreateDate DESC", Document.class);
                
            query.setParameter("status", "ACTIVE");
            query.setHint("org.hibernate.cacheable", true);
            query.setHint("org.hibernate.cacheRegion", "documents");
            
            return query.getResultList();
        });
    }
}
```

## Framework Benefits

### **Automatic Technology Adaptation**
- **Write Once, Run Anywhere**: Same repository code works in Spring, OSGi, and Quarkus
- **No Framework-Specific Code**: No need to write different implementations for each framework
- **Automatic Detection**: Framework automatically detects and adapts to the runtime environment

### **Consistent Transaction Management**
- **Unified API**: Same transaction methods work across all frameworks
- **Framework-Specific Optimization**: Each implementation uses the most efficient transaction management for its environment
- **Automatic Mapping**: Transaction types are automatically mapped to framework-specific equivalents

### **Bundle Isolation (OSGi)**
- **Domain-Driven Design Support**: Each bundle gets its own isolated persistence unit
- **Aggregate Pattern**: Supports DDD aggregate boundaries through bundle isolation
- **Independent Deployment**: Bundles can be deployed and updated independently

### **Spring Integration**
- **Spring Data JPA Compatibility**: Works seamlessly with Spring Data JPA repositories
- **Spring Transaction Management**: Leverages Spring's powerful transaction management
- **Auto-Configuration**: Automatically configures with Spring Boot

This comprehensive JPA repository framework ensures that Water Framework applications have robust, performant, and maintainable data access patterns with full transaction control and optimization capabilities, while automatically adapting to any supported Java runtime environment. 