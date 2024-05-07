import GraphNode from "./graphNode.js";
import Edge from "./edge.js";
import { keyboardState } from "./main.js";
// Graph global variable
class Graph {
    // #endregion
    constructor() {
        this.nodes = [];
        this.weighted = false;
        this.directed = false;
        // Objects to keep track of
        this.initial_node = null;
        this.final_node = null;
        this.moving_edge = null;
        this.size = 0;
        this.next_node_val = 0;
        this.traversing = false;
        this.HTML_Container = document.querySelector(".graph-container");
        this.HTML_Container.addEventListener("mouseup", this.addNode.bind(this));
    }
    addNode(event) {
        // Prevent adding a node when mouse is on a node div, or edge div
        if (event.button !== 0 || this.traversing || event.target.closest(".pan")) {
            return;
        }
        // Create the new node object
        const new_node = new GraphNode(event.clientX, event.clientY, this.next_node_val, this);
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
    reset_colour() {
        // Initialize each node to white and egde to gray
        for (let node of this.nodes) {
            // this.setNodeColour(node, "white");
            node.updateColour("white");
            node.updateBorderColour(GraphNode.DEFAULT_BORDER_COLOUR);
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
        return this.nodes[0];
    }
    toggle_directed(event) {
        // Prevent from changing graph type while traversing
        if (this.traversing) {
            event.preventDefault();
            return;
        }
        // Toggle boolean
        this.directed = !this.directed;
        // Loop through every edge in the graph
        for (let node of this.nodes) {
            for (let edge of node.out_edges) {
                edge.linkNodesPos(); // Update visual of the arrowheads
            }
        }
    }
    toggle_weighted(event) {
        // Prevent from changing graph type while traversin
        if (this.traversing) {
            event.preventDefault();
            return;
        }
        // Toggle boolean
        this.weighted = !this.weighted;
        // Loop through every edge in the graph
        for (let node of this.nodes) {
            for (let edge of node.out_edges) {
                edge.updateWeight(edge.weight); // Update weight text
            }
        }
    }
    sortNodes() {
        this.nodes.sort((a, b) => a.value - b.value);
    }
}
// #region ATTRIBUTES
// Global class constants
Graph.DELAY_TIME = 200;
export default Graph;
