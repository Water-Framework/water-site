# Query System

Water Framework provides a powerful and flexible query system that allows developers to construct complex database queries using a fluent API while maintaining type safety and performance.

## Query Builder

Water Framework provides a powerful query builder for constructing complex database queries:

```java
@FrameworkComponent
public class DocumentRepositoryImpl extends BaseJpaRepositoryImpl<Document> implements DocumentRepository {
    
    public List<Document> findDocumentsByUserAndType(String userId, String documentType) {
        QueryBuilder queryBuilder = getQueryBuilderInstance();
        
        Query query = queryBuilder
            .select()
            .from(Document.class)
            .where()
            .eq("ownerUserId", userId)
            .and()
            .eq("documentType", documentType)
            .and()
            .isNotNull("title")
            .orderBy("entityCreateDate", QueryOrder.DESC)
            .build();
            
        return findAll(query, 100, 0, QueryOrder.DESC);
    }
    
    public List<Document> findRecentDocuments(int days) {
        QueryBuilder queryBuilder = getQueryBuilderInstance();
        
        Date cutoffDate = Date.from(Instant.now().minus(days, ChronoUnit.DAYS));
        
        Query query = queryBuilder
            .select()
            .from(Document.class)
            .where()
            .gte("entityCreateDate", cutoffDate)
            .orderBy("entityCreateDate", QueryOrder.DESC)
            .build();
            
        return findAll(query, 50, 0, QueryOrder.DESC);
    }
    
    public List<Document> findDocumentsByKeywords(List<String> keywords) {
        QueryBuilder queryBuilder = getQueryBuilderInstance();
        
        Query query = queryBuilder
            .select()
            .from(Document.class)
            .where()
            .in("tags", keywords)
            .or()
            .like("title", "%" + String.join("%", keywords) + "%")
            .orderBy("entityCreateDate", QueryOrder.DESC)
            .build();
            
        return findAll(query, 100, 0, QueryOrder.DESC);
    }
}
```

## Advanced Query Features

### Complex Conditions

```java
public List<Document> findComplexDocuments() {
    QueryBuilder queryBuilder = getQueryBuilderInstance();
    
    Query query = queryBuilder
        .select()
        .from(Document.class)
        .where()
        .eq("status", "ACTIVE")
        .and()
        .group()
            .eq("ownerUserId", getCurrentUserId())
            .or()
            .eq("isPublic", true)
        .endGroup()
        .and()
        .gt("fileSize", 1024L)
        .orderBy("entityCreateDate", QueryOrder.DESC)
        .build();
        
    return findAll(query, 100, 0, QueryOrder.DESC);
}
```

### Joins and Relationships

```java
public List<Document> findDocumentsWithMetadata() {
    QueryBuilder queryBuilder = getQueryBuilderInstance();
    
    Query query = queryBuilder
        .select("d")
        .from(Document.class, "d")
        .join("d.metadata", "m")
        .where()
        .eq("d.status", "ACTIVE")
        .and()
        .eq("m.category", "IMPORTANT")
        .orderBy("d.entityCreateDate", QueryOrder.DESC)
        .build();
        
    return findAll(query, 100, 0, QueryOrder.DESC);
}
```

### Subqueries

```java
public List<Document> findDocumentsWithRecentActivity() {
    QueryBuilder queryBuilder = getQueryBuilderInstance();
    
    Query subquery = queryBuilder
        .select("a.documentId")
        .from(Activity.class, "a")
        .where()
        .gte("a.timestamp", Date.from(Instant.now().minus(7, ChronoUnit.DAYS)))
        .build();
    
    Query query = queryBuilder
        .select()
        .from(Document.class)
        .where()
        .in("id", subquery)
        .orderBy("entityCreateDate", QueryOrder.DESC)
        .build();
        
    return findAll(query, 100, 0, QueryOrder.DESC);
}
```

### Aggregation Queries

```java
public Map<String, Long> getDocumentCountByType() {
    QueryBuilder queryBuilder = getQueryBuilderInstance();
    
    Query query = queryBuilder
        .select("documentType", "COUNT(*)")
        .from(Document.class)
        .where()
        .eq("status", "ACTIVE")
        .groupBy("documentType")
        .orderBy("COUNT(*)", QueryOrder.DESC)
        .build();
        
    return executeAggregationQuery(query);
}
```

## Pagination and Sorting

### PaginableResult

Water Framework provides built-in pagination support through the `PaginableResult` interface:

```java
@FrameworkComponent
public class DocumentRepositoryImpl extends BaseJpaRepositoryImpl<Document> implements DocumentRepository {
    
    public PaginableResult<Document> findDocumentsPaginated(int page, int pageSize) {
        QueryBuilder queryBuilder = getQueryBuilderInstance();
        
        Query query = queryBuilder
            .select()
            .from(Document.class)
            .where()
            .eq("status", "ACTIVE")
            .orderBy("entityCreateDate", QueryOrder.DESC)
            .build();
            
        return findAll(query, pageSize, page, QueryOrder.DESC);
    }
    
    public PaginableResult<Document> findDocumentsByUserPaginated(String userId, int page, int pageSize) {
        QueryBuilder queryBuilder = getQueryBuilderInstance();
        
        Query query = queryBuilder
            .select()
            .from(Document.class)
            .where()
            .eq("ownerUserId", userId)
            .orderBy("entityCreateDate", QueryOrder.DESC)
            .build();
            
        return findAll(query, pageSize, page, QueryOrder.DESC);
    }
}
```

### Using PaginableResult

```java
@FrameworkComponent
public class DocumentService implements DocumentApi {
    
    @Inject
    private DocumentRepository documentRepository;
    
    public DocumentPageResponse getDocumentsPage(int page, int pageSize) {
        PaginableResult<Document> result = documentRepository.findDocumentsPaginated(page, pageSize);
        
        return DocumentPageResponse.builder()
            .documents(result.getResults())
            .currentPage(result.getCurrentPage())
            .totalPages(result.getTotalPages())
            .totalElements(result.getTotalElements())
            .hasNext(result.hasNext())
            .hasPrevious(result.hasPrevious())
            .build();
    }
}
```

### Advanced Sorting

```java
public PaginableResult<Document> findDocumentsWithMultiSort(int page, int pageSize) {
    QueryBuilder queryBuilder = getQueryBuilderInstance();
    
    Query query = queryBuilder
        .select()
        .from(Document.class)
        .where()
        .eq("status", "ACTIVE")
        .orderBy("priority", QueryOrder.DESC)
        .orderBy("entityCreateDate", QueryOrder.DESC)
        .orderBy("title", QueryOrder.ASC)
        .build();
        
    return findAll(query, pageSize, page, QueryOrder.DESC);
}
```

## Query Optimization

### Query Hints

```java
public List<Document> findDocumentsWithHints() {
    QueryBuilder queryBuilder = getQueryBuilderInstance();
    
    Query query = queryBuilder
        .select()
        .from(Document.class)
        .where()
        .eq("status", "ACTIVE")
        .orderBy("entityCreateDate", QueryOrder.DESC)
        .build();
        
    // Add query hints for optimization
    query.addHint("org.hibernate.cacheable", true);
    query.addHint("org.hibernate.cacheRegion", "documents");
    query.addHint("org.hibernate.fetchSize", 50);
    
    return findAll(query, 100, 0, QueryOrder.DESC);
}
```

### Dynamic Query Building

```java
public List<Document> findDocumentsWithDynamicFilters(DocumentFilter filter) {
    QueryBuilder queryBuilder = getQueryBuilderInstance();
    
    QueryBuilder.QueryBuilderStep queryStep = queryBuilder
        .select()
        .from(Document.class)
        .where();
    
    // Add dynamic conditions based on filter
    if (filter.getUserId() != null) {
        queryStep = queryStep.eq("ownerUserId", filter.getUserId());
    }
    
    if (filter.getDocumentType() != null) {
        queryStep = queryStep.and().eq("documentType", filter.getDocumentType());
    }
    
    if (filter.getMinSize() != null) {
        queryStep = queryStep.and().gte("fileSize", filter.getMinSize());
    }
    
    if (filter.getMaxSize() != null) {
        queryStep = queryStep.and().lte("fileSize", filter.getMaxSize());
    }
    
    if (filter.getStartDate() != null) {
        queryStep = queryStep.and().gte("entityCreateDate", filter.getStartDate());
    }
    
    if (filter.getEndDate() != null) {
        queryStep = queryStep.and().lte("entityCreateDate", filter.getEndDate());
    }
    
    Query query = queryStep
        .orderBy("entityCreateDate", QueryOrder.DESC)
        .build();
        
    return findAll(query, filter.getLimit(), 0, QueryOrder.DESC);
}
```

This comprehensive query system provides Water Framework applications with powerful, flexible, and performant data querying capabilities while maintaining type safety and following best practices. 