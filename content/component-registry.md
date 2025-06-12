# Component Registry

The Component Registry is the central piece of Water Framework that manages all components in the system.

## Registering Components

To register a component, use the `@FrameworkComponent` annotation:

```java
@FrameworkComponent
public class MyComponent {
    // Component implementation
}
```

## Finding Components

You can find components using the Component Registry:

```java
ComponentRegistry registry = // get registry
MyComponent component = registry.findComponent(MyComponent.class);
```

## Component Properties

Components can have properties that can be used for filtering and configuration:

```java
@FrameworkComponent(properties = {
    "name=myComponent",
    "version=1.0"
})
public class MyComponent {
    // Component implementation
}
``` 