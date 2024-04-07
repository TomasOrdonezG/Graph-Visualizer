import Edge from "./edge.js";
import { GRAPH, keyboardState } from "./main.js";
class GraphNode {
    // #endregion
    // * INITIALIZATION
    constructor(x, y, value) {
        var _a;
        this.border_colour = "black";
        this.text_colour = "black";
        this.colour = "white";
        this.out_edges = [];
        this.in_neighbours = [];
        this.selected = true;
        // Dragging attributes
        this.dragging = false;
        this.initialX_drag = 0;
        this.initialY_drag = 0;
        // Update Methods
        this.updateAll = () => {
            this.updateValue();
            this.updateColour();
            this.updateSize();
        };
        this.updatePos = (x, y) => {
            this.x = x;
            this.y = y;
            this.div.style.left = this.x - GraphNode.RADIUS + "px";
            this.div.style.top = this.y - GraphNode.RADIUS + "px";
            this.updateEdgesPos();
        };
        this.updateValue = () => {
            this.div.textContent = this.value.toString();
        };
        this.updateColour = () => {
            this.div.style.backgroundColor = this.colour;
            this.div.style.color = this.text_colour;
            this.div.style.border = GraphNode.BORDER_WIDTH + "px" + " solid " + this.border_colour;
        };
        this.updateSize = () => {
            this.div.style.width = 2 * GraphNode.RADIUS + "px";
            this.div.style.height = 2 * GraphNode.RADIUS + "px";
        };
        this.updateEdgesPos = () => {
            // Update each out_edge
            for (let out_edge of this.out_edges) {
                out_edge.linkNodePos();
            }
            // Update each in_neighbour
            for (let in_neighbour of this.in_neighbours) {
                for (let out_edge_of_in_neighbour of in_neighbour.out_edges) {
                    if (out_edge_of_in_neighbour.destination == this) {
                        out_edge_of_in_neighbour.linkNodePos();
                    }
                }
            }
        };
        this.value = value;
        this.x = x;
        this.y = y;
        // Create node Div
        this.div = document.createElement("div");
        this.div.className = "circle";
        this.div.setAttribute("contenteditable", "false");
        (_a = GRAPH.HTML_Container) === null || _a === void 0 ? void 0 : _a.appendChild(this.div);
        this.updatePos(this.x, this.y);
        this.updateAll();
        this.mouseEventListeners();
        this.keyboardEventListeners();
    }
    mouseEventListeners() {
        // Mouse down
        this.div.addEventListener("mousedown", (event) => {
            event.preventDefault();
            if (event.button === 0 && !keyboardState.SHIFT) {
                // * LEFT CLICK NO SHIFT: Select node and initialize drag for all selected nodes
                // Select
                if (!keyboardState.CTRL)
                    GRAPH.deselect_all();
                this.select();
                // Set dragging to true on ALL selected nodes. Compute the initial position of the cursor
                for (let node of GRAPH.nodes) {
                    if (node.selected) {
                        node.dragging = true;
                        node.initialX_drag = event.clientX - node.x;
                        node.initialY_drag = event.clientY - node.y;
                    }
                }
            }
            else if (event.button === 0 && keyboardState.SHIFT) {
                // * LEFT CLICK + SHIFT: Connect from all selected nodes
                for (let node of GRAPH.nodes) {
                    if (node == this)
                        continue;
                    if (node.selected) {
                        node.connect(this);
                    }
                }
                // Select only this as newly connected node destination
                GRAPH.deselect_all();
                this.select();
            }
            else if (event.button === 2) {
                // * RIGHT CLICK: Set as source node for next connection
                GRAPH.initial_node = this;
            }
        });
        // Mouse move
        document.addEventListener("mousemove", (event) => {
            event.preventDefault();
            if (this.dragging) {
                this.updatePos(event.clientX - this.initialX_drag, event.clientY - this.initialY_drag);
            }
        });
        // Mouse up
        document.addEventListener("mouseup", (event) => {
            event.preventDefault();
            this.dragging = false;
            GRAPH.initial_node = null;
        });
        this.div.addEventListener("mouseup", (event) => {
            if (GRAPH.initial_node && GRAPH.initial_node !== this) {
                // Connect to the initial node previously determined by right click drag
                GRAPH.initial_node.connect(this);
                // Select only this node as the newly connected node destination
                GRAPH.deselect_all();
                this.select();
            }
            else {
                // Don't connect if there is no initial node or if initial node is itself
                GRAPH.initial_node = null;
            }
        });
    }
    keyboardEventListeners() {
        document.addEventListener("keydown", (event) => {
            // Skip if this node is not selected or if the key pressed is not Enter
            if (!this.selected || event.key !== "Enter")
                return;
            event.preventDefault();
            // Check if this is the only selected node
            for (let node of GRAPH.nodes) {
                if (node !== this && node.selected)
                    return;
            }
            if (this.div.getAttribute("contenteditable") !== "true") {
                // Edit value
                this.div.setAttribute("contenteditable", "true");
                this.div.focus();
                // Select content inside the div
                const selection = window.getSelection();
                const range = document.createRange();
                range.selectNodeContents(this.div);
                selection === null || selection === void 0 ? void 0 : selection.removeAllRanges();
                selection === null || selection === void 0 ? void 0 : selection.addRange(range);
            }
            else {
                // Save editing changes
                this.div.setAttribute("contenteditable", "false");
                // Validate input and update value
                const new_val = parseInt(this.div.innerText);
                if (new_val) {
                    this.value = new_val;
                    for (let adj of this.in_neighbours) {
                        adj.sortNeighbours();
                    }
                }
                this.div.innerText = this.value.toString();
            }
        });
    }
    // Connection
    connect(destination_node) {
        GRAPH.initial_node = null;
        // Don't connect if already connected or if connected to itself
        if (destination_node === this)
            return null;
        if (this.out_edges.map((out_edge) => out_edge.destination).includes(destination_node))
            return null;
        // Add neighbour and calculate position of arrow
        const new_edge = new Edge(this, destination_node);
        this.out_edges.push(new_edge);
        destination_node.in_neighbours.push(this);
        // Update attributes
        this.updateEdgesPos();
        this.sortNeighbours();
        destination_node.sortNeighbours();
        return new_edge;
    }
    delete() {
        var _a;
        // Remove from array
        let i = GRAPH.nodes.indexOf(this);
        if (i == -1)
            throw Error("Error: Attempting to delete node that isn't a part of GRAPH.nodes");
        else
            GRAPH.nodes.splice(i, 1);
        // Delete node HTML element
        (_a = GRAPH.HTML_Container) === null || _a === void 0 ? void 0 : _a.removeChild(this.div);
        // Delete out_edges
        for (let j = this.out_edges.length - 1; j >= 0; j--) {
            this.out_edges[j].delete();
        }
        // Delete in_edges
        for (let l = this.in_neighbours.length - 1; l >= 0; l--) {
            for (let out_edge_of_in_neighbour of this.in_neighbours[l].out_edges) {
                if (out_edge_of_in_neighbour.destination === this) {
                    out_edge_of_in_neighbour.delete();
                }
            }
        }
        GRAPH.size--;
    }
    // Selection
    select() {
        this.border_colour = GraphNode.SELECTED_BORDER_COLOUR;
        this.updateColour();
        this.selected = true;
    }
    deselect() {
        this.border_colour = "black";
        this.updateColour();
        this.selected = false;
    }
    sortNeighbours() {
        this.out_edges.sort((a, b) => a.destination.value - b.destination.value);
        this.in_neighbours.sort((a, b) => a.value - b.value);
    }
}
// #region * ATTRIBUTES
// Constants
GraphNode.RADIUS = 25;
GraphNode.BORDER_WIDTH = 3;
GraphNode.SELECTED_BORDER_COLOUR = "red";
export default GraphNode;
