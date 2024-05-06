import Edge from "./edge.js";
import { keyboardState } from "./main.js";
class GraphNode {
    // #endregion
    // * INITIALIZATION
    constructor(x, y, value, graph) {
        this.out_edges = [];
        this.in_edges = [];
        this.border_colour = GraphNode.DEFAULT_BORDER_COLOUR;
        this.text_colour = GraphNode.DEFAULT_BORDER_COLOUR;
        this.colour = "white";
        // State
        this.selected = true;
        this.search_status = null;
        this.dragging = false;
        this.initialX_drag = 0;
        this.initialY_drag = 0;
        this.bound_handlers = {
            keydown: this.handle_keydown.bind(this),
            mouse_enter_div: this.handle_mouse_enter.bind(this),
            mouse_leave_div: this.handle_mouse_leave_div.bind(this),
            mouse_down_div: this.handle_mouse_down_div.bind(this),
            mouse_up_div: this.handle_mouse_up_div.bind(this),
            mouse_up_doc: this.handle_mouse_up_doc.bind(this),
            mouse_move: this.handle_mouse_move.bind(this),
        };
        // public distance_text: HTMLParagraphElement;
        this.show_time_interval = false;
        this.DFS_dtime = "_";
        this.DFS_ftime = "_";
        this.distance = 0;
        // Update Methods
        this.updateAll = () => {
            this.updateText();
            this.updateValue();
            this.updateColour(this.colour);
            this.updateSize();
        };
        this.updateText = () => {
            this.time_interval_text.textContent = `[${this.DFS_dtime}, ${this.DFS_ftime}]`;
            this.time_interval_text.style.display = this.show_time_interval ? "" : "none";
        };
        this.updatePos = (x, y) => {
            // Node pos
            this.x = x;
            this.y = y;
            this.div.style.left = this.x - GraphNode.RADIUS + "px";
            this.div.style.top = this.y - GraphNode.RADIUS + "px";
            // Text pos
            this.time_interval_text.style.left = this.x + "px";
            this.time_interval_text.style.top = this.y - 2.5 * GraphNode.RADIUS + "px";
            // Edges pos
            this.updateEdgesPos();
        };
        this.updateValue = () => {
            this.div.textContent = this.value.toString();
        };
        this.updateColour = (colour) => {
            this.updateBorderColour(GraphNode.DEFAULT_BORDER_COLOUR);
            this.colour = colour;
            if (colour === "black") {
                this.colour = GraphNode.SEARCHED_COLOUR;
                this.updateBorderColour("black");
            }
            this.div.style.backgroundColor = this.colour;
            this.text_colour = colour === "black" ? "white" : "black";
            this.div.style.color = this.text_colour;
        };
        this.updateSize = () => {
            this.div.style.width = 2 * GraphNode.RADIUS + "px";
            this.div.style.height = 2 * GraphNode.RADIUS + "px";
        };
        this.updateEdgesPos = () => {
            // Update each out edge
            for (let out_edge of this.out_edges) {
                out_edge.linkNodesPos();
            }
            // Update each in edge
            for (let in_edge of this.in_edges) {
                in_edge.linkNodesPos();
            }
        };
        this.graph = graph;
        this.value = value;
        this.x = x;
        this.y = y;
        // Create node Div
        this.div = document.createElement("div");
        this.div.classList.add("circle", "pan");
        this.graph.HTML_Container.appendChild(this.div);
        // Create text elements
        this.time_interval_text = document.createElement("p");
        this.time_interval_text.classList.add("node-text", "pan");
        this.time_interval_text.textContent = `[${this.DFS_dtime}, ${this.DFS_ftime}]`;
        this.graph.HTML_Container.appendChild(this.time_interval_text);
        this.updatePos(this.x, this.y);
        this.updateAll();
        this.addAllEventListeners();
    }
    // Event listeners and handlers
    handle_mouse_enter() {
        this.div.style.transform = "scale(1.05)";
        this.div.style.fontSize = "20px";
        // Highlight when edge is begin dragged (and this is being hovered)
        if (this.graph.moving_edge && (this !== this.graph.initial_node || this !== this.graph.final_node)) {
            this.graph.moving_edge.updateColour(Edge.READY_COLOUR);
            this.updateBorderColour(GraphNode.READY_BORDER_COLOUR);
        }
    }
    handle_mouse_leave_div() {
        this.div.style.transform = "scale(1)";
    }
    handle_mouse_down_div(event) {
        event.preventDefault();
        if (event.button === 0 && !keyboardState.SHIFT) {
            // * LEFT CLICK NO SHIFT: Select node and initialize drag for all selected nodes
            // Select
            if (!keyboardState.CTRL)
                this.graph.deselect_all();
            this.select();
            // Set dragging to true on ALL selected nodes. Compute the initial position of the cursor
            for (let node of this.graph.nodes) {
                if (node.selected) {
                    node.dragging = true;
                    node.initialX_drag = event.clientX - node.x;
                    node.initialY_drag = event.clientY - node.y;
                }
            }
        }
        else if (event.button === 0 && keyboardState.SHIFT && !this.graph.traversing) {
            // * LEFT CLICK + SHIFT: Connect from all selected nodes
            for (let node of this.graph.nodes) {
                if (node == this)
                    continue;
                if (node.selected) {
                    node.connect(this);
                }
            }
            // Select only this as newly connected node destination
            this.graph.deselect_all();
            this.select();
        }
        else if (event.button === 2 && !this.graph.traversing) {
            // * RIGHT CLICK: Set as source node for next connection
            this.graph.initial_node = this;
        }
    }
    handle_mouse_up_doc(event) {
        event.preventDefault();
        this.dragging = false;
        this.graph.initial_node = null;
    }
    handle_mouse_up_div() {
        // * Connect TO this node
        if (this.graph.final_node === null && this.graph.initial_node && this.graph.initial_node !== this) {
            // Connect to the initial node
            this.graph.initial_node.connect(this);
            // Select only this node as the newly connected node destination
            this.graph.deselect_all();
            this.select();
            this.graph.initial_node = null;
        }
        else {
            // Don't connect if there is no initial node or if initial node is itself
            this.graph.initial_node = null;
        }
        // * Connect FROM this node
        if (this.graph.final_node && this.graph.initial_node === null && this.graph.final_node !== this) {
            // Connect final node to this node
            this.connect(this.graph.final_node);
            // Select only final node as the newly connected node destination
            this.graph.deselect_all();
            this.select();
            this.graph.final_node = null;
        }
        else {
            // Don't connect if there is no final node or if final node is itself
            this.graph.final_node = null;
        }
    }
    handle_mouse_move(event) {
        event.preventDefault();
        if (this.dragging) {
            this.updatePos(event.clientX - this.initialX_drag, event.clientY - this.initialY_drag);
        }
    }
    handle_keydown(event) {
        // Skip if this node is not selected or if the key pressed is not Enter
        if (!this.selected || event.key !== "Enter")
            return;
        event.preventDefault();
        // Check if this is the only selected node
        for (let node of this.graph.nodes) {
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
                for (let adj of this.in_edges) {
                    adj.source.sortNeighbours();
                }
            }
            this.div.innerText = this.value.toString();
        }
    }
    addAllEventListeners() {
        // Hover
        this.div.addEventListener("mouseenter", this.bound_handlers.mouse_enter_div);
        this.div.addEventListener("mouseleave", this.bound_handlers.mouse_leave_div);
        // Mouse actions
        this.div.addEventListener("mousedown", this.bound_handlers.mouse_down_div);
        document.addEventListener("mouseup", this.bound_handlers.mouse_up_doc);
        this.div.addEventListener("mouseup", this.bound_handlers.mouse_up_div);
        document.addEventListener("mousemove", this.bound_handlers.mouse_move);
        // Keyboard actions
        document.addEventListener("keydown", this.bound_handlers.keydown);
    }
    removeAllEventListeners() {
        // Hover
        this.div.removeEventListener("mouseenter", this.bound_handlers.mouse_enter_div);
        this.div.removeEventListener("mouseleave", this.bound_handlers.mouse_leave_div);
        // Mouse actions
        this.div.removeEventListener("mousedown", this.bound_handlers.mouse_down_div);
        document.removeEventListener("mouseup", this.bound_handlers.mouse_up_doc);
        this.div.removeEventListener("mouseup", this.bound_handlers.mouse_up_div);
        document.removeEventListener("mousemove", this.bound_handlers.mouse_move);
        // Keyboard actions
        document.removeEventListener("keydown", this.bound_handlers.keydown);
    }
    // Connection
    connect(destination_node) {
        this.graph.initial_node = null;
        // Don't connect if already connected or if connected to itself
        if (destination_node === this)
            return null;
        if (this.out_edges.map((out_edge) => out_edge.destination).includes(destination_node))
            return null;
        // Add edges and neighbours
        const new_edge = new Edge(this, destination_node, this.graph);
        this.out_edges.push(new_edge);
        destination_node.in_edges.push(new_edge);
        // Update attributes
        destination_node.sortNeighbours();
        this.sortNeighbours();
        this.updateEdgesPos();
        return new_edge;
    }
    delete() {
        var _a;
        // Remove from nodes array in this.graph
        let i = this.graph.nodes.indexOf(this);
        if (i === -1)
            throw Error("Error: Attempting to delete node that isn't a part of this.graph.nodes");
        else
            this.graph.nodes.splice(i, 1);
        this.graph.size--;
        // Delete node HTML element and event listeners
        (_a = this.graph.HTML_Container) === null || _a === void 0 ? void 0 : _a.removeChild(this.div);
        this.removeAllEventListeners();
        // Delete all edges
        for (let j = this.out_edges.length - 1; j >= 0; j--) {
            this.out_edges[j].delete();
        }
        for (let k = this.in_edges.length - 1; k >= 0; k--) {
            this.in_edges[k].delete();
        }
    }
    // Selection
    select() {
        this.updateBorderColour(GraphNode.SELECTED_BORDER_COLOUR);
        this.selected = true;
    }
    deselect() {
        this.updateBorderColour(this.colour === GraphNode.SEARCHED_COLOUR ? "black" : GraphNode.DEFAULT_BORDER_COLOUR);
        this.selected = false;
    }
    updateBorderColour(colour) {
        this.border_colour = colour;
        this.div.style.border = GraphNode.BORDER_WIDTH + "px" + " solid " + this.border_colour;
    }
    sortNeighbours() {
        this.out_edges.sort((a, b) => a.destination.value - b.destination.value);
        this.in_edges.sort((a, b) => a.source.value - b.source.value);
    }
}
// #region * ATTRIBUTES
// Constants
GraphNode.RADIUS = 25;
GraphNode.BORDER_WIDTH = 3;
GraphNode.SELECTED_BORDER_COLOUR = "coral";
GraphNode.DEFAULT_BORDER_COLOUR = "#444444";
GraphNode.SEARCHED_COLOUR = "#353535";
GraphNode.READY_BORDER_COLOUR = Edge.READY_COLOUR;
export default GraphNode;
