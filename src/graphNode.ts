import Edge from "./edge.js";
import { GRAPH, keyboardState } from "./main.js";

export default class GraphNode {
    // #region * ATTRIBUTES

    // Constants
    static RADIUS = 25;
    static BORDER_WIDTH = 3;
    static SELECTED_BORDER_COLOUR = "coral";
    static DEFAULT_BORDER_COLOUR = "#444444";
    static READY_BORDER_COLOUR = Edge.READY_COLOUR;

    // Attributes
    public value: number;
    public y: number;
    public x: number;
    public div: HTMLDivElement;
    public out_edges: Edge[] = [];
    public in_edges: Edge[] = [];
    public neighbours: GraphNode[] = [];

    private border_colour: string = GraphNode.DEFAULT_BORDER_COLOUR;
    public text_colour: string = GraphNode.DEFAULT_BORDER_COLOUR;
    public colour: string = "white";
    public selected: boolean = true;

    // Dragging attributes
    private dragging: boolean = false;
    private initialX_drag: number = 0;
    private initialY_drag: number = 0;
    // #endregion

    // * INITIALIZATION
    constructor(x: number, y: number, value: number) {
        this.value = value;
        this.x = x;
        this.y = y;

        // Create node Div
        this.div = document.createElement("div");
        this.div.className = "circle";
        this.div.setAttribute("contenteditable", "false");
        GRAPH.HTML_Container?.appendChild(this.div);

        this.updatePos(this.x, this.y);
        this.updateAll();
        this.mouseEventListeners();
        this.keyboardEventListeners();
    }

    private mouseEventListeners(): void {
        // Hover
        this.div.addEventListener("mouseenter", (event: MouseEvent) => {
            this.div.style.transform = "scale(1.05)";
            this.div.style.fontSize = "20px";

            // Highlight when edge is begin dragged (and this is being hovered)
            if (GRAPH.moving_edge && (this !== GRAPH.initial_node || this !== GRAPH.final_node)) {
                GRAPH.moving_edge.updateColour(Edge.READY_COLOUR);
                this.border_colour = GraphNode.READY_BORDER_COLOUR;
                this.updateColour();
            }
        });
        this.div.addEventListener("mouseleave", (event: MouseEvent) => {
            this.div.style.transform = "scale(1)";
            this.border_colour = this.selected ? GraphNode.SELECTED_BORDER_COLOUR : GraphNode.DEFAULT_BORDER_COLOUR;
            this.updateColour();
        });

        // Mouse down
        this.div.addEventListener("mousedown", (event: MouseEvent): void => {
            event.preventDefault();
            if (event.button === 0 && !keyboardState.SHIFT) {
                // * LEFT CLICK NO SHIFT: Select node and initialize drag for all selected nodes

                // Select
                if (!keyboardState.CTRL) GRAPH.deselect_all();
                this.select();

                // Set dragging to true on ALL selected nodes. Compute the initial position of the cursor
                for (let node of GRAPH.nodes) {
                    if (node.selected) {
                        node.dragging = true;
                        node.initialX_drag = event.clientX - node.x;
                        node.initialY_drag = event.clientY - node.y;
                    }
                }
            } else if (event.button === 0 && keyboardState.SHIFT) {
                // * LEFT CLICK + SHIFT: Connect from all selected nodes
                for (let node of GRAPH.nodes) {
                    if (node == this) continue;
                    if (node.selected) {
                        node.connect(this);
                    }
                }

                // Select only this as newly connected node destination
                GRAPH.deselect_all();
                this.select();
            } else if (event.button === 2) {
                // * RIGHT CLICK: Set as source node for next connection
                GRAPH.initial_node = this;
            }
        });

        // Mouse move
        document.addEventListener("mousemove", (event: MouseEvent): void => {
            event.preventDefault();
            if (this.dragging) {
                this.updatePos(event.clientX - this.initialX_drag, event.clientY - this.initialY_drag);
            }
        });

        // Mouse up
        document.addEventListener("mouseup", (event: MouseEvent): void => {
            event.preventDefault();
            this.dragging = false;
            GRAPH.initial_node = null;
        });
        this.div.addEventListener("mouseup", (event: MouseEvent): void => {
            // * Connect TO this node
            if (GRAPH.final_node === null && GRAPH.initial_node && GRAPH.initial_node !== this) {
                // Connect to the initial node
                GRAPH.initial_node.connect(this);

                // Select only this node as the newly connected node destination
                GRAPH.deselect_all();
                this.select();

                GRAPH.initial_node = null;
            } else {
                // Don't connect if there is no initial node or if initial node is itself
                GRAPH.initial_node = null;
            }

            // * Connect FROM this node
            if (GRAPH.final_node && GRAPH.initial_node === null && GRAPH.final_node !== this) {
                // Connect final node to this node
                this.connect(GRAPH.final_node);

                // Select only final node as the newly connected node destination
                GRAPH.deselect_all();
                this.select();

                GRAPH.final_node = null;
            } else {
                // Don't connect if there is no final node or if final node is itself
                GRAPH.final_node = null;
            }
        });
    }

    private keyboardEventListeners(): void {
        document.addEventListener("keydown", (event: KeyboardEvent) => {
            // Skip if this node is not selected or if the key pressed is not Enter
            if (!this.selected || event.key !== "Enter") return;
            event.preventDefault();

            // Check if this is the only selected node
            for (let node of GRAPH.nodes) {
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
        });
    }

    // Connection
    public connect(destination_node: GraphNode): Edge | null {
        GRAPH.initial_node = null;

        // Don't connect if already connected or if connected to itself
        if (destination_node === this) return null;
        if (this.out_edges.map((out_edge) => out_edge.destination).includes(destination_node)) return null;

        // Add neighbour and calculate position of arrow
        const new_edge = new Edge(this, destination_node);
        this.out_edges.push(new_edge);
        destination_node.in_edges.push(new_edge);

        // Update attributes
        this.updateEdgesPos();
        this.sortNeighbours();
        destination_node.sortNeighbours();

        return new_edge;
    }

    public delete(): void {
        // Remove from array
        let i = GRAPH.nodes.indexOf(this);
        if (i == -1) throw Error("Error: Attempting to delete node that isn't a part of GRAPH.nodes");
        else GRAPH.nodes.splice(i, 1);

        // Delete node HTML element
        GRAPH.HTML_Container?.removeChild(this.div);

        // Delete all edges
        for (let j = this.out_edges.length - 1; j >= 0; j--) {
            this.out_edges[j].delete();
        }
        for (let k = this.in_edges.length - 1; k >= 0; k--) {
            this.in_edges[k].delete();
        }

        GRAPH.size--;
    }

    // Selection
    public select(): void {
        this.border_colour = GraphNode.SELECTED_BORDER_COLOUR;
        this.updateColour();
        this.selected = true;
    }
    public deselect(): void {
        this.border_colour = GraphNode.DEFAULT_BORDER_COLOUR;
        this.updateColour();
        this.selected = false;
    }

    // Update Methods
    public updateAll = (): void => {
        this.updateValue();
        this.updateColour();
        this.updateSize();
    };
    public updatePos = (x: number, y: number): void => {
        this.x = x;
        this.y = y;
        this.div.style.left = this.x - GraphNode.RADIUS + "px";
        this.div.style.top = this.y - GraphNode.RADIUS + "px";
        this.updateEdgesPos();
    };
    public updateValue = (): void => {
        this.div.textContent = this.value.toString();
    };
    public updateColour = (): void => {
        this.div.style.backgroundColor = this.colour;
        this.div.style.color = this.text_colour;
        this.div.style.border = GraphNode.BORDER_WIDTH + "px" + " solid " + this.border_colour;
    };
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
        this.neighbours.sort((a, b) => a.value - b.value);
    }
}
