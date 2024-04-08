# Graph-Visualizer

## Description

This is a simple directed graph creator. You're able to add and delete nodes and edges to a graph. The goal of this app is to visualize the way various graph algorithms work for better understanding. The current algorithms implemented are BFS and DFS.

## Usage

### Graph Nodes

-   **Left-Click** anywhere in the blank page to **add a graph node**.
-   **Left-Click and drage** a node to **move** it (and select it).
-   **Hold `Shift` + Left-Click** anywhere in the blank page to **add a node and an edge** that connects all selected nodes to the newly created node.
-   **Hold `Ctrl` + Left-Click** to **select multiple nodes**.
-   **Hold `Ctrl` + Left-Click drag** to **move all selected nodes**.
-   **`Ctrl` + `A`** to **select all** nodes.
-   **`Backspace`** to **delete all selected nodes**.
-   **`Enter`** to **edit the value** of a selected node (one at a time).

### Graph Edges/Arrows

-   **Right-Click** and drag from one node to another to **add an edge** to connect them.
-   **Left-Click and drag** the head of an arrow/edge to another node to **reconnect** to set that node as the new destination node.
-   **Left-Click and drag** the tail of an arrow/edge to another node to **reconnect** to set that node as the new source node.
-   **Left-Click and drag** the head or tail and let go on an empty spot to remove the edge.
-   **Hold `Shift` + Right-Click** on a node to **add an edge** that connects all selected nodes to the clicked node.
-   **Hold `Shift` + Left-Click** anywhere in the blank page to **add a node and an edge** that connects all selected nodes to the newly created node.

### Animating

-   Click `BFS` Button to run [Breadth First Search](https://en.wikipedia.org/wiki/Breadth-first_search) on the first selected node.
-   Click `DFS` Button to run [Depth First Search](https://en.wikipedia.org/wiki/Depth-first_search) on the graph.

## Future Features

### Features

-   Implement undirected graphs.
-   Implement [weighted graphs](<https://en.wikipedia.org/wiki/Graph_(discrete_mathematics)#Weighted_graph>).
-   Add a way to edit weight of edges once weighted graphs are implemented.
-   Add distance attribute to each node when running BSF.
-   Add discovery time and finish time of each node when running DFS.

### Animations

-   Find [SCC](https://en.wikipedia.org/wiki/Strongly_connected_component)s of the graph.
-   Find a [Topological Order](https://en.wikipedia.org/wiki/Topological_sorting) of the graph using DFS.
-   Create a [Heap](<https://en.wikipedia.org/wiki/Heap_(data_structure)>).
-   Create a [BST](https://en.wikipedia.org/wiki/Binary_search_tree).
    -   Balance the BST using [AVL rotation](https://en.wikipedia.org/wiki/AVL_tree#Rebalancing).
-   Find a [Minimum Spanning Tree](https://en.wikipedia.org/wiki/Minimum_spanning_tree) using [Kruskal's Algorithm](https://en.wikipedia.org/wiki/Kruskal%27s_algorithm) (after implementing weighted graphs).
-   Find a [Minimum Spanning Tree](https://en.wikipedia.org/wiki/Minimum_spanning_tree) using [Prim's Algorithm](https://en.wikipedia.org/wiki/Prim's_algorithm) (after implementing weighted graphs).

### QoL

-   Add visual when adding an edge between two nodes using Right-Click drag.
-   More keyboard shortcuts (need ideas for this one)
