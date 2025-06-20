# Security & Permissions

## Permission Enforcement in API Services

While `@AccessControl` defines default behavior applied only at startup, developers must use permission annotations like `@AllowPermission` in API services to enforce permission checks before method execution. These annotations are checked at runtime for every method call.

### Permission Annotation Types

Water Framework provides several permission annotation types for different use cases:

#### **@AllowPermission - Entity-Specific Permissions**
Checks specific permissions on entity instances (requires entity parameter or ID):

```java
@AllowPermission(action = CrudActions.SAVE)
public Document createDocument(Document document) {
    return save(document);
}

@AllowPermission(action = CrudActions.UPDATE)
public Document updateDocument(Document document) {
    return update(document);
}

@AllowPermission(action = CrudActions.FIND)
public Document findDocument(String id) {
    return find(id);
}

@AllowPermission(action = CrudActions.FIND_ALL)
public List<Document> getAllDocuments() {
    return findAll();
}

@AllowPermission(action = CrudActions.REMOVE)
public void deleteDocument(String id) {
    remove(id);
}
```

#### **@AllowGenericPermissions - Resource Type Permissions**
Checks generic permissions on resource types (doesn't require specific entity):

```java
@AllowGenericPermissions(actions = {CrudActions.SAVE, CrudActions.UPDATE})
public void performBulkOperation(List<Document> documents) {
    // Bulk operation implementation
}
```

#### **@AllowRoles - Role-Based Access Control**
Checks if user has specific roles:

```java
@AllowRoles(roles = {"admin", "manager"})
public void performAdminOperation() {
    // Admin-only operation
}
```

#### **@AllowLoggedUser - Basic Authentication**
Ensures method is called only by authenticated users:

```java
@AllowLoggedUser
public UserProfile getCurrentUserProfile() {
    return getCurrentUser();
}
```

#### **@AllowPermissionsOnReturn - Return Object Permissions**
Checks permissions on the object returned by the method:

```java
@AllowPermissionsOnReturn(action = CrudActions.FIND)
public Document getSharedDocument(String id) {
    return find(id);
}
```

### Complete API Service Example

```java
@Service
public class DocumentApi extends BaseEntityApi<Document> {
    
    // Standard CRUD operations with automatic permission checking
    @AllowPermission(action = CrudActions.SAVE)
    public Document createDocument(Document document) {
        return super.save(document);
    }
    
    @AllowPermission(action = CrudActions.UPDATE)
    public Document updateDocument(Document document) {
        return super.update(document);
    }
    
    @AllowPermission(action = CrudActions.FIND)
    public Document findDocument(String id) {
        return super.find(id);
    }
    
    @AllowPermission(action = CrudActions.FIND_ALL)
    public List<Document> getAllDocuments() {
        return super.findAll();
    }
    
    @AllowPermission(action = CrudActions.REMOVE)
    public void deleteDocument(String id) {
        super.remove(id);
    }
    
    // Custom business methods with specific permissions
    @AllowPermission(action = "SHARE")
    public void shareDocument(String documentId, String userId) {
        // Share logic implementation
    }
    
    @AllowPermission(action = "ARCHIVE")
    public Document archiveDocument(String id) {
        Document doc = findDocument(id);
        doc.setArchived(true);
        return updateDocument(doc);
    }
}
```

### Best Practices

1. **Always Use Annotations**: Every public method in API services should have appropriate permission annotations
2. **Choose the Right Annotation**: 
   - Use `@AllowPermission` for entity-specific operations
   - Use `@AllowGenericPermissions` for general resource operations
   - Use `@AllowRoles` for role-based access control
   - Use `@AllowLoggedUser` for basic authentication checks
3. **Be Specific with Actions**: Use the most specific action names possible
4. **Test Permissions**: Always test with different user roles to ensure proper access control
5. **Document Custom Actions**: Clearly document any custom actions defined in your entities
6. **Use Return Permissions Carefully**: `@AllowPermissionsOnReturn` should only be used when the returned object needs permission validation
7. **Avoid Generic Permissions for Sensitive Operations**: Use specific permissions for operations that modify or delete data

### Key Security Principles

#### **1. Security by Design**
- **Automatic Permission Checking**: All public API calls are automatically secured
- **Role-Based Access Control**: Default roles and permissions for common operations
- **Resource-Level Security**: Fine-grained control over entity access

#### **2. Separation of Concerns**
- **Public APIs**: Handle external requests with permission checking
- **System APIs**: Handle internal operations without permission overhead
- **REST APIs**: Expose public APIs as HTTP endpoints

#### **3. Performance Optimization**
- **System APIs**: Bypass permission checking for internal operations
- **Lazy Loading**: Dependencies injected only when needed
- **Caching**: Built-in caching for frequently accessed data

This permission enforcement system ensures that Water Framework applications maintain strict security boundaries while providing developers with clear, declarative control over access permissions. 