# Entity Extensions

Water Framework provides powerful entity extension capabilities that allow developers to extend and customize entities without modifying the core entity classes. This approach follows the Open/Closed Principle and enables flexible entity customization.

## Entity Expansion Pattern

### AbstractJpaEntityExpansion

Water Framework provides the `AbstractJpaEntityExpansion` class for extending entities with additional functionality:

```java
@FrameworkComponent
public class UserExpansion extends AbstractJpaEntityExpansion<User> {
    
    @Inject
    private UserProfileRepository userProfileRepository;
    
    @Inject
    private UserPreferencesRepository userPreferencesRepository;
    
    public UserExpansion() {
        super(User.class);
    }
    
    @Override
    public void expand(User user) {
        // Load additional data
        UserProfile profile = userProfileRepository.findByUserId(user.getId());
        UserPreferences preferences = userPreferencesRepository.findByUserId(user.getId());
        
        // Set expanded data
        user.setProfile(profile);
        user.setPreferences(preferences);
    }
    
    @Override
    public void expand(List<User> users) {
        // Batch load additional data for multiple users
        List<Long> userIds = users.stream()
            .map(User::getId)
            .collect(Collectors.toList());
            
        Map<Long, UserProfile> profiles = userProfileRepository.findByUserIds(userIds);
        Map<Long, UserPreferences> preferences = userPreferencesRepository.findByUserIds(userIds);
        
        // Set expanded data for each user
        for (User user : users) {
            user.setProfile(profiles.get(user.getId()));
            user.setPreferences(preferences.get(user.getId()));
        }
    }
}
```

### Entity Expansion Registration

```java
@FrameworkComponent
public class EntityExpansionRegistry {
    
    private Map<Class<? extends BaseEntity>, List<EntityExpansion<?>>> expansions = new HashMap<>();
    
    @Inject
    private List<EntityExpansion<?>> allExpansions;
    
    @OnActivate
    public void activate() {
        // Register all entity expansions
        for (EntityExpansion<?> expansion : allExpansions) {
            Class<? extends BaseEntity> entityType = expansion.getEntityType();
            expansions.computeIfAbsent(entityType, k -> new ArrayList<>()).add(expansion);
        }
    }
    
    public <T extends BaseEntity> void expand(T entity) {
        List<EntityExpansion<?>> entityExpansions = expansions.get(entity.getClass());
        if (entityExpansions != null) {
            for (EntityExpansion<?> expansion : entityExpansions) {
                ((EntityExpansion<T>) expansion).expand(entity);
            }
        }
    }
    
    public <T extends BaseEntity> void expand(List<T> entities) {
        if (entities.isEmpty()) return;
        
        Class<? extends BaseEntity> entityType = entities.get(0).getClass();
        List<EntityExpansion<?>> entityExpansions = expansions.get(entityType);
        
        if (entityExpansions != null) {
            for (EntityExpansion<?> expansion : entityExpansions) {
                ((EntityExpansion<T>) expansion).expand(entities);
            }
        }
    }
}
```

## Validation Extensions

### Custom Validation Extensions

```java
@FrameworkComponent
public class UserValidationExtension extends AbstractJpaEntityExpansion<User> {
    
    @Inject
    private UserRepository userRepository;
    
    public UserValidationExtension() {
        super(User.class);
    }
    
    @Override
    public void validate(User user) {
        // Custom validation logic
        if (user.getEmail() != null) {
            // Check if email is already taken by another user
            User existingUser = userRepository.findByEmail(user.getEmail());
            if (existingUser != null && !existingUser.getId().equals(user.getId())) {
                throw new ValidationException("Email already exists: " + user.getEmail());
            }
        }
        
        // Validate username uniqueness
        if (user.getUsername() != null) {
            User existingUser = userRepository.findByUsername(user.getUsername());
            if (existingUser != null && !existingUser.getId().equals(user.getId())) {
                throw new ValidationException("Username already exists: " + user.getUsername());
            }
        }
        
        // Validate password strength
        if (user.getPassword() != null) {
            validatePasswordStrength(user.getPassword());
        }
    }
    
    private void validatePasswordStrength(String password) {
        if (password.length() < 8) {
            throw new ValidationException("Password must be at least 8 characters long");
        }
        
        if (!password.matches(".*[A-Z].*")) {
            throw new ValidationException("Password must contain at least one uppercase letter");
        }
        
        if (!password.matches(".*[a-z].*")) {
            throw new ValidationException("Password must contain at least one lowercase letter");
        }
        
        if (!password.matches(".*[0-9].*")) {
            throw new ValidationException("Password must contain at least one digit");
        }
    }
}
```

### Business Rule Extensions

```java
@FrameworkComponent
public class DocumentBusinessRuleExtension extends AbstractJpaEntityExpansion<Document> {
    
    @Inject
    private UserRepository userRepository;
    
    @Inject
    private StorageService storageService;
    
    public DocumentBusinessRuleExtension() {
        super(Document.class);
    }
    
    @Override
    public void validate(Document document) {
        // Check user permissions
        User owner = userRepository.find(document.getOwnerUserId());
        if (owner == null) {
            throw new ValidationException("Document owner does not exist");
        }
        
        // Check storage quota
        long userStorageUsed = storageService.getUserStorageUsed(document.getOwnerUserId());
        long documentSize = document.getFileSize() != null ? document.getFileSize() : 0;
        long userQuota = owner.getStorageQuota();
        
        if (userStorageUsed + documentSize > userQuota) {
            throw new ValidationException("Storage quota exceeded");
        }
        
        // Validate file type
        if (document.getMimeType() != null) {
            validateFileType(document.getMimeType());
        }
    }
    
    private void validateFileType(String mimeType) {
        List<String> allowedTypes = Arrays.asList(
            "application/pdf",
            "text/plain",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );
        
        if (!allowedTypes.contains(mimeType)) {
            throw new ValidationException("File type not allowed: " + mimeType);
        }
    }
}
```

## Lifecycle Extensions

### Pre-Persist Extensions

```java
@FrameworkComponent
public class UserLifecycleExtension extends AbstractJpaEntityExpansion<User> {
    
    @Inject
    private EmailService emailService;
    
    @Inject
    private AuditService auditService;
    
    public UserLifecycleExtension() {
        super(User.class);
    }
    
    @Override
    public void prePersist(User user) {
        // Set default values
        if (user.getStatus() == null) {
            user.setStatus(UserStatus.PENDING);
        }
        
        if (user.getCreatedDate() == null) {
            user.setCreatedDate(new Date());
        }
        
        // Generate verification token for new users
        if (user.getVerificationToken() == null) {
            user.setVerificationToken(generateVerificationToken());
        }
        
        // Hash password if not already hashed
        if (user.getPassword() != null && !user.getPassword().startsWith("$2a$")) {
            user.setPassword(hashPassword(user.getPassword()));
        }
    }
    
    @Override
    public void postPersist(User user) {
        // Send welcome email
        emailService.sendWelcomeEmail(user);
        
        // Create audit record
        auditService.recordUserCreated(user);
    }
    
    @Override
    public void preUpdate(User user) {
        // Update modification date
        user.setModifiedDate(new Date());
        
        // Hash password if changed
        if (user.getPassword() != null && !user.getPassword().startsWith("$2a$")) {
            user.setPassword(hashPassword(user.getPassword()));
        }
    }
    
    @Override
    public void postUpdate(User user) {
        // Create audit record
        auditService.recordUserUpdated(user);
    }
    
    @Override
    public void preRemove(User user) {
        // Cleanup user data
        cleanupUserData(user);
    }
    
    @Override
    public void postRemove(User user) {
        // Create audit record
        auditService.recordUserDeleted(user);
    }
    
    private String generateVerificationToken() {
        return UUID.randomUUID().toString();
    }
    
    private String hashPassword(String password) {
        return BCrypt.hashpw(password, BCrypt.gensalt());
    }
    
    private void cleanupUserData(User user) {
        // Implementation for cleaning up user-related data
    }
}
```

## Computed Field Extensions

### Dynamic Field Computation

```java
@FrameworkComponent
public class DocumentComputedFieldExtension extends AbstractJpaEntityExpansion<Document> {
    
    @Inject
    private UserRepository userRepository;
    
    @Inject
    private DocumentVersionRepository versionRepository;
    
    public DocumentComputedFieldExtension() {
        super(Document.class);
    }
    
    @Override
    public void expand(Document document) {
        // Compute owner name
        if (document.getOwnerUserId() != null) {
            User owner = userRepository.find(document.getOwnerUserId());
            if (owner != null) {
                document.setOwnerName(owner.getFullName());
            }
        }
        
        // Compute version count
        long versionCount = versionRepository.countByDocumentId(document.getId());
        document.setVersionCount(versionCount);
        
        // Compute file size in human readable format
        if (document.getFileSize() != null) {
            document.setFileSizeFormatted(formatFileSize(document.getFileSize()));
        }
        
        // Compute age
        if (document.getEntityCreateDate() != null) {
            document.setAge(computeAge(document.getEntityCreateDate()));
        }
    }
    
    private String formatFileSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        if (bytes < 1024 * 1024 * 1024) return String.format("%.1f MB", bytes / (1024.0 * 1024.0));
        return String.format("%.1f GB", bytes / (1024.0 * 1024.0 * 1024.0));
    }
    
    private String computeAge(Date createDate) {
        long diffInMillis = System.currentTimeMillis() - createDate.getTime();
        long diffInDays = diffInMillis / (24 * 60 * 60 * 1000);
        
        if (diffInDays == 0) return "Today";
        if (diffInDays == 1) return "Yesterday";
        if (diffInDays < 7) return diffInDays + " days ago";
        if (diffInDays < 30) return (diffInDays / 7) + " weeks ago";
        if (diffInDays < 365) return (diffInDays / 30) + " months ago";
        return (diffInDays / 365) + " years ago";
    }
}
```

## Extension Integration

### Repository Integration

```java
@FrameworkComponent
public class ExtendedDocumentRepositoryImpl extends BaseJpaRepositoryImpl<Document> implements DocumentRepository {
    
    @Inject
    private EntityExpansionRegistry expansionRegistry;
    
    public ExtendedDocumentRepositoryImpl() {
        super(Document.class);
    }
    
    @Override
    public Document find(long id) {
        Document document = super.find(id);
        if (document != null) {
            expansionRegistry.expand(document);
        }
        return document;
    }
    
    @Override
    public PaginableResult<Document> findAll(Query filter, int delta, int page, QueryOrder queryOrder) {
        PaginableResult<Document> result = super.findAll(filter, delta, page, queryOrder);
        if (result.getResults() != null && !result.getResults().isEmpty()) {
            expansionRegistry.expand(result.getResults());
        }
        return result;
    }
    
    @Override
    public Document persist(Document entity) {
        // Apply pre-persist extensions
        expansionRegistry.prePersist(entity);
        
        Document persisted = super.persist(entity);
        
        // Apply post-persist extensions
        expansionRegistry.postPersist(persisted);
        
        return persisted;
    }
    
    @Override
    public Document update(Document entity) {
        // Apply pre-update extensions
        expansionRegistry.preUpdate(entity);
        
        Document updated = super.update(entity);
        
        // Apply post-update extensions
        expansionRegistry.postUpdate(updated);
        
        return updated;
    }
    
    @Override
    public void remove(long id) {
        Document entity = find(id);
        if (entity != null) {
            // Apply pre-remove extensions
            expansionRegistry.preRemove(entity);
            
            super.remove(id);
            
            // Apply post-remove extensions
            expansionRegistry.postRemove(entity);
        }
    }
}
```

This comprehensive entity extension system provides Water Framework applications with flexible, maintainable, and powerful entity customization capabilities while following best practices and design patterns. 