# Graph-Visualizer

## Description

This is a simple directed and undirected graph creator. You're able to add and delete nodes and edges to a graph. The goal of this app is to visualize the way various graph algorithms work for better understanding. The current algorithms implemented are BFS and DFS.

## Usage

Place cursor near the left side of the screen to open the sidebar.

### Graph

-   Toggle `Directed` in the sidebar to switch between a directed and an undirected graph.
-   Toggle `Weighted` in the sidebar to switch between a weighted and an unweighted graph.
-   **Middle-Click** and drag to pan around the canvas.

### Nodes/Vertices

-   **Left-Click** anywhere in the blank page to **add a graph node**.
-   **Left-Click and drag** a node to **move** it (and select it).
-   **Left-Click and drag** on an empty space to create a box which will select all nodes inside.
-   **Hold `Shift` + Left-Click** anywhere in the blank page to **add a node and an edge** that connects all selected nodes to the newly created node.
-   **Hold `Ctrl` + Left-Click** to **select multiple nodes**.
-   **Hold `Ctrl` + Left-Click drag** to **move all selected nodes**.
-   **`Ctrl` + `A`** to **select all** nodes.
-   **`Backspace`** to **delete all selected nodes**.
-   **Double-click** a node to **edit its value**, click **`Enter`**, or click away to confirm.

### Edges/Arrows

-   **Right-Click** and drag from one node to another to **add an edge** to connect them.
-   **Left-Click and drag** the head of an arrow/edge to another node to **reconnect** to set that node as the new destination node.
-   **Left-Click and drag** the tail of an arrow/edge to another node to **reconnect** to set that node as the new source node.
-   **Left-Click and drag** the head or tail and let go on an empty spot to remove the edge.
-   **Hold `Shift` + Right-Click** on a node to **add an edge** that connects all selected nodes to the clicked node.
-   **Hold `Shift` + Left-Click** anywhere in the blank page to **add a node and an edge** that connects all selected nodes to the newly created node.
-   **Double-click** an edge to **edit its weight**, click **`Enter`**, or click away to confirm.

### Animations

The left hand side menu contains buttons to run many different types of algorithms. Some algorithms need to have one node as the root, this node will be chosen as the first selected node or the node with lowest value.

**Once the animation has been created:**

-   **`LeftArrow`** to skip to the previous frame.
-   **`RightArrow`** to skip to the next frame.
-   **`SPACE`** to toggle play/pause.
-   **`r`** to reset the animation.
-   **`ESC`** to exit the animation state.

Each one of these commands can also be done by clicking the corresponding buttons on the animation menu.

**Available algorithms:**

-   [BFS](https://en.wikipedia.org/wiki/Breadth-first_search)
-   [DFS](https://en.wikipedia.org/wiki/Depth-first_search)
-   [Dijkstra's Algorithm](https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm)
    -   Considers Cartesian distance as edge weights when graph is unweighted.
-   [Kruskal's Algorithm](https://en.wikipedia.org/wiki/Kruskal%27s_algorithm)

## Future Plans

### Animations

-   Check if the graph is a [Directed Acyclic Graph (DAG)](https://en.wikipedia.org/wiki/Directed_acyclic_graph) using DFS.
-   Find [Strongly Connected Components (SCC)](https://en.wikipedia.org/wiki/Strongly_connected_component) of the graph.
-   Find a [Topological Order](https://en.wikipedia.org/wiki/Topological_sorting) of the graph using DFS.
-   Create a [Heap](<https://en.wikipedia.org/wiki/Heap_(data_structure)>).
-   Create a [Binary Search Tree (BST)](https://en.wikipedia.org/wiki/Binary_search_tree).
    -   Balance the BST using [AVL rotation](https://en.wikipedia.org/wiki/AVL_tree#Rebalancing).
-   [Prim's Algorithm](https://en.wikipedia.org/wiki/Prim's_algorithm).

### QoL

-   Add visual when adding an edge between two nodes using Right-Click drag.
-   More keyboard shortcuts (need ideas for this one).
-   Add a slider for animation speed.
-   Colour customization.

### Known Bugs

-   Unlinking an already exisiting edge will be deleted when attempting to reconnect to the previously linked node.
-   First click adds invisible node (sometimes).
-   When reconnecting an edge, if the user attempts to reconnect to the node which the edge is already connected to, it will be highlighted as if connection is ready. However, one cannot connect a node to itself.
