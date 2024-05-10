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
        this.HTML_Container = document.querySelector(".graph-container");
        // Objects to keep track of
        this.initial_node = null;
        this.final_node = null;
        this.moving_edge = null;
        this.size = 0;
        this.next_node_val = 0;
        // Graph states
        this.traversing = false;
        this.isLeftMouseDown = false;
        this.isMiddleMouseDown = false;
        this.middleDown_x1 = 0;
        this.middleDown_y1 = 0;
        // Selection box
        this.selection_div = document.querySelector(".selection-box");
        this.selection_x1 = 0;
        this.selection_y1 = 0;
        this.selection_div.style.display = "none";
        this.HTML_Container.addEventListener("mousedown", (event) => {
            if (event.button === 0 && !event.target.closest(".pan")) {
                // Handle right down state
                this.isLeftMouseDown = true;
                this.show_selection_box(event.clientX, event.clientY);
            }
        });
        this.HTML_Container.addEventListener("mouseup", (event) => {
            if (event.button === 0) {
                // Turn off left down state and hide the selection box
                this.isLeftMouseDown = false;
                // Add node when selection div is small and not clicking another node
                if (parseInt(this.selection_div.style.width) < GraphNode.RADIUS &&
                    parseInt(this.selection_div.style.height) < GraphNode.RADIUS &&
                    !event.target.closest(".pan")) {
                    this.addNode(event.clientX, event.clientY);
                }
                this.hide_selection_box();
            }
        });
        this.HTML_Container.addEventListener("mousemove", (event) => {
            if (this.isLeftMouseDown) {
                // Handle left click drag
                this.resize_selection_box(event.clientX, event.clientY);
            }
            if (this.isMiddleMouseDown) {
                // Move everything
            }
        });
    }
    addNode(clientX, clientY) {
        // Prevent adding a node when mouse is on a node div, or edge div
        if (this.traversing || this.initial_node)
            return;
        // Create the new node object
        const new_node = new GraphNode(clientX, clientY, this.next_node_val, this);
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
        if (!this.nodes)
            return null;
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
            event === null || event === void 0 ? void 0 : event.preventDefault();
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
            event === null || event === void 0 ? void 0 : event.preventDefault();
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
    reset_distances() {
        for (let node of this.nodes) {
            node.distance = Infinity;
        }
    }
    // Selection box methods
    hide_selection_box() {
        this.select_content_inside();
        this.selection_div.style.display = "none";
    }
    show_selection_box(x1, y1) {
        this.selection_x1 = x1;
        this.selection_y1 = y1;
        this.selection_div.style.display = "";
        this.selection_div.style.left = `${x1}px`;
        this.selection_div.style.top = `${y1}px`;
        this.selection_div.style.width = `0px`;
        this.selection_div.style.height = `0px`;
    }
    resize_selection_box(x2, y2) {
        this.selection_div.style.left = `${Math.min(this.selection_x1, x2)}px`;
        this.selection_div.style.top = `${Math.min(this.selection_y1, y2)}px`;
        this.selection_div.style.width = `${Math.abs(x2 - this.selection_x1)}px`;
        this.selection_div.style.height = `${Math.abs(y2 - this.selection_y1)}px`;
    }
    select_content_inside() {
        if (this.selection_div.style.display === "none")
            return;
        this.deselect_all();
        const selection_left = parseInt(this.selection_div.style.left);
        const selection_top = parseInt(this.selection_div.style.top);
        const selection_right = selection_left + parseInt(this.selection_div.style.width);
        const selection_bottom = selection_top + parseInt(this.selection_div.style.height);
        for (let node of this.nodes) {
            const node_left = node.x - GraphNode.RADIUS - GraphNode.BORDER_WIDTH;
            const node_right = node.x + GraphNode.RADIUS + GraphNode.BORDER_WIDTH;
            const node_top = node.y - GraphNode.RADIUS - GraphNode.BORDER_WIDTH;
            const node_bottom = node.y + GraphNode.RADIUS + GraphNode.BORDER_WIDTH;
            if (selection_top < node_top &&
                selection_left < node_left &&
                selection_right > node_right &&
                selection_bottom > node_bottom) {
                node.select();
            }
        }
    }
}
// #region ATTRIBUTES
// Global class constants
Graph.DELAY_TIME = 200;
export default Graph;
