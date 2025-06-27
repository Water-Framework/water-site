# Query System

Water Framework provides a powerful and flexible query system that abstracts database query construction across different persistence technologies. The system offers both programmatic query building and string-based query parsing, with automatic translation to native database queries (JPA Criteria API, SQL, etc.).

## Query System Architecture

### Core Components

The query system is built around several key interfaces and classes:

```java
// Core query interface
public interface Query {
    void defineOperands(Query... operands);
    String getDefinition();
    Query and(Query rightQuery);
    Query or(Query rightQuery);
    Query in(List<?> values);
    Query not();
}

// Query builder interface
public interface QueryBuilder {
    Query createQueryFilter(String filter);
    FieldNameOperand field(String name);
}

// Query order interface
public interface QueryOrder {
    List<QueryOrderParameter> getParametersList();
}
```

### Query Operation Hierarchy

Water Framework implements a comprehensive operation hierarchy:

```java
// Base operation class
public abstract class AbstractOperation implements QueryFilterOperation, Query {
    protected List<Query> operands;
    private String name;
    private String operator;
    private boolean needExpr;
    private int numOperands;
}

// Binary operations (field operator value)
public abstract class BinaryOperation extends AbstractOperation {
    // Operations: =, !=, >, >=, <, <=, LIKE
}

// Logic operations
public class AndOperation extends BinaryLogicOperation { }
public class OrOperation extends BinaryLogicOperation { }
public class NotOperation extends UnaryOperation { }

// Value operations
public class EqualTo extends BinaryValueOperation { }
public class NotEqualTo extends BinaryValueOperation { }
public class GreaterThan extends BinaryValueOperation { }
public class GreaterOrEqualThan extends BinaryValueOperation { }
public class LowerThan extends BinaryValueOperation { }
public class LowerOrEqualThan extends BinaryValueOperation { }
public class Like extends BinaryValueOperation { }
public class In extends BinaryValueListOperation { }
```

## Query Builder Patterns

### Fluent API Pattern

Water Framework provides a fluent API for building queries programmatically:

```java
@FrameworkComponent
public class DocumentRepositoryImpl extends BaseJpaRepositoryImpl<Document> implements DocumentRepository {
    
    public List<Document> findDocumentsByUserAndType(String userId, String documentType) {
        QueryBuilder queryBuilder = getQueryBuilderInstance();
        
        // Fluent API approach
        Query query = queryBuilder
            .field("ownerUserId").equalTo(userId)
            .and(queryBuilder.field("documentType").equalTo(documentType))
            .and(queryBuilder.field("status").equalTo("ACTIVE"));
            
        return findAll(query, 100, 1, null);
    }
    
    public List<Document> findDocumentsByDateRange(Date startDate, Date endDate) {
        QueryBuilder queryBuilder = getQueryBuilderInstance();
        
        Query query = queryBuilder
            .field("entityCreateDate").greaterOrEqualThan(startDate)
            .and(queryBuilder.field("entityCreateDate").lowerOrEqualThan(endDate))
            .and(queryBuilder.field("status").notEqualTo("DELETED"));
            
        return findAll(query, 50, 1, null);
    }
    
    public List<Document> findDocumentsByTags(List<String> tags) {
        QueryBuilder queryBuilder = getQueryBuilderInstance();
        
        // Using IN operation
        Query query = queryBuilder
            .field("tags").in(tags)
            .and(queryBuilder.field("status").equalTo("PUBLISHED"));
            
        return findAll(query, 100, 1, null);
    }
}
```

### String-Based Query Parsing

Water Framework also supports parsing queries from string expressions:

```java
@FrameworkComponent
public class DocumentRepositoryImpl extends BaseJpaRepositoryImpl<Document> implements DocumentRepository {
    
    public List<Document> findDocumentsWithStringQuery(String userId, int minAge) {
        QueryBuilder queryBuilder = getQueryBuilderInstance();
        
        // String-based query parsing
        Query query = queryBuilder.createQueryFilter(
            "ownerUserId = '" + userId + "' AND age >= " + minAge + " AND status = 'ACTIVE'"
        );
        
        return findAll(query, 100, 1, null);
    }
    
    public List<Document> findDocumentsWithComplexStringQuery() {
        QueryBuilder queryBuilder = getQueryBuilderInstance();
        
        // Complex string query with parentheses and logical operators
        Query query = queryBuilder.createQueryFilter(
            "(ownerUserId = 'user123' OR sharedWith LIKE '%user123%') " +
            "AND (status = 'ACTIVE' OR status = 'DRAFT') " +
            "AND entityCreateDate >= '2024-01-01'"
        );
        
        return findAll(query, 100, 1, null);
    }
}
```

## Query Operations

### Field Operations

The `FieldNameOperand` class provides methods for creating field-based operations:

```java
@FrameworkComponent
public class DocumentRepositoryImpl extends BaseJpaRepositoryImpl<Document> implements DocumentRepository {
    
    public void demonstrateFieldOperations() {
        QueryBuilder queryBuilder = getQueryBuilderInstance();
        
        // Equality operations
        Query equalQuery = queryBuilder.field("title").equalTo("Sample Document");
        Query notEqualQuery = queryBuilder.field("status").notEqualTo("DELETED");
        
        // Numeric comparisons
        Query greaterQuery = queryBuilder.field("size").greaterThan(1024);
        Query greaterEqualQuery = queryBuilder.field("size").greaterOrEqualThan(1024);
        Query lowerQuery = queryBuilder.field("size").lowerThan(1048576);
        Query lowerEqualQuery = queryBuilder.field("size").lowerOrEqualThan(1048576);
        
        // String operations
        Query likeQuery = queryBuilder.field("title").like("%sample%");
        
        // List operations
        List<String> statuses = Arrays.asList("ACTIVE", "DRAFT", "REVIEW");
        Query inQuery = queryBuilder.field("status").in(statuses);
    }
}
```

### Logical Operations

Complex queries can be built using logical operators:

```java
@FrameworkComponent
public class DocumentRepositoryImpl extends BaseJpaRepositoryImpl<Document> implements DocumentRepository {
    
    public List<Document> findComplexDocuments() {
        QueryBuilder queryBuilder = getQueryBuilderInstance();
        
        // Complex logical query
        Query query = queryBuilder
            .field("ownerUserId").equalTo("user123")
            .and(
                queryBuilder.field("status").equalTo("ACTIVE")
                .or(queryBuilder.field("status").equalTo("DRAFT"))
            )
            .and(
                queryBuilder.field("size").greaterThan(1024)
                .or(queryBuilder.field("type").equalTo("IMPORTANT"))
            )
            .not();
            
        return findAll(query, 100, 1, null);
    }
    
    public List<Document> findDocumentsWithMultipleConditions() {
        QueryBuilder queryBuilder = getQueryBuilderInstance();
        
        // Building complex conditions step by step
        Query userCondition = queryBuilder.field("ownerUserId").equalTo("user123");
        Query statusCondition = queryBuilder.field("status").equalTo("ACTIVE");
        Query dateCondition = queryBuilder.field("entityCreateDate").greaterThan(new Date());
        
        Query finalQuery = userCondition
            .and(statusCondition)
            .and(dateCondition);
            
        return findAll(finalQuery, 100, 1, null);
    }
}
```

## Query Parsing System

### QueryParser Architecture

Water Framework includes a sophisticated query parser that can parse string expressions into Query objects:

```java
public class QueryParser {
    private StreamTokenizer tokenizer;
    private static List<QueryFilterOperation> availableOperations;
    
    static {
        availableOperations = new ArrayList<>();
        availableOperations.add(new AndOperation());
        availableOperations.add(new EqualTo());
        availableOperations.add(new GreaterOrEqualThan());
        availableOperations.add(new GreaterThan());
        availableOperations.add(new Like());
        availableOperations.add(new LowerOrEqualThan());
        availableOperations.add(new LowerThan());
        availableOperations.add(new NotEqualTo());
        availableOperations.add(new NotOperation());
        availableOperations.add(new OrOperation());
    }
}
```

### Supported Query Syntax

The parser supports a rich query syntax:

```java
// Basic field comparisons
"name = 'John'"
"age > 25"
"status != 'DELETED'"
"title LIKE '%sample%'"

// Logical operators
"name = 'John' AND age > 25"
"status = 'ACTIVE' OR status = 'DRAFT'"
"NOT (status = 'DELETED')"

// Complex expressions with parentheses
"(ownerUserId = 'user123' OR sharedWith LIKE '%user123%') AND status = 'ACTIVE'"
"age >= 18 AND (status = 'ACTIVE' OR status = 'PENDING')"

// IN operations
"status IN ('ACTIVE', 'DRAFT', 'REVIEW')"
"category IN ('TECH', 'BUSINESS', 'PERSONAL')"
```

### Parsing Examples

```java
@FrameworkComponent
public class DocumentRepositoryImpl extends BaseJpaRepositoryImpl<Document> implements DocumentRepository {
    
    public void demonstrateQueryParsing() {
        QueryBuilder queryBuilder = getQueryBuilderInstance();
        
        // Simple equality
        Query simpleQuery = queryBuilder.createQueryFilter("name = 'John'");
        
        // Numeric comparison
        Query numericQuery = queryBuilder.createQueryFilter("age >= 18");
        
        // String pattern matching
        Query likeQuery = queryBuilder.createQueryFilter("title LIKE '%report%'");
        
        // Logical combinations
        Query logicalQuery = queryBuilder.createQueryFilter(
            "status = 'ACTIVE' AND (ownerUserId = 'user123' OR sharedWith LIKE '%user123%')"
        );
        
        // Complex nested conditions
        Query complexQuery = queryBuilder.createQueryFilter(
            "(category = 'TECH' OR category = 'BUSINESS') " +
            "AND (size > 1024 OR type = 'IMPORTANT') " +
            "AND NOT (status = 'DELETED')"
        );
    }
}
```

## JPA Integration

### PredicateBuilder

Water Framework automatically translates Query objects to JPA Criteria API predicates:

```java
public class PredicateBuilder<T> {
    private Root<T> entityDef;
    private CriteriaBuilder cb;
    
    public Predicate buildPredicate(Query filter) {
        if (filter instanceof AndOperation andOperation) {
            return cb.and(
                this.buildPredicate(andOperation.getOperand(0)), 
                this.buildPredicate(andOperation.getOperand(1))
            );
        } else if (filter instanceof OrOperation orOperation) {
            return cb.or(
                this.buildPredicate(orOperation.getOperand(0)), 
                this.buildPredicate(orOperation.getOperand(1))
            );
        } else if (filter instanceof NotOperation notOperation) {
            return cb.not(this.buildPredicate(notOperation.getOperand(0)));
        } else if (filter instanceof BinaryValueOperation binaryValueOperation) {
            Path p = getPathForFields((AbstractOperation) filter);
            FieldValueOperand fieldValue = (FieldValueOperand) binaryValueOperation.getOperand(1);
            
            if (filter instanceof EqualTo) {
                return cb.equal(p, convertToEntityFieldType(p.getJavaType(), fieldValue.getValue()));
            } else if (filter instanceof NotEqualTo) {
                return cb.notEqual(p, fieldValue.getValue());
            } else if (filter instanceof GreaterThan) {
                Double d = Double.parseDouble(fieldValue.getValue().toString());
                return cb.greaterThan(p, d);
            } else if (filter instanceof Like) {
                return cb.like(p, fieldValue.getDefinition());
            }
        }
        // ... other operations
    }
}
```

### Type Conversion

The system automatically handles type conversion between query values and entity field types:

```java
private Object convertToEntityFieldType(Class<?> type, Object value) {
    if (value == null || type == null) return null;
    String valueStr = value.toString();
    
    if (type.equals(String.class)) {
        return value;
    } else if (type.equals(Integer.class) || type.equals(int.class)) {
        return Integer.valueOf(valueStr);
    } else if (type.equals(Long.class) || type.equals(long.class)) {
        return Long.valueOf(valueStr);
    } else if (type.equals(Boolean.class) || type.equals(boolean.class)) {
        return Boolean.valueOf(valueStr);
    } else if (type.equals(Double.class) || type.equals(double.class)) {
        return Double.valueOf(valueStr);
    } else if (type.equals(Float.class) || type.equals(float.class)) {
        return Float.valueOf(valueStr);
    }
    
    throw new IllegalArgumentException("Not supported type: " + type.getName());
}
```

## Query Ordering

### QueryOrder Implementation

Water Framework provides flexible query ordering capabilities:

```java
public class DefaultQueryOrder implements QueryOrder {
    private Set<QueryOrderParameter> orders;
    
    public QueryOrder addOrderField(String name, boolean asc) {
        QueryOrderParameter param = new DefaultQueryOrderParameter();
        param.setName(name);
        param.setAsc(asc);
        orders.add(param);
        return this;
    }
}
```

### Ordering Examples

```java
@FrameworkComponent
public class DocumentRepositoryImpl extends BaseJpaRepositoryImpl<Document> implements DocumentRepository {
    
    public List<Document> findDocumentsWithOrdering() {
        QueryBuilder queryBuilder = getQueryBuilderInstance();
        Query query = queryBuilder.field("status").equalTo("ACTIVE");
        
        // Create ordering
        DefaultQueryOrder order = new DefaultQueryOrder();
        order.addOrderField("entityCreateDate", false);  // DESC
        order.addOrderField("title", true);              // ASC
        order.addOrderField("size", false);              // DESC
        
        return findAll(query, 100, 1, order);
    }
    
    public List<Document> findRecentDocuments() {
        QueryBuilder queryBuilder = getQueryBuilderInstance();
        Query query = queryBuilder.field("status").equalTo("ACTIVE");
        
        // Simple descending order by creation date
        DefaultQueryOrder order = new DefaultQueryOrder();
        order.addOrderField("entityCreateDate", false);
        
        return findAll(query, 50, 1, order);
    }
}
```

## Advanced Query Features

### Nested Field Access

Water Framework supports nested field access for complex entity relationships:

```java
@FrameworkComponent
public class DocumentRepositoryImpl extends BaseJpaRepositoryImpl<Document> implements DocumentRepository {
    
    public List<Document> findDocumentsByOwnerDetails() {
        QueryBuilder queryBuilder = getQueryBuilderInstance();
        
        // Access nested fields (e.g., owner.name, owner.company.id)
        Query query = queryBuilder
            .field("owner.name").like("%John%")
            .and(queryBuilder.field("owner.company.id").equalTo(123L));
            
        return findAll(query, 100, 1, null);
    }
}
```

### Dynamic Query Building

```java
@FrameworkComponent
public class DocumentRepositoryImpl extends BaseJpaRepositoryImpl<Document> implements DocumentRepository {
    
    public List<Document> findDocumentsWithDynamicFilters(Map<String, Object> filters) {
        QueryBuilder queryBuilder = getQueryBuilderInstance();
        Query finalQuery = null;
        
        for (Map.Entry<String, Object> entry : filters.entrySet()) {
            Query fieldQuery = queryBuilder.field(entry.getKey()).equalTo(entry.getValue());
            
            if (finalQuery == null) {
                finalQuery = fieldQuery;
            } else {
                finalQuery = finalQuery.and(fieldQuery);
            }
        }
        
        return finalQuery != null ? findAll(finalQuery, 100, 1, null) : new ArrayList<>();
    }
    
    public List<Document> findDocumentsWithOptionalFilters(String userId, String status, Date fromDate) {
        QueryBuilder queryBuilder = getQueryBuilderInstance();
        Query finalQuery = null;
        
        // Build query conditionally
        if (userId != null) {
            finalQuery = queryBuilder.field("ownerUserId").equalTo(userId);
        }
        
        if (status != null) {
            Query statusQuery = queryBuilder.field("status").equalTo(status);
            finalQuery = finalQuery != null ? finalQuery.and(statusQuery) : statusQuery;
        }
        
        if (fromDate != null) {
            Query dateQuery = queryBuilder.field("entityCreateDate").greaterOrEqualThan(fromDate);
            finalQuery = finalQuery != null ? finalQuery.and(dateQuery) : dateQuery;
        }
        
        return finalQuery != null ? findAll(finalQuery, 100, 1, null) : new ArrayList<>();
    }
}
```

## Performance Optimization

### Query Optimization Techniques

```java
@FrameworkComponent
public class DocumentRepositoryImpl extends BaseJpaRepositoryImpl<Document> implements DocumentRepository {
    
    public List<Document> findOptimizedDocuments() {
        QueryBuilder queryBuilder = getQueryBuilderInstance();
        
        // Use indexed fields first
        Query query = queryBuilder
            .field("ownerUserId").equalTo("user123")  // Indexed field
            .and(queryBuilder.field("status").equalTo("ACTIVE"))  // Indexed field
            .and(queryBuilder.field("title").like("%report%"));   // Non-indexed field
            
        // Add ordering for efficient pagination
        DefaultQueryOrder order = new DefaultQueryOrder();
        order.addOrderField("entityCreateDate", false);
        
        return findAll(query, 50, 1, order);
    }
    
    public List<Document> findDocumentsWithEfficientPagination(int page, int size) {
        QueryBuilder queryBuilder = getQueryBuilderInstance();
        Query query = queryBuilder.field("status").equalTo("ACTIVE");
        
        // Use indexed field for ordering
        DefaultQueryOrder order = new DefaultQueryOrder();
        order.addOrderField("id", false);  // Primary key ordering is most efficient
        
        return findAll(query, size, page, order);
    }
}
```

## Query System Benefits

### **Technology Abstraction**
- **Database Agnostic**: Same query syntax works across different databases
- **Framework Independent**: Queries work in Spring, OSGi, and Quarkus environments
- **Automatic Translation**: Queries are automatically translated to native database syntax

### **Type Safety**
- **Compile-Time Validation**: Field names and operations are validated at compile time
- **Type Conversion**: Automatic conversion between query values and entity field types
- **Null Safety**: Proper handling of null values in queries

### **Performance**
- **Optimized Translation**: Efficient translation to native database queries
- **Index Awareness**: Support for using indexed fields in queries
- **Pagination Support**: Built-in support for efficient pagination

### **Flexibility**
- **Multiple Syntaxes**: Support for both programmatic and string-based queries
- **Complex Operations**: Support for nested conditions, logical operators, and list operations
- **Dynamic Queries**: Ability to build queries dynamically based on runtime conditions

### **Maintainability**
- **Readable Syntax**: Clear and intuitive query syntax
- **Reusable Components**: Query components can be reused across different queries
- **Debugging Support**: Query definitions can be easily inspected and debugged

This comprehensive query system ensures that Water Framework applications have powerful, flexible, and performant data access capabilities while maintaining clean and maintainable code. 