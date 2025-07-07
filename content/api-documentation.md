# API Documentation - Defining REST Services in Water Framework

The Water Framework provides a powerful, technology-agnostic way to define REST APIs. This approach allows you to write your API contracts once and implement them for different frameworks (JAX-RS, Spring, etc.) with minimal duplication. This guide explains how to define, document, and implement REST APIs in Water, and the differences between JAX-RS and Spring approaches.

## 1. Core Concepts

### a. RestApi Interface
**ALL REST API interfaces must extend the base `RestApi` interface** from `it.water.core.api.service.rest`:

```java
public interface RestApi extends Service {
}
```

This marks the interface as a REST API contract and is **mandatory** for all REST interfaces in the Water Framework.

### b. @FrameworkRestApi Annotation
Use the `@FrameworkRestApi` annotation to mark your interface as a REST API that should be registered and exposed by the framework. This enables automatic discovery and registration.

### c. Swagger Annotations
Annotate your API interfaces and methods with Swagger annotations (`@Api`, `@ApiOperation`, `@ApiResponses`, etc.) to generate rich API documentation. These annotations are technology-agnostic and will be picked up by both JAX-RS and Spring implementations.

## 2. Supported REST Interfaces from Core-api

The Water Framework provides several core interfaces in `it.water.core.api.service.rest`:

- **`RestApi`**: Base interface that all REST APIs must extend
- **`RestApiRegistry`**: Component for registering REST services
- **`RestApiManager`**: Manages REST API server lifecycle
- **`FrameworkRestApi`**: Annotation for marking REST API interfaces
- **`FrameworkRestController`**: Annotation for marking REST controller implementations
- **`WaterJsonView`**: JSON view interfaces for controlling data exposure

## 3. Defining a REST API Interface

Here is a typical example from the User module:

```java
@Path("/users")
@Api(produces = MediaType.APPLICATION_JSON, tags = "Water User API")
@FrameworkRestApi
public interface UserRestApi extends RestApi {
    @POST
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "/users", notes = "Save User", httpMethod = "POST")
    @ApiResponses({
        @ApiResponse(code = 200, message = "Successful operation"),
        @ApiResponse(code = 404, message = "Entity not found")
    })
    WaterUser save(WaterUser user);
    // ... other methods ...
}
```

- **@Path**: JAX-RS path for the resource
- **@Api**: Swagger class-level annotation
- **@FrameworkRestApi**: Water-specific marker
- **@ApiOperation, @ApiResponses**: Swagger method-level documentation
- **extends RestApi**: **MANDATORY** - all REST interfaces must extend this

## 4. Implementing the API for Different Frameworks

### a. JAX-RS Implementation

To expose your API via JAX-RS (e.g., Apache CXF), create a new interface that extends your base API and adds JAX-RS-specific annotations:

```java
@Path("/users")
@FrameworkRestApi
public interface UserJaxRsApi extends UserRestApi {
    @POST
    @Override
    WaterUser save(WaterUser user);
    // ...
}
```

**Important**: The JAX-RS interface must also extend `RestApi` (through `UserRestApi`).

- Use JAX-RS annotations like `@Path`, `@GET`, `@POST`, `@Produces`, `@Consumes`.
- The implementation class (e.g., `UserRestControllerImpl`) is registered as a bean and will be proxied by the framework.

#### Example: Status API
```java
@Path("/status")
@FrameworkRestApi
public interface DefaultStatusApi extends StatusApi {
    @GET
    @Produces(MediaType.TEXT_PLAIN)
    @Override
    String checkModuleWorking();
}
```

### b. Spring Implementation

To expose your API via Spring MVC, create a new interface that extends your base API and adds Spring-specific annotations:

```java
@RequestMapping("/users")
@FrameworkRestApi
public interface UserSpringRestApi extends UserRestApi {
    @PostMapping
    @Override
    WaterUser save(@RequestBody WaterUser user);
    // ...
}
```

**Important**: The Spring interface must also extend `RestApi` (through `UserRestApi`).

- Use Spring annotations like `@RequestMapping`, `@GetMapping`, `@PostMapping`, `@RequestBody`, `@PathVariable`, `@RequestParam`.
- The implementation class is the same as for JAX-RS; the framework will proxy it with the correct interface.

#### Example: Status API
```java
@RequestMapping("/status")
@FrameworkRestApi
public interface SpringStatusApi extends StatusApi {
    @GetMapping
    @Override
    String checkModuleWorking();
}
```

## 5. Implementation Class

The actual logic is implemented in a class annotated with `@FrameworkRestController`, referring to the base API interface:

```java
@FrameworkRestController(referredRestApi = UserRestApi.class)
public class UserRestControllerImpl implements UserRestApi {
    @Override
    public WaterUser save(WaterUser user) {
        // business logic
    }
    // ...
}
```

- The same implementation is used for both JAX-RS and Spring, thanks to dynamic proxying.
- The implementation class must implement the base `RestApi` interface (not the framework-specific one).

## 6. How the Framework Wires Everything

- The Water Framework scans for all interfaces annotated with `@FrameworkRestApi`.
- For each, it registers the implementation class (annotated with `@FrameworkRestController`) as a bean.
- At runtime, the framework creates proxies that implement the technology-specific interface (JAX-RS or Spring) and delegate to the implementation.
- Swagger annotations are always read from the base interface, so documentation is consistent.

## 7. Best Practices

- **ALL REST interfaces MUST extend `RestApi`** - this is mandatory for the framework to work correctly.
- **Always define your API contract in a technology-agnostic interface that extends `RestApi`.**
- **Use Swagger annotations for all documentation.**
- **Add technology-specific annotations in separate interfaces that also extend `RestApi`.**
- **Keep your implementation logic in a single class.**
- **Use `@FrameworkRestApi` and `@FrameworkRestController` for automatic registration.**

## 8. Example: Full Flow

**Step 1: Define the API contract (MUST extend RestApi)**
```java
@Path("/entities")
@Api(tags = "Entity API")
@FrameworkRestApi
public interface EntityRestApi extends RestApi {
    @GET
    @Path("/{id}")
    @ApiOperation(value = "Get entity by ID")
    Entity find(@PathParam("id") long id);
}
```

**Step 2: JAX-RS interface (extends RestApi through EntityRestApi)**
```java
@Path("/entities")
@FrameworkRestApi
public interface EntityJaxRsApi extends EntityRestApi {
    @GET
    @Path("/{id}")
    @Override
    Entity find(@PathParam("id") long id);
}
```

**Step 3: Spring interface (extends RestApi through EntityRestApi)**
```java
@RequestMapping("/entities")
@FrameworkRestApi
public interface EntitySpringRestApi extends EntityRestApi {
    @GetMapping("/{id}")
    @Override
    Entity find(@PathVariable("id") long id);
}
```

**Step 4: Implementation (implements the base RestApi interface)**
```java
@FrameworkRestController(referredRestApi = EntityRestApi.class)
public class EntityRestControllerImpl implements EntityRestApi {
    @Override
    public Entity find(long id) {
        // business logic
    }
}
```

## 9. Summary Table: JAX-RS vs Spring

| Aspect                | JAX-RS (CXF, etc.)         | Spring MVC                  |
|-----------------------|----------------------------|-----------------------------|
| Base interface        | Must extend `RestApi`      | Must extend `RestApi`       |
| Interface annotation  | `@Path`, `@GET`, ...       | `@RequestMapping`, ...      |
| Parameter annotation  | `@PathParam`, `@QueryParam`| `@PathVariable`, `@RequestParam` |
| Method mapping        | `@GET`, `@POST`, ...       | `@GetMapping`, `@PostMapping` |
| Implementation class  | Same for both              | Same for both               |
| Swagger support       | Yes                        | Yes                         |
| Registration          | Automatic via Water        | Automatic via Water         |

## 10. JSON Views

The Water Framework provides predefined JSON views through `WaterJsonView`:

- **`Public`**: All public fields that all users can access
- **`Compact`**: Reduces the amount of fields shown, just necessary ones
- **`Extended`**: Increases the amount of fields shown with deeper details
- **`Internal`**: Internal fields for internal system use
- **`Secured`**: Secured fields that must not be exposed outside
- **`Privacy`**: Privacy fields

Use these with `@JsonView` annotations to control data exposure:

```java
@JsonView(WaterJsonView.Public.class)
public User getUser() {
    // Returns only public fields
}
```

## 11. Swagger and API Documentation

- All documentation is centralized in the base interface using Swagger annotations.
- The Water Framework can generate OpenAPI/Swagger docs for all registered APIs.
- Use `@Api`, `@ApiOperation`, `@ApiResponses`, and `@ApiParam` for rich documentation.

## 12. Conclusion

The Water Framework's approach to REST APIs allows you to:
- Write your API contract once
- Implement it for multiple frameworks
- Keep documentation and logic DRY and consistent
- Leverage automatic registration and documentation generation

**Key Requirement**: ALL REST interfaces must extend `RestApi` for the framework to properly register and manage them.

For more examples, see the `UserRestApi`, `UserSpringRestApi`, and `UserRestControllerImpl` classes in the User module, or the Status API in the Rest module. 