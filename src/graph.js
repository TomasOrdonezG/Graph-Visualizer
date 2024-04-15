var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import GraphNode from "./graphNode.js";
import Edge from "./edge.js";
import { keyboardState } from "./main.js";
import { waitForClick, delay } from "./utils.js";
// Graph global variable
class Graph {
    // #endregion
    constructor() {
        // Standardly initializable attributes
        this.nodes = [];
        this.directed = false;
        // Objects to keep track of
        this.initial_node = null;
        this.final_node = null;
        this.moving_edge = null;
        this.size = 0;
        this.next_node_val = 0;
        this.traversing = false;
        // * Create container
        const container = document.createElement("div");
        container.id = "graph";
        document.body.appendChild(container);
        this.HTML_Container = container;
        // * Event Listeners
        // Add node on click
        document.addEventListener("mouseup", this.addNode.bind(this));
    }
    addNode(event) {
        // Prevent adding a node when mouse is on a node div, or edge div
        if (event.button !== 0 || this.traversing || event.target.closest(".pan")) {
            return;
        }
        // Create the new node object
        const new_node = new GraphNode(event.clientX, event.clientY, this.next_node_val);
        // Connect all selected nodes to the new node if SHIFT is down
        if (keyboardState.SHIFT && !keyboardState.CTRL) {
            for (let node of this.nodes) {
                if (node.selected) {
                    node.connect(new_node);
                }
            }
        }
        // Select only new node
        if (!keyboardState.CTRL)
            this.deselect_all();
        new_node.select();
        // Update GRAPH attributes
        this.nodes.push(new_node);
        this.next_node_val++;
        this.size++;
        this.sortNodes();
    }
    deselect_all() {
        for (let node of this.nodes) {
            node.deselect();
        }
    }
    // TRAVERSAL
    BFS() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.traversing || this.size === 0)
                return;
            this.traversing = true;
            // Reset the colour of all nodes and edges in the graph
            this.reset_colour();
            yield delay(Graph.DELAY_TIME);
            // Get root as the first selected node then mark as discovered
            let root = this.get_first_selected();
            if (!root)
                root = this.nodes[0];
            yield this.setNodeColour(root, "gray");
            // Create queue and enqueue root
            const Q = {
                queue: [],
                is_empty() {
                    return this.queue.length == 0;
                },
                enqueue(node) {
                    this.queue.push(node);
                },
                dequeue() {
                    return this.queue.splice(0, 1)[0];
                },
            };
            Q.enqueue(root);
            // Main BFS loop
            while (!Q.is_empty()) {
                let node = Q.dequeue();
                if (this.directed) {
                    // * DIRECTED GRAPH TRAVERSAL
                    for (let out_edge of node.out_edges) {
                        const adj_node = out_edge.destination;
                        if (adj_node.colour === "white") {
                            // Explore node if it's white
                            yield this.highlightEdge(out_edge);
                            yield this.setNodeColour(adj_node, "gray");
                            Q.enqueue(adj_node);
                        }
                    }
                }
                else {
                    // * UNDIRECTED GRAPH TRAVERSAL
                    for (let adj of node.neighbours) {
                        // Explore node if it's white
                        if (adj.colour === "white") {
                            // Find edge
                            let edge = null;
                            for (let adj_edge of node.out_edges.concat(node.in_edges)) {
                                if (adj_edge.source === adj || adj_edge.destination === adj) {
                                    edge = adj_edge;
                                }
                            }
                            // Highligh and enqueue
                            if (edge)
                                yield this.highlightEdge(edge);
                            else
                                throw Error("Node is in neighbours array but edge is not in out_edges nor in_edges.");
                            yield this.setNodeColour(adj, "gray");
                            Q.enqueue(adj);
                        }
                    }
                }
                yield this.setNodeColour(node, "black");
            }
            yield this.displayTraversalTree();
            this.traversing = false;
        });
    }
    DFS() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.traversing || this.size === 0)
                return;
            this.traversing = true;
            this.deselect_all();
            // Visits one node and traverses through with DFS
            const DFS_Visit = (root) => __awaiter(this, void 0, void 0, function* () {
                // Mark root as discovered
                yield this.setNodeColour(root, "gray");
                if (this.directed) {
                    // * DIRECTED GRAPH TRAVERSAL
                    // Run DFS on each neighbour in order
                    for (let out_edge of root.out_edges) {
                        const adj_node = out_edge.destination;
                        if (adj_node.colour === "white") {
                            // Explore node if it's white
                            yield this.highlightEdge(out_edge);
                            yield DFS_Visit(adj_node);
                        }
                    }
                }
                else {
                    // * UNDIRECTED GRAPH TRAVERSAL
                    for (let adj of root.neighbours) {
                        // Explore node if its white
                        if (adj.colour === "white") {
                            // Find edge
                            let edge = null;
                            for (let adj_edge of root.out_edges.concat(root.in_edges)) {
                                if (adj_edge.source === adj || adj_edge.destination === adj) {
                                    edge = adj_edge;
                                }
                            }
                            // Highligh and recurse
                            if (edge)
                                yield this.highlightEdge(edge);
                            else
                                throw Error("Node is in neighbours array but edge is not in out_edges nor in_edges.");
                            yield DFS_Visit(adj);
                        }
                    }
                }
                // Mark root as searched
                yield this.setNodeColour(root, "black");
            });
            this.reset_colour();
            yield delay(Graph.DELAY_TIME);
            // Main DFS loop
            for (let node of this.nodes) {
                if (node.colour === "white") {
                    yield DFS_Visit(node);
                }
            }
            yield this.displayTraversalTree();
            this.traversing = false;
        });
    }
    displayTraversalTree() {
        return __awaiter(this, void 0, void 0, function* () {
            // Shows only the edges that were traversed by the traversal method
            for (let node of this.nodes) {
                for (let out_edge of node.out_edges) {
                    if (out_edge.colour !== Edge.HIGHLIGHT_COLOUR) {
                        out_edge.updateColour("transparent");
                    }
                }
            }
            // Waits for click anywhere and the resets the colour of the graph
            yield waitForClick();
            this.reset_colour();
        });
    }
    setNodeColour(node, colour) {
        return __awaiter(this, void 0, void 0, function* () {
            // Updates the node and text colour of a node and sets a delay
            // Should only be called from inside animation methods or reset_colour method
            const text_colour = colour === "black" ? "white" : "black";
            node.colour = colour;
            node.text_colour = text_colour;
            node.updateColour();
            yield delay(Graph.DELAY_TIME);
        });
    }
    highlightEdge(edge) {
        return __awaiter(this, void 0, void 0, function* () {
            // Highlights an edge and sets a delay
            // Should only be called from inside animation methods
            edge.updateColour(Edge.HIGHLIGHT_COLOUR);
            yield delay(Graph.DELAY_TIME);
        });
    }
    // Update
    toggle_directed(event) {
        // Prevent from changing graph type while traversing
        if (this.traversing) {
            event.preventDefault();
            return;
        }
        // Update each edge to have its arrowhead to invisible
        this.directed = !this.directed;
        for (let node of this.nodes) {
            for (let out_edge of node.out_edges) {
                out_edge.linkNodesPos();
            }
        }
    }
    reset_colour() {
        // Initialize each node to white and egde to gray
        for (let node of this.nodes) {
            this.setNodeColour(node, "white");
            for (let edge of node.out_edges) {
                edge.updateColour(Edge.DEFAULT_COLOUR);
            }
        }
    }
    get_first_selected() {
        for (let node of this.nodes) {
            if (node.selected) {
                return node;
            }
        }
        return null;
    }
    sortNodes() {
        this.nodes.sort((a, b) => a.value - b.value);
    }
}
// #region ATTRIBUTES
// Global class constants
Graph.DELAY_TIME = 200;
export default Graph;