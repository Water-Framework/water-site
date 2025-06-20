# Validation

Water Framework provides a comprehensive validation system that automatically validates entities in SystemApi operations while supporting both standard Jakarta validation annotations and custom framework validation annotations.

## Automatic Validation in SystemApi

Water Framework automatically performs validation on all entities processed through SystemApi operations. This validation occurs transparently without requiring explicit validation calls in your service implementations.

### Validation Flow

When you call any SystemApi method (save, update, etc.), the framework automatically:

1. **Pre-validation**: Validates the entity before any database operations
2. **Constraint validation**: Checks database constraints and business rules
3. **Post-validation**: Performs any additional validation after successful operations

```java
@FrameworkComponent
public class DocumentSystemApiImpl extends BaseEntitySystemServiceImpl<Document> implements DocumentSystemApi {
    
    public DocumentSystemApiImpl() {
        super(Document.class);
    }
    
    @Override
    public Document save(Document entity) {
        // Validation is automatically performed by the framework
        // No explicit validation calls needed
        return super.save(entity);
    }
    
    @Override
    public Document update(Document entity) {
        // Validation is automatically performed by the framework
        return super.update(entity);
    }
}
```

## Jakarta Validation Support

Water Framework fully supports standard Jakarta validation annotations for entity validation.

### Standard Validation Annotations

```java
@Entity
@Table(name = "users")
public class User extends AbstractJpaEntity implements ProtectedEntity {
    
    @NotNull
    @Size(min = 3, max = 50)
    @Column(name = "username", unique = true)
    private String username;
    
    @NotNull
    @Email
    @Column(name = "email", unique = true)
    private String email;
    
    @NotNull
    @Size(min = 8, max = 100)
    @Column(name = "password")
    private String password;
    
    @Min(0)
    @Max(120)
    @Column(name = "age")
    private Integer age;
    
    @Pattern(regexp = "^[A-Z]{2}[0-9]{2}[A-Z0-9]{10,30}$")
    @Column(name = "iban")
    private String iban;
    
    @NotNull
    @Valid
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "profile_id")
    private UserProfile profile;
    
    // Getters and setters...
}
```

## Water Framework Custom Validations

The Core-validation module provides specialized validation annotations that extend beyond standard Jakarta validation capabilities.

### Custom Validation Annotations

```java
@Entity
@Table(name = "secure_documents")
public class SecureDocument extends AbstractJpaEntity implements ProtectedEntity {
    
    @NotNull
    @Column(name = "title")
    private String title;
    
    @ValidPassword
    @Column(name = "access_password")
    private String accessPassword;
    
    @NoMalitiusCode
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @PowOf2
    @Column(name = "buffer_size")
    private Integer bufferSize;
    
    @NotNullOnPersist
    @Column(name = "document_type")
    private String documentType;
    
    // Getters and setters...
}
```

### Available Custom Validations

Water Framework provides several custom validation annotations:

#### Security Validations

- **`@ValidPassword`**: Ensures password meets security requirements
  - Minimum 8 characters
  - Must contain uppercase, lowercase, numbers, and special characters
  - Prevents common weak passwords

- **`@NoMalitiusCode`**: Prevents insertion of malicious code in text fields
  - Blocks SQL injection attempts
  - Prevents XSS attacks
  - Validates against common attack patterns

#### Business Logic Validations

- **`@PowOf2`**: Validates that a number is a power of 2
  - Useful for buffer sizes, memory allocations
  - Ensures optimal performance configurations

- **`@NotNullOnPersist`**: Ensures field is not null specifically during persistence operations
  - Different from `@NotNull` which applies to all operations
  - Useful for fields that should be required only on creation

#### Custom Validation Implementation

You can create custom validators by implementing the `WaterValidator` interface:

```java
@FrameworkComponent
public class CustomDocumentValidator implements WaterValidator {
    
    @Override
    public void validate(Resource entity) {
        if (entity instanceof Document) {
            Document document = (Document) entity;
            
            // Custom validation logic
            if (document.getFileSize() != null && document.getFileSize() > 10000000) {
                throw new ValidationException("File size cannot exceed 10MB");
            }
            
            if (document.getTitle() != null && document.getTitle().contains("confidential")) {
                // Additional security checks for confidential documents
                validateConfidentialDocument(document);
            }
        }
    }
    
    private void validateConfidentialDocument(Document document) {
        // Custom validation for confidential documents
        if (document.getAccessLevel() == null || document.getAccessLevel().getLevel() < 3) {
            throw new ValidationException("Confidential documents require high access level");
        }
    }
}
```

## Repository Constraint Validation

Water Framework provides repository-level constraint validation through the `RepositoryConstraintValidator` interface:

```java
@FrameworkComponent
public class DocumentConstraintValidator implements RepositoryConstraintValidator {
    
    @Override
    public <T extends BaseEntity> void checkConstraint(T entity, Class<T> type, BaseRepository<T> entityRepository) {
        if (type.equals(Document.class)) {
            Document document = (Document) entity;
            
            // Check unique constraints
            if (document.getTitle() != null) {
                Query query = entityRepository.getQueryBuilderInstance()
                    .field("title").equalTo(document.getTitle())
                    .and()
                    .field("id").notEqualTo(document.getId())
                    .build();
                
                if (entityRepository.find(query) != null) {
                    throw new ValidationException("Document title must be unique");
                }
            }
            
            // Check business rules
            if (document.getFileSize() != null && document.getFileSize() > 5000000) {
                // Check if user has premium account for large files
                validateLargeFilePermission(document);
            }
        }
    }
    
    private void validateLargeFilePermission(Document document) {
        // Custom business logic validation
        // This could check user permissions, storage quotas, etc.
    }
}
```

## Validation Error Handling

Water Framework provides comprehensive error handling for validation failures:

```java
@FrameworkComponent
public class DocumentSystemApiImpl extends BaseEntitySystemServiceImpl<Document> implements DocumentSystemApi {
    
    @Override
    public Document save(Document entity) {
        try {
            return super.save(entity);
        } catch (ValidationException e) {
            // Handle validation errors
            log.error("Validation failed for document: {}", e.getMessage());
            throw new BusinessException("Document validation failed: " + e.getMessage());
        } catch (ConstraintViolationException e) {
            // Handle constraint violations
            log.error("Constraint violation for document: {}", e.getMessage());
            throw new BusinessException("Document constraints violated: " + e.getMessage());
        }
    }
}
```

This validation system ensures that all entities in Water Framework applications are properly validated according to both standard and custom business rules, providing robust data integrity and security. 