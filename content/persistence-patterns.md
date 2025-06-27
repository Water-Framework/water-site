# Persistence Patterns

Water Framework provides a comprehensive data access layer that abstracts persistence concerns and provides consistent patterns for database operations across different persistence technologies.

## Overview

The persistence layer in Water Framework is organized into three main areas:

### [JPA Repository Framework](jpa-repository.md)
The core repository pattern implementation providing:
- **Repository Pattern**: Base repository interface and implementation
- **Transaction Management**: Programmatic transaction control and transaction types
- **Data Access Patterns**: Repository with custom queries and batch operations
- **Performance Optimization**: Query optimization and caching strategies

### [Query System](query-system.md)
Powerful query building and execution capabilities including:
- **Query Builder**: Fluent API for constructing complex database queries
- **Advanced Query Features**: Complex conditions, joins, subqueries, and aggregations
- **Pagination and Sorting**: Built-in pagination support with PaginableResult
- **Query Optimization**: Query hints and dynamic query building

### [Entity Extensions](entity-extension.md)
Flexible entity customization and extension patterns:
- **Entity Expansion Pattern**: Extending entities with additional functionality
- **Validation Extensions**: Custom validation and business rule extensions
- **Lifecycle Extensions**: Pre/post persist, update, and remove hooks
- **Computed Field Extensions**: Dynamic field computation and integration

## Key Benefits

### **Consistency Across Technologies**
Water Framework's persistence layer provides consistent patterns regardless of the underlying persistence technology (JPA, Hibernate, etc.).

### **Type Safety**
All query building and repository operations maintain full type safety through generics and compile-time checking.

### **Performance Optimization**
Built-in support for caching, query optimization, and batch operations ensures optimal performance for enterprise applications.

### **Extensibility**
The entity extension system allows for flexible customization without modifying core entity classes, following the Open/Closed Principle.

### **Transaction Management**
Comprehensive transaction management with support for various transaction types and programmatic control.

## Quick Start

To get started with Water Framework persistence:

1. **Define your entities** extending `AbstractJpaEntity`
2. **Create repository interfaces** extending `BaseRepository<T>`
3. **Implement repositories** extending `BaseJpaRepositoryImpl<T>`
4. **Use the query builder** for complex queries
5. **Apply entity extensions** for custom functionality

For detailed information on each aspect, refer to the specific documentation sections above. 