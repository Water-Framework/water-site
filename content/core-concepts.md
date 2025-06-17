# Core Concepts

## 1. Water Framework Overview

Water Framework is a powerful cross-framework solution designed for building microservices. It provides a unified approach to developing applications that can be deployed across different frameworks while maintaining consistent behavior and functionality.

### Key Features:
- **Cross-Framework Compatibility:** Build once, deploy anywhere - your modules can run on Spring, OSGi, Quarkus, and other frameworks
- **Ready-to-Run Projects:** Generated projects come with all necessary configurations and dependencies
- **Framework Independence:** Core business logic remains framework-agnostic
- **Modular Architecture:** Components can be used as standalone modules in any supported framework

## 2. Core API Concepts

The Core-api module defines the fundamental building blocks of the Water Framework. Here are the key concepts:

### 2.1 Component System
The framework is built around a component-based architecture, where each piece of functionality is encapsulated in a component. Components are the building blocks of your application.

### 2.2 Core Annotations
- **@FrameworkComponent:** Marks a class as a framework component, making it available for dependency injection and component registry
- **@Inject:** Enables dependency injection of other components into your class

### 2.3 Component Registry
The Component Registry is the central system that manages all components in your application. It handles:
- Component registration and discovery
- Lifecycle management
- Dependency resolution
- Component filtering and retrieval

### 2.4 Core Interfaces

#### Component and Registry
- **ComponentRegistry:** Central registry for managing component lifecycle and discovery
- **ComponentFilter:** Interface for filtering and retrieving specific components
- **ComponentConfiguration:** Defines configuration properties for components

#### Security and Permissions
- **SecurityContext:** Manages security context and user authentication state
- **PermissionManager:** Handles permission checking and management
- **Action:** Represents a specific action that can be performed on a resource
- **Permission:** Defines a specific permission that can be granted to users

#### Entity and Repository
- **BaseEntity:** Base interface for all entities in the system
- **BaseRepository:** Core interface for data access operations
- **QueryBuilder:** Builds database queries in a framework-agnostic way

#### Service Layer
- **Service:** Base interface for all services
- **RestApi:** Interface for REST API endpoints

#### Interceptors
- **MethodInterceptor:** Base interface for method interception
- **InterceptorChain:** Manages the chain of interceptors
- **InterceptorContext:** Provides context for interceptor operations

#### User and Role Management
- **UserManager:** Manages user operations and lifecycle
- **RoleManager:** Handles role management and assignment
- **UserContext:** Provides context for user-related operations

#### Validation
- **Validator:** Interface for validating objects
- **ValidationContext:** Provides context for validation operations
- **ValidationResult:** Contains validation results and errors

#### Bundle and Runtime
- **Runtime:** Core runtime interface providing access to framework services
- **ApplicationProperties:** Manages application configuration properties
- **BundleContext:** Provides context for bundle operations

#### Notification
- **NotificationManager:** Manages system notifications
- **NotificationSender:** Handles sending of notifications
- **NotificationTemplate:** Defines templates for notifications

## 3. Runtime and Security

### 3.1 Runtime Object
The Runtime object is a central piece of the framework that provides:
- Security context management
- Application properties access
- Component registry access
- Runtime configuration

### 3.2 Security System
The framework provides a robust security system with:
- Permission-based access control
- Role-based security
- Security context management
- Encryption utilities

## 4. Interceptors and Cross-Cutting Concerns

The framework makes it easy to implement cross-cutting concerns through its interceptor system:
- **@AllowPermissions:** Restricts method access based on permissions
- **@AllowGeneric:** Provides generic method interception capabilities
- Custom interceptors for logging, validation, and other concerns

## 5. Framework Implementation

Water Framework modules can be implemented for specific frameworks:
- **Spring Implementation:** Provides Spring-specific implementations of core interfaces
- **OSGi Implementation:** Enables OSGi bundle integration
- **Quarkus Implementation:** Supports Quarkus-specific features

## 6. Module Initialization

The Core-bundle module handles the initialization process:
- Component registration
- Property loading
- Runtime initialization
- Security context setup

## 7. Service Layer

The framework provides a robust service layer with:
- Base service implementations
- REST API support
- Service integration capabilities
- Event handling

## 8. Data Access

The framework abstracts data access through:
- Repository pattern implementation
- Query building
- Entity management
- Validation support 