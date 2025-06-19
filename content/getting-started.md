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

After generation, your project will have a multi-module structure following Water Framework conventions. Here is an example based on the generated `WaterModule` project:

#### Root Project Structure

```
WaterModule/
├── .yo-rc.json                # Generator configuration (all your answers)
├── build.gradle               # Root build configuration
├── settings.gradle            # Project settings and module inclusion
├── gradle.properties          # Gradle properties and versions
├── gradlew, gradlew.bat       # Gradle wrapper scripts
├── gradle/                    # Gradle wrapper files
├── .gitignore                 # Git ignore rules
├── License.md                 # Project license
├── README.md                  # Project documentation
├── WaterModule-api/           # API module (interfaces and contracts)
├── WaterModule-model/         # Model module (entities and data classes)
├── WaterModule-service/       # Service module (business logic, OSGi support)
└── WaterModule-service-spring/# Spring-specific implementation
```

#### Module Descriptions

**WaterModule-api**
- Contains all API interfaces for your entities and system APIs.
- Example files:
  - `NewEntityApi.java`: Main API interface for your entity, extends Water's `BaseEntityApi`.
  - `NewEntitySystemApi.java`: System-level API for advanced operations.
  - `NewEntityRepository.java`: Repository interface for data access.
  - `rest/`: REST API interfaces for JAX-RS.

**WaterModule-model**
- Contains your entity classes and data models.
- Example file:
  - `NewEntity.java`: The main entity, annotated for JPA, validation, and Water permissions. Includes fields, validation annotations, and role-based access control via `@AccessControl`.

**WaterModule-service**
- Contains business logic, repository implementations, and REST controllers.
- Example files:
  - `repository/NewEntityRepositoryImpl.java`: JPA repository implementation for your entity.
  - `service/NewEntityServiceImpl.java`: Service implementation, business logic for your entity.
  - `service/NewEntitySystemServiceImpl.java`: System service implementation.
  - `service/rest/NewEntityRestControllerImpl.java`: JAX-RS REST controller for your entity, exposes CRUD endpoints.
- Also contains OSGi-specific configuration (`bnd.bnd`).

**WaterModule-service-spring**
- Contains Spring Boot application entry point and Spring-specific REST controllers.
- Example files:
  - `service/WaterModuleApplication.java`: Main Spring Boot application class, enables Water Framework and configures component scanning.
  - `service/rest/spring/NewEntitySpringRestApi.java`: Spring REST API interface.
  - `service/rest/spring/NewEntitySpringRestControllerImpl.java`: Spring REST controller implementation.

#### Test Structure
- Each service module contains test classes for both JUnit and Karate (API and integration tests):
  - `WaterModule-service/src/test/java/it/water/module/NewEntityApiTest.java`: JUnit tests for service and API logic.
  - `WaterModule-service/src/test/java/it/water/module/WaterModuleRestApiTest.java`: Karate tests for REST API (OSGi/standalone).
  - `WaterModule-service-spring/src/test/java/it/water/module/WaterModuleRestSpringApiTest.java`: Karate tests for REST API (Spring Boot).

#### Configuration Files
- **.yo-rc.json**: Contains all generator answers and configuration for reproducibility.
- **build.gradle/settings.gradle**: Multi-module Gradle configuration, applies Water workspace plugin.

---

### What to do next?

1. **Customize Your Entity**
   - Edit `WaterModule-model/src/main/java/it/water/module/model/NewEntity.java` to add or modify fields, validation, and business rules.
   - Adjust role and permission annotations as needed.

2. **Align and Expand Test Classes**
   - Update or add JUnit tests in `WaterModule-service/src/test/java/it/water/module/NewEntityApiTest.java` to cover your business logic.
   - Add or update Karate feature files and tests for REST endpoints.

3. **Implement Custom Logic**
   - Add business logic in `NewEntityServiceImpl.java` or custom REST endpoints in `NewEntityRestControllerImpl.java` or `NewEntitySpringRestControllerImpl.java`.

4. **Configure for Your Environment**
   - Adjust `application.properties` or `application.yml` in the Spring module for database, ports, and other settings.

---

### How to Run the Generated Module

#### Run with Spring Boot
```bash
cd WaterModule/WaterModule-service-spring
./../../gradlew bootRun
```
- The application will start on a random port (see logs or set `server.port` in properties).
- Access REST endpoints at `http://localhost:<port>/waterModules`.

#### Run with OSGi (Karaf)

First, download the Karaf Water basic distribution:

[Download water-karaf-distribution-3.0.0.zip](https://nexus.acsoftware.it/nexus/repository/maven-water/it/water/container/water-karaf-distribution/3.0.0/water-karaf-distribution-3.0.0.zip)

Unzip the distribution and follow the instructions in the README to start the Karaf container.

Deploy the generated OSGi bundles to your Karaf container. For details on installing bundles in Karaf, see the [Apache Karaf documentation on bundle installation](https://karaf.apache.org/manual/latest/#_deploying_bundles).

- Access REST endpoints at the configured context root after deployment.

#### Run JUnit Tests
```bash
cd WaterModule
./gradlew test
```
- Runs all JUnit tests, including service and API logic.

#### Run Karate API Tests
```bash
cd WaterModule
./gradlew test
```
- Karate tests are integrated and will run as part of the test suite.
- For Spring Boot-specific Karate tests:
```bash
cd WaterModule/WaterModule-service-spring
./../../gradlew test
```

---

You now have a fully functional, modular Water Framework project ready for customization, testing, and deployment on your preferred Java runtime!

## Running Your Project

### Step 5: Build the Project

You can build your project using either the Water Generator or directly with Gradle.

#### Build with Water Generator

To build all modules in your workspace:
```bash
yo water:build-all
```

To build specific projects:
```bash
yo water:build --projects Project1,Project2
```

- The generator will handle dependency analysis, build order, and run all necessary build steps for you.
- If you want to include tests in the build, you can use:
```bash
yo water:build-all --withTests
```

#### Build with Gradle

```bash
# Navigate to your project directory
cd WaterModule

# Build the project
./gradlew build
```

This command:
- Downloads all dependencies
- Compiles your Java code
- Runs tests
- Creates executable JAR files

