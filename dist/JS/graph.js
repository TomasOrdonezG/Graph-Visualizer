import GraphNode from "./graphNode.js";
import Edge from "./edge.js";
import { keyboardState } from "./main.js";
export var Action;
(function (Action) {
    Action[Action["ADD"] = 0] = "ADD";
    Action[Action["LINK"] = 1] = "LINK";
    Action[Action["MOVE"] = 2] = "MOVE";
    Action[Action["DELETE"] = 3] = "DELETE";
})(Action || (Action = {}));
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
        this.size = 0;
        this.next_node_val = 0;
        this.phantom_edge = null;
        // Graph states
        this.action = Action.ADD;
        this.editingValue = false;
        this.traversing = false;
        this.isLeftMouseDown = false;
        this.isRightMouseDown = false;
        this.rightDown_x1 = 0;
        this.rightDown_y1 = 0;
        this.initial_node_positions = [];
        // Selection box
        this.selection_div = document.querySelector(".selection-box");
        this.selection_x1 = 0;
        this.selection_y1 = 0;
        this.selection_div.style.display = "none";
        this.HTML_Container.addEventListener("mousedown", (event) => {
            if (event.button === 0) {
                if (!event.target.closest(".pan")) {
                    this.show_selection_box(event.clientX, event.clientY);
                    this.isLeftMouseDown = true;
                    if ([Action.MOVE, Action.DELETE].includes(this.action)) {
                        this.deselect_all();
                    }
                }
                else {
                    this.reset_selection_box();
                }
            }
            else if (event.button === 2) {
                event.preventDefault();
                this.isRightMouseDown = true;
                if (this.action === Action.MOVE) {
                    // Remember the initial click position and all of the initial positions of the nodes
                    this.rightDown_x1 = event.clientX;
                    this.rightDown_y1 = event.clientY;
                    this.initial_node_positions = this.nodes.map((node) => ({
                        node: node,
                        x1: node.x,
                        y1: node.y,
                    }));
                }
            }
        });
        this.HTML_Container.addEventListener("mouseup", (event) => {
            var _a;
            // Delete phantom edge, and reset initial and final nodes
            (_a = this.phantom_edge) === null || _a === void 0 ? void 0 : _a.deleteHTML();
            this.phantom_edge = null;
            this.initial_node = null;
            this.final_node = null;
            if (event.button === 0) {
                this.isLeftMouseDown = false;
                // End selection box visual
                this.select_content_inside_selection_box();
                this.hide_selection_box();
                let is_click_but_not_drag = parseInt(this.selection_div.style.width) < GraphNode.RADIUS &&
                    parseInt(this.selection_div.style.height) < GraphNode.RADIUS &&
                    !event.target.closest(".pan");
                // Delete all selected when selection box is large
                if (!is_click_but_not_drag && this.action === Action.DELETE) {
                    this.delete_all_selected();
                }
                // Add node when selection div is small and not clicking another node
                if (is_click_but_not_drag && this.action !== Action.DELETE) {
                    console.log("add");
                    this.addNode(event.clientX, event.clientY);
                }
            }
            else if (event.button === 2) {
                event.preventDefault();
                this.isRightMouseDown = false;
                if (this.action === Action.MOVE) {
                    this.initial_node_positions = [];
                }
            }
        });
        this.HTML_Container.addEventListener("mousemove", (event) => {
            // Handle phantom edge if exists
            if (this.phantom_edge) {
                if (this.phantom_edge.moving_head) {
                    this.phantom_edge.linkCursorToHeadPos(event);
                }
                else if (this.phantom_edge.moving_tail) {
                    this.phantom_edge.linkCursorToTailPos(event);
                }
            }
            if (this.isLeftMouseDown) {
                // Handle left click drag
                this.resize_selection_box(event.clientX, event.clientY);
            }
            if (this.isRightMouseDown) {
                event.preventDefault();
                if (this.action === Action.MOVE) {
                    // Move everything
                    this.selection_x1;
                    this.selection_y1;
                    for (let { node, x1, y1 } of this.initial_node_positions) {
                        node.updatePos(x1 + event.clientX - this.rightDown_x1, y1 + event.clientY - this.rightDown_y1);
                    }
                }
            }
        });
        document.addEventListener("keydown", (event) => {
            if (event.key === "Backspace" && this.phantom_edge === null) {
                this.delete_all_selected();
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
    set_phantom_edge(edge) {
        if (this.phantom_edge) {
            this.phantom_edge.delete();
        }
        this.phantom_edge = edge;
    }
    deselect_all() {
        for (let node of this.nodes) {
            node.deselect();
        }
    }
    delete_all_selected() {
        if (this.traversing)
            return;
        // Delete selected nodes
        for (let i = this.nodes.length - 1; i >= 0; i--) {
            if (this.nodes[i].selected && this.nodes[i].div.getAttribute("contenteditable") === "false") {
                this.nodes[i].delete();
            }
        }
        if (this.size === 0)
            this.next_node_val = 0;
        this.sortNodes();
    }
    delete_all_nodes() {
        if (this.traversing)
            return;
        for (let node of this.nodes) {
            node.select();
        }
        this.delete_all_selected();
    }
    reset_all_attributes() {
        for (let node of this.nodes) {
            node.updateColour("white");
            node.updateBorderColour(GraphNode.DEFAULT_BORDER_COLOUR);
            node.updateTextColour("black");
            node.updateShowText(false);
            node.updateText("");
            node.deselect();
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
    jsonify() {
        // Construct adjacency matrix
        const adjacency_matrix = [];
        for (let node1 of this.nodes) {
            const row = [];
            let next_adj_i = 0; // Keep track of the next adjacent edge index
            for (let node2 of this.nodes) {
                const next_out_edge = node1.out_edges[next_adj_i];
                if (next_out_edge && next_out_edge.destination === node2) {
                    row.push(next_out_edge.weight); // Push weight when node2 is a neighbour of node1
                    next_adj_i++;
                }
                else {
                    row.push(null); // Case node2 is not a neighbour of node1
                }
            }
            adjacency_matrix.push(row);
        }
        // Vertices
        const vertices = this.nodes.map(({ value, x, y }) => ({
            value: value,
            x: x / window.innerWidth,
            y: y / window.innerHeight,
        }));
        // Settings
        const settings = {
            directed: this.directed,
            weighted: this.weighted,
        };
        return { adjacency_matrix, vertices, settings };
    }
    build(graph_content) {
        this.delete_all_nodes();
        // Create nodes
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        for (let node of graph_content.vertices) {
            const new_node = new GraphNode(vw * node.x, vh * node.y, node.value, this);
            this.nodes.push(new_node);
        }
        // Connect nodes
        for (let i = 0; i < graph_content.adjacency_matrix.length; i++) {
            const target_node = this.nodes[i];
            for (let j = 0; j < graph_content.adjacency_matrix[i].length; j++) {
                const adj = this.nodes[j];
                const weight = graph_content.adjacency_matrix[i][j];
                if (weight) {
                    const new_edge = target_node.connect(adj);
                    if (new_edge) {
                        new_edge.updateWeight(weight);
                    }
                }
            }
        }
        this.deselect_all();
    }
    // Selection box methods
    hide_selection_box() {
        this.selection_div.style.display = "none";
    }
    reset_selection_box() {
        this.selection_div.style.display = "";
        this.selection_div.style.width = `0px`;
        this.selection_div.style.height = `0px`;
    }
    show_selection_box(x1, y1) {
        this.selection_x1 = x1;
        this.selection_y1 = y1;
        this.selection_div.style.left = `${x1}px`;
        this.selection_div.style.top = `${y1}px`;
        this.reset_selection_box();
    }
    resize_selection_box(x2, y2) {
        this.selection_div.style.left = `${Math.min(this.selection_x1, x2)}px`;
        this.selection_div.style.top = `${Math.min(this.selection_y1, y2)}px`;
        this.selection_div.style.width = `${Math.abs(x2 - this.selection_x1)}px`;
        this.selection_div.style.height = `${Math.abs(y2 - this.selection_y1)}px`;
    }
    select_content_inside_selection_box() {
        if (this.selection_div.style.display === "none")
            return;
        const selection_left = parseInt(this.selection_div.style.left);
        const selection_top = parseInt(this.selection_div.style.top);
        const selection_right = selection_left + parseInt(this.selection_div.style.width);
        const selection_bottom = selection_top + parseInt(this.selection_div.style.height);
        if (selection_right - selection_left < GraphNode.RADIUS || selection_bottom - selection_top < GraphNode.RADIUS)
            return;
        this.deselect_all();
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
