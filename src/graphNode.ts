import Edge from "./edge";
import { GRAPH, keyboardState } from "./main";

export default class GraphNode {
    // #region * ATTRIBUTES

    // Constants
    static RADIUS = 25;
    static BORDER_WIDTH = 2;
    static SELECTED_BORDER_COLOUR = "green";

    // Attributes
    private value: number;
    public y: number;
    public x: number;
    public div: HTMLElement;

    private background_colour: string = "white";
    private border_colour: string = "black";
    public out_edges: Edge[] = [];
    public in_neighbours: GraphNode[] = [];
    public selected: boolean = true;

    // Dragging attributes
    private dragging: boolean = false;
    private initialX_drag: number = 0;
    private initialY_drag: number = 0;
    // #endregion

    // * INITIALIZATION
    constructor(x: number, y: number, value: number, div: HTMLElement) {
        this.value = value;
        this.x = x;
        this.y = y;
        this.div = div;
        this.updateAll();
        this.mouseEventListeners();

        if (!keyboardState.CTRL) GRAPH.deselect_all();
        this.select();
    }

    // * PRIVATE METHODS

    private mouseEventListeners(): void {
        // Mouse down
        this.div.addEventListener("mousedown", (event: MouseEvent): void => {
            event.preventDefault();
            if (event.button === 0) {
                // * LEFT CLICK

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
            } else if (event.button === 2) {
                // * RIGHT CLICK
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
            if (GRAPH.initial_node && GRAPH.initial_node !== this) {
                GRAPH.initial_node.connect(this);
            } else {
                GRAPH.initial_node = null;
            }
        });
    }

    // Connection
    private connect(destination_node: GraphNode): void {
        GRAPH.initial_node = null;

        // Don't connect if already connected
        if (this.out_edges.map((out_edge) => out_edge.destination).includes(destination_node)) return;

        // Select the final node
        GRAPH.deselect_all();
        destination_node.select();

        // Add neighbour and calculate position of arrow
        this.out_edges.push(new Edge(this, destination_node));
        destination_node.in_neighbours.push(this);
        this.updateEdgesPos();
    }

    // * PUBLIC METHODS
    public delete(): void {
        // Remove from array
        let i = GRAPH.nodes.indexOf(this);
        if (i == -1) throw Error("Error: Attempting to delete node that isn't a part of GRAPH.nodes");
        else GRAPH.nodes.splice(i, 1);

        // Delete node HTML element
        GRAPH.HTML_Container?.removeChild(this.div);

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
    public select(): void {
        this.border_colour = GraphNode.SELECTED_BORDER_COLOUR;
        this.updateColour();
        this.selected = true;
    }
    public deselect(): void {
        this.border_colour = "black";
        this.updateColour();
        this.selected = false;
    }
    public toggle_select(): void {
        if (this.selected) this.deselect();
        else this.select();
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
        this.div.style.backgroundColor = this.background_colour;
        this.div.style.border = GraphNode.BORDER_WIDTH + "px" + " solid " + this.border_colour;
    };
    public updateSize = (): void => {
        this.div.style.width = 2 * GraphNode.RADIUS + "px";
        this.div.style.height = 2 * GraphNode.RADIUS + "px";
    };
    public updateEdgesPos = (): void => {
        // Update each out_edge
        for (let out_edge of this.out_edges) {
            out_edge.updatePos();
        }

        // Update each in_neighbour
        for (let in_neighbour of this.in_neighbours) {
            for (let out_edge_of_in_neighbour of in_neighbour.out_edges) {
                if (out_edge_of_in_neighbour.destination == this) {
                    out_edge_of_in_neighbour.updatePos();
                }
            }
        }
    };
}
