# JPA Repository Framework

Water Framework provides a comprehensive JPA repository framework that abstracts persistence concerns and provides consistent patterns for database operations across different persistence technologies.

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

This comprehensive JPA repository framework ensures that Water Framework applications have robust, performant, and maintainable data access patterns with full transaction control and optimization capabilities. 