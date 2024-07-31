# Graph-Visualizer

## Description

This is a simple directed and undirected graph creator. You're able to add and delete nodes and edges to a graph. The goal of this app is to visualize the way various graph algorithms work for better understanding.

## Usage

## Action Modes

There are four different action modes. Each action mode allows different editing functionality.

#### Ways to switch between action modes

1. Mouse scroll.
2. Number keys from 1 to 4.
3. Right hand side menu.

#### The four action modes: Add, Link, Move, Delete.

1. Add Mode
    - Click on the screen to add a node.
    - Drag a node to move it.
2. Linking Mode
    - Drag from one node to another to link them.
    - Click on the screen to add a node.
3. Moving Mode
    - Drag a node to move it.
    - Drag with right mouse button to move all nodes.
    - Drag to select multiple nodes. Then moving any node will move every other selected node.
    - Click on the screen to add a node.
4. Delete Mode
    - Click on any node to delete it.
    - Drag an area to delete every node inside.
5. All action modes have these features:
    - Click on either side of an edge to delete it.
    - `CRTL`+`A` to select all nodes.
    - `BACKSPACE` to delete all selected nodes.
    - Double click on an edge to change its weight when on weighted graph mode.
    - Double click on a node to change the node number.

### **Available algorithms:**

-   [BFS](https://en.wikipedia.org/wiki/Breadth-first_search)
-   [DFS](https://en.wikipedia.org/wiki/Depth-first_search)
-   [Dijkstra's Algorithm](https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm)
    -   Considers Cartesian distance as edge weights when graph is unweighted.
-   [Kruskal's Algorithm](https://en.wikipedia.org/wiki/Kruskal%27s_algorithm)
-   Find [Strongly Connected Components (SCC)](https://en.wikipedia.org/wiki/Strongly_connected_component) of the graph.

## Future Plans

### Animations

-   Check if the graph is a [Directed Acyclic Graph (DAG)](https://en.wikipedia.org/wiki/Directed_acyclic_graph) using DFS.
-   Find a [Topological Order](https://en.wikipedia.org/wiki/Topological_sorting) of the graph using DFS.
-   Create a [Heap](<https://en.wikipedia.org/wiki/Heap_(data_structure)>).
-   Create a [Binary Search Tree (BST)](https://en.wikipedia.org/wiki/Binary_search_tree).
    -   Balance the BST using [AVL rotation](https://en.wikipedia.org/wiki/AVL_tree#Rebalancing).
-   [Prim's Algorithm](https://en.wikipedia.org/wiki/Prim's_algorithm).
