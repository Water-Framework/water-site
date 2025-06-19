# Getting Started with Water Framework

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation](#installation)
3. [Water Generator Commands](#water-generator-commands)
4. [Creating Your First Project](#creating-your-first-project)
5. [Running Your Project](#running-your-project)
6. [Water Framework Key Features](#water-framework-key-features)
7. [Next Steps](#next-steps)
8. [Water Framework Philosophy](#water-framework-philosophy)

---

This guide will walk you through setting up Water Framework and creating your first project. Water Framework is a "cross-framework" that allows you to write modular applications that can run on different Java runtimes such as Spring, OSGi, Quarkus, and more.

## System Requirements

Before you begin, ensure your system meets these requirements:

### Required Software

- **Java 17 or higher** - Water Framework requires Java 17+ for modern language features
- **Gradle 7.6 or higher** - For building and managing dependencies
- **Node.js 18.20.8 or higher** - For the Water Generator tool

### Verify Your Installation

Check your current versions:

```bash
# Check Java version
java --version

# Check Gradle version
gradle --version

# Check Node.js version
node --version

# Check npm version
npm --version
```

If any of these are missing or outdated, install/update them before proceeding.

**Note**: If you're using NVM and don't have Node.js 18.20.8, switch to it:
```bash
nvm use 18.20.8
```

## Installation

### Step 1: Install the Water Generator

The Water Generator is a Yeoman-based tool that scaffolds Water Framework projects. Install it using the ACSoftware repository:

```bash
# Install the Water Generator globally
npm install -g yo generator-water --registry https://nexus.acsoftware.it/nexus/repository/npm-acs-public-repo
```

**What this does:**
- Installs Yeoman (`yo`) - a scaffolding tool for web applications
- Installs the Water Generator (`generator-water`) - creates Water Framework projects
- Uses the ACSoftware private registry for secure package distribution

### Step 2: Verify Generator Installation

```bash
# Check available generators
yo --generators

# You should see 'water' in the list
# Or run the help command to see all available commands
yo water:help
```

## Water Generator Commands

The Water Generator provides several commands to help you manage your projects:

### Available Commands

```bash
yo water:help                    # Show help and available commands
yo water:app                     # Print info about the water generator
yo water:new-project             # Scaffolds a new project
yo water:add-entity              # Adds new entity on existing project
yo water:add-rest-services       # Adds rest service modules on an existing project
yo water:new-empty-module        # Creates a new empty module into an existing project
yo water:new-entity-extension    # Scaffolds classes to create an entity extension
yo water:build                   # Launch build on workspace projects
yo water:build-all               # Launch build on all workspace projects
yo water:projects-order          # Define projects precedence for build and deploy
yo water:projects-order-show     # Show current projects order
yo water:publish                 # Publish project to Maven repository
yo water:publish-all             # Publish ALL workspace projects to Maven repository
yo water:stabilityMetrics        # Prints stability metrics about software quality
```

### Command Details

#### Project Management
- **`yo water:new-project`** - Creates a new Water Framework project with interactive prompts
- **`yo water:add-entity`** - Adds a new entity to an existing project
- **`yo water:add-rest-services`** - Adds REST service modules to an existing project
- **`yo water:new-empty-module`** - Creates a new empty module within an existing project
- **`yo water:new-entity-extension`** - Scaffolds classes for entity extensions

#### Build Management
- **`yo water:build --projects Project1,Project2`** - Build specific projects
- **`yo water:build-all`** - Build all workspace projects
- **`yo water:projects-order`** - Configure build order for projects
- **`yo water:projects-order-show`** - Display current project build order

#### Publishing
- **`yo water:publish`** - Publish a single project to Maven repository
- **`yo water:publish-all`** - Publish all workspace projects to Maven repository

#### Quality Analysis
- **`yo water:stabilityMetrics --projects ...`** - Analyze software quality and stability metrics

## Creating Your First Project

### Step 3: Generate a New Project

```bash
# Create a new Water Framework project
yo water:new-project
```

The generator will ask you several questions to configure your project. Here's what each question means and how to answer:

#### Project Configuration Questions

**1. Technology Selection**
```
? Which technology should be used? (Use arrow keys)
❯ Water
  Spring 3.X
  OSGi
  Quarkus
```
- **What it does**: Chooses the runtime environment and framework implementation for your application
- **Water**: Cross-framework mode that can run on multiple runtimes
- **Spring 3.X**: Full Spring Boot integration with auto-configuration
- **OSGi**: Modular OSGi bundles with Karaf container
- **Quarkus**: Cloud-native framework with GraalVM support
- **Recommendation**: Start with "Water" for cross-framework compatibility

**2. Project Name**
```
? Project-Name (my-awesome-project)
```
- **What it does**: Sets the name for your project directory and artifact
- **Recommendation**: Use lowercase with hyphens (e.g., `my-awesome-project`)
- **Impact**: This becomes your project folder name and Maven/Gradle artifact ID

**3. Group ID**
```
? Group ID (com.myawesomeproject)
```
- **What it does**: Sets the Maven/Gradle group identifier for your project
- **Default**: Automatically generated from project name (e.g., `com.myawesomeproject`)
- **Recommendation**: Use reverse domain notation (e.g., `com.company.project`)
- **Impact**: Used in Maven coordinates and package structure

**4. Version (Conditional)**
```
? Version (1.0.0)
```
- **What it does**: Sets the project version number
- **When asked**: Only for non-Water technology projects
- **Default**: 1.0.0
- **Recommendation**: Follow semantic versioning (MAJOR.MINOR.PATCH)

**5. Application Type**
```
? Select application type: (Use arrow keys)
❯ Application with persistence
  Integration application
```
- **What it does**: Determines the type of application you're building
- **Application with persistence**: Entity-based application with database persistence
- **Integration application**: Service-based application for integration scenarios
- **Recommendation**: Choose "Application with persistence" for most use cases

**6. Model Definition (Conditional)**
```
? Does Your service project has model to be defined? (Y/n)
```
- **What it does**: Determines if your service project needs data models
- **When asked**: Only for "Integration application" type
- **Default**: false
- **Recommendation**: Yes if you need to define data structures

**7. Model Name (Conditional)**
```
? Please insert model name? (MyEntityName)
```
- **What it does**: Sets the name for your main entity/model class
- **When asked**: For entity applications or service applications with models
- **Default**: MyEntityName
- **Recommendation**: Use PascalCase (e.g., `User`, `Document`, `Order`)
- **Impact**: This becomes your main entity class name

**8. Protected Entity (Conditional)**
```
? Is your aggregate model a "protected entity" so its access should be controlled by the Permission System? (Y/n)
```
- **What it does**: Enables Water Framework's permission system for your entity
- **When asked**: Only for "Application with persistence" type
- **Default**: false
- **Benefits**: Automatic CRUD permission management, role-based access control
- **Recommendation**: Yes for applications requiring security

**9. Owned Entity (Conditional)**
```
? Is your aggregate model an "owned entity"? (Y/n)
```
- **What it does**: Enables ownership tracking for your entity
- **When asked**: Only for "Application with persistence" type
- **Default**: false
- **Benefits**: Automatic owner assignment, ownership-based filtering
- **Recommendation**: Yes if entities should belong to specific users

**10. Spring Repository (Conditional)**
```
? Would you like to use Spring repository instead of spring Water default repositories? (Y/n)
```
- **What it does**: Chooses between Spring Data JPA repositories and Water Framework repositories
- **When asked**: Only for Spring technology with entity applications
- **Default**: true
- **Spring repositories**: Standard Spring Data JPA with query methods
- **Water repositories**: Enhanced repositories with events, validation, and permissions
- **Recommendation**: Use Water repositories for better integration

**11. REST Services**
```
? Project has rest services? (Y/n)
```
- **What it does**: Determines if your project should include REST API endpoints
- **Default**: true
- **Benefits**: HTTP API endpoints, JSON responses, automatic CRUD operations
- **Recommendation**: Yes for web applications or mobile apps

**12. REST Context Root (Conditional)**
```
? Please insert your rest context root ex. /myEntity? (/myEntityNames)
```
- **What it does**: Sets the base URL path for your REST API
- **When asked**: Only if REST services are enabled
- **Default**: Automatically generated from model name (e.g., `/myEntityNames`)
- **Example**: `/users`, `/documents`, `/orders`
- **Impact**: Your API will be available at `http://localhost:8080/context-root`

**13. Authentication (Conditional)**
```
? Do you want to add automatic login management to your rest services (@Login annotation)? (Y/n)
```
- **What it does**: Enables automatic authentication for REST endpoints
- **When asked**: Only if REST services are enabled
- **Default**: true
- **Benefits**: Automatic login validation, JWT token support, secure endpoints
- **Recommendation**: Yes for applications requiring user authentication

**14. Additional Modules**
```
? Do you want to add other modules to have out of the box features? (Y/n)
```
- **What it does**: Allows you to include additional Water Framework modules
- **Default**: false
- **Benefits**: Pre-built functionality for common enterprise features
- **Recommendation**: Yes if you need user management, permissions, or shared entities

**15. Module Selection (Conditional)**
```
? Please select modules you want to add to your microservice? (Use arrow keys)
❯ User Integration - for querying user's services remotely
  Role Integration - for querying role's services remotely
  Permission - to integrate permission management locally
  Shared Entity Integration - for querying shared entity's services remotely
```
- **What it does**: Choose specific Water Framework modules to include
- **When asked**: Only if additional modules are enabled
- **User Integration**: Remote user service queries
- **Role Integration**: Remote role service queries
- **Permission**: Local permission management system
- **Shared Entity**: Remote shared entity service queries
- **Recommendation**: Select based on your application needs

**16. Maven Repository Publishing**
```
? Project should be deployed to remote maven repository? (Y/n)
```
- **What it does**: Configures Maven repository publishing settings
- **Default**: false
- **Benefits**: Automated deployment to Maven repositories
- **Recommendation**: Yes for libraries or shared components

**17. Repository Name (Conditional)**
```
? Please insert publish repo symbolic name? (My Repository)
```
- **What it does**: Sets a descriptive name for the Maven repository
- **When asked**: Only if Maven publishing is enabled
- **Default**: "My Repository"
- **Example**: "ACSoftware Nexus", "Company Maven Repo"

**18. Repository URL (Conditional)**
```
? Please insert publish repo URL? (https://myrepo/m2)
```
- **What it does**: Sets the URL for the Maven repository
- **When asked**: Only if Maven publishing is enabled
- **Default**: "https://myrepo/m2"
- **Example**: "https://nexus.company.com/repository/maven-releases"

**19. Repository Authentication (Conditional)**
```
? Repository requires authentication? (Y/n)
```
- **What it does**: Determines if the Maven repository requires credentials
- **When asked**: Only if Maven publishing is enabled
- **Default**: false
- **Impact**: Affects how credentials are configured in build files

**20. SonarQube Integration**
```
? Do you want to add Sonarqube properties for Sonarqube integration? (Y/n)
```
- **What it does**: Adds SonarQube configuration for code quality analysis
- **Default**: false
- **Benefits**: Code quality metrics, security analysis, technical debt tracking
- **Recommendation**: Yes for enterprise projects or open-source libraries

### Step 4: Project Structure

After generation, your project will have a multi-module structure following Water Framework conventions. Based on the configuration from the Book project example, here's what you'll get:

#### Root Project Structure

```
Book/                                    # Root project directory
├── .yo-rc.json                         # Generator configuration (contains all your answers)
├── build.gradle                        # Root build configuration
├── settings.gradle                     # Project settings and module inclusion
├── gradle.properties                   # Gradle properties and versions
├── gradlew                             # Gradle wrapper script (Unix)
├── gradlew.bat                         # Gradle wrapper script (Windows)
├── gradle/                             # Gradle wrapper files
├── .gitignore                          # Git ignore rules
├── License.md                          # Project license
├── README.md                           # Project documentation
├── Book-api/                           # API module (interfaces and contracts)
├── Book-model/                         # Model module (entities and data classes)
├── Book-service/                       # Service module (business logic)
└── Book-service-spring/                # Spring-specific implementation
```

#### Module Structure

**Book-api Module** (Interfaces and Contracts)
```
Book-api/
├── build.gradle                        # API module build configuration
├── lombok.config                       # Lombok configuration
├── README.md                           # API documentation
└── src/
    └── main/
        └── java/
            └── com/
                └── book/
                    └── api/
                        ├── QuartaApi.java              # Entity API interface
                        ├── QuartaRepository.java       # Repository interface
                        ├── QuartaSystemApi.java        # System API interface
                        ├── AuthorApi.java              # Additional entity APIs
                        ├── EditorApi.java              # Additional entity APIs
                        ├── TerzaApi.java               # Additional entity APIs
                        ├── MyEntityNameApi.java        # Default entity API
                        └── rest/                       # REST API interfaces
```

**Book-model Module** (Entities and Data Classes)
```
Book-model/
├── build.gradle                        # Model module build configuration
├── lombok.config                       # Lombok configuration
├── README.md                           # Model documentation
└── src/
    └── main/
        └── java/
            └── com/
                └── book/
                    └── model/
                        ├── Quarta.java                 # Main entity class
                        ├── Author.java                 # Additional entities
                        ├── Editor.java                 # Additional entities
                        ├── Terza.java                  # Additional entities
                        └── MyEntityName.java           # Default entity
```

**Book-service Module** (Business Logic Implementation)
```
Book-service/
├── build.gradle                        # Service module build configuration
├── bnd.bnd                             # OSGi bundle configuration
├── lombok.config                       # Lombok configuration
├── README.md                           # Service documentation
└── src/
    └── main/
        └── java/
            └── com/
                └── book/
                    ├── repository/                     # Repository implementations
                    │   ├── QuartaRepositoryImpl.java
                    │   ├── AuthorRepositoryImpl.java
                    │   ├── EditorRepositoryImpl.java
                    │   ├── TerzaRepositoryImpl.java
                    │   └── MyEntityNameRepositoryImpl.java
                    └── service/                        # Service implementations
                        ├── QuartaServiceImpl.java
                        ├── AuthorServiceImpl.java
                        ├── EditorServiceImpl.java
                        ├── TerzaServiceImpl.java
                        ├── MyEntityNameServiceImpl.java
                        └── rest/                        # REST service implementations
                            ├── QuartaRestApiImpl.java
                            ├── AuthorRestApiImpl.java
                            ├── EditorRestApiImpl.java
                            ├── TerzaRestApiImpl.java
                            └── MyEntityNameRestApiImpl.java
```

**Book-service-spring Module** (Spring Boot Implementation)
```
Book-service-spring/
├── build.gradle                        # Spring module build configuration
└── src/
    └── main/
        ├── java/
        │   └── com/
        │       └── book/
        │           └── spring/                         # Spring-specific classes
        └── resources/
            ├── application.properties                  # Spring configuration
            └── application.yml                         # Alternative config
```

#### Package Structure

The generated project follows a consistent package structure:

- **Base Package**: `com.book` (derived from your Group ID)
- **API Package**: `com.book.api` - Contains interfaces and contracts
- **Model Package**: `com.book.model` - Contains entity classes
- **Repository Package**: `com.book.repository` - Contains repository implementations
- **Service Package**: `com.book.service` - Contains business logic implementations
- **REST Package**: `com.book.service.rest` - Contains REST API implementations

#### Configuration Files

**Root build.gradle** - Defines common configuration for all modules:
```gradle
allprojects {
    project.ext.BookVersion = project.waterVersion
    group 'com.book'
    version project.BookVersion
    // Repository configuration
    // Common plugins (java, maven-publish, jacoco)
}
```

**settings.gradle** - Configures the multi-module project:
```gradle
// Water Framework workspace plugin
apply plugin: 'it.water.workspace'
```

**.yo-rc.json** - Contains all your generator answers:
```json
{
  "generator-water": {
    "projectName": "Book",
    "projectGroupId": "com.book",
    "projectTechnology": "water",
    "hasRestServices": true,
    "restContextRoot": "/books",
    "isProtectedEntity": true,
    "isOwnedEntity": false,
    // ... all other configuration
  }
}
```

#### Key Features of Generated Structure

1. **Multi-Module Architecture**: Separates concerns into API, Model, and Service modules
2. **Cross-Framework Support**: Includes both generic (Book-service) and framework-specific (Book-service-spring) modules
3. **Consistent Naming**: All modules follow the pattern `{ProjectName}-{ModuleType}`
4. **Package Organization**: Clear separation of interfaces, models, and implementations
5. **Build Configuration**: Each module has its own build.gradle with appropriate dependencies
6. **Framework Integration**: Ready for Spring Boot, OSGi, or standalone deployment

## Running Your Project

### Step 5: Build the Project

```bash
# Navigate to your project directory
cd my-water-app

# Build the project
./gradlew build
```

This command:
- Downloads all dependencies
- Compiles your Java code
- Runs tests
- Creates executable JAR files

### Step 6: Running in Different Environments

#### Running with Spring Boot

```bash
# Run the Spring Boot application
./gradlew bootRun

# Or run the JAR file
java -jar build/libs/my-water-app-spring-boot.jar
```

**What happens:**
- Starts embedded Tomcat server
- Initializes Spring context
- Loads Water Framework components
- Connects to database
- Application available at `http://localhost:8080`

#### Running with OSGi (Karaf)

```bash
# Build OSGi bundles
./gradlew build

# Start Karaf container
./gradlew karafStart

# Deploy bundles to Karaf
./gradlew karafDeploy
```

**What happens:**
- Starts Apache Karaf OSGi container
- Deploys your application as OSGi bundles
- Activates Water Framework components
- Application available at `http://localhost:8181`

#### Running Tests

```bash
# Run all tests
./gradlew test

# Run specific test class
./gradlew test --tests UserServiceTest

# Run tests with coverage report
./gradlew test jacocoTestReport
```

**Test reports available at:**
- `build/reports/tests/test/index.html` - Test results
- `build/reports/jacoco/test/html/index.html` - Coverage report

### Step 7: Accessing Your Application

#### Spring Boot Application
- **Main Application**: `http://localhost:8080`
- **Swagger API Docs**: `http://localhost:8080/swagger-ui.html`
- **Health Check**: `http://localhost:8080/actuator/health`

#### OSGi Application
- **Main Application**: `http://localhost:8181`
- **Karaf Console**: `http://localhost:8181/system/console`
- **Bundle Status**: `http://localhost:8181/system/console/bundles`

## Water Framework Key Features

Water Framework provides several "out of the box" features:

### Core Features
- **User Management**: Complete user lifecycle management
- **Granular Permission System**: Role-based access control with fine-grained permissions
- **Cross-Framework Support**: Write once, run on Spring, OSGi, Quarkus, or Standalone
- **Event System**: Built-in event handling for real-time applications
- **Repository Pattern**: Unified data access layer
- **REST API Support**: Automatic REST endpoint generation
- **Validation Framework**: Comprehensive data validation

### Modular Architecture
- **100% Modular Design**: Based on SOLID principles
- **Component Registry**: Centralized component management
- **Interceptor System**: AOP-like functionality for cross-cutting concerns
- **Service Integration**: Easy integration with external services

### Technology Integrations
- **Database Support**: H2, PostgreSQL, MySQL, Oracle, SQL Server
- **Document Management**: File storage and version control
- **Email System**: Automated email notifications
- **Blockchain Integration**: Ethereum connector support
- **Cloud Storage**: S3 integration for document persistence
- **Big Data**: Hadoop connector for data processing

## Next Steps

### Development Workflow

1. **Start Development Server**
   ```bash
   ./gradlew bootRun
   ```

2. **Make Changes** - Edit your Java files, the server will auto-reload

3. **Run Tests**
   ```bash
   ./gradlew test
   ```

4. **Build for Production**
   ```bash
   ./gradlew build
   ```

### Useful Commands

```bash
# Clean build
./gradlew clean build

# Run with specific profile
./gradlew bootRun --args='--spring.profiles.active=dev'

# Generate project documentation
./gradlew javadoc

# Check for dependency updates
./gradlew dependencyUpdates

# Run security scan
./gradlew dependencyCheckAnalyze
```

### Adding New Features

```bash
# Add a new entity
yo water:add-entity

# Add REST services
yo water:add-rest-services

# Create entity extension
yo water:new-entity-extension
```

### Troubleshooting

**Common Issues:**

1. **Port already in use**
   ```bash
   # Change port in application.properties
   server.port=8081
   ```

2. **Database connection issues**
   ```bash
   # Check database configuration in application.properties
   # Ensure database is running
   ```

3. **Memory issues**
   ```bash
   # Increase JVM memory
   ./gradlew bootRun -Dorg.gradle.jvmargs="-Xmx2g"
   ```

4. **Node.js version issues**
   ```bash
   # Switch to required Node.js version
   nvm use 18.20.8
   ```

## Water Framework Philosophy

Water Framework follows the principle: *"Be water, my friend"* - like water, it takes the form of the container that incorporates it. This means:

- **Cross-Framework Compatibility**: Your code can run on Spring, OSGi, Quarkus, or Standalone
- **Modular Design**: Components can be easily added, removed, or modified
- **Convention over Coding**: Follows established patterns to reduce development time
- **Flexible Architecture**: Supports monolithic, microservices, or hybrid approaches

This completes your setup! You now have a fully functional Water Framework application running with enterprise features like authentication, user management, and REST APIs. The framework's modular design allows you to start simple and scale as your needs grow.
