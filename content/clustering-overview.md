# Clustering Overview

The Water Framework provides a robust clustering system that enables distributed applications to coordinate, share information, and maintain consistency across multiple nodes. This clustering system is built on top of the framework's core concepts and provides a flexible, extensible architecture for building distributed applications.

## Core Concepts

### Cluster Coordinator

The `ClusterCoordinator` interface is the central component of the clustering system. It defines the contract for cluster coordination operations:

```java
public interface ClusterCoordinator {
    boolean addClusterSubscription(ClusterNodeInfo nodeInfo);
    boolean removeClusterSubscription(ClusterNodeInfo nodeInfo);
    boolean checkLeadershipFor(ClusterNodeInfo nodeInfo, String taskId);
    boolean peerExists(ClusterNodeInfo nodeInfo);
    Collection<ClusterNodeInfo> getPeerNodes();
}
```

The cluster coordinator is responsible for:
- Managing cluster membership
- Handling node registration and deregistration
- Coordinating leadership elections
- Maintaining peer node information

### Cluster Coordinator Client

The `ClusterCoordinatorClient` interface represents a client that connects to the cluster coordinator:

```java
public interface ClusterCoordinatorClient extends Service {
    @OnActivate
    void onActivate(ComponentRegistry componentRegistry);
    
    @OnDeactivate
    void onDeactivate();
    
    boolean isStarted();
    void awaitConnection() throws InterruptedException;
    boolean registerToCluster();
    boolean unregisterToCluster();
    boolean checkClusterLeadershipFor(String leadershipServiceKey);
    boolean peerStillExists(ClusterNodeInfo clusterNodeInfo);
    Collection<ClusterNodeInfo> getPeerNodes();
    void subscribeToClusterEvents(ClusterObserver clusterObserver);
    void unsubscribeToClusterEvents(ClusterObserver clusterObserver);
    void registerForLeadership(String leadershipServiceKey);
    void unregisterForLeadership(String leadershipServiceKey);
}
```

### Cluster Node Information

Each node in the cluster is represented by the `ClusterNodeInfo` interface, which extends `ClusterNodeOptions`:

```java
public interface ClusterNodeOptions extends Service {
    String PROP_NODE_ID = "water.core.api.service.cluster.node.id";
    String PROP_LAYER_ID = "water.core.api.service.cluster.node.layer.id";
    String PROP_IP = "water.core.api.service.cluster.node.ip";
    String PROP_HOST = "water.core.api.service.cluster.node.host";
    String PROP_USE_IP = "water.core.api.service.cluster.node.useIp";
    String PROP_CLUSTER_MODE_ENABLED = "water.core.api.service.cluster.mode.enabled";
    
    boolean clusterModeEnabled();
    String getNodeId();
    String getLayer();
    String getIp();
    String getHost();
    boolean useIpInClusterRegistration();
}
```

### Cluster Events

The framework defines a comprehensive set of cluster events through the `ClusterEvent` enum:

```java
public enum ClusterEvent {
    PEER_CONNECTED,        // New peer has connected
    PEER_DISCONNECTED,     // A peer has disconnected
    PEER_ERROR,           // A peer is in an error state
    PEER_INFO_CHANGED,    // Information about one peer has changed
    PEER_DATA_EVENT,      // Peer wants to communicate custom data
    PEER_CUSTOM_EVENT     // Peer wants to raise a custom event
}
```

### Cluster Observer

Components can subscribe to cluster events using the `ClusterObserver` interface:

```java
public interface ClusterObserver {
    void onClusterEvent(ClusterEvent clusterEvent, ClusterNodeInfo nodeInfo, byte[] data);
}
```

## Architecture Overview

The clustering system follows a layered architecture:

1. **Core API Layer**: Defines the interfaces and contracts
2. **Implementation Layer**: Provides concrete implementations for different technologies
3. **Client Layer**: Handles node registration and event subscription
4. **Coordination Layer**: Manages cluster state and leadership

### Key Components

#### 1. Node Registration
- Nodes register themselves with the cluster coordinator
- Registration includes node metadata (ID, layer, IP, host)
- Ephemeral nodes are used to handle automatic cleanup on disconnection

#### 2. Event Distribution
- Cluster events are distributed to all subscribed observers
- Events include node information and optional custom data
- Event processing is asynchronous and non-blocking

#### 3. Leadership Management
- Nodes can register for leadership on specific service keys
- Only one node can be leader for a given service at a time
- Leadership is automatically transferred when the current leader fails

#### 4. Peer Discovery
- Nodes automatically discover other peers in the cluster
- Peer information is cached locally for quick access
- Peer state changes are propagated through events

## Configuration

The clustering system is configured through the `ClusterNodeOptions` interface, which supports the following properties:

| Property | Description | Default |
|----------|-------------|---------|
| `water.core.api.service.cluster.node.id` | Unique node identifier | Generated |
| `water.core.api.service.cluster.node.layer.id` | Logical layer identifier | "default" |
| `water.core.api.service.cluster.node.ip` | Node IP address | Auto-detected |
| `water.core.api.service.cluster.node.host` | Node hostname | Auto-detected |
| `water.core.api.service.cluster.node.useIp` | Use IP instead of hostname | false |
| `water.core.api.service.cluster.mode.enabled` | Enable cluster mode | true |

## Usage Patterns

### Basic Cluster Setup

```java
@Component
public class MyClusterService implements ClusterObserver {
    
    @Inject
    private ClusterCoordinatorClient clusterCoordinatorClient;
    
    @OnActivate
    public void onActivate(ComponentRegistry componentRegistry) {
        // Subscribe to cluster events
        clusterCoordinatorClient.subscribeToClusterEvents(this);
        
        // Register for leadership on a specific service
        clusterCoordinatorClient.registerForLeadership("my-service");
    }
    
    @Override
    public void onClusterEvent(ClusterEvent event, ClusterNodeInfo nodeInfo, byte[] data) {
        switch (event) {
            case PEER_CONNECTED:
                handlePeerConnected(nodeInfo);
                break;
            case PEER_DISCONNECTED:
                handlePeerDisconnected(nodeInfo);
                break;
        }
    }
    
    public void performLeaderTask() {
        if (clusterCoordinatorClient.checkClusterLeadershipFor("my-service")) {
            // Perform leader-specific operations
        }
    }
}
```

### Cluster-Aware Services

Services can be made cluster-aware by implementing the `ClusterObserver` interface:

```java
@Component
public class DistributedCacheService implements ClusterObserver {
    
    private final Map<String, ClusterNodeInfo> peers = new ConcurrentHashMap<>();
    
    @Override
    public void onClusterEvent(ClusterEvent event, ClusterNodeInfo nodeInfo, byte[] data) {
        String nodeKey = nodeInfo.getLayer() + "$$" + nodeInfo.getNodeId();
        
        switch (event) {
            case PEER_CONNECTED:
                peers.put(nodeKey, nodeInfo);
                synchronizeCache(nodeInfo);
                break;
            case PEER_DISCONNECTED:
                peers.remove(nodeKey);
                handlePeerFailure(nodeInfo);
                break;
        }
    }
}
```

## Benefits

The Water Framework clustering system provides several key benefits:

1. **High Availability**: Automatic failover and leader election
2. **Scalability**: Horizontal scaling across multiple nodes
3. **Consistency**: Coordinated state management
4. **Flexibility**: Pluggable coordination backends
5. **Observability**: Comprehensive event system for monitoring

## Implementation Technologies

The clustering system supports multiple coordination backends:

- **Apache ZooKeeper**: Production-ready distributed coordination
- **In-Memory**: Lightweight coordination for testing
- **Custom Implementations**: Extensible for other coordination systems

Each implementation provides the same interface, allowing applications to switch between coordination backends without code changes. 