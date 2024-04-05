import Edge from "./edge.js";
import { GRAPH, keyboardState } from "./main.js";
class GraphNode {
    // #endregion
    // * INITIALIZATION
    constructor(x, y, value, div) {
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
        this.div = div;
        this.updateAll();
        this.mouseEventListeners();
        if (!keyboardState.CTRL)
            GRAPH.deselect_all();
        this.select();
    }
    // * PRIVATE METHODS
    mouseEventListeners() {
        // Mouse down
        this.div.addEventListener("mousedown", (event) => {
            event.preventDefault();
            if (event.button === 0) {
                // * LEFT CLICK
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
            else if (event.button === 2) {
                // * RIGHT CLICK
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
                GRAPH.initial_node.connect(this);
            }
            else {
                GRAPH.initial_node = null;
            }
        });
    }
    // Connection
    connect(destination_node) {
        GRAPH.initial_node = null;
        // Don't connect if already connected
        if (this.out_edges.map((out_edge) => out_edge.destination).includes(destination_node))
            return null;
        // Select the final node
        GRAPH.deselect_all();
        destination_node.select();
        // Add neighbour and calculate position of arrow
        const new_edge = new Edge(this, destination_node);
        this.out_edges.push(new_edge);
        destination_node.in_neighbours.push(this);
        this.updateEdgesPos();
        return new_edge;
    }
    // * PUBLIC METHODS
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
}
// #region * ATTRIBUTES
// Constants
GraphNode.RADIUS = 25;
GraphNode.BORDER_WIDTH = 2;
GraphNode.SELECTED_BORDER_COLOUR = "green";
export default GraphNode;
