# Project Entanglement - Graph Neural Network (GNN) Integration

## Phase 2: Network Graph and GNN Integration

This document outlines the implementation of the Graph Neural Network (GNN) component for optimizing satellite communication scheduling in Project Entanglement.

### 🧠 Graph-Based Optimization Approach

The GNN component transforms the satellite constellation scheduling problem into a graph optimization problem, where:

- **Nodes**: Satellites and ground stations
- **Edges**: Possible communication windows
- **Features**: Data backlog, priorities, window quality, etc.
- **Goal**: Learn optimal assignment strategies for maximizing network throughput

### 📊 Graph Builder Module

The `graph_builder.py` module converts the simulation state into a graph representation:

```python
# Create graph from simulation
builder = GraphBuilder(simulator)
graph = builder.create_graph_snapshot(simulation_state)
```

#### Key Components

1. **GraphBuilder Class**:
   - Converts simulation state to NetworkX graph
   - Transforms NetworkX graph to PyTorch Geometric Data
   - Captures dynamic node and edge attributes

2. **Node Representation**:
   - **Satellite nodes**: Data backlog, priority, position
   - **Ground station nodes**: Status (busy/idle), capabilities

3. **Edge Representation**:
   - Communication window quality
   - Duration in minutes
   - Maximum elevation angle

### 🔄 From Simulation to Graph

The simulation state is transformed into a graph through the following steps:

1. Extract satellite, ground station, and window information
2. Create graph nodes for each entity with appropriate attributes
3. Add edges for potential communication windows
4. Convert to PyTorch Geometric format for GNN processing

### 📈 GNN Architecture (Coming in Phase 2.2)

The GNN architecture will use the graph representation to:

1. **Process** the graph through message passing neural networks
2. **Learn** from historical scheduling decisions
3. **Predict** optimal satellite-ground station assignments
4. **Maximize** total data downlink and system efficiency

### 🧪 Testing the Graph Builder

Use the included test script to verify the graph builder functionality:

```bash
python backend/test_graph_builder.py
```

This will test:
- Basic graph construction
- Node and edge attribute assignments
- Conversion to PyTorch Geometric format (if dependencies installed)

### 🚀 Next Steps

1. **Install dependencies**:
   ```
   pip install -r requirements.txt
   ```

2. **GNN Model Development**:
   - Design custom GNN architecture tailored to satellite scheduling
   - Implement message passing layers for satellite-ground station communication
   - Create training pipeline with simulated scheduling scenarios

3. **Integration with Scheduler**:
   - Connect GNN predictions to scheduling decisions
   - Implement feedback loop for continuous learning
   - Measure performance improvement over baseline algorithms
