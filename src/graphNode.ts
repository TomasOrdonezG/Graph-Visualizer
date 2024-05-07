import Graph from "./graph.js";
import Edge from "./edge.js";
import { keyboardState } from "./main.js";

export default class GraphNode {
    // #region * ATTRIBUTES

    // Constants
    static RADIUS = 25;
    static BORDER_WIDTH = 3;
    static SELECTED_BORDER_COLOUR = "coral";
    static DEFAULT_BORDER_COLOUR = "#444444";
    static SEARCHED_COLOUR = "#353535";
    static READY_BORDER_COLOUR = Edge.READY_COLOUR;

    // Graph attributes
    private graph: Graph;
    public value: number;
    public out_edges: Edge[] = [];
    public in_edges: Edge[] = [];

    // Appearance
    public div: HTMLDivElement;
    public y: number;
    public x: number;
    private border_colour: string = GraphNode.DEFAULT_BORDER_COLOUR;
    public text_colour: string = GraphNode.DEFAULT_BORDER_COLOUR;
    public colour: string = "white";

    // State
    public selected: boolean = true;
    public search_status: null | "new" | "discovered" | "searched" = null;
    private dragging: boolean = false;
    private initialX_drag: number = 0;
    private initialY_drag: number = 0;
    private bound_handlers = {
        keydown: this.handle_keydown.bind(this),
        mouse_enter_div: this.handle_mouse_enter.bind(this),
        mouse_leave_div: this.handle_mouse_leave_div.bind(this),
        mouse_down_div: this.handle_mouse_down_div.bind(this),
        mouse_up_div: this.handle_mouse_up_div.bind(this),
        mouse_up_doc: this.handle_mouse_up_doc.bind(this),
        mouse_move: this.handle_mouse_move.bind(this),
    };

    // Algorithm specific attributes
    public time_interval_text: HTMLParagraphElement;
    // public distance_text: HTMLParagraphElement;
    public show_time_interval: boolean = false;
    public DFS_dtime: String = "_";
    public DFS_ftime: String = "_";
    public distance: number = 0;

    // #endregion

    // * INITIALIZATION
    constructor(x: number, y: number, value: number, graph: Graph) {
        this.graph = graph;
        this.value = value;
        this.x = x;
        this.y = y;

        // Create node Div
        this.div = document.createElement("div");
        this.div.setAttribute("contenteditable", "false");
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
    private handle_mouse_enter(): void {
        this.div.style.transform = "scale(1.05)";
        this.div.style.fontSize = "20px";

        // Highlight when edge is begin dragged (and this is being hovered)
        if (this.graph.moving_edge && (this !== this.graph.initial_node || this !== this.graph.final_node)) {
            this.graph.moving_edge.updateColour(Edge.READY_COLOUR);
            this.updateBorderColour(GraphNode.READY_BORDER_COLOUR);
        }
    }
    private handle_mouse_leave_div(): void {
        this.div.style.transform = "scale(1)";
    }
    private handle_mouse_down_div(event: MouseEvent): void {
        event.preventDefault();
        if (event.button === 0 && !keyboardState.SHIFT) {
            // * LEFT CLICK NO SHIFT: Select node and initialize drag for all selected nodes

            // Select
            if (!keyboardState.CTRL) this.graph.deselect_all();
            this.select();

            // Set dragging to true on ALL selected nodes. Compute the initial position of the cursor
            for (let node of this.graph.nodes) {
                if (node.selected) {
                    node.dragging = true;
                    node.initialX_drag = event.clientX - node.x;
                    node.initialY_drag = event.clientY - node.y;
                }
            }
        } else if (event.button === 0 && keyboardState.SHIFT && !this.graph.traversing) {
            // * LEFT CLICK + SHIFT: Connect from all selected nodes
            for (let node of this.graph.nodes) {
                if (node == this) continue;
                if (node.selected) {
                    node.connect(this);
                }
            }

            // Select only this as newly connected node destination
            this.graph.deselect_all();
            this.select();
        } else if (event.button === 2 && !this.graph.traversing) {
            // * RIGHT CLICK: Set as source node for next connection
            this.graph.initial_node = this;
        }
    }
    private handle_mouse_up_doc(event: MouseEvent): void {
        event.preventDefault();
        this.dragging = false;
        this.graph.initial_node = null;
    }
    private handle_mouse_up_div(): void {
        // * Connect TO this node
        if (this.graph.final_node === null && this.graph.initial_node && this.graph.initial_node !== this) {
            // Connect to the initial node
            this.graph.initial_node.connect(this);

            // Select only this node as the newly connected node destination
            this.graph.deselect_all();
            this.select();

            this.graph.initial_node = null;
        } else {
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
        } else {
            // Don't connect if there is no final node or if final node is itself
            this.graph.final_node = null;
        }
    }
    private handle_mouse_move(event: MouseEvent): void {
        event.preventDefault();
        if (this.dragging) {
            this.updatePos(event.clientX - this.initialX_drag, event.clientY - this.initialY_drag);
        }
    }
    private handle_keydown(event: KeyboardEvent): void {
        // Skip if this node is not selected or if the key pressed is not Enter
        if (!this.selected || event.key !== "Enter") return;
        event.preventDefault();

        // Check if this is the only selected node
        for (let node of this.graph.nodes) {
            if (node !== this && node.selected) return;
        }

        if (this.div.getAttribute("contenteditable") !== "true") {
            // Edit value
            this.div.setAttribute("contenteditable", "true");
            this.div.focus();

            // Select content inside the div
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(this.div);
            selection?.removeAllRanges();
            selection?.addRange(range);
        } else {
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
    private addAllEventListeners(): void {
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
    private removeAllEventListeners(): void {
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
    public connect(destination_node: GraphNode): Edge | null {
        this.graph.initial_node = null;

        // Don't connect if already connected or if connected to itself
        if (destination_node === this) return null;
        if (this.out_edges.map((out_edge) => out_edge.destination).includes(destination_node)) return null;

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

    public delete(): void {
        // Remove from nodes array in this.graph
        let i = this.graph.nodes.indexOf(this);
        if (i === -1) throw Error("Error: Attempting to delete node that isn't a part of this.graph.nodes");
        else this.graph.nodes.splice(i, 1);
        this.graph.size--;

        // Delete node HTML element and event listeners
        this.graph.HTML_Container?.removeChild(this.div);
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
    public select(): void {
        this.updateBorderColour(GraphNode.SELECTED_BORDER_COLOUR);
        this.selected = true;
    }
    public deselect(): void {
        this.updateBorderColour(this.colour === GraphNode.SEARCHED_COLOUR ? "black" : GraphNode.DEFAULT_BORDER_COLOUR);
        this.selected = false;
    }

    // Update Methods
    public updateAll = (): void => {
        this.updateText();
        this.updateValue();
        this.updateColour(this.colour);
        this.updateSize();
    };
    public updateText = (): void => {
        this.time_interval_text.textContent = `[${this.DFS_dtime}, ${this.DFS_ftime}]`;
        this.time_interval_text.style.display = this.show_time_interval ? "" : "none";
    };
    public updatePos = (x: number, y: number): void => {
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
    public updateValue = (): void => {
        this.div.textContent = this.value.toString();
    };
    public updateColour = (colour: string): void => {
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
    public updateBorderColour(colour: string): void {
        this.border_colour = colour;
        this.div.style.border = GraphNode.BORDER_WIDTH + "px" + " solid " + this.border_colour;
    }
    public updateSize = (): void => {
        this.div.style.width = 2 * GraphNode.RADIUS + "px";
        this.div.style.height = 2 * GraphNode.RADIUS + "px";
    };
    public updateEdgesPos = (): void => {
        // Update each out edge
        for (let out_edge of this.out_edges) {
            out_edge.linkNodesPos();
        }

        // Update each in edge
        for (let in_edge of this.in_edges) {
            in_edge.linkNodesPos();
        }
    };

    private sortNeighbours() {
        this.out_edges.sort((a, b) => a.destination.value - b.destination.value);
        this.in_edges.sort((a, b) => a.source.value - b.source.value);
    }
}
