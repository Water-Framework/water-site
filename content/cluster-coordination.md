# Cluster Coordination

The Water Framework's cluster coordination system provides a robust foundation for distributed applications. This document focuses on the practical implementation using Apache ZooKeeper as the coordination backend.

## ZooKeeper Implementation

The Water Framework provides a complete ZooKeeper-based implementation of the clustering system through the `ZookeeperConnector` module. This implementation leverages Apache Curator for reliable ZooKeeper operations.

### Core Components

#### ZKClusterCoordinatorClient

The `ZKClusterCoordinatorClient` is the main implementation of the `ClusterCoordinatorClient` interface:

```java
@FrameworkComponent
public class ZKClusterCoordinatorClient implements ClusterCoordinatorClient, ClusterObserver, ZookeeperClient {
    
    @Inject
    @Setter
    private ClusterNodeOptions clusterNodeOptions;
    
    @Inject
    @Setter
    private ZookeeperConnectorSystemApi zookeeperConnectorSystemApi;
    
    private Set<ClusterObserver> clusterObservers;
    private CuratorCache clusterCuratorCache;
    private CuratorCacheListener clusterCacheListener;
    private Map<String, ClusterNodeInfo> peers;
    private boolean started;
}
```

### Node Registration Process

When a node starts up, it follows this registration process:

1. **Connection Setup**: The client waits for ZooKeeper connection to be established
2. **Node Data Creation**: Creates a `ZKData` object with node information
3. **Ephemeral Node Creation**: Registers as an ephemeral node in ZooKeeper
4. **Event Listener Registration**: Sets up listeners for cluster events
5. **Peer Discovery**: Discovers existing peers in the cluster

```java
@Override
public boolean registerToCluster() {
    Thread thread = new Thread(() -> {
        await().atMost(30, SECONDS).until(() -> 
            this.zookeeperConnectorSystemApi.getZookeeperCuratorClient() != null && 
            this.zookeeperConnectorSystemApi.getZookeeperCuratorClient().getState().equals(CuratorFrameworkState.STARTED));
        
        if (this.zookeeperConnectorSystemApi.getZookeeperCuratorClient().getState().equals(CuratorFrameworkState.STARTED)) {
            try {
                ZKData zkData = new ZKData();
                zkData.addParam(ClusterNodeOptions.NODE_ID_FIELD_NAME, clusterNodeOptions.getNodeId().getBytes());
                zkData.addParam(ClusterNodeOptions.HOST_FIELD_NAME, clusterNodeOptions.getHost().getBytes());
                zkData.addParam(ClusterNodeOptions.IP_FIELD_NAME, clusterNodeOptions.getIp().getBytes());
                zkData.addParam(ClusterNodeOptions.LAYER_FIELD_NAME, clusterNodeOptions.getLayer().getBytes());
                zkData.addParam(ClusterNodeOptions.CLUSTER_MODE_FIELD_NAME, "true".getBytes());
                zkData.addParam(ClusterNodeOptions.IP_REGISTRATION_FIELD_NAME, 
                    String.valueOf(clusterNodeOptions.useIpInClusterRegistration()).getBytes());
                
                this.zookeeperConnectorSystemApi.createEphemeral(
                    zookeeperConnectorSystemApi.getPeerPath(clusterNodeOptions.getNodeId()), 
                    zkData.getBytes(), 
                    true
                );
                
                this.started = true;
                this.subscribeToClusterEvents(this);
                this.registerClusterEventListener();
            } catch (Exception e) {
                logger.error(e.getMessage(), e);
            }
        }
    });
    thread.start();
    return true;
}
```

### Event Processing

The cluster coordinator processes ZooKeeper events and converts them to cluster events:

```java
private void processClusterEvent(CuratorCacheListener.Type type, ChildData oldData, ChildData newData) {
    AtomicReference<ClusterEvent> atomicClusterEvent = new AtomicReference<>();
    boolean dataIsPresent = newData != null && newData.getData() != null;
    AtomicReference<byte[]> data = new AtomicReference<>();
    data.set(dataIsPresent ? newData.getData() : new byte[0]);
    
    switch (type) {
        case NODE_CREATED -> atomicClusterEvent.set(ClusterEvent.PEER_CONNECTED);
        case NODE_CHANGED -> atomicClusterEvent.set(ClusterEvent.PEER_INFO_CHANGED);
        case NODE_DELETED -> {
            atomicClusterEvent.set(ClusterEvent.PEER_DISCONNECTED);
            dataIsPresent = oldData != null && oldData.getData() != null;
            data.set(dataIsPresent ? oldData.getData() : new byte[0]);
        }
    }
    
    ZKData zkData = dataIsPresent ? ZKData.fromBytes(data.get()) : new ZKData();
    clusterObservers.forEach(observer -> 
        observer.onClusterEvent(atomicClusterEvent.get(), new ZKClusterNodeInfo(zkData), data.get())
    );
}
```

### Leadership Management

The ZooKeeper implementation uses Apache Curator's leader election recipe:

```java
@Override
public void registerForLeadership(String leadershipServiceKey) {
    doClusterOperation(() -> 
        this.zookeeperConnectorSystemApi.registerLeadershipComponent(leadershipServiceKey)
    );
}

@Override
public boolean checkClusterLeadershipFor(String leadershipServiceKey) {
    return Boolean.TRUE.equals(doClusterOperation(() -> 
        this.zookeeperConnectorSystemApi.isLeader(leadershipServiceKey)
    ));
}
```

### Node Information Management

The `ZKClusterNodeInfo` class encapsulates node information stored in ZooKeeper:

```java
@RequiredArgsConstructor
public class ZKClusterNodeInfo implements ClusterNodeInfo {

    @NonNull
    private final ZKData zkData;

    public ZKClusterNodeInfo(byte[] zkDataBytes) {
        if (zkDataBytes == null || zkDataBytes.length == 0)
            this.zkData = new ZKData();
        else
            this.zkData = ZKData.fromBytes(zkDataBytes);
    }

    @Override
    public String getNodeId() {
        return new String(zkData.getParam(NODE_ID_FIELD_NAME));
    }

    @Override
    public String getLayer() {
        return new String(zkData.getParam(LAYER_FIELD_NAME));
    }

    @Override
    public String getIp() {
        return new String(zkData.getParam(IP_FIELD_NAME));
    }

    @Override
    public String getHost() {
        return new String(zkData.getParam(HOST_FIELD_NAME));
    }
}
```

## ZooKeeper Data Structure

The ZooKeeper implementation uses a hierarchical data structure:

```
/water/cluster/
├── peers/
│   ├── node-1 (ephemeral)
│   ├── node-2 (ephemeral)
│   └── node-3 (ephemeral)
└── leadership/
    ├── service-1/
    │   ├── leader-election-1
    │   └── leader-election-2
    └── service-2/
        └── leader-election-3
```

### Peer Registration

Each node creates an ephemeral node under `/water/cluster/peers/` with the following data structure:

```json
{
  "nodeId": "node-1",
  "host": "localhost",
  "ip": "127.0.0.1",
  "layer": "default",
  "clusterMode": "true",
  "useIp": "false"
}
```

### Leadership Elections

Leadership elections are managed using Apache Curator's leader election recipe:

- Each service key creates a separate election path
- Only one node can be leader for a given service at a time
- Automatic failover when the current leader fails

## Configuration

### ZooKeeper Connection

Configure ZooKeeper connection properties:

```properties
# ZooKeeper connection string
water.zookeeper.connection.string=localhost:2181

# Connection timeout
water.zookeeper.connection.timeout=30000

# Session timeout
water.zookeeper.session.timeout=60000

# Retry policy
water.zookeeper.retry.policy.baseSleepTime=1000
water.zookeeper.retry.policy.maxRetries=3
```

### Cluster Node Configuration

Configure cluster node properties:

```properties
# Node identification
water.core.api.service.cluster.node.id=my-node-1
water.core.api.service.cluster.node.layer.id=web-tier

# Network configuration
water.core.api.service.cluster.node.ip=192.168.1.100
water.core.api.service.cluster.node.host=web-server-1
water.core.api.service.cluster.node.useIp=false

# Cluster mode
water.core.api.service.cluster.mode.enabled=true
```

## Usage Examples

### Basic Cluster Service

```java
@Component
public class MyClusterService implements ClusterObserver {
    
    @Inject
    private ClusterCoordinatorClient clusterCoordinatorClient;
    
    private final Map<String, ClusterNodeInfo> peers = new ConcurrentHashMap<>();
    
    @OnActivate
    public void onActivate(ComponentRegistry componentRegistry) {
        // Subscribe to cluster events
        clusterCoordinatorClient.subscribeToClusterEvents(this);
        
        // Register for leadership
        clusterCoordinatorClient.registerForLeadership("my-service");
    }
    
    @Override
    public void onClusterEvent(ClusterEvent event, ClusterNodeInfo nodeInfo, byte[] data) {
        String nodeKey = nodeInfo.getLayer() + "$$" + nodeInfo.getNodeId();
        
        switch (event) {
            case PEER_CONNECTED:
                peers.put(nodeKey, nodeInfo);
                logger.info("Peer connected: {} at {}", nodeInfo.getNodeId(), nodeInfo.getIp());
                break;
            case PEER_DISCONNECTED:
                peers.remove(nodeKey);
                logger.info("Peer disconnected: {}", nodeInfo.getNodeId());
                break;
        }
    }
    
    public void performLeaderTask() {
        if (clusterCoordinatorClient.checkClusterLeadershipFor("my-service")) {
            logger.info("I am the leader, performing leader task");
            // Perform leader-specific operations
        }
    }
    
    @OnDeactivate
    public void onDeactivate() {
        clusterCoordinatorClient.unsubscribeToClusterEvents(this);
        clusterCoordinatorClient.unregisterForLeadership("my-service");
    }
}
```

### Distributed Cache Implementation

```java
@Component
public class DistributedCacheService implements ClusterObserver {
    
    private final Map<String, Object> cache = new ConcurrentHashMap<>();
    private final Map<String, ClusterNodeInfo> peers = new ConcurrentHashMap<>();
    
    @Inject
    private ClusterCoordinatorClient clusterCoordinatorClient;
    
    @OnActivate
    public void onActivate(ComponentRegistry componentRegistry) {
        clusterCoordinatorClient.subscribeToClusterEvents(this);
    }
    
    @Override
    public void onClusterEvent(ClusterEvent event, ClusterNodeInfo nodeInfo, byte[] data) {
        String nodeKey = nodeInfo.getLayer() + "$$" + nodeInfo.getNodeId();
        
        switch (event) {
            case PEER_CONNECTED:
                peers.put(nodeKey, nodeInfo);
                synchronizeCacheWithPeer(nodeInfo);
                break;
            case PEER_DISCONNECTED:
                peers.remove(nodeKey);
                handlePeerFailure(nodeInfo);
                break;
            case PEER_DATA_EVENT:
                handlePeerDataEvent(nodeInfo, data);
                break;
        }
    }
    
    private void synchronizeCacheWithPeer(ClusterNodeInfo peer) {
        // Send cache data to new peer
        byte[] cacheData = serializeCache();
        // Implementation would send data to peer
    }
    
    private void handlePeerFailure(ClusterNodeInfo failedPeer) {
        // Handle peer failure, possibly redistributing cached data
        logger.warn("Peer failed: {}", failedPeer.getNodeId());
    }
    
    private void handlePeerDataEvent(ClusterNodeInfo peer, byte[] data) {
        // Handle custom data from peer
        // Deserialize and update local cache
    }
}
```

## Testing

The framework provides comprehensive testing utilities for cluster coordination:

```java
@ExtendWith(WaterTestExtension.class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ZKClusterCoordinatorTest implements Service {
    
    @Inject
    @Setter
    private ClusterCoordinatorClient clusterCoordinatorClient;
    
    private TestingServer zkServer;
    
    @BeforeAll
    void startZookeeper() throws Exception {
        zkServer = new TestingServer(2181);
    }
    
    @Test
    void testClusterCoordination() {
        // Test cluster coordination functionality
        clusterCoordinatorClient.awaitConnection();
        Assertions.assertTrue(clusterCoordinatorClient.isStarted());
        
        // Test peer registration
        Collection<ClusterNodeInfo> peers = clusterCoordinatorClient.getPeerNodes();
        Assertions.assertNotNull(peers);
    }
    
    @AfterAll
    void stopZookeeper() throws Exception {
        zkServer.close();
    }
}
```

## Best Practices

### 1. Error Handling

Always implement proper error handling for cluster operations:

```java
private void doClusterOperation(Runnable runnable) {
    try {
        this.awaitConnection();
        runnable.run();
    } catch (InterruptedException e) {
        logger.error("Cluster operation interrupted", e);
        Thread.currentThread().interrupt();
    } catch (Exception e) {
        logger.error("Cluster operation failed", e);
    }
}
```

### 2. Event Subscription Management

Properly manage event subscriptions:

```java
@OnActivate
public void onActivate(ComponentRegistry componentRegistry) {
    clusterCoordinatorClient.subscribeToClusterEvents(this);
}

@OnDeactivate
public void onDeactivate() {
    clusterCoordinatorClient.unsubscribeToClusterEvents(this);
}
```

### 3. Leadership Handling

Implement proper leadership handling:

```java
public void performLeaderTask() {
    if (clusterCoordinatorClient.checkClusterLeadershipFor("my-service")) {
        try {
            // Perform leader task
            executeLeaderTask();
        } catch (Exception e) {
            logger.error("Leader task failed", e);
            // Consider stepping down as leader
        }
    }
}
```

### 4. Peer State Management

Maintain consistent peer state:

```java
@Override
public void onClusterEvent(ClusterEvent event, ClusterNodeInfo nodeInfo, byte[] data) {
    String nodeKey = nodeInfo.getLayer() + "$$" + nodeInfo.getNodeId();
    
    switch (event) {
        case PEER_CONNECTED:
            peers.put(nodeKey, nodeInfo);
            break;
        case PEER_DISCONNECTED:
            peers.remove(nodeKey);
            break;
        case PEER_INFO_CHANGED:
            peers.put(nodeKey, nodeInfo);
            break;
    }
}
```

## Monitoring and Observability

The cluster coordination system provides several monitoring points:

1. **Connection Status**: Monitor ZooKeeper connection state
2. **Peer Count**: Track number of active peers
3. **Leadership Status**: Monitor leadership elections
4. **Event Processing**: Track cluster event processing
5. **Error Rates**: Monitor cluster operation failures

Use these metrics to ensure cluster health and performance. 